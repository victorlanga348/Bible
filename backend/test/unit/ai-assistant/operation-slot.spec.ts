import { existsSync } from 'node:fs';
import { mkdtemp, readFile, writeFile, rm, unlink, type FileHandle } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { performance } from 'node:perf_hooks';
import { AiOperationSlot } from '../../../src/modules/ai-assistant/infrastructure/operation-slot';
import { AiTimeoutError, AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';

// Physical technical filesystem and cooperative callbacks only; no AI inference.
function guarded<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const watchdog = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Technical harness watchdog; operation did not settle')), 5000); });
  return Promise.race([promise, watchdog]).finally(() => clearTimeout(timer));
}
const untilAbort = (signal: AbortSignal): Promise<never> => new Promise((_, reject) => {
  if (signal.aborted) reject(new Error('Technical callback cancelled'));
  else signal.addEventListener('abort', () => reject(new Error('Technical callback cancelled')), { once: true });
});

describe('whole-operation owned lease and monotonic budget, real filesystem', () => {
  let home: string; let slots: AiOperationSlot[];
  const slot = (budget = 5000) => { const value = new AiOperationSlot(home, budget); slots.push(value); return value; };
  const lease = () => join(home, '.biblia-ai-operation.lock');
  beforeEach(async () => { home = await mkdtemp(join(resolve('reports'), 'ai-operation-')); slots = []; });
  afterEach(async () => {
    for (const value of slots) await value.onModuleDestroy();
    if (!home.startsWith(resolve('reports') + sep + 'ai-operation-')) throw new Error('Unsafe technical cleanup');
    await rm(home, { recursive: true, force: true });
  });
  it('holds an exclusive owned lease throughout the callback and removes it before returning success', async () => {
    const value = slot();
    expect(await value.run(async signal => {
      expect(signal.aborted).toBe(false); expect(existsSync(lease())).toBe(true);
      const identity = JSON.parse(await readFile(lease(), 'utf8')) as { pid: number; nonce: string };
      expect(identity.pid).toBe(process.pid); expect(identity.nonce).toMatch(/^[0-9a-f-]{36}$/);
      return 42;
    })).toBe(42);
    expect(existsSync(lease())).toBe(false); expect(await value.run(async () => 43)).toBe(43);
  });
  it('admits the fixed default profile budget without leaving a timer or lease after successful work', async () => {
    const value = new AiOperationSlot(home); slots.push(value);
    const scheduled = jest.spyOn(globalThis, 'setTimeout'); const cleared = jest.spyOn(globalThis, 'clearTimeout'); const realClear = cleared.getMockImplementation()!;
    try {
      expect(await value.run(async () => { expect(existsSync(lease())).toBe(true); return 'default-profile-budget'; })).toBe('default-profile-budget');
      expect(scheduled).toHaveBeenCalled();
      for (const result of scheduled.mock.results) if (result.type === 'return') expect(cleared).toHaveBeenCalledWith(result.value);
    } finally {
      // Test cleanup may close a leaked owned timer after an assertion already
      // failed; it cannot turn the missing product cleanup into a PASS.
      for (const result of scheduled.mock.results) if (result.type === 'return') realClear(result.value);
      scheduled.mockRestore(); cleared.mockRestore();
    }
    expect(existsSync(lease())).toBe(false);
  });
  it('releases its own lease after a callback error and preserves the actual non-timeout error', async () => {
    const value = slot(); const original = new Error('Controlled technical failure');
    await expect(value.run(async () => { throw original; })).rejects.toBe(original);
    expect(existsSync(lease())).toBe(false); expect(await value.run(async () => 'after-failure')).toBe('after-failure');
  });
  it('closes the actual owned lease file descriptor rather than relying on eventual garbage collection', async () => {
    const actualFs = jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises'); const originalOpen = actualFs.open;
    const handles: FileHandle[] = [];
    const observer = jest.spyOn(actualFs, 'open').mockImplementation(async (path, flags, mode) => { const handle = await originalOpen(path, flags, mode); handles.push(handle); return handle; });
    try {
      expect(await slot().run(async () => 1)).toBe(1); expect(handles.length).toBeGreaterThan(0);
      handles.forEach(handle => expect(handle.fd).toBe(-1));
    } finally { observer.mockRestore(); for (const handle of handles) if (handle.fd !== -1) await handle.close(); }
  });
  it('rejects same-instance and other-instance concurrency without queueing or touching the first lease', async () => {
    const first = slot(); const second = slot(); let entered!: () => void; let release!: (value: number) => void;
    const started = new Promise<void>(resolveStarted => { entered = resolveStarted; });
    const pending = first.run(signal => new Promise<number>((resolveResult, reject) => { release = resolveResult; signal.addEventListener('abort', () => reject(new Error('Technical cancellation')), { once: true }); entered(); }));
    void pending.catch(() => undefined);
    try {
      await guarded(started); const before = await readFile(lease(), 'utf8');
      await expect(first.run(async () => 2)).rejects.toThrow(AiUnavailableError); await expect(second.run(async () => 3)).rejects.toThrow(AiUnavailableError);
      expect(await readFile(lease(), 'utf8')).toBe(before); release(1); expect(await guarded(pending)).toBe(1);
      expect(await second.run(async () => 4)).toBe(4);
    } finally { release?.(1); }
  });
  it('refuses and preserves a pre-existing foreign lease, including one using the current PID', async () => {
    const foreign = JSON.stringify({ pid: process.pid, nonce: 'foreign-technical-owner' }); await writeFile(lease(), foreign);
    await expect(slot().run(async () => 1)).rejects.toThrow(AiUnavailableError); expect(await readFile(lease(), 'utf8')).toBe(foreign);
  });
  it('never unlinks a lease whose nonce was replaced during its callback', async () => {
    const foreign = JSON.stringify({ pid: process.pid, nonce: 'replaced-technical-owner' });
    await expect(slot().run(async () => { await writeFile(lease(), foreign); return 1; })).rejects.toThrow(AiUnavailableError);
    expect(await readFile(lease(), 'utf8')).toBe(foreign);
  });
  it('refuses a replaced PID even when the nonce was retained, without signalling that PID', async () => {
    let foreign = '';
    await expect(slot().run(async () => {
      const identity = JSON.parse(await readFile(lease(), 'utf8')) as { pid: number; nonce: string };
      foreign = JSON.stringify({ ...identity, pid: process.pid + 1 }); await writeFile(lease(), foreign); return 1;
    })).rejects.toThrow(AiUnavailableError);
    expect(await readFile(lease(), 'utf8')).toBe(foreign);
  });
  it('preserves malformed replacement contents rather than deleting a lock it cannot authenticate', async () => {
    await expect(slot().run(async () => { await writeFile(lease(), 'malformed technical ownership'); return 1; })).rejects.toThrow(AiUnavailableError);
    expect(await readFile(lease(), 'utf8')).toBe('malformed technical ownership');
  });
  it('fails closed when its lease disappears, without creating an unowned replacement', async () => {
    await expect(slot().run(async () => { await unlink(lease()); return 1; })).rejects.toThrow(AiUnavailableError);
    expect(existsSync(lease())).toBe(false);
  });
  it('rejects an already cancelled caller before lease acquisition or callback execution', async () => {
    const value = slot(); const abort = new AbortController(); abort.abort(); const execute = jest.fn(async () => 1);
    await expect(value.run(execute, abort.signal)).rejects.toThrow(AiUnavailableError); expect(execute).not.toHaveBeenCalled(); expect(existsSync(lease())).toBe(false);
    expect(await value.run(async () => 2)).toBe(2);
  });
  it('propagates caller cancellation to the active callback, waits for cleanup and then frees the slot', async () => {
    const value = slot(); const abort = new AbortController(); let entered!: () => void; const started = new Promise<void>(resolveStarted => { entered = resolveStarted; });
    const pending = value.run(signal => { entered(); return untilAbort(signal); }, abort.signal); void pending.catch(() => undefined);
    await guarded(started); abort.abort(); await expect(guarded(pending)).rejects.toThrow(AiUnavailableError);
    expect(existsSync(lease())).toBe(false); expect(await value.run(async () => 2)).toBe(2);
  });
  it('aborts the complete operation on its real short test budget and classifies its timeout distinctly', async () => {
    const value = slot(80); const began = performance.now();
    await expect(guarded(value.run(untilAbort))).rejects.toThrow(AiTimeoutError);
    expect(performance.now() - began).toBeLessThan(3000); expect(existsSync(lease())).toBe(false);
    expect(await value.run(async () => 2)).toBe(2);
  });
  it('refuses a late success even when the event loop prevented its timeout timer from firing', async () => {
    const value = slot(1000); let entered = false;
    await expect(guarded(value.run(async signal => {
      entered = true; expect(signal.aborted).toBe(false);
      const stopAt = performance.now() + 1100; while (performance.now() < stopAt) { /* bounded technical event-loop stall */ }
      expect(signal.aborted).toBe(false); return 'late-technical-success';
    }))).rejects.toThrow(AiTimeoutError);
    expect(entered).toBe(true); expect(existsSync(lease())).toBe(false);
  });
  it('closes admission on shutdown, cancels and waits for its own callback, then removes its lease', async () => {
    const value = slot(); let entered!: () => void; const started = new Promise<void>(resolveStarted => { entered = resolveStarted; });
    const pending = value.run(signal => { entered(); return untilAbort(signal); }); void pending.catch(() => undefined);
    await guarded(started); await guarded(value.onModuleDestroy()); await expect(guarded(pending)).rejects.toThrow(AiUnavailableError);
    expect(existsSync(lease())).toBe(false); await expect(value.run(async () => 1)).rejects.toThrow(AiUnavailableError);
  });
  it('makes idle shutdown idempotent without creating a lease', async () => {
    const value = slot(); await value.onModuleDestroy(); await value.onModuleDestroy();
    await expect(value.run(async () => 1)).rejects.toThrow(AiUnavailableError); expect(existsSync(lease())).toBe(false);
  });
  it.each([0, -1, 0.5, NaN, Infinity, 600001])('rejects an unsafe trusted operation budget %p', budget => {
    expect(() => new AiOperationSlot(home, budget)).toThrow(AiUnavailableError); expect(existsSync(lease())).toBe(false);
  });
});
