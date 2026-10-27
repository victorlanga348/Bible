import type { OnModuleDestroy } from '@nestjs/common';
import type { AiOperationPort } from '../application/analysis-ports';
import { randomUUID } from 'node:crypto';
import { open, readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { AiTimeoutError, AiUnavailableError } from '../application/errors';

export class AiOperationSlot implements AiOperationPort, OnModuleDestroy {
  private active: AbortController | undefined;
  private pending: Promise<unknown> | undefined;
  private closed = false;
  constructor(private readonly home: string, private readonly operationMilliseconds = 600000) {
    if (!Number.isSafeInteger(operationMilliseconds) || operationMilliseconds <= 0 || operationMilliseconds > 600000) throw new AiUnavailableError();
  }
  run<T>(execute: (signal: AbortSignal) => Promise<T>, signal?: AbortSignal): Promise<T> {
    if (this.closed || this.active) return Promise.reject(new AiUnavailableError());
    const controller = new AbortController(); this.active = controller;
    const pending = this.runOwned(execute, controller, signal); this.pending = pending;
    return pending.finally(() => { this.active = undefined; this.pending = undefined; });
  }
  private async runOwned<T>(execute: (signal: AbortSignal) => Promise<T>, controller: AbortController, parent?: AbortSignal): Promise<T> {
    const path = join(this.home, '.biblia-ai-operation.lock'); const nonce = randomUUID();
    const deadline = performance.now() + this.operationMilliseconds;
    let acquired = false; let timedOut = false; let result!: T;
    const abort = (): void => controller.abort();
    const failure = (): Error | undefined => timedOut || performance.now() >= deadline ? new AiTimeoutError() : controller.signal.aborted || parent?.aborted ? new AiUnavailableError() : undefined;
    const assertActive = (): void => { const error = failure(); if (error) throw error; };
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, Math.max(0, deadline - performance.now()));
    parent?.addEventListener('abort', abort, { once: true });
    try {
      try {
        assertActive();
        try {
          const file = await open(path, 'wx', 0o600); acquired = true;
          try { await file.writeFile(JSON.stringify({ pid: process.pid, nonce }), 'utf8'); }
          finally { await file.close(); }
        } catch { throw new AiUnavailableError(); }
        assertActive();
        result = await execute(controller.signal); assertActive();
      } finally {
        clearTimeout(timer); parent?.removeEventListener('abort', abort);
        if (acquired) await this.release(path, nonce);
      }
      assertActive(); return result;
    } catch (error) { throw failure() ?? error; }
  }
  private async release(path: string, nonce: string): Promise<void> {
    try {
      const owner = JSON.parse(await readFile(path, 'utf8')) as { pid: unknown; nonce: unknown };
      if (owner.pid !== process.pid || owner.nonce !== nonce) throw new AiUnavailableError();
      await unlink(path);
    } catch { throw new AiUnavailableError(); }
  }
  async onModuleDestroy(): Promise<void> {
    this.closed = true; this.active?.abort();
    await this.pending?.catch(() => undefined);
  }
}
