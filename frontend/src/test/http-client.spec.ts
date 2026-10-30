import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { request, ApiError } from '../shared/api/http-client';
import { queryKeys } from '../shared/api/query-client';

describe('HTTP Client & Contratos de Integração', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('injeta Authorization Bearer quando o token é fornecido', async () => {
    let capturedHeaders: Headers | undefined;

    globalThis.fetch = vi.fn().mockImplementation((_url, init) => {
      capturedHeaders = new Headers(init?.headers);
      return Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), { status: 200 }));
    });

    const res = await request<{ status: string }>('/health/live', {
      token: 'jwt-token-123',
    });

    expect(res.status).toBe('ok');
    expect(capturedHeaders?.get('Authorization')).toBe('Bearer jwt-token-123');
    expect(capturedHeaders?.get('Accept')).toBe('application/json');
  });

  it('lida com respostas 204 No Content retornando undefined', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    const res = await request<void>('/workspace/notes/123', {
      method: 'DELETE',
    });

    expect(res).toBeUndefined();
  });

  it('mapeia erro 401 e dispara evento biblia:unauthorized', async () => {
    const errorPayload = {
      error: { code: 'UNAUTHORIZED', message: 'Autenticação necessária.' },
    };

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(errorPayload), { status: 401 })
    );

    const eventSpy = vi.fn();
    window.addEventListener('biblia:unauthorized', eventSpy);

    await expect(request('/studies')).rejects.toThrow('Autenticação necessária.');
    expect(eventSpy).toHaveBeenCalledTimes(1);

    window.removeEventListener('biblia:unauthorized', eventSpy);
  });

  it('mapeia erro 409 CONFLICT em revisões concorrentes CAS', async () => {
    const errorPayload = {
      error: { code: 'WORKSPACE_CONFLICT', message: 'Não foi possível atualizar esta revisão da nota.' },
    };

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(errorPayload), { status: 409 })
    );

    try {
      await request('/workspace/notes/123', { method: 'PATCH' });
      expect.fail('Deveria ter lançado ApiError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(409);
      expect(apiErr.code).toBe('WORKSPACE_CONFLICT');
    }
  });

  it('mapeia erro 422 quando o modelo ou relação é rejeitada por falta de fundamentação', async () => {
    const errorPayload = {
      error: { code: 'AI_RESULT_REJECTED', message: 'Não foi possível fundamentar esta análise.' },
    };

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(errorPayload), { status: 422 })
    );

    await expect(request('/studies/123/ai-analyses', { method: 'POST' })).rejects.toMatchObject({
      status: 422,
      code: 'AI_RESULT_REJECTED',
    });
  });

  it('mapeia erro 503 quando o serviço de IA ou Workspace está indisponível', async () => {
    const errorPayload = {
      error: { code: 'AI_UNAVAILABLE', message: 'Assistente temporariamente indisponível.' },
    };

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(errorPayload), { status: 503 })
    );

    await expect(request('/studies/123/ai-analyses')).rejects.toMatchObject({
      status: 503,
      code: 'AI_UNAVAILABLE',
    });
  });

  it('mapeia falhas de rede (Network Error) de forma amigável', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(request('/health/ready')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
    });
  });

  describe('queryKeys Factory', () => {
    it('gera chaves estruturadas e determinísticas para o TanStack Query', () => {
      expect(queryKeys.canon.translations()).toEqual(['canon', 'translations']);
      expect(queryKeys.canon.books('porbr2018')).toEqual(['canon', 'books', 'porbr2018']);
      expect(queryKeys.canon.passage('porbr2018', 'GEN', 1, 1, 3)).toEqual([
        'canon',
        'passage',
        'porbr2018',
        'GEN',
        1,
        { from: 1, to: 3 },
      ]);
      expect(queryKeys.workspace.notes('uuid-1', 2)).toEqual(['workspace', 'notes', 'uuid-1', { version: 2 }]);
    });
  });
});
