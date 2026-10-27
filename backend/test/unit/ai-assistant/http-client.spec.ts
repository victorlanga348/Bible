import { createServer, type Server } from 'node:http';
import { AiResultRejectedError, AiTimeoutError, AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import { NativeModelHttpClient } from '../../../src/modules/ai-assistant/infrastructure/http-client';
import type { ModelEndpoint } from '../../../src/modules/ai-assistant/infrastructure/session';

describe('real HTTP transport to a clearly identified technical loopback server, without AI', () => {
  const key = 'technical-protocol-key-12345678901234567890';
  let server: Server; let base: string; let packets = 0; let sinkRequests = 0;
  const timers = new Set<NodeJS.Timeout>();
  beforeAll(async () => {
    server = createServer(async (request, response) => {
      packets++;
      if (request.url === '/private-sink') { sinkRequests++; response.end('{}'); return; }
      if (request.headers.authorization !== 'Bearer ' + key) { response.writeHead(401); response.end('technical confidential body'); return; }
      const chunks: Buffer[] = []; for await (const chunk of request) chunks.push(chunk as Buffer);
      let body: { scenario?: string };
      try { body = JSON.parse(Buffer.concat(chunks).toString()) as { scenario?: string }; }
      catch { response.writeHead(422); response.end('{}'); return; }
      response.setHeader('Content-Type', 'application/json');
      if (body.scenario === 'small-known') { response.end('0'); return; }
      if (body.scenario === 'small-stream') { response.write('0'); response.end(); return; }
      const later = (work: () => void) => { const timer = setTimeout(() => { timers.delete(timer); if (!response.destroyed) work(); }, 250); timers.add(timer); };
      if (body.scenario === 'delay-headers') { later(() => response.end('{}')); return; }
      if (body.scenario === 'delay-body') { response.write('{"tokens":'); later(() => response.end('[1]}')); return; }
      if (body.scenario === 'redirect') { response.writeHead(302, { Location: base + '/private-sink' }); response.end(); return; }
      if (body.scenario === 'bad-json') { response.end('{broken'); return; }
      if (body.scenario === 'bad-utf8') { response.end(Buffer.concat([Buffer.from('{"value":"'), Buffer.from([0xff]), Buffer.from('"}')])); return; }
      if (body.scenario === 'unicode-stream') { response.write('{"value":"' + 'é'.repeat(10)); response.end('é'.repeat(10) + '"}'); return; }
      if (body.scenario === 'large-known') { response.end(JSON.stringify({ value: 'x'.repeat(100) })); return; }
      if (body.scenario === 'large-stream') { response.write('{"value":"' + 'x'.repeat(20)); response.end('x'.repeat(80) + '"}'); return; }
      if (body.scenario?.startsWith('status-')) { response.writeHead(Number(body.scenario.slice(7))); response.end('technical confidential body'); return; }
      response.end(JSON.stringify({ tokens: [1, 2], method: request.method, path: request.url, mediaType: request.headers['content-type'] }));
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address(); if (!address || typeof address === 'string') throw new Error('Technical HTTP server did not bind');
    base = `http://127.0.0.1:${address.port}`;
  });
  afterAll(async () => {
    for (const timer of timers) clearTimeout(timer);
    server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve()));
  });
  const client = (timeoutMs = 2000, secret = key, signal?: AbortSignal) => new NativeModelHttpClient(base, secret, 'technical-protocol-only', timeoutMs, signal);
  it('authenticates and sends only a POST to the specified native endpoint', async () => {
    const session = client();
    expect(session.runtimeVersion).toBe('technical-protocol-only');
    await expect(session.post('/tokenize', { content: 'technical' }, 1024)).resolves.toEqual({ tokens: [1, 2], method: 'POST', path: '/tokenize', mediaType: 'application/json' });
  });
  it.each(['/tokenize', '/apply-template', '/v1/embeddings', '/v1/chat/completions'] as const)('admits the internal endpoint %s with JSON media type', async endpoint => {
    await expect(client().post(endpoint, {}, 1024)).resolves.toMatchObject({ path: endpoint, mediaType: 'application/json' });
  });
  it.each(['small-known', 'small-stream'])('accepts a one-byte response at the exact budget for %s and a canonical trailing slash', async scenario => {
    await expect(new NativeModelHttpClient(base + '/', key, 'technical').post('/tokenize', { scenario }, 1)).resolves.toBe(0);
  });
  it.each([32, 128])('admits an internal key of exactly %p characters', length => {
    expect(() => new NativeModelHttpClient(base, 'x'.repeat(length), 'technical')).not.toThrow();
  });
  it.each([1, 120000])('admits the exact deadline boundary %p without sending a request', timeout => {
    expect(() => client(timeout)).not.toThrow();
  });
  it('admits canonical port one without trying to bind or connect to it', () => {
    expect(() => new NativeModelHttpClient('http://127.0.0.1:1', key, 'technical')).not.toThrow();
  });
  it.each(['http://127.0.0.1:3000/.', 'http://127.0.0.1:03000', 'HTTP://127.0.0.1:3000'])('rejects a normalized but noncanonical spelling %s', url => {
    expect(() => new NativeModelHttpClient(url, key, 'technical')).toThrow(AiUnavailableError);
  });
  it('rejects an absent request body before any packet or credential is sent', async () => {
    const prior = packets;
    await expect(client().post('/tokenize', undefined, 1024)).rejects.toBeInstanceOf(AiUnavailableError);
    expect(packets).toBe(prior);
  });
  it.each(['http://example.com:3000', 'http://localhost:3000', 'https://127.0.0.1:3000', 'http://127.0.0.1:0', 'http://user@127.0.0.1:3000', 'http://127.0.0.1:3000/path', 'http://127.0.0.1:3000?query=1', 'http://127.0.0.1:3000#fragment', 'not-url'])('rejects unowned/noncanonical base %s', url => {
    expect(() => new NativeModelHttpClient(url, key, 'technical')).toThrow(AiUnavailableError);
  });
  it.each(['', 'short', 'x'.repeat(129), 'x'.repeat(40) + '\n'])('rejects a malformed internal key without including it in the error', secret => {
    expect(() => new NativeModelHttpClient(base, secret, 'technical')).toThrow(AiUnavailableError);
  });
  it.each([0, -1, 0.5, NaN, Infinity, 120001])('rejects an invalid request deadline %p', timeout => {
    expect(() => new NativeModelHttpClient(base, key, 'technical', timeout)).toThrow(AiUnavailableError);
  });
  it('accepts the maximum response allowance and reads valid UTF-8 without confusing bytes with characters', async () => {
    await expect(client().post('/tokenize', { scenario: 'unicode-stream' }, 4194304)).resolves.toEqual({ value: 'é'.repeat(20) });
    await expect(client().post('/tokenize', { scenario: 'unicode-stream' }, 32)).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it.each(['/private-sink', '//example.com', 'http://example.com', '/../tokenize'])('rejects endpoint %s before sending credentials', async endpoint => {
    const prior = packets;
    await expect(client().post(endpoint as ModelEndpoint, {}, 1024)).rejects.toBeInstanceOf(AiUnavailableError);
    expect(packets).toBe(prior);
  });
  it.each([0, -1, 1.5, Infinity, 4194305])('rejects invalid response budget %p', async limit => {
    const prior = packets;
    await expect(client().post('/tokenize', {}, limit)).rejects.toBeInstanceOf(AiUnavailableError);
    expect(packets).toBe(prior);
  });
  it('does not follow redirects or forward its key to a second endpoint', async () => {
    const prior = sinkRequests;
    await expect(client().post('/tokenize', { scenario: 'redirect' }, 1024)).rejects.toBeInstanceOf(AiUnavailableError);
    expect(sinkRequests).toBe(prior);
  });
  it.each([400, 422])('classifies native input rejection %p', async status => {
    await expect(client().post('/tokenize', { scenario: 'status-' + status }, 1024)).rejects.toBeInstanceOf(AiResultRejectedError);
  });
  it.each([401, 403, 404, 429, 500, 503])('classifies native availability failure %p without exposing its body', async status => {
    const error = await client().post('/tokenize', { scenario: 'status-' + status }, 1024).catch((value: unknown) => value);
    expect(error).toBeInstanceOf(AiUnavailableError);
    expect((error as Error).message).not.toContain('technical confidential');
  });
  it('rejects incorrect authentication instead of parsing its error body', async () => {
    await expect(client(2000, 'different-technical-key-123456789012345').post('/tokenize', {}, 1024)).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it.each(['bad-json', 'bad-utf8', 'large-known', 'large-stream'])('rejects malformed or excessive response %s', async scenario => {
    await expect(client().post('/tokenize', { scenario }, scenario.startsWith('large') ? 32 : 1024)).rejects.toBeInstanceOf(AiUnavailableError);
  });
  it.each(['delay-headers', 'delay-body'])('limits the entire request including %s', async scenario => {
    await expect(client(40).post('/tokenize', { scenario }, 1024)).rejects.toBeInstanceOf(AiTimeoutError);
  });
  it('sanitizes external cancellation before sending any credential', async () => {
    const controller = new AbortController(); controller.abort(new Error('technical private cancellation reason'));
    const prior = packets;
    const error = await client(2000, key, controller.signal).post('/tokenize', {}, 1024).catch((value: unknown) => value);
    expect(error).toBeInstanceOf(AiUnavailableError);
    expect((error as Error).message).not.toContain('private cancellation');
    expect(packets).toBe(prior);
  });
  it('cancels a pending body read without returning the private reason', async () => {
    const controller = new AbortController();
    const pending = client(2000, key, controller.signal).post('/tokenize', { scenario: 'delay-body' }, 1024);
    const timer = setTimeout(() => controller.abort('technical private reason'), 30);
    try { await expect(pending).rejects.toBeInstanceOf(AiUnavailableError); } finally { clearTimeout(timer); }
  });
});
