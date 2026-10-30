import { afterEach, describe, expect, it, vi } from 'vitest';
import { request } from '../shared/api/http-client';
import { apiClient } from '../shared/api/client';

// Protocol regression doubles; actual browser/API/PG proof is separate.
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
const respond = (body = '{}', status = 200) => vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { status })));

describe('request contracts and session-safe error feedback', () => {
  it.each(['primary', 'service'])('keeps a usable error message when the server sends a malformed failure: %s', async client => {
    respond('not-json', 503);
    await expect(client === 'primary' ? request('/technical') : apiClient('/technical'))
      .rejects.toMatchObject({ status: 503, name: 'ApiError', message: expect.stringMatching(/\S/) });
  });
  it.each([new Error('TIMEOUT'), Object.assign(new Error('technical abort'), { name: 'AbortError' })])('presents deadline/abort failures as a recoverable timeout: %j', async error => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw error; }));
    await expect(request('/technical')).rejects.toMatchObject({ status: 504, code: 'TIMEOUT', message: expect.stringMatching(/\S/) });
  });
  it('keeps a usable network failure message without exposing transport internals', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('technical transport internal'); }));
    await expect(request('/technical')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR', message: expect.stringMatching(/\S/) });
  });
  it('requests JSON in the existing service client', async () => {
    respond(); await apiClient('/technical');
    expect(new Headers(vi.mocked(fetch).mock.calls[0]![1]?.headers).get('Accept')).toBe('application/json');
  });
  it('lets the browser supply multipart boundaries instead of labelling FormData as JSON', async () => {
    respond(); const form = new FormData(); form.append('purpose', 'technical');
    await apiClient('/technical', { method: 'POST', body: form });
    const options = vi.mocked(fetch).mock.calls[0]![1];
    expect(new Headers(options?.headers).has('Content-Type')).toBe(false);
    expect(options?.body).toBe(form);
  });
  it('does not label an absent GET body as JSON', async () => {
    respond(); await request('/health/live');
    const options = vi.mocked(fetch).mock.calls[0]![1];
    expect(new Headers(options?.headers).has('Content-Type')).toBe(false);
    expect(options?.body).toBeUndefined();
  });
  it('labels a structured request body as JSON for backend validation', async () => {
    respond(); await request('/technical', { method: 'POST', body: { purpose: 'technical' } });
    const options = vi.mocked(fetch).mock.calls[0]![1];
    expect(new Headers(options?.headers).get('Content-Type')).toBe('application/json');
    expect(options?.body).toBe('{"purpose":"technical"}');
  });
  it.each(['primary', 'service'])('retains HTTP status when an error body is JSON null: %s', async client => {
    respond('null', 500);
    await expect(client === 'primary' ? request('/technical') : apiClient('/technical'))
      .rejects.toMatchObject({ status: 500, code: 'INTERNAL_ERROR' });
  });
  it.each([403, 409, 503, 504])('does not log the user out for a non-401 error: %i', async status => {
    const onUnauthorized = vi.fn(); window.addEventListener('biblia:unauthorized', onUnauthorized);
    try {
      respond('{"error":{"code":"TECHNICAL_ERROR","message":"technical"}}', status);
      await expect(request('/technical')).rejects.toMatchObject({ status });
      expect(onUnauthorized).not.toHaveBeenCalled();
    } finally { window.removeEventListener('biblia:unauthorized', onUnauthorized); }
  });
  it('delivers the actual sanitized authentication failure to the session listener', async () => {
    const details: unknown[] = [];
    const listener = (event: Event) => details.push((event as CustomEvent).detail);
    window.addEventListener('biblia:unauthorized', listener);
    try {
      const error = { code: 'AUTH_REQUIRED', message: 'Autenticação necessária.' };
      respond(JSON.stringify({ error }), 401);
      await expect(request('/technical')).rejects.toMatchObject({ status: 401, code: 'AUTH_REQUIRED' });
      expect(details).toEqual([error]);
    } finally { window.removeEventListener('biblia:unauthorized', listener); }
  });
  it('releases its timeout after a successful request', async () => {
    vi.useFakeTimers(); respond();
    await request('/technical');
    expect(vi.getTimerCount()).toBe(0);
  });
  it('releases its timeout after a network failure', async () => {
    vi.useFakeTimers(); vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('technical transport failure'); }));
    await expect(request('/technical')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
    expect(vi.getTimerCount()).toBe(0);
  });
  it('can perform an ordinary request when AbortController is not available', async () => {
    vi.stubGlobal('AbortController', undefined); respond('{"ok":true}');
    await expect(request('/technical')).resolves.toEqual({ ok: true });
  });
});
