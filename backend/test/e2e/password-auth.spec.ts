import { randomBytes, randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApplication } from '../../src/app';
import { parseRuntimeConfig } from '../../src/config/runtime-config';
import { openSourceTestDatabase } from '../helpers/source-library';
import type { Database } from '../../src/infrastructure/database';
import { cleanCanon, seedCanon } from '../helpers/canon';
import { cleanSourceTestData } from '../helpers/source-library';
import { cleanStudyTestData } from '../helpers/study-database';

const password = 'Uma palavra-passe segura 123!';
const origin = 'http://127.0.0.1:5173';

describe('application accounts over real HTTP and PostgreSQL', () => {
  let app: INestApplication, database: Database;
  const prefix = `account-${randomUUID()}`;
  const email = `${prefix}@example.test`;
  const secret = randomBytes(40).toString('base64url');
  beforeAll(async () => {
    database = await openSourceTestDatabase();
  });
  beforeEach(async () => {
    app = await createApplication({ ...parseRuntimeConfig(process.env), jwtSecret: secret });
    await app.init();
  });
  afterEach(async () => { await app?.close(); });
  afterAll(async () => {
    try { if (database) await database.client.passwordAccount.deleteMany({ where: { email: { startsWith: prefix } } }); }
    finally { await database?.onModuleDestroy(); }
  });
  const send = (path: string, body: object) => request(app.getHttpServer()).post(`/auth/${path}`).set('Origin', origin).send(body);
  it('registers, stores a hash, signs in again and confirms the same private owner', async () => {
    const registration = await request(app.getHttpServer()).post('/auth/register').set('Origin', origin).send({ email, password }).expect(201);
    expect(registration.headers['cache-control']).toBe('no-store');
    expect(registration.body).toEqual({ accessToken: expect.any(String), tokenType: 'Bearer', expiresIn: 3600 });
    const identity = await request(app.getHttpServer()).get('/auth/me').auth(registration.body.accessToken, { type: 'bearer' }).expect(200);
    expect(identity.body.ownerId).toMatch(/^account-[a-f0-9-]{36}$/);
    const rows = await database.client.$queryRaw<{ password_hash: string }[]>`SELECT password_hash FROM app.password_account WHERE email = ${email}`;
    expect(rows).toHaveLength(1);
    expect(rows[0]!.password_hash).toMatch(/^scrypt-v1\$/);
    expect(rows[0]!.password_hash).not.toContain(password);
    const login = await request(app.getHttpServer()).post('/auth/login').set('Origin', origin).send({ email: email.toUpperCase(), password }).expect(200);
    const again = await request(app.getHttpServer()).get('/auth/me').auth(login.body.accessToken, { type: 'bearer' }).expect(200);
    expect(again.body).toEqual(identity.body);
  });

  it('normalizes email while preserving spaces and Unicode in the password', async () => {
    const input = { email: `  ${prefix.toUpperCase()}-NORMAL@example.test  `, password: '  Uma frase acentuada: Bíblia!  ' };
    await send('register', input).expect(201);
    await send('login', { email: `${prefix}-normal@example.test`, password: input.password }).expect(200);
    await send('login', { ...input, password: input.password.trim() }).expect(401);
  });

  it('keeps a unique account and original password when concurrent registrations collide', async () => {
    const input = { email: `${prefix}-race@example.test`, password };
    const results = await Promise.all([send('register', input), send('register', input)]);
    expect(results.map(result => result.status).sort()).toEqual([201, 409]);
    expect(await database.client.passwordAccount.count({ where: { email: input.email } })).toBe(1);
    await send('register', { ...input, password: 'Uma palavra-passe diferente!' }).expect(409);
    await send('login', input).expect(200);
  });

  it('returns the same sanitized error for unknown accounts, wrong passwords and malformed stored hashes', async () => {
    const input = { email: `${prefix}-reject@example.test`, password };
    await send('register', input).expect(201);
    const wrong = await send('login', { ...input, password: 'Outra palavra-passe incorreta' }).expect(401);
    const missing = await send('login', { email: `${prefix}-missing@example.test`, password }).expect(401);
    expect(wrong.body).toEqual({ error: { code: 'INVALID_CREDENTIALS', message: 'Email ou palavra-passe incorretos.' } });
    expect(missing.body).toEqual(wrong.body);
    expect(wrong.headers['cache-control']).toBe('no-store');
    await database.client.passwordAccount.update({ where: { email: input.email }, data: { passwordHash: 'corrupt' } });
    expect((await send('login', input).expect(401)).body).toEqual(wrong.body);
  });

  it.each([
    {}, { email, password: 'short' }, { email, password: 'x'.repeat(129) }, { email: 'invalid', password },
    { email, password, ownerId: 'another-owner' }, { email, password: 123 }, { email: 'a'.repeat(255) + '@example.test', password },
  ])('rejects invalid bodies for both account routes: %j', async input => {
    for (const path of ['register', 'login']) {
      expect((await send(path, input).expect(400).expect('Cache-Control', 'no-store')).body).toEqual({ error: { code: 'VALIDATION_ERROR', message: 'Entrada inválida.' } });
    }
  });

  it('accepts both password length boundaries without truncating them', async () => {
    for (const length of [15, 128]) {
      const input = { email: `${prefix}-${length}@example.test`, password: 'x'.repeat(length) };
      await send('register', input).expect(201);
      await send('login', input).expect(200);
      await send('login', { ...input, password: 'y' + 'x'.repeat(length - 1) }).expect(401);
    }
  });

  it.each([undefined, 'https://evil.example', 'http://localhost:5173.evil.example'])('rejects an untrusted or missing origin: %s', async value => {
    let call = request(app.getHttpServer()).post('/auth/register').send({ email: `${prefix}-origin@example.test`, password });
    if (value) call = call.set('Origin', value);
    await call.expect(403);
    expect(await database.client.passwordAccount.count({ where: { email: `${prefix}-origin@example.test` } })).toBe(0);
  });

  it('accepts the configured loopback origins and JSON content type parameters', async () => {
    const port = parseRuntimeConfig(process.env).port;
    for (const allowed of [`http://localhost:${port}`, `http://127.0.0.1:${port}`, 'http://localhost:5173']) {
      await request(app.getHttpServer()).post('/auth/login').set('Origin', allowed).set('Content-Type', 'application/json; charset=utf-8').send({ email: `${prefix}-absent@example.test`, password }).expect(401);
    }
  });

  it('limits attempts using the direct IP and ignores spoofed forwarding headers', async () => {
    for (let index = 0; index < 10; index++) await send('login', { email: `${prefix}-unknown@example.test`, password }).expect(401);
    const rejected = await send('login', { email, password }).set('X-Forwarded-For', '203.0.113.45').expect(429);
    expect(rejected.body.error.code).toBe('AUTH_RATE_LIMITED');
    expect(rejected.headers['retry-after']).toBe('900');
  });

  it('refuses registration before writing when JWT access is not configured', async () => {
    const { jwtSecret: unused, ...config } = parseRuntimeConfig(process.env); void unused;
    const disabled = await createApplication(config);
    try {
      await disabled.init();
      const body = { email: `${prefix}-disabled@example.test`, password };
      for (const path of ['register', 'login']) await request(disabled.getHttpServer()).post(`/auth/${path}`).set('Origin', origin).send(body).expect(503);
      expect(await database.client.passwordAccount.count({ where: { email: body.email } })).toBe(0);
    } finally { await disabled.close(); }
  });

  it('creates a structured study, retains access after login, and hides it from another account', async () => {
    await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database);
    try {
      await seedCanon(database);
      const input = { email: `${prefix}-study@example.test`, password };
      const account = (await send('register', input).expect(201)).body;
      const other = (await send('register', { email: `${prefix}-other@example.test`, password }).expect(201)).body;
      const study = (await request(app.getHttpServer()).post('/studies').auth(account.accessToken, { type: 'bearer' })
        .send({ translationId: 'porbr2018', reference: 'GEN 1:1' }).expect(201)).body;
      const login = (await send('login', input).expect(200)).body;
      await request(app.getHttpServer()).get(`/studies/${study.id}`).auth(login.accessToken, { type: 'bearer' }).expect(200);
      await request(app.getHttpServer()).get(`/studies/${study.id}`).auth(other.accessToken, { type: 'bearer' }).expect(404);
      await request(app.getHttpServer()).get(`/studies/${study.id}`).expect(401);
    } finally { await cleanStudyTestData(database); await cleanCanon(database); }
  });

  it('publishes strict account bodies and response contracts in OpenAPI', async () => {
    const doc = (await request(app.getHttpServer()).get('/openapi.json').expect(200)).body;
    for (const [route, status] of [['register', '201'], ['login', '200']]) {
      const operation = doc.paths[`/auth/${route}`].post;
      expect(operation.requestBody.content['application/json'].schema.additionalProperties).toBe(false);
      expect(operation.responses[status!]).toBeDefined();
    }
  });
});
