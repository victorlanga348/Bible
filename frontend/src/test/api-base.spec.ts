import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getApiBaseUrl, request } from '../shared/api/http-client';
import { apiClient, getApiBaseUrl as legacyBaseUrl } from '../shared/api/client';

// Technical fetch doubles test URL construction; real proxy/API evidence is separate.
describe('same-origin API URLs', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', '');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })));
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it('uses /api by default in the primary client', () => {
    expect(getApiBaseUrl()).toBe('/api');
  });
  it('uses /api by default in the existing service client', () => {
    expect(legacyBaseUrl()).toBe('/api');
  });
  it('resolves relative paths against the page origin and preserves query and method', async () => {
    await request('references/resolve', { method: 'POST', params: { reference: 'GEN 1:1', empty: undefined }, body: { translationId: 'porbr2018' } });
    const [url, options] = vi.mocked(fetch).mock.calls[0]!;
    const parsed = new URL(String(url));
    expect(parsed.origin).toBe(window.location.origin);
    expect(parsed.pathname).toBe('/api/references/resolve');
    expect(parsed.searchParams.get('reference')).toBe('GEN 1:1');
    expect(parsed.searchParams.has('empty')).toBe(false);
    expect(options?.method).toBe('POST');
    expect(options?.body).toBe(JSON.stringify({ translationId: 'porbr2018' }));
  });
  it('keeps the existing service client on the same origin too', async () => {
    await apiClient('/translations', { params: { limit: 2 } });
    const [url] = vi.mocked(fetch).mock.calls[0]!;
    expect(String(url)).toBe(`${window.location.origin}/api/translations?limit=2`);
  });
  it('keeps an explicitly configured API origin and removes a trailing slash', async () => {
    vi.stubEnv('VITE_API_URL', 'http://127.0.0.1:32123/api/');
    await request('/health/live');
    expect(getApiBaseUrl()).toBe('http://127.0.0.1:32123/api');
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('http://127.0.0.1:32123/api/health/live');
  });
});
