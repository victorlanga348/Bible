import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { apiProxy } from './src/server/api-proxy.ts';

export default defineConfig(({ mode }) => {
  const configured = loadEnv(mode, process.cwd(), 'BIBLE_').BIBLE_API_PROXY_TARGET;
  const proxy = apiProxy(configured);
  const headers = {
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      host: '127.0.0.1',
      strictPort: true,
      headers,
      proxy,
    },
    preview: { host: '127.0.0.1', port: 5173, strictPort: true, proxy, headers },
  };
});
