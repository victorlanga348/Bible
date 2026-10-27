import { randomBytes } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { AiResultRejectedError, AiTimeoutError, AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import { NativeRuntime, type RuntimeTiming } from '../../../src/modules/ai-assistant/infrastructure/native-runtime';
import type { RuntimeArtifactPort, VerifiedModelFiles } from '../../../src/modules/ai-assistant/infrastructure/runtime-artifacts';
import type { InstalledRuntimeProfile } from '../../../src/modules/ai-assistant/infrastructure/profile';

describe('owned native lifecycle using a technical Node child, never AI', () => {
  const reports = resolve('reports'); const homes: string[] = []; const runtimes: NativeRuntime[] = [];
  const timings: RuntimeTiming = { readinessMs: 3000, requestMs: 2000, operationMs: 10000, stopMs: 100, pollMs: 20 };
  const make = async (mode = 'normal', override: Partial<RuntimeTiming> = {}) => {
    const home = await mkdtemp(join(reports, 'native-runtime-test-')); homes.push(home);
    const key = randomBytes(36).toString('base64url'); await writeFile(join(home, 'runtime.key'), key + '\n');
    const original = JSON.parse(await readFile('admissions/local-extractive-v1.json', 'utf8')) as InstalledRuntimeProfile;
    const profile: InstalledRuntimeProfile = { ...original, id: 'technical-process-policy', runtime: { ...original.runtime, engineCommit: 'technical-native-runtime-1' } };
    let verifications = 0;
    const artifacts: RuntimeArtifactPort = { home, profile, verify: async (): Promise<VerifiedModelFiles> => {
      verifications++;
      return { executable: process.execPath, argsPrefix: [resolve('test/fixtures/ai-assistant/technical-native-server.cjs'), '--technical-mode=' + mode, '--technical-pid-file', join(home, 'model.pid')], model: join(home, 'technical-not-a-model.fixture'), keyFile: join(home, 'runtime.key'), key, engineCommit: 'technical-native-runtime-1' };
    } };
    const runtime = new NativeRuntime(artifacts, { ...timings, ...override }); runtimes.push(runtime);
    return { home, runtime, artifacts, key, verifications: () => verifications };
  };
  const missing = async (path: string) => access(path).then(() => false, () => true);
  const childStopped = async (home: string) => { const pid = Number(await readFile(join(home, 'model.pid'), 'utf8')); expect(() => process.kill(pid, 0)).toThrow(); };
  afterEach(async () => {
    for (const runtime of runtimes.splice(0)) await runtime.close();
    for (const home of homes.splice(0)) {
      const inside = relative(reports, resolve(home));
      if (inside === '..' || inside.startsWith('..' + sep) || isAbsolute(inside) || !inside.startsWith('native-runtime-test-')) throw new Error('Unsafe native harness cleanup');
      await rm(home, { recursive: true, force: true });
    }
  });
  it('loads only its own child, authenticates, sanitizes env/argv and stops it before releasing the lock', async () => {
    const { home, runtime, key } = await make(); const prior = process.env.BIBLE_TECH_PRIVATE_MARKER;
    process.env.BIBLE_TECH_PRIVATE_MARKER = 'technical-private-value';
    try {
      const value = await runtime.run('generation', async session => ({ version: session.runtimeVersion, response: await session.post('/tokenize', { content: 'technical' }, 8192) }));
      expect(value.version).toBe('technical-native-runtime-1');
      const output = value.response as { authenticated: boolean; envLeaked: boolean; argv: string[] };
      expect(output.authenticated).toBe(true); expect(output.envLeaked).toBe(false);
      expect(output.argv.includes(key)).toBe(false);
      expect(output.argv).toEqual(expect.arrayContaining(['--offline', '--no-context-shift', '--no-webui', '--no-agent', '--api-key-file', join(home, 'runtime.key')]));
      const options = ['--model', '--alias', '--host', '--ctx-size', '--parallel', '--threads', '--threads-batch', '--batch-size', '--ubatch-size', '--n-gpu-layers', '--timeout', '--chat-template-kwargs'];
      expect(Object.fromEntries(options.map(name => [name, output.argv[output.argv.indexOf(name) + 1]]))).toEqual({
        '--model': join(home, 'technical-not-a-model.fixture'), '--alias': 'biblia-generation', '--host': '127.0.0.1', '--ctx-size': '2048', '--parallel': '1', '--threads': '2', '--threads-batch': '2', '--batch-size': '512', '--ubatch-size': '512', '--n-gpu-layers': '0', '--timeout': '120', '--chat-template-kwargs': '{"enable_thinking":false}',
      });
      expect(output.argv).not.toContain('--embedding');
      await childStopped(home); expect(await missing(join(home, '.biblia-ai.lock'))).toBe(true);
    } finally { if (prior === undefined) delete process.env.BIBLE_TECH_PRIVATE_MARKER; else process.env.BIBLE_TECH_PRIVATE_MARKER = prior; }
  });
  it('selects dedicated embedding flags and can start another session after cleanup', async () => {
    const { home, runtime } = await make();
    for (let pass = 0; pass < 2; pass++) {
      const data = await runtime.run('embedding', session => session.post('/tokenize', {}, 8192)) as { argv: string[] };
      expect(data.argv).toEqual(expect.arrayContaining(['--embedding', '--pooling', 'last', '--ctx-size', '1024']));
      await childStopped(home);
    }
  });
  it('preserves a classified callback failure and still removes its own process/lock', async () => {
    const { home, runtime } = await make(); const error = new AiResultRejectedError();
    await expect(runtime.run('generation', async () => { throw error; })).rejects.toBe(error);
    await childStopped(home); expect(await missing(join(home, '.biblia-ai.lock'))).toBe(true);
  });
  it('sanitizes unexpected callback diagnostics and still tears down its owned child', async () => {
    const { home, runtime } = await make();
    const error: unknown = await runtime.run('generation', async () => { throw new Error('technical private callback diagnostic'); }).catch((value: unknown) => value);
    expect(error).toBeInstanceOf(AiUnavailableError);
    expect((error as Error).message).toBe('AI_RUNTIME_PROCESS_FAILED');
    await childStopped(home); expect(await missing(join(home, '.biblia-ai.lock'))).toBe(true);
  });
  it('rejects an unexpected health status before invoking the session callback', async () => {
    const { home, runtime } = await make('health-invalid'); let called = false;
    await expect(runtime.run('generation', async () => { called = true; return true; })).rejects.toMatchObject({ message: 'AI_RUNTIME_HEALTH_INVALID' });
    expect(called).toBe(false); await childStopped(home);
    expect(await missing(join(home, '.biblia-ai.lock'))).toBe(true);
  });
  it.each(['bad-version', 'exit-early'])('fails closed for %s rather than reporting model readiness', async mode => {
    const { home, runtime } = await make(mode);
    await expect(runtime.run('generation', async () => true)).rejects.toBeInstanceOf(AiUnavailableError);
    expect(await missing(join(home, '.biblia-ai.lock'))).toBe(true);
  });
  it.each(['never-listen', 'unhealthy'])('bounds readiness for %s and stops only the created child', async mode => {
    const { home, runtime } = await make(mode, { readinessMs: 1000 });
    await expect(runtime.run('generation', async () => true)).rejects.toBeInstanceOf(AiTimeoutError);
    await childStopped(home); expect(await missing(join(home, '.biblia-ai.lock'))).toBe(true);
  });
  it('bounds even an uncooperative asynchronous callback and cleans up its child', async () => {
    const { home, runtime } = await make('normal', { operationMs: 1200 });
    await expect(runtime.run('generation', async () => new Promise<never>(() => {}))).rejects.toBeInstanceOf(AiTimeoutError);
    await childStopped(home);
  });
  it('rejects a pre-aborted caller before verifying artifacts or loading a process', async () => {
    const { home, runtime, verifications } = await make(); const controller = new AbortController(); controller.abort('technical private reason');
    await expect(runtime.run('generation', async () => true, controller.signal)).rejects.toBeInstanceOf(AiUnavailableError);
    expect(verifications()).toBe(0); expect(await missing(join(home, 'model.pid'))).toBe(true);
  });
  it('does not delete a lock belonging to another process/instance', async () => {
    const { home, runtime, verifications } = await make(); const lock = join(home, '.biblia-ai.lock'); await writeFile(lock, 'technical-foreign-lock');
    await expect(runtime.run('generation', async () => true)).rejects.toBeInstanceOf(AiUnavailableError);
    expect(await readFile(lock, 'utf8')).toBe('technical-foreign-lock'); expect(verifications()).toBe(0);
  });
  it('does not delete a replacement lock created during a session', async () => {
    const { home, runtime } = await make(); const lock = join(home, '.biblia-ai.lock');
    await expect(runtime.run('generation', async () => { await writeFile(lock, 'technical replacement'); return true; })).rejects.toBeInstanceOf(AiUnavailableError);
    expect(await readFile(lock, 'utf8')).toBe('technical replacement'); await childStopped(home);
  });
  it('classifies a disappeared lease during cleanup without leaking the filesystem error', async () => {
    const { home, runtime } = await make(); const lock = join(home, '.biblia-ai.lock');
    await expect(runtime.run('generation', async () => { await rm(lock); return true; })).rejects.toBeInstanceOf(AiUnavailableError);
    await childStopped(home);
  });
  it('serializes sessions across two runtime instances with the same artifact directory', async () => {
    const { runtime, artifacts } = await make(); const other = new NativeRuntime(artifacts, timings); runtimes.push(other);
    let enter!: () => void; let release!: () => void;
    const entered = new Promise<void>(resolve => { enter = resolve; }); const released = new Promise<void>(resolve => { release = resolve; });
    const first = runtime.run('embedding', async () => { enter(); await released; return 'first'; });
    try {
      expect(await Promise.race([entered.then(() => true), first.then(() => false)])).toBe(true);
      await expect(other.run('generation', async () => 'second')).rejects.toBeInstanceOf(AiUnavailableError);
      await expect(runtime.run('generation', async () => 'same instance')).rejects.toBeInstanceOf(AiUnavailableError);
    } finally { release(); }
    await expect(first).resolves.toBe('first');
  });
  it('shutdown interrupts a pending private response and disallows later sessions', async () => {
    const { home, runtime } = await make(); let enter!: () => void;
    const entered = new Promise<void>(resolve => { enter = resolve; });
    const pending = runtime.run('generation', async session => { enter(); return session.post('/tokenize', { pending: true }, 8192); });
    const observed = pending.catch((value: unknown) => value);
    expect(await Promise.race([entered.then(() => true), observed.then(() => false)])).toBe(true);
    await runtime.close(); expect(await observed).toBeInstanceOf(AiUnavailableError);
    await childStopped(home);
    await expect(runtime.run('generation', async () => true)).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it('finishes teardown when the technical child ignores graceful termination', async () => {
    const { home, runtime } = await make('ignore-term');
    await expect(runtime.run('generation', async () => 'technical complete')).resolves.toBe('technical complete');
    await childStopped(home); expect(await missing(join(home, '.biblia-ai.lock'))).toBe(true);
  });
  it.each([{ readinessMs: 180001 }, { requestMs: 120001 }, { operationMs: 600001 }, { stopMs: 10001 }, { pollMs: 251 }, { pollMs: 0 }, { requestMs: 0.5 }])('does not allow an internal timing override to expand the approved limits %j', async override => {
    await expect(make('normal', override)).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it('independently bounds the technical harness if a mutation worker loses cleanup', async () => {
    const { home } = await make('never-listen');
    await expect(promisify(execFile)(process.execPath, [resolve('test/fixtures/ai-assistant/technical-native-server.cjs'), '--technical-mode=never-listen', '--technical-watchdog-ms', '150', '--technical-pid-file', join(home, 'model.pid')], { windowsHide: true, timeout: 3000 })).rejects.toMatchObject({ code: 91 });
    await childStopped(home);
  });
});
