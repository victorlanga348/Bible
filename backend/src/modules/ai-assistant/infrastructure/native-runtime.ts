import type { RuntimeArtifactPort } from './runtime-artifacts';
import type { ModelKind, ModelRuntimePort, ModelSession } from './session';
import { execFile, spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { open, readFile, unlink, type FileHandle } from 'node:fs/promises';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import { promisify } from 'node:util';
import { AiResultRejectedError, AiTimeoutError, AiUnavailableError } from '../application/errors';
import { NativeModelHttpClient } from './http-client';

const versionCommand = promisify(execFile);

async function availablePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const address = server.address();
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  if (!address || typeof address === 'string') throw new AiUnavailableError();
  return address.port;
}
async function stoppedWithin(child: ChildProcess, milliseconds: number): Promise<boolean> {
  if (child.exitCode !== null || child.signalCode !== null) return true;
  let timer: NodeJS.Timeout | undefined;
  let done!: () => void;
  const stopped = new Promise<boolean>(resolve => { done = () => resolve(true); child.once('close', done); });
  const expired = new Promise<boolean>(resolve => { timer = setTimeout(() => resolve(false), milliseconds); timer.unref(); });
  try { return await Promise.race([stopped, expired]); }
  finally { clearTimeout(timer); child.removeListener('close', done); }
}
async function stopOwnChild(child: ChildProcess | undefined, milliseconds: number): Promise<void> {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return;
  child.kill('SIGTERM');
  if (await stoppedWithin(child, milliseconds)) return;
  child.kill('SIGKILL');
  if (!await stoppedWithin(child, milliseconds)) throw new AiUnavailableError('AI_RUNTIME_TEARDOWN_FAILED');
}
function abortable<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(new AiUnavailableError());
  return new Promise<T>((resolve, reject) => {
    const aborted = () => reject(new AiUnavailableError());
    signal.addEventListener('abort', aborted, { once: true });
    work.then(resolve, reject).finally(() => signal.removeEventListener('abort', aborted)).catch(() => undefined);
  });
}

export interface RuntimeTiming { readonly readinessMs: number; readonly requestMs: number; readonly operationMs: number; readonly stopMs: number; readonly pollMs: number }
export class NativeRuntime implements ModelRuntimePort {
  private readonly timing: RuntimeTiming;
  private active: { controller: AbortController; completion: Promise<unknown> } | undefined;
  private closed = false;
  constructor(private readonly artifacts: RuntimeArtifactPort, timing: Partial<RuntimeTiming> = {}) {
    const limits = artifacts.profile.limits;
    const maximum: RuntimeTiming = { readinessMs: limits.readinessSeconds * 1000, requestMs: limits.inferenceSeconds * 1000, operationMs: limits.operationSeconds * 1000, stopMs: 10000, pollMs: 250 };
    this.timing = { ...maximum, ...timing };
    if ((Object.keys(maximum) as (keyof RuntimeTiming)[]).some(key => !Number.isSafeInteger(this.timing[key]) || this.timing[key] < 1 || this.timing[key] > maximum[key])) throw new AiUnavailableError('AI_RUNTIME_TIMING_INVALID');
  }
  run<T>(kind: ModelKind, execute: (session: ModelSession) => Promise<T>, signal?: AbortSignal): Promise<T> {
    if (this.closed || this.active || signal?.aborted) return Promise.reject(new AiUnavailableError('AI_RUNTIME_BUSY_OR_CLOSED'));
    const controller = new AbortController();
    const combined = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
    const completion = this.execute(kind, execute, combined);
    const active = { controller, completion }; this.active = active;
    return completion.finally(() => { if (this.active === active) this.active = undefined; });
  }
  async close(): Promise<void> {
    this.closed = true;
    const active = this.active;
    if (active) { active.controller.abort(); await active.completion.catch(() => undefined); }
  }
  private async finishLease(lock: FileHandle, path: string, record: string, stopped: boolean): Promise<void> {
    try {
      await lock.close();
      if (stopped) {
        if (await readFile(path, 'utf8') !== record) throw new Error();
        await unlink(path);
      }
    } catch { throw new AiUnavailableError('AI_RUNTIME_LOCK_CHANGED_OR_UNAVAILABLE'); }
  }
  private async execute<T>(kind: ModelKind, execute: (session: ModelSession) => Promise<T>, caller: AbortSignal): Promise<T> {
    const deadline = new AbortController();
    const timer = setTimeout(() => deadline.abort(), this.timing.operationMs); timer.unref();
    const signal = AbortSignal.any([caller, deadline.signal]);
    const lockPath = join(this.artifacts.home, '.biblia-ai.lock');
    const record = JSON.stringify({ pid: process.pid, nonce: randomUUID() });
    let lock: FileHandle | undefined; let child: ChildProcess | undefined;
    try {
      signal.throwIfAborted();
      lock = await open(lockPath, 'wx', 0o600); await lock.writeFile(record);
      const files = await this.artifacts.verify(kind, signal); signal.throwIfAborted();
      const allowed = new Set(this.artifacts.profile.runtime.environmentAllowlist.map(name => name.toUpperCase()));
      const environment = Object.fromEntries(Object.entries(process.env).filter(([name]) => allowed.has(name.toUpperCase())));
      const version = await versionCommand(files.executable, [...files.argsPrefix, '--version'], { cwd: this.artifacts.home, env: environment, windowsHide: true, signal, timeout: 10000, maxBuffer: 65536, killSignal: 'SIGKILL' });
      if (!(version.stdout + version.stderr).includes(files.engineCommit)) throw new AiUnavailableError('AI_RUNTIME_VERSION_INVALID');
      const port = await availablePort(); signal.throwIfAborted();
      const context = kind === 'embedding' ? this.artifacts.profile.limits.embeddingContextTokens : this.artifacts.profile.limits.generationContextTokens;
      const args = [...files.argsPrefix, '--model', files.model, '--alias', kind === 'embedding' ? 'biblia-embedding' : 'biblia-generation', '--host', '127.0.0.1', '--port', String(port), '--api-key-file', files.keyFile, '--ctx-size', String(context), '--parallel', '1', '--threads', '2', '--threads-batch', '2', '--batch-size', '512', '--ubatch-size', '512', '--n-gpu-layers', '0', '--timeout', '120', '--offline', '--no-context-shift', '--no-agent', '--no-webui'];
      if (kind === 'embedding') args.push('--embedding', '--pooling', 'last');
      else args.push('--chat-template-kwargs', JSON.stringify({ enable_thinking: this.artifacts.profile.generation.enableThinking }));
      child = spawn(files.executable, args, { cwd: this.artifacts.home, env: environment, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
      let failed = false; let listening = false; let tail = '';
      const output = (chunk: Buffer) => { tail = (tail + chunk.toString('utf8')).slice(-8192); if (tail.includes(`listening on http://127.0.0.1:${port}`)) listening = true; };
      child.stdout?.on('data', output); child.stderr?.on('data', output);
      child.once('error', () => { failed = true; }); child.once('exit', () => { failed = true; });
      const started = performance.now();
      for (;;) {
        signal.throwIfAborted();
        if (failed) throw new AiUnavailableError('AI_RUNTIME_EXITED');
        if (performance.now() - started >= this.timing.readinessMs) throw new AiTimeoutError();
        if (listening) {
          try {
            const response = await fetch(`http://127.0.0.1:${port}/health`, { redirect: 'error', signal: AbortSignal.any([signal, AbortSignal.timeout(Math.min(1000, this.timing.readinessMs))]) });
            await response.body?.cancel();
            if (response.status === 200 && !failed) break;
            if (response.status !== 503) throw new AiUnavailableError('AI_RUNTIME_HEALTH_INVALID');
          } catch (error) { if (error instanceof AiUnavailableError) throw error; }
        }
        await pause(this.timing.pollMs, undefined, { signal });
      }
      const client = new NativeModelHttpClient(`http://127.0.0.1:${port}`, files.key, files.engineCommit, this.timing.requestMs, signal);
      return await abortable(execute(client), signal);
    } catch (error) {
      if (deadline.signal.aborted) throw new AiTimeoutError();
      if (caller.aborted) throw new AiUnavailableError('AI_RUNTIME_CANCELLED');
      if (error instanceof AiUnavailableError || error instanceof AiTimeoutError || error instanceof AiResultRejectedError) throw error;
      throw new AiUnavailableError('AI_RUNTIME_PROCESS_FAILED');
    } finally {
      let stopped = false;
      try { await stopOwnChild(child, this.timing.stopMs); stopped = true; }
      finally {
        try {
          if (lock) await this.finishLease(lock, lockPath, record, stopped);
        } finally { clearTimeout(timer); }
      }
    }
  }
}
