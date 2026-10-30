import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, useSession } from '../shared/hooks/use-session';

// Fetch protocol doubles isolate React session races. Native Nest/PG/browser proof is separate.
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const identity = (ownerId = 'technical-owner') => new Response(JSON.stringify({ ownerId }));
const setup = () => renderHook(() => useSession(), { wrapper: SessionProvider });
function deferred() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>(done => { resolve = done; });
  return { promise, resolve };
}

describe('verified in-memory application session', () => {
  it('starts anonymous even when a public build variable contains a token', () => {
    vi.stubEnv('VITE_LOCAL_AUTH_TOKEN', 'technical-env-token');
    const { result } = setup();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.ownerId).toBeNull();
  });
  it('waits for backend identity and retains its actual owner instead of a default', async () => {
    const pending = deferred(); vi.stubGlobal('fetch', vi.fn(() => pending.promise));
    const { result } = setup();
    let login!: Promise<unknown>;
    act(() => { login = Promise.resolve(result.current.setSession('  technical-token  ')); });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    await act(async () => { pending.resolve(identity('google-technical-owner')); await login; });
    expect(result.current.ownerId).toBe('google-technical-owner');
    expect(result.current.token).toBe('technical-token');
    expect(vi.mocked(fetch).mock.calls[0]![0]).toMatch(/\/api\/auth\/me$/);
    const options = vi.mocked(fetch).mock.calls[0]![1];
    expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer technical-token');
    expect(options?.cache).toBe('no-store');
    expect(localStorage.getItem('biblia-token')).toBeNull();
  });
  it.each([
    () => new Response('{}', { status: 401 }),
    () => new Response('{"ownerId":""}'),
    () => new Response('{"ownerId":"owner with spaces"}'),
    () => new Response('{"ownerId":"technical-owner\\n"}'),
    () => new Response('{"ownerId":"technical-owner","email":"unexpected@example.invalid"}'),
  ])('refuses an unverified or malformed identity response', async response => {
    vi.stubGlobal('fetch', vi.fn(async () => response()));
    const { result } = setup();
    await act(async () => { await expect(result.current.setSession('technical-token')).rejects.toThrow(); });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.ownerId).toBeNull();
  });
  it('cannot reactivate a session when logout happens before identity validation returns', async () => {
    const pending = deferred(); vi.stubGlobal('fetch', vi.fn(() => pending.promise));
    const { result } = setup(); let login!: Promise<unknown>;
    act(() => { login = Promise.resolve(result.current.setSession('old-technical-token')); });
    act(() => result.current.clearSession());
    await act(async () => { pending.resolve(identity('old-owner')); await login; });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
  });
  it('does not let a slower old login overwrite the newer verified owner', async () => {
    const old = deferred(); vi.stubGlobal('fetch', vi.fn().mockReturnValueOnce(old.promise).mockResolvedValueOnce(identity('new-owner')));
    const { result } = setup(); let first!: Promise<unknown>;
    act(() => { first = Promise.resolve(result.current.setSession('old-token')); });
    await act(async () => { await result.current.setSession('new-token'); });
    await act(async () => { old.resolve(identity('old-owner')); await first; });
    expect(result.current.ownerId).toBe('new-owner');
    expect(result.current.token).toBe('new-token');
  });
  it('keeps a valid current session when an older request emits an unauthorized event', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => identity('new-owner')));
    const { result } = setup();
    await act(async () => { await result.current.setSession('new-token'); });
    await act(async () => { window.dispatchEvent(new CustomEvent('biblia:unauthorized')); });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.ownerId).toBe('new-owner');
  });
  it('clears the session if the backend confirms its current token is unauthorized', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(identity()).mockResolvedValueOnce(new Response('{}', { status: 401 })));
    const { result } = setup();
    await act(async () => { await result.current.setSession('technical-token'); });
    act(() => { window.dispatchEvent(new CustomEvent('biblia:unauthorized')); });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('does not mistake a temporary network failure for proof of session expiration', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(identity()).mockRejectedValueOnce(new TypeError('technical offline')));
    const { result } = setup();
    await act(async () => { await result.current.setSession('technical-token'); });
    await act(async () => { window.dispatchEvent(new CustomEvent('biblia:unauthorized')); });
    expect(result.current.isAuthenticated).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('rejects a confirmation that changes the identity bound to the current token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(identity('owner-a')).mockResolvedValueOnce(identity('owner-b')));
    const { result } = setup();
    await act(async () => { await result.current.setSession('technical-token'); });
    act(() => { window.dispatchEvent(new CustomEvent('biblia:unauthorized')); });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
  });
  it('does not send an empty token', async () => {
    vi.stubGlobal('fetch', vi.fn()); const { result } = setup();
    await act(async () => { await expect(result.current.setSession('  ')).rejects.toThrow('Não foi possível confirmar'); });
    expect(fetch).not.toHaveBeenCalled(); expect(result.current.isAuthenticated).toBe(false);
  });
  it('aborts an unresponsive identity check at its deadline', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new DOMException('technical abort', 'AbortError')));
    })));
    const { result } = setup(); let login!: Promise<unknown>;
    act(() => { login = result.current.setSession('technical-token'); });
    const rejected = expect(login).rejects.toThrow('Não foi possível confirmar');
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); await rejected; });
    expect(result.current.isAuthenticated).toBe(false); expect(vi.getTimerCount()).toBe(0);
  });
  it('does not let a stale 401 confirmation remove a newer verified session', async () => {
    const old = deferred();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(identity('owner-a')).mockReturnValueOnce(old.promise).mockResolvedValueOnce(identity('owner-b')));
    const { result } = setup();
    await act(async () => { await result.current.setSession('token-a'); });
    act(() => { window.dispatchEvent(new CustomEvent('biblia:unauthorized')); });
    await act(async () => { await result.current.setSession('token-b'); old.resolve(new Response('{}', { status: 401 })); });
    expect(result.current.ownerId).toBe('owner-b'); expect(result.current.isAuthenticated).toBe(true);
  });
  it('clears an active session when identity confirmation is malformed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(identity()).mockResolvedValueOnce(Response.json({ unexpected: true })));
    const { result } = setup();
    await act(async () => { await result.current.setSession('technical-token'); });
    act(() => { window.dispatchEvent(new CustomEvent('biblia:unauthorized')); });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
  });
  it('requires the session provider rather than silently creating a default identity', () => {
    expect(() => renderHook(() => useSession())).toThrow('useSession must be used within SessionProvider');
  });
});

it('ignores an unauthorized event when no token is active', async () => {
  vi.stubGlobal('fetch', vi.fn()); setup();
  await act(async () => { window.dispatchEvent(new CustomEvent('biblia:unauthorized')); });
  expect(fetch).not.toHaveBeenCalled();
});
it('keeps the newer owner when an old identity request fails after another login', async () => {
  const old = deferred();
  vi.stubGlobal('fetch', vi.fn().mockReturnValueOnce(old.promise).mockResolvedValueOnce(identity('new-owner')));
  const { result } = setup(); let stale!: Promise<boolean>;
  act(() => { stale = result.current.setSession('old-token'); });
  await act(async () => { await result.current.setSession('new-token'); });
  await act(async () => { old.resolve(new Response('{}', { status: 401 })); expect(await stale).toBe(false); });
  expect(result.current.ownerId).toBe('new-owner'); expect(result.current.isAuthenticated).toBe(true);
});
it('does not let an older request clear the cancellation handle of a newer check', async () => {
  const first = deferred(), second = deferred();
  vi.stubGlobal('fetch', vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise));
  const { result } = setup(); let old!: Promise<boolean>, recent!: Promise<boolean>;
  act(() => { old = result.current.setSession('old-token'); });
  act(() => { recent = result.current.setSession('new-token'); });
  const signal = vi.mocked(fetch).mock.calls[1]![1]?.signal;
  await act(async () => { first.resolve(identity()); await old; });
  act(() => result.current.clearSession());
  expect(signal?.aborted).toBe(true);
  await act(async () => { second.resolve(identity()); expect(await recent).toBe(false); });
});
it('clears identity timers after success and rejection, and cancels pending work on unmount', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(identity()).mockResolvedValueOnce(new Response('{}', { status: 401 })));
  const { result, unmount } = setup();
  await act(async () => { await result.current.setSession('valid-token'); });
  expect(vi.getTimerCount()).toBe(0);
  await act(async () => { await expect(result.current.setSession('rejected-token')).rejects.toThrow('Não foi possível confirmar a sessão. Tenta novamente.'); });
  expect(vi.getTimerCount()).toBe(0);
  const pending = deferred(); vi.mocked(fetch).mockReturnValueOnce(pending.promise);
  let login!: Promise<boolean>;
  act(() => { login = result.current.setSession('pending-token'); });
  const signal = vi.mocked(fetch).mock.calls.at(-1)![1]?.signal;
  unmount(); expect(signal?.aborted).toBe(true);
  await act(async () => { pending.resolve(identity()); expect(await login).toBe(false); });
  expect(vi.getTimerCount()).toBe(0);
});
it('preserves a newer session when an old successful recheck returns a different owner', async () => {
  const old = deferred();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(identity('owner-a')).mockReturnValueOnce(old.promise).mockResolvedValueOnce(identity('owner-b')));
  const { result } = setup();
  await act(async () => { await result.current.setSession('token-a'); });
  act(() => { window.dispatchEvent(new CustomEvent('biblia:unauthorized')); });
  const recheck = vi.mocked(fetch).mock.calls[1]![1];
  expect(recheck?.cache).toBe('no-store'); expect(recheck?.redirect).toBe('error'); expect(recheck?.signal).toBeDefined();
  await act(async () => { await result.current.setSession('token-b'); old.resolve(identity('owner-a')); });
  expect(result.current.ownerId).toBe('owner-b'); expect(result.current.isAuthenticated).toBe(true);
});
