import { URL } from 'node:url';

// Server configuration only. This module is never imported by the browser entry.
export function apiProxy(configured?: string) {
  const target = URL.parse(configured || 'http://127.0.0.1:3000');
  if (!target || target.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)
    || target.username || target.password || target.pathname !== '/' || target.search || target.hash) {
    throw new Error('Invalid configuration: BIBLE_API_PROXY_TARGET');
  }
  return {
    '^/api(?:/|$)': {
      target: target.origin,
      changeOrigin: false,
      cookiePathRewrite: { '/auth/google': '/api/auth/google' },
      rewrite: (path: string) => path.replace(/^\/api(?=\/|$)/, '') || '/',
    },
  };
}
