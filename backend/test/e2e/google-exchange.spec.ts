import { createServer, type Server } from 'node:http';
import { randomBytes } from 'node:crypto';
import { createRemoteJWKSet, exportJWK, generateKeyPair, jwtVerify, SignJWT } from 'jose';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureTransport } from '../../src/app';
import { parseRuntimeConfig } from '../../src/config/runtime-config';
import { DatabaseModule } from '../../src/infrastructure/database.module';
import { AccessModule } from '../../src/infrastructure/access.module';
import { GoogleAuthModule } from '../../src/infrastructure/google-auth.module';
import { GoogleIdentityVerifier } from '../../src/infrastructure/google-identity';
import { LocalAccessTokens } from '../../src/infrastructure/access-token';
import type { Database } from '../../src/infrastructure/database';
import { StudyModule } from '../../src/modules/study/module';
import { WorkspaceModule } from '../../src/modules/study-workspace/module';
import { cleanCanon, seedCanon } from '../helpers/canon';
import { cleanSourceTestData, openSourceTestDatabase, seedCuratedSource } from '../helpers/source-library';
import { cleanStudyTestData } from '../helpers/study-database';
import { seedPassageLink } from '../helpers/passage-links';

const client = '123456789012-protocoltest.apps.googleusercontent.com';
// Real HTTP JWKS + real RSA/HS256 + Nest/PostgreSQL. Keys are technical, not Google's.
describe('Google exchange protocol and private persistence, controlled real infrastructure', () => {
  let app: INestApplication, database: Database, server: Server;
  let privateKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
  let secret: string, keyRequests = 0, unavailable = false;
  beforeAll(async () => {
    secret = randomBytes(40).toString('base64url'); const pair = await generateKeyPair('RS256', { extractable: true }); privateKey = pair.privateKey;
    const jwks = { keys: [{ ...await exportJWK(pair.publicKey), kid: 'protocol-one', alg: 'RS256', use: 'sig' }] };
    server = createServer((_req, response) => { keyRequests++; response.writeHead(unavailable ? 503 : 200, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(unavailable ? { error: 'technical-provider-details' } : jwks)); });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve)); const address = server.address(); if (!address || typeof address === 'string') throw new Error('Technical JWKS server not ready');
    const identity = new GoogleIdentityVerifier(client, createRemoteJWKSet(new URL(`http://127.0.0.1:${address.port}/certs`), { cooldownDuration: 0, timeoutDuration: 2000 }));
    database = await openSourceTestDatabase(); await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); await seedCanon(database); await seedCuratedSource(database); await seedPassageLink(database);
    const config = { ...parseRuntimeConfig(process.env), jwtSecret: secret, googleClientId: client };
    const module = await Test.createTestingModule({ imports: [DatabaseModule.register(config.databaseUrl), AccessModule.register(secret), GoogleAuthModule.register(config), StudyModule, WorkspaceModule.register(config)] }).overrideProvider(GoogleIdentityVerifier).useValue(identity).compile();
    app = module.createNestApplication({ logger: false }); configureTransport(app); await app.init();
  });
  afterAll(async () => { try { await app?.close(); if (database) { await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); } } finally { await database?.onModuleDestroy(); server?.closeAllConnections(); if (server?.listening) await new Promise<void>(resolve => server.close(() => resolve())); } });
  async function challenge() {
    const response = await request(app.getHttpServer()).get('/auth/google').expect(200); const nonce = /data-nonce="([A-Za-z0-9_-]{43})"/.exec(response.text)?.[1]; if (!nonce) throw new Error('Missing challenge');
    return { nonce, cookie: String(response.headers['set-cookie']).split(';')[0]! };
  }
  async function signed(nonce: string, overrides: Record<string, unknown> = {}, kid = 'protocol-one') {
    const now = Math.floor(Date.now() / 1000); return new SignJWT({ sub: 'protocol-google-sub-1', iss: 'https://accounts.google.com', aud: client, iat: now, exp: now + 3600, nonce, ...overrides }).setProtectedHeader({ alg: 'RS256', kid }).sign(privateKey);
  }
  async function login(overrides: Record<string, unknown> = {}) {
    const c = await challenge(); return request(app.getHttpServer()).post('/auth/google').set('Origin', 'http://localhost:3000').set('Cookie', c.cookie).send({ credential: await signed(c.nonce, overrides), csrfToken: c.nonce });
  }
  it('exchanges trusted protocol identity for an independently verifiable local Bearer', async () => {
    const response = await login(); expect(response.status).toBe(200); expect(response.body).toMatchObject({ tokenType: 'Bearer', expiresIn: 3600 }); expect(response.headers['cache-control']).toBe('no-store'); expect(String(response.headers['set-cookie'])).toContain('Max-Age=0');
    const verified = await jwtVerify(response.body.accessToken, new TextEncoder().encode(secret), { issuer: 'biblia-local', audience: 'biblia-backend', algorithms: ['HS256'] }); expect(verified.payload.sub).toMatch(/^google-[A-Za-z0-9_-]{43}$/); expect(keyRequests).toBeGreaterThan(0);
    const me = await request(app.getHttpServer()).get('/auth/me').auth(response.body.accessToken, { type: 'bearer' }).expect(200); expect(me.body).toEqual({ ownerId: verified.payload.sub });
  });
  it('persists a real private study for Google owner, denying local and other Google owners', async () => {
    const a = await login(), b = await login({ sub: 'protocol-google-sub-2' }); expect(a.status).toBe(200); expect(b.status).toBe(200);
    const created = await request(app.getHttpServer()).post('/studies').auth(a.body.accessToken, { type: 'bearer' }).send({ translationId: 'porbr2018', reference: 'GEN 1:1' }).expect(201);
    const me = await request(app.getHttpServer()).get('/auth/me').auth(a.body.accessToken, { type: 'bearer' }).expect(200); expect((await database.client.studyRecord.findUniqueOrThrow({ where: { id: created.body.id } })).ownerId).toBe(me.body.ownerId);
    await request(app.getHttpServer()).get('/studies/' + created.body.id).auth(b.body.accessToken, { type: 'bearer' }).expect(404);
    await request(app.getHttpServer()).get('/studies/' + created.body.id).auth(await new LocalAccessTokens(secret).issue('local-owner'), { type: 'bearer' }).expect(404);
    await request(app.getHttpServer()).get('/studies/' + created.body.id).auth(a.body.accessToken, { type: 'bearer' }).expect(200);
    await request(app.getHttpServer()).delete('/workspace/studies/' + created.body.id).auth(a.body.accessToken, { type: 'bearer' }).expect(204);
  });
  it.each([{}, { credential: 'x', csrfToken: 'x' }, { credential: 'a.b.c', csrfToken: 'n'.repeat(43), ownerId: 'local-owner' }, { credential: 'x'.repeat(16385), csrfToken: 'n'.repeat(43) }])('rejects invalid transport schemas', async body => {
    const response = await request(app.getHttpServer()).post('/auth/google').send(body).expect(400); expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
  it('rejects missing cookie and foreign origin with sanitised errors, without logging credentials', async () => {
    const c = await challenge(), credential = await signed(c.nonce); const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    try { for (const foreign of [false, true]) { const call = request(app.getHttpServer()).post('/auth/google').set('Origin', foreign ? 'https://evil.example' : 'http://localhost:3000'); if (foreign) call.set('Cookie', c.cookie); const response = await call.send({ credential, csrfToken: c.nonce }).expect(401); expect(response.body).toEqual({ error: { code: 'AUTH_REQUIRED', message: 'Autenticação necessária.' } }); } expect(JSON.stringify(log.mock.calls)).not.toContain(credential); expect(log).toHaveBeenCalledWith(JSON.stringify({ component: 'http', code: 'AUTH_REQUIRED', status: 401 })); } finally { log.mockRestore(); }
  });
  it('refuses exchange replay after the first successful token', async () => {
    const c = await challenge(), body = { credential: await signed(c.nonce), csrfToken: c.nonce }; await request(app.getHttpServer()).post('/auth/google').set('Origin', 'http://localhost:3000').set('Cookie', c.cookie).send(body).expect(200);
    await request(app.getHttpServer()).post('/auth/google').set('Origin', 'http://localhost:3000').set('Cookie', c.cookie).send(body).expect(401);
  });
  it.each(['credential', 'csrfToken'] as const)('rejects a trailing newline in %s at the transport boundary', async field => {
    const c = await challenge(), body = { credential: await signed(c.nonce), csrfToken: c.nonce };
    body[field] = field === 'credential' ? body[field] + '\n' : body[field].slice(0, 42) + '\n';
    await request(app.getHttpServer()).post('/auth/google').set('Origin', 'http://localhost:3000').set('Cookie', c.cookie).send(body).expect(400);
  });
  it('reports actual controlled JWKS HTTP outage as 503 without provider diagnostics', async () => {
    const c = await challenge(); unavailable = true;
    try { const response = await request(app.getHttpServer()).post('/auth/google').set('Origin', 'http://localhost:3000').set('Cookie', c.cookie).send({ credential: await signed(c.nonce, {}, 'rotated-protocol-key'), csrfToken: c.nonce }).expect(503); expect(response.body).toEqual({ error: { code: 'GOOGLE_AUTH_UNAVAILABLE', message: 'Autenticação Google temporariamente indisponível.' } }); } finally { unavailable = false; }
  });
});
