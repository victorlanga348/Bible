// @vitest-environment node
import { expect, it } from 'vitest';
import { createRequire } from 'node:module';
const { frontendMutationScope } = createRequire(import.meta.url)('../../scripts/check-mutation.cjs');
const transport = ['src/shared/api/api-url.ts', 'src/shared/api/client.ts', 'src/shared/api/http-client.ts', 'src/server/api-proxy.ts', 'vite.config.ts'];
it('includes every changed session/application module without replacing the existing transport scope', () => {
  expect(frontendMutationScope('session')).toEqual([...transport, 'src/App.tsx', 'src/shared/api/query-client.ts', 'src/shared/hooks/use-session.tsx', 'src/shared/auth/google-identity.ts', 'src/shared/auth/google-sign-in.tsx', 'src/shared/ui/shell.tsx']);
});
it('keeps transport and global inventories independently verifiable', () => {
  expect(frontendMutationScope('transport')).toEqual(transport);
  expect(frontendMutationScope('global')).toEqual(['src/**/*.ts', 'src/**/*.tsx', '!src/test/**', '!src/**/*.d.ts', 'vite.config.ts']);
});
it('rejects an unknown scope rather than silently running a smaller inventory', () => {
  expect(() => frontendMutationScope('technical-invalid-scope')).toThrow('Invalid mutation scope');
});
