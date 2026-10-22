import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApplication } from '../../src/app';
import { parseRuntimeConfig } from '../../src/config/runtime-config';
import { LocalAccessTokens } from '../../src/infrastructure/access-token';
import type { Database } from '../../src/infrastructure/database';
import { cleanCanon, seedCanon } from '../helpers/canon';
import { cleanSourceTestData, openSourceTestDatabase, seedCuratedSource, sourceFixture } from '../helpers/source-library';
import { cleanStudyTestData, failStudyVersionWrite } from '../helpers/study-database';
import { seedPassageLink } from '../helpers/passage-links';
import { createStudyTestServices } from '../helpers/study-runtime';
import { realEvidence, studyContent } from '../helpers/study';

describe('private studies through real Nest, JOSE, public libraries and PostgreSQL', () => {
  // Explicit test-only signing material; never a development credential.
  const secret = 'study-http-test-only-signing-material-2026';
  const body = { translationId: 'porbr2018', reference: 'GEN 1:1' };
  const absent = '00000000-0000-0000-0000-000000000000';
  let app: INestApplication; let database: Database; let owner: string; let other: string;
  beforeAll(async () => {
    database = await openSourceTestDatabase();
    app = await createApplication({ ...parseRuntimeConfig(process.env), jwtSecret: secret }); await app.init();
    const tokens = new LocalAccessTokens(secret); owner = await tokens.issue('owner-a'); other = await tokens.issue('owner-b');
  });
  beforeEach(async () => {
    await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database);
    await seedCanon(database); await seedCuratedSource(database); await seedPassageLink(database);
  });
  afterAll(async () => { try { if (database) { await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); } } finally { try { await app?.close(); } finally { await database?.onModuleDestroy(); } } });
  const error = (code: string, message: string) => ({ error: { code, message } });
  it('creates, reads and revises exact retained versions without exposing owner', async () => {
    const created = (await request(app.getHttpServer()).post('/studies').auth(owner, { type: 'bearer' }).send(body).expect(201)).body;
    expect(created).toMatchObject({ version: 1, reference: studyContent().reference, passage: studyContent().passage, evidence: [{ ...realEvidence(), availability: 'available' }] });
    expect(created).not.toHaveProperty('ownerId');
    expect((await request(app.getHttpServer()).get(`/studies/${created.id}`).auth(owner, { type: 'bearer' }).expect(200)).body).toEqual(created);
    const revised = (await request(app.getHttpServer()).post(`/studies/${created.id}/versions`).auth(owner, { type: 'bearer' }).send({ expectedVersion: 1 }).expect(201)).body;
    expect(revised).toMatchObject({ id: created.id, version: 2, reference: created.reference });
    expect((await request(app.getHttpServer()).get(`/studies/${created.id}?version=1`).auth(owner, { type: 'bearer' }).expect(200)).body).toEqual(created);
    expect((await request(app.getHttpServer()).get(`/studies/${created.id}`).auth(owner, { type: 'bearer' }).expect(200)).body).toEqual(revised);
    expect((await database.client.studyRecord.findUniqueOrThrow({ where: { id: created.id } })).ownerId).toBe('owner-a');
  });
  it.each(['create', 'read', 'revise'])('requires authentication for %s', async operation => {
    const call = operation === 'create' ? request(app.getHttpServer()).post('/studies').send(body)
      : operation === 'read' ? request(app.getHttpServer()).get(`/studies/${absent}`)
        : request(app.getHttpServer()).post(`/studies/${absent}/versions`).send({ expectedVersion: 1 });
    expect((await call.expect(401)).body).toEqual(error('UNAUTHORIZED', 'Autenticação necessária.'));
  });
  it('rejects a real token signed by another key and a genuinely expired token', async () => {
    const wrong = await new LocalAccessTokens('other-http-test-only-signing-material').issue('owner-a');
    const expired = await new LocalAccessTokens(secret, () => new Date(Date.now() - 7200000)).issue('owner-a');
    for (const token of [wrong, expired, 'invalid']) expect((await request(app.getHttpServer()).post('/studies').auth(token, { type: 'bearer' }).send(body).expect(401)).body).toEqual(error('UNAUTHORIZED', 'Autenticação necessária.'));
  });
  it('closes private access when the configured key is absent while preserving public reading', async () => {
    const configured = parseRuntimeConfig(process.env); const { jwtSecret: ignored, ...withoutKey } = configured; void ignored;
    const closed = await createApplication(withoutKey);
    try { await closed.init(); await request(closed.getHttpServer()).post('/studies').auth(owner, { type: 'bearer' }).send(body).expect(401); await request(closed.getHttpServer()).get('/translations').expect(200); }
    finally { await closed.close(); }
  });
  it.each([{}, { ...body, ownerId: 'owner-b' }, { ...body, unexpected: true }, { ...body, translationId: '' }, { ...body, reference: '' }, { ...body, reference: 1 }, { ...body, reference: 'João 3:16' }])('rejects invalid creation %j', async input => {
    expect((await request(app.getHttpServer()).post('/studies').auth(owner, { type: 'bearer' }).send(input).expect(400)).body).toEqual(error('VALIDATION_ERROR', 'Entrada inválida.'));
    expect(await database.client.studyRecord.count()).toBe(0);
  });
  it.each(['?extra=x', '?version=0', '?version=-1', '?version=1.5', '?version=1e1', '?version=9007199254740992', '?version=1&version=2'])('rejects malformed read query %s', async query => {
    expect((await request(app.getHttpServer()).get(`/studies/${absent}${query}`).auth(owner, { type: 'bearer' }).expect(400)).body).toEqual(error('VALIDATION_ERROR', 'Entrada inválida.'));
  });
  it.each([{}, { expectedVersion: 0 }, { expectedVersion: '1' }, { expectedVersion: 1.5 }, { expectedVersion: 9007199254740992 }, { expectedVersion: 1, ownerId: 'owner-b' }])('rejects malformed revision body %j', async input => {
    await request(app.getHttpServer()).post(`/studies/${absent}/versions`).auth(owner, { type: 'bearer' }).send(input).expect(400);
  });
  it('validates UUID and empty query contracts on writes', async () => {
    for (const path of ['/studies/invalid', '/studies/not-a-uuid?version=1']) await request(app.getHttpServer()).get(path).auth(owner, { type: 'bearer' }).expect(400);
    await request(app.getHttpServer()).post('/studies?extra=x').auth(owner, { type: 'bearer' }).send(body).expect(400);
    await request(app.getHttpServer()).post(`/studies/${absent}/versions?version=1`).auth(owner, { type: 'bearer' }).send({ expectedVersion: 1 }).expect(400);
  });
  it('hides other owners, missing references and absent versions behind the same 404', async () => {
    const saved = await createStudyTestServices(database).store.create('owner-a', studyContent());
    for (const path of [`/studies/${saved.id}`, `/studies/${absent}`]) expect((await request(app.getHttpServer()).get(path).auth(other, { type: 'bearer' }).expect(404)).body).toEqual(error('NOT_FOUND', 'Recurso não encontrado.'));
    await request(app.getHttpServer()).post(`/studies/${saved.id}/versions`).auth(other, { type: 'bearer' }).send({ expectedVersion: 1 }).expect(404);
    await request(app.getHttpServer()).get(`/studies/${saved.id}?version=2`).auth(owner, { type: 'bearer' }).expect(404);
    await request(app.getHttpServer()).post('/studies').auth(owner, { type: 'bearer' }).send({ ...body, reference: 'GEN 99:1' }).expect(404);
  });
  it('returns a conflict for stale or concurrent revisions without losing either saved snapshot', async () => {
    const saved = await createStudyTestServices(database).store.create('owner-a', studyContent());
    const results = await Promise.all([1, 2].map(() => request(app.getHttpServer()).post(`/studies/${saved.id}/versions`).auth(owner, { type: 'bearer' }).send({ expectedVersion: 1 })));
    expect(results.map(result => result.status).sort()).toEqual([201, 409]);
    expect(results.find(result => result.status === 409)!.body).toEqual(error('CONFLICT', 'Não foi possível criar esta versão.'));
    expect(await database.client.studyVersion.count()).toBe(2);
  });
  it('redacts revoked quotes and dependent sections on retained HTTP reads', async () => {
    const saved = await createStudyTestServices(database).store.create('owner-a', studyContent());
    await database.client.sourceLibrarySource.update({ where: { id: sourceFixture.id }, data: { permissions: { ...sourceFixture.permissions, store: 'pending' } } });
    const view = (await request(app.getHttpServer()).get(`/studies/${saved.id}`).auth(owner, { type: 'bearer' }).expect(200)).body;
    expect(view.evidence[0]).toMatchObject({ quote: null, availability: 'restricted' }); expect(view.sections[4].status).toBe('insufficient-evidence'); expect(view.interpretations).toEqual([]);
  });
  it('sanitises actual transactional write failure and current evidence corruption', async () => {
    await failStudyVersionWrite(database, 1);
    expect((await request(app.getHttpServer()).post('/studies').auth(owner, { type: 'bearer' }).send(body).expect(500)).body).toEqual(error('INTERNAL_ERROR', 'Erro interno.'));
    expect(await database.client.studyRecord.count()).toBe(0); await cleanStudyTestData(database);
    const saved = await createStudyTestServices(database).store.create('owner-a', studyContent());
    await database.client.sourceLibraryExcerpt.update({ where: { id: realEvidence().excerptId }, data: { textSha256: 'a'.repeat(64) } });
    expect((await request(app.getHttpServer()).get(`/studies/${saved.id}`).auth(owner, { type: 'bearer' }).expect(500)).body).toEqual(error('INTERNAL_ERROR', 'Erro interno.'));
  });
  it('publishes strict bodies, private Bearer security, version query and all status contracts', async () => {
    const doc = (await request(app.getHttpServer()).get('/openapi.json').expect(200)).body;
    expect(doc.components.securitySchemes.bearer).toMatchObject({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' });
    for (const [path, method, success] of [['/studies', 'post', '201'], ['/studies/{id}', 'get', '200'], ['/studies/{id}/versions', 'post', '201']]) {
      const operation = doc.paths[path!][method!]; expect(operation.security).toEqual([{ bearer: [] }]);
      for (const status of [success, '400', '401', '404', '500', ...(path!.endsWith('versions') ? ['409'] : [])]) expect(operation.responses[status!].content['application/json'].schema).toBeDefined();
      expect(operation.responses[success!].content['application/json'].schema.additionalProperties).toBe(false);
      if (method === 'post') expect(operation.requestBody.content['application/json'].schema.additionalProperties).toBe(false);
    }
    expect(doc.paths['/studies/{id}'].get.parameters.some((parameter: { name: string }) => parameter.name === 'version')).toBe(true);
    expect(doc.paths['/translations'].get.security).toBeUndefined();
  });
});
