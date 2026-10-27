import type { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { PassThrough } from 'node:stream';
import { randomBytes } from 'node:crypto';
import { AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import { NativeRuntime } from '../../../src/modules/ai-assistant/infrastructure/native-runtime';
import type { InstalledRuntimeProfile } from '../../../src/modules/ai-assistant/infrastructure/profile';
import type { RuntimeArtifactPort } from '../../../src/modules/ai-assistant/infrastructure/runtime-artifacts';

const childProcesses = jest.requireActual<typeof import('node:child_process')>('node:child_process');

// Explicit fault double: its PID never reaches an OS signal API. No model/AI is run.
class TechnicalChildFault extends EventEmitter {
  pid: number | undefined = 123456;
  exitCode: number | null = null;
  signalCode: NodeJS.Signals | null = null;
  readonly stdout = new PassThrough();
  readonly stderr = new PassThrough();
  readonly signals: NodeJS.Signals[] = [];
  constructor(private readonly mode: 'spawn-error' | 'exit-code' | 'signal-code' | 'unkillable') { super(); }
  kill(signal: NodeJS.Signals): boolean {
    this.signals.push(signal);
    if (this.mode === 'unkillable') return false;
    if (this.mode === 'exit-code') this.exitCode = 0;
    else this.signalCode = signal;
    // Models the race in which exit state is already visible to stoppedWithin.
    return true;
  }
}

describe('explicit unit fault injection for rare ChildProcess states; not native/AI integration', () => {
  const reports = resolve('reports'); const homes: string[] = []; const runtimes: NativeRuntime[] = []; const servers: Server[] = [];
  afterEach(async () => {
    jest.restoreAllMocks();
    for (const runtime of runtimes.splice(0)) await runtime.close();
    for (const server of servers.splice(0)) {
      server.closeAllConnections();
      if (server.listening) await new Promise<void>(resolve => server.close(() => resolve()));
    }
    for (const home of homes.splice(0)) {
      const inside = relative(reports, resolve(home));
      if (inside === '..' || inside.startsWith('..' + sep) || isAbsolute(inside) || !inside.startsWith('native-fault-test-')) throw new Error('Unsafe fault harness cleanup');
      await rm(home, { recursive: true, force: true });
    }
  });
  const prepare = async (mode: 'spawn-error' | 'exit-code' | 'signal-code' | 'unkillable') => {
    const home = await mkdtemp(join(reports, 'native-fault-test-')); homes.push(home);
    const key = randomBytes(36).toString('base64url'); await writeFile(join(home, 'runtime.key'), key);
    const original = JSON.parse(await readFile('admissions/local-extractive-v1.json', 'utf8')) as InstalledRuntimeProfile;
    const profile: InstalledRuntimeProfile = { ...original, runtime: { ...original.runtime, engineCommit: 'technical-native-runtime-1' } };
    const artifacts: RuntimeArtifactPort = { home, profile, verify: async () => ({ executable: process.execPath, argsPrefix: [resolve('test/fixtures/ai-assistant/technical-native-server.cjs'), '--technical-mode=normal'], model: join(home, 'technical-no-weights'), key, keyFile: join(home, 'runtime.key'), engineCommit: profile.runtime.engineCommit }) };
    const child = new TechnicalChildFault(mode);
    jest.spyOn(childProcesses, 'spawn').mockImplementation(((...args: Parameters<typeof childProcesses.spawn>) => {
      const argv = args[1] as readonly string[];
      if (mode === 'spawn-error') {
        child.pid = undefined;
        setImmediate(() => child.emit('error', new Error('technical private OS diagnostic')));
      } else {
        const port = Number(argv[argv.indexOf('--port') + 1]);
        const server = createServer((_request, response) => { response.end('{"status":"ok"}'); }); servers.push(server);
        server.listen(port, '127.0.0.1', () => child.stderr.write(`technical listening on http://127.0.0.1:${port}\n`));
      }
      return child as unknown as ChildProcess;
    }) as typeof childProcesses.spawn);
    const runtime = new NativeRuntime(artifacts, { readinessMs: 2000, operationMs: 5000, requestMs: 1000, pollMs: 10, stopMs: 20 }); runtimes.push(runtime);
    return { home, runtime, child, artifacts };
  };
  it('classifies a spawn error before calling the session and releases the unused lease', async () => {
    const { home, runtime, child } = await prepare('spawn-error'); let called = false;
    const error: unknown = await runtime.run('generation', async () => { called = true; }).catch((value: unknown) => value);
    expect(error).toBeInstanceOf(AiUnavailableError); expect((error as Error).message).not.toContain('private OS');
    expect(called).toBe(false); expect(child.signals).toEqual([]);
    await expect(access(join(home, '.biblia-ai.lock'))).rejects.toMatchObject({ code: 'ENOENT' });
  });
  it.each(['exit-code', 'signal-code'] as const)('accepts an already visible %s after graceful kill without waiting for another close event', async mode => {
    const { home, runtime, child } = await prepare(mode);
    await expect(runtime.run('generation', async () => 'technical success')).resolves.toBe('technical success');
    expect(child.signals).toEqual(['SIGTERM']);
    await expect(access(join(home, '.biblia-ai.lock'))).rejects.toMatchObject({ code: 'ENOENT' });
  });
  it('retains its lease and rejects another session when both simulated kill attempts fail', async () => {
    const { home, runtime, child, artifacts } = await prepare('unkillable');
    await expect(runtime.run('generation', async () => 'must not report completed')).rejects.toMatchObject({ message: 'AI_RUNTIME_TEARDOWN_FAILED' });
    expect(child.signals).toEqual(['SIGTERM', 'SIGKILL']);
    const record: unknown = JSON.parse(await readFile(join(home, '.biblia-ai.lock'), 'utf8'));
    expect(record).toMatchObject({ pid: process.pid, nonce: expect.any(String) });
    const other = new NativeRuntime(artifacts); runtimes.push(other);
    await expect(other.run('generation', async () => 'must not enter')).rejects.toBeInstanceOf(AiUnavailableError);
    expect(JSON.parse(await readFile(join(home, '.biblia-ai.lock'), 'utf8'))).toEqual(record);
  });
});
