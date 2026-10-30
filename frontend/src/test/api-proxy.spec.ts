// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProxyOptions } from 'vite';
import viteConfig from '../../vite.config';

async function config() {
  return typeof viteConfig === 'function'
    ? await viteConfig({ command: 'serve', mode: 'test' })
    : await viteConfig;
}
describe('local API reverse proxy contract', () => {
  beforeEach(() => { vi.stubEnv('BIBLE_API_PROXY_TARGET', ''); });
  afterEach(() => { vi.unstubAllEnvs(); });

  it('forwards only /api paths, preserving query and origin, in development and preview', async () => {
    const settings = await config();
    const entries = Object.entries(settings.server?.proxy ?? {});
    const route = entries.find(([key]) => key.startsWith('^') && new RegExp(key).test('/api/translations'));
    expect(route).toBeDefined();
    const [pattern, proxy] = route! as [string, ProxyOptions];
    expect(new RegExp(pattern).test('/apix/translations')).toBe(false);
    expect(new RegExp(pattern).test('/api')).toBe(true);
    expect(proxy.target).toBe('http://127.0.0.1:3000');
    expect(proxy.changeOrigin).not.toBe(true);
    expect(proxy.rewrite?.('/api/translations?limit=2')).toBe('/translations?limit=2');
    expect(proxy.rewrite?.('/api')).toBe('/');
    expect(settings.preview?.proxy).toEqual(settings.server?.proxy);
    expect(settings.server?.host).toBe('127.0.0.1');
    expect(settings.server?.strictPort).toBe(true);
    expect(settings.preview?.host).toBe('127.0.0.1');
  });
  it('allows an isolated loopback backend configured only for the Vite server', async () => {
    vi.stubEnv('BIBLE_API_PROXY_TARGET', 'http://127.0.0.1:32123');
    const settings = await config();
    const proxy = Object.values(settings.server?.proxy ?? {})[0] as ProxyOptions | undefined;
    expect(proxy?.target).toBe('http://127.0.0.1:32123');
  });
  it.each(['http://localhost:32123', 'http://[::1]:32123'])('supports the loopback alias %s', async target => {
    vi.stubEnv('BIBLE_API_PROXY_TARGET', target);
    const settings = await config();
    expect((Object.values(settings.server?.proxy ?? {})[0] as ProxyOptions).target).toBe(target);
  });
  it.each([
    'https://external.example', 'http://external.example:3000',
    'http://user:private@127.0.0.1:3000', 'http://:private@127.0.0.1:3000', 'http://127.0.0.1:3000/path',
    'http://127.0.0.1:3000?secret=value', 'http://127.0.0.1:3000#fragment', 'not-a-url',
  ])('rejects a target outside the local proxy contract without echoing it: %s', async target => {
    vi.stubEnv('BIBLE_API_PROXY_TARGET', target);
    await expect(config()).rejects.toThrow('Invalid configuration: BIBLE_API_PROXY_TARGET');
  });
});
