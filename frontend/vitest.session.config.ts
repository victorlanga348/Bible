import { defineConfig } from 'vitest/config';
import { frontendTestConfig } from './vitest.config.ts';

export default defineConfig({
  ...frontendTestConfig,
  test: {
    ...frontendTestConfig.test,
    coverage: {
      ...frontendTestConfig.test?.coverage,
      provider: 'v8',
      include: [
        'src/shared/api/{api-url,client,http-client,query-client}.ts', 'src/server/[a]pi-proxy.ts',
        'src/[A]pp.tsx', 'src/shared/hooks/[u]se-session.tsx', 'src/shared/auth/*.{ts,tsx}', 'src/shared/ui/[s]hell.tsx',
      ],
      reportsDirectory: 'reports/coverage/session',
    },
  },
});
