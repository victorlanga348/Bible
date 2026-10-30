import { afterEach, expect, it, vi } from 'vitest';
import { loadGoogleIdentity } from '../shared/auth/google-identity';

const sdk = { initialize: vi.fn(), renderButton: vi.fn() };
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); document.querySelectorAll('script[src="https://accounts.google.com/gsi/client"]').forEach(node => node.remove()); });
it('reuses the official SDK already loaded in this page', async () => {
  vi.stubGlobal('google', { accounts: { id: sdk } });
  await expect(loadGoogleIdentity()).resolves.toBe(sdk);
});
it('loads one official script for concurrent consumers and resolves only after the SDK is available', async () => {
  vi.stubGlobal('google', undefined);
  const first = loadGoogleIdentity(), second = loadGoogleIdentity();
  void first.catch(() => {}); void second.catch(() => {});
  const scripts = document.querySelectorAll<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
  expect(scripts).toHaveLength(1);
  expect(scripts[0]?.async).toBe(true);
  vi.stubGlobal('google', { accounts: { id: sdk } }); scripts[0]!.dispatchEvent(new Event('load'));
  await expect(first).resolves.toBe(sdk); await expect(second).resolves.toBe(sdk);
});
it('rejects a failed load without exposing diagnostics and allows an explicit retry', async () => {
  vi.stubGlobal('google', undefined);
  const failed = loadGoogleIdentity(); const rejection = expect(failed).rejects.toThrow('Google indisponível');
  document.querySelector('script[src="https://accounts.google.com/gsi/client"]')?.dispatchEvent(new Event('error'));
  await rejection;
  expect(document.querySelector('script[src="https://accounts.google.com/gsi/client"]')).toBeNull();
  const retry = loadGoogleIdentity();
  vi.stubGlobal('google', { accounts: { id: sdk } });
  document.querySelector('script[src="https://accounts.google.com/gsi/client"]')?.dispatchEvent(new Event('load'));
  await expect(retry).resolves.toBe(sdk);
});
it('stops waiting when the official script never responds', async () => {
  vi.useFakeTimers(); vi.stubGlobal('google', undefined);
  const pending = loadGoogleIdentity(); const rejection = expect(pending).rejects.toThrow('Google indisponível');
  await vi.advanceTimersByTimeAsync(15000);
  await rejection;
});
it('rejects a load event that does not actually make the official SDK available', async () => {
  vi.stubGlobal('google', undefined);
  const loading = loadGoogleIdentity(); const rejection = expect(loading).rejects.toThrow('Google indisponível');
  document.querySelector('script[src="https://accounts.google.com/gsi/client"]')?.dispatchEvent(new Event('load'));
  await rejection;
});
