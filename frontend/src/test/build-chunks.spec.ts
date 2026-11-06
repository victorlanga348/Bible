// @vitest-environment node
import { expect, it } from 'vitest';
import viteConfig from '../../vite.config';

it('keeps framework, icons, query and Radix in separate vendor chunks and application code in its own bundle', async () => {
  if (typeof viteConfig !== 'function') throw new Error('Expected the Vite configuration factory');
  const config = await viteConfig({ command: 'build', mode: 'test' });
  const output = config.build?.rollupOptions?.output;
  if (!output || Array.isArray(output) || typeof output.manualChunks !== 'function') throw new Error('Expected the chunk resolver');
  const chunk = output.manualChunks as (id: string) => string | undefined;
  for (const [dependency, group] of [
    ['react/index.js', 'vendor-react'], ['react-dom/client.js', 'vendor-react'],
    ['@radix-ui/react-dialog/index.js', 'vendor-radix'], ['@tanstack/react-query/index.js', 'vendor-query'],
    ['lucide-react/index.js', 'vendor-icons'], ['other-library/index.js', undefined],
  ] as const) expect(chunk(`/project/node_modules/${dependency}`)).toBe(group);
  expect(chunk('/project/src/App.tsx')).toBeUndefined();
  expect(config.server?.strictPort).toBe(true); expect(config.preview?.host).toBe('127.0.0.1');
});
