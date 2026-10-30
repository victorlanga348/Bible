import { defineConfig } from 'vitest/config';
import { frontendTestConfig } from './vitest.config.ts';

export default defineConfig({
  ...frontendTestConfig,
  test: {
    ...frontendTestConfig.test,
    coverage: {
      ...frontendTestConfig.test?.coverage,
      provider: 'v8',
      include: ['src/shared/api/{api-url,client,http-client}.ts', 'src/server/[a]pi-proxy.ts'],
      reportsDirectory: 'reports/coverage/transport',
    },
  },
});
