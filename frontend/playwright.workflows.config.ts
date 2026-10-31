import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', testMatch: 'workflows-api.spec.ts', fullyParallel: false,
  retries: 0, workers: 1, reporter: 'list', timeout: 180000,
  use: { baseURL: 'http://127.0.0.1:5273', actionTimeout: 15000, channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: 'off', screenshot: 'off', video: 'off' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: process.env.PLAYWRIGHT_PREVIEW === '1' ? 'npm run preview -- --port 5273' : 'npm run dev -- --port 5273',
    url: 'http://127.0.0.1:5273', reuseExistingServer: false,
    env: { BIBLE_API_PROXY_TARGET: 'http://127.0.0.1:32124' }, timeout: 120000,
  },
});
