export interface ApiErrorPayload {
  code: string;
  message: string;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message || `Erro da API: ${payload.code}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = payload.code;
  }
}

export function getApiBaseUrl(): string {
  const envUrl = typeof import.meta !== 'undefined' ? (import.meta.env.VITE_API_URL as string) : undefined;
  return (envUrl || 'http://127.0.0.1:3000').replace(/\/$/, '');
}

export interface RequestOptions extends RequestInit {
  token?: string | null;
  params?: Record<string, string | number | undefined>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  if (options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorPayload: ApiErrorPayload = data?.error || {
      code: response.status === 401 ? 'UNAUTHORIZED' : response.status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR',
      message: 'Ocorreu um erro na requisição.',
    };
    throw new ApiError(response.status, errorPayload);
  }

  return data as T;
}
