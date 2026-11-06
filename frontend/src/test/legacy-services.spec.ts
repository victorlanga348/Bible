// @vitest-environment node
import { createServer } from 'node:http';
import { afterEach, expect, it, vi } from 'vitest';
import { api } from '../shared/api/services';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
it('preserves methods, authentication, versions and cursors across the legacy HTTP facade', async () => {
  const calls: { path: string; method: string; authorization?: string; body: string }[] = [];
  const server = createServer((req, res) => {
    let body = ''; req.on('data', chunk => { body += chunk; }); req.on('end', () => {
      calls.push({ path: req.url!, method: req.method!, authorization: req.headers.authorization, body });
      res.writeHead(200, { 'content-type': 'application/json' }); res.end('{}');
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number }; vi.stubEnv('VITE_API_URL', `http://127.0.0.1:${address.port}`);
  vi.stubGlobal('window', { location: { origin: `http://127.0.0.1:${address.port}` } });
  try {
    await api.health(); await api.translations(); await api.books('porbr2018');
    await api.passage('porbr2018', 'GEN', 1, 1, 3); await api.resolveReference('porbr2018', 'GEN 1:1');
    await api.sources(); await api.workspaceStudies('technical-token', 'opaque cursor'); await api.study('technical-study', 'technical-token', 3);
    await api.createStudy('porbr2018', 'GEN 1:1', 'technical-token');
    expect(calls.map(call => call.path)).toEqual(['/health/ready', '/translations', '/translations/porbr2018/books', '/translations/porbr2018/books/GEN/chapters/1/verses?from=1&to=3', '/references/resolve', '/sources', '/workspace/studies?cursor=opaque+cursor', '/studies/technical-study?version=3', '/studies']);
    expect(calls[4]).toMatchObject({ method: 'POST', body: JSON.stringify({ translationId: 'porbr2018', reference: 'GEN 1:1' }) });
    expect(calls[8]).toMatchObject({ method: 'POST', authorization: 'Bearer technical-token', body: calls[4].body });
    expect(calls[6].authorization).toBe('Bearer technical-token'); expect(calls[0].authorization).toBeUndefined();
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});
