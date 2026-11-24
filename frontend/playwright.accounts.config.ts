import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testDir: './e2e', testMatch: ['accounts-real.spec.ts', 'auth-session.spec.ts', 'workflows-real.spec.ts'],
  outputDir: 'reports/accounts/browser', workers: 1,
  use: { ...base.use, baseURL: 'http://127.0.0.1:5174', channel: 'chrome' },
  webServer: {
    command: 'npm run dev -- --port 5174', url: 'http://127.0.0.1:5174',
    reuseExistingServer: false, timeout: 120000,
    env: { BIBLE_API_PROXY_TARGET: 'http://127.0.0.1:32123', VITE_API_URL: '/api' },
  },
});
