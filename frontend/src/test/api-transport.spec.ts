import { afterEach, describe, expect, it, vi } from 'vitest';
import { request, ApiError } from '../shared/api/http-client';
import { apiClient, ApiError as ServiceApiError } from '../shared/api/client';

// Identified protocol doubles; no claim of provider or database integration.
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const respond = (body: string, status = 200) => vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { status })));

describe('HTTP transport boundary behavior', () => {
  it('preserves nonempty headers and JSON strings while serializing false/zero query values', async () => {
    respond('{}');
    await request('/technical', {
      headers: { 'X-Request-Purpose': 'transport-test' },
      params: { zero: 0, present: false, absent: null, omitted: undefined },
      body: '{"purpose":"technical"}',
    });
    const [url, options] = vi.mocked(fetch).mock.calls[0]!;
    expect(new URL(String(url)).search).toBe('?zero=0&present=false');
    expect(new Headers(options?.headers).get('X-Request-Purpose')).toBe('transport-test');
    expect(new Headers(options?.headers).get('Content-Type')).toBe('application/json');
    expect(options?.body).toBe('{"purpose":"technical"}');
  });
  it('does not add content type or bearer to a bodyless anonymous request', async () => {
    respond('{}');
    await request('/health/live', { body: null, token: null });
    const options = vi.mocked(fetch).mock.calls[0]![1];
    expect(new Headers(options?.headers).has('Content-Type')).toBe(false);
    expect(new Headers(options?.headers).has('Authorization')).toBe(false);
    expect(options?.body).toBeUndefined();
  });
  it.each([
    [401, 'UNAUTHORIZED'], [404, 'NOT_FOUND'], [409, 'CONFLICT'], [422, 'AI_RESULT_REJECTED'],
    [503, 'SERVICE_UNAVAILABLE'], [504, 'AI_TIMEOUT'], [500, 'INTERNAL_ERROR'],
  ])('classifies a non-JSON HTTP %i without exposing response text', async (status, code) => {
    respond('private-technical-upstream-text', status as number);
    await expect(request('/technical')).rejects.toMatchObject({ status, code });
  });
  it('retains a caller abort signal without sending it as JSON', async () => {
    respond('{}');
    const controller = new AbortController();
    await request('/technical', { signal: controller.signal });
    expect(vi.mocked(fetch).mock.calls[0]![1]?.signal).toBe(controller.signal);
  });
  it('enforces the configured request timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(options.signal?.reason), { once: true });
    })));
    const checked = expect(request('/technical', { timeoutMs: 20 })).rejects.toMatchObject({ status: 504, code: 'TIMEOUT' });
    await vi.advanceTimersByTimeAsync(20);
    await checked;
    expect(vi.getTimerCount()).toBe(0);
  });
  it('classifies an unknown thrown value as a generic network failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw { privateDetails: 'technical' }; }));
    await expect(request('/technical')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
  });
  it('uses a stable fallback when an API error has no message', () => {
    const error = new ApiError(400, { code: 'VALIDATION_ERROR', message: '' });
    expect(error.message).toContain('VALIDATION_ERROR');
    expect(error.payload.code).toBe('VALIDATION_ERROR');
  });
});

describe('existing service transport', () => {
  it('preserves JSON, bearer and query and omits undefined values', async () => {
    respond('{"ok":true}');
    const result = await apiClient<{ ok: boolean }>('/technical', {
      method: 'POST', token: 'technical-test-bearer', body: '{}',
      headers: { 'X-Request-Purpose': 'transport-test' }, params: { zero: 0, omitted: undefined },
    });
    expect(result.ok).toBe(true);
    const [url, options] = vi.mocked(fetch).mock.calls[0]!;
    expect(new URL(String(url)).search).toBe('?zero=0');
    expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer technical-test-bearer');
    expect(new Headers(options?.headers).get('Content-Type')).toBe('application/json');
    expect(new Headers(options?.headers).get('X-Request-Purpose')).toBe('transport-test');
    expect(options?.body).toBe('{}');
  });
  it('handles a bodyless 204 without parsing JSON or adding credentials', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 204 })));
    await expect(apiClient('/technical', { method: 'DELETE' })).resolves.toBeUndefined();
    const headers = new Headers(vi.mocked(fetch).mock.calls[0]![1]?.headers);
    expect(headers.has('Authorization')).toBe(false);
    expect(headers.has('Content-Type')).toBe(false);
  });
  it.each([[401, 'UNAUTHORIZED'], [404, 'NOT_FOUND'], [500, 'INTERNAL_ERROR']])('handles unstructured HTTP %i', async (status, code) => {
    respond('not-json', status as number);
    await expect(apiClient('/technical')).rejects.toMatchObject({ status, code });
  });
  it('retains the real backend error envelope', async () => {
    respond('{"error":{"code":"WORKSPACE_CONFLICT","message":"technical conflict"}}', 409);
    await expect(apiClient('/technical')).rejects.toMatchObject({ status: 409, code: 'WORKSPACE_CONFLICT', message: 'technical conflict' });
  });
  it('preserves its error class and fallback message', () => {
    const error = new ServiceApiError(400, { code: 'VALIDATION_ERROR', message: '' });
    expect(error.name).toBe('ApiError');
    expect(error.message).toContain('VALIDATION_ERROR');
  });
});
