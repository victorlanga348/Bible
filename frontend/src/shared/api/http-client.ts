/**
 * Cliente HTTP Tipado para a API do Bíblia App
 * Comunicação direta com o backend NestJS, tratamento de erros contratuais e eventos de autenticação
 */

import { apiRequestUrl } from './api-url';
export { getApiBaseUrl } from './api-url';

export interface ApiErrorPayload {
  code: string;
  message: string;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly payload: ApiErrorPayload;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message || `Erro da API: ${payload.code}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = payload.code;
    this.payload = payload;
  }
}

export interface HttpRequestOptions extends Omit<RequestInit, 'body'> {
  token?: string | null;
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  timeoutMs?: number;
}

export async function request<T>(endpoint: string, options: HttpRequestOptions = {}): Promise<T> {
  const url = apiRequestUrl(endpoint);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  let bodyContent: BodyInit | undefined;
  if (options.body !== undefined && options.body !== null) {
    if (typeof options.body === 'string') {
      bodyContent = options.body;
      headers.set('Content-Type', 'application/json');
    } else {
      bodyContent = JSON.stringify(options.body);
      headers.set('Content-Type', 'application/json');
    }
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  // Tratamento de timeout configurável (padrão 15 segundos)
  const timeoutMs = options.timeoutMs ?? 15000;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let signal = options.signal;

  if (!signal && typeof AbortController !== 'undefined') {
    const controller = new AbortController();
    timer = setTimeout(() => controller.abort(new Error('TIMEOUT')), timeoutMs);
    signal = controller.signal;
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers,
      body: bodyContent,
      signal,
    });

    if (timer) clearTimeout(timer);

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorPayload: ApiErrorPayload = data?.error || {
        code:
          response.status === 401
            ? 'UNAUTHORIZED'
            : response.status === 404
            ? 'NOT_FOUND'
            : response.status === 409
            ? 'CONFLICT'
            : response.status === 422
            ? 'AI_RESULT_REJECTED'
            : response.status === 503
            ? 'SERVICE_UNAVAILABLE'
            : response.status === 504
            ? 'AI_TIMEOUT'
            : 'INTERNAL_ERROR',
        message: 'Ocorreu um erro no processamento da requisição.',
      };

      // Dispara evento global quando a sessão expirar ou for rejeitada
      if (response.status === 401 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('biblia:unauthorized', { detail: errorPayload }));
      }

      throw new ApiError(response.status, errorPayload);
    }

    return data as T;
  } catch (error: unknown) {
    if (timer) clearTimeout(timer);

    if (error instanceof ApiError) {
      throw error;
    }

    const isTimeout =
      error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError' || error.message === 'TIMEOUT');

    throw new ApiError(isTimeout ? 504 : 0, {
      code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: isTimeout
        ? 'A requisição excedeu o tempo limite de resposta.'
        : 'Falha de comunicação com o servidor. Verifique se o backend está em execução.',
    });
  }
}
