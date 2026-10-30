export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  return (configured || '/api').replace(/\/$/, '');
}

export function apiRequestUrl(endpoint: string): URL {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return new URL(`${getApiBaseUrl()}${path}`, window.location.origin);
}
