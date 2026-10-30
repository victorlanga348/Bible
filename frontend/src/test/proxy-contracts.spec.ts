// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolve } from 'node:path';
import type { PluginOption } from 'vite';
import viteConfig from '../../vite.config.ts';
import { apiProxy } from '../server/api-proxy';

afterEach(() => { vi.unstubAllEnvs(); });
async function pluginNames(options: PluginOption[] = []): Promise<string[]> {
  const names: string[] = [];
  for (const option of options) {
    const plugin = await option;
    if (Array.isArray(plugin)) names.push(...await pluginNames(plugin));
    else if (plugin) names.push(plugin.name);
  }
  return names;
}
async function config() {
  vi.stubEnv('BIBLE_API_PROXY_TARGET', '');
  return typeof viteConfig === 'function' ? await viteConfig({ command: 'serve', mode: 'test' }) : await viteConfig;
}
describe('frontend server capabilities', () => {
  it('rejects HTTPS even when the destination host is loopback', () => {
    expect(() => apiProxy('https://127.0.0.1:3000')).toThrow('Invalid configuration: BIBLE_API_PROXY_TARGET');
  });
  it('preserves the React/Tailwind pipeline and the source import alias', async () => {
    const settings = await config();
    const names = await pluginNames(settings.plugins);
    expect(names.some(name => name.startsWith('vite:react'))).toBe(true);
    expect(names.some(name => name.startsWith('@tailwindcss/vite'))).toBe(true);
    expect(settings.resolve?.alias).toMatchObject({ '@': resolve('src') });
  });
  it('keeps preview on the fixed local application origin instead of silently changing ports', async () => {
    const settings = await config();
    expect(settings.server?.port).toBe(5173);
    expect(settings.preview?.port).toBe(5173);
    expect(settings.preview?.strictPort).toBe(true);
  });
});
