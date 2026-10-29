import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApplication } from '../../src/app';
import { parseRuntimeConfig } from '../../src/config/runtime-config';
import { LocalAccessTokens } from '../../src/infrastructure/access-token';
import type { Database } from '../../src/infrastructure/database';
import { relationProps } from '../helpers/cross-references';
import { cleanCanon, seedCanon } from '../helpers/canon';
import { cleanSourceTestData, openSourceTestDatabase, seedCuratedSource, sourceFixture } from '../helpers/source-library';
const p = relationProps(); const secret = 'cross-reference-http-test-only-signing-material-2026';
const body = () => ({ from: { translationId: p.from.translationId, reference: p.from.normalized }, to: { translationId: p.to.translationId, reference: p.to.normalized }, type: p.type, reading: p.reading, rationale: p.rationale, evidence: p.evidence.map(({ excerptId, startOffset, endOffset }) => ({ excerptId, startOffset, endOffset })) });
describe('private cross-references over actual Nest/JWT/Prisma/PostgreSQL, no model configured', () => {
  let app: INestApplication; let database: Database; let token: string; let other: string;
  const clean = async () => { await database.client.crossReferenceRecord.deleteMany(); await cleanSourceTestData(database); await cleanCanon(database); };
  beforeAll(async () => { database = await openSourceTestDatabase(); app = await createApplication({ ...parseRuntimeConfig(process.env), jwtSecret: secret }); await app.init(); token = await new LocalAccessTokens(secret).issue(p.ownerId); other = await new LocalAccessTokens(secret).issue('other-owner'); });
  beforeEach(async () => { await clean(); await seedCanon(database); await seedCuratedSource(database); });
  afterAll(async () => { try { if (database) await clean(); } finally { await app?.close(); await database?.onModuleDestroy(); } });
  const post = () => request(app.getHttpServer()).post('/cross-references').auth(token, { type: 'bearer' });
  const list = (reference = p.from.normalized, auth = token) => request(app.getHttpServer()).get('/cross-references').auth(auth, { type: 'bearer' }).query({ translationId: p.from.translationId, reference });
  it('creates, browses both endpoints, reads and deletes only its own interpretation with exact contracts', async () => {
    const created = (await post().send(body()).expect(201)).body;
    expect(created).toMatchObject({ assessment: 'user-interpretation', type: p.type, reading: p.reading, from: p.from, to: p.to }); expect(created).not.toHaveProperty('ownerId'); expect(created).not.toHaveProperty('document'); expect(created.evidence[0].availability).toBe('available');
    expect((await list().expect(200)).body.items.map((r: { id: string }) => r.id)).toEqual([created.id]); expect((await list(p.to.normalized).expect(200)).body.items[0].id).toBe(created.id);
    expect((await request(app.getHttpServer()).get(`/cross-references/${created.id}`).auth(token, { type: 'bearer' }).expect(200)).body).toEqual(created);
    await request(app.getHttpServer()).delete(`/cross-references/${created.id}`).auth(token, { type: 'bearer' }).expect(204); await request(app.getHttpServer()).get(`/cross-references/${created.id}`).auth(token, { type: 'bearer' }).expect(404); expect(await database.client.crossReferenceRecord.count()).toBe(0);
  });
  it('returns a canonical cursor and stable pages without owner leakage', async () => {
    const first = (await post().send(body()).expect(201)).body; const second = (await post().send(body()).expect(201)).body;
    const a = (await list().query({ limit: 1 }).expect(200)).body; expect(a.items).toHaveLength(1); expect(typeof a.nextCursor).toBe('string');
    const b = (await list().query({ limit: 1, cursor: a.nextCursor }).expect(200)).body; expect(b.items).toHaveLength(1); expect(b.nextCursor).toBeNull(); expect(new Set([a.items[0].id, b.items[0].id])).toEqual(new Set([first.id, second.id]));
    expect((await list(p.from.normalized, other).expect(200)).body).toEqual({ items: [], nextCursor: null });
  });
  it('requires a real JWT and hides another owner identically to missing', async () => {
    await request(app.getHttpServer()).post('/cross-references').send(body()).expect(401); const view = (await post().send(body()).expect(201)).body;
    const denied = await request(app.getHttpServer()).get(`/cross-references/${view.id}`).auth(other, { type: 'bearer' }).expect(404);
    const missing = await request(app.getHttpServer()).get('/cross-references/99999999-9999-4999-8999-999999999999').auth(other, { type: 'bearer' }).expect(404); expect(denied.body).toEqual(missing.body);
    await request(app.getHttpServer()).delete(`/cross-references/${view.id}`).auth(other, { type: 'bearer' }).expect(404); expect(await database.client.crossReferenceRecord.count()).toBe(1);
  });
  it.each([{ ownerId: 'injected' }, { type: 'invented' }, { reading: 'historical' }, { type: 'prophetic-relation', reading: 'textual' }, { rationale: '' }, { rationale: 'é'.repeat(1001) }, { rationale: '\ud800' }, { evidence: [] }])('rejects invalid or unapproved body %p', async patch => { await post().send({ ...body(), ...patch }).expect(400); expect(await database.client.crossReferenceRecord.count()).toBe(0); });
  it.each([{ limit: '0' }, { limit: '51' }, { cursor: 'invalid' }, { owner: 'injected' }])('rejects malformed list query %p before reading', async patch => { await list().query(patch).expect(400); });
  it('rejects invalid paths, query/body fields and self-relations', async () => {
    await request(app.getHttpServer()).get('/cross-references/not-a-uuid').auth(token, { type: 'bearer' }).expect(400);
    await post().send({ ...body(), to: body().from }).expect(400);
    await post().query({ owner: 'injected' }).send(body()).expect(400);
    const view = (await post().send(body()).expect(201)).body;
    await request(app.getHttpServer()).delete(`/cross-references/${view.id}`).auth(token, { type: 'bearer' }).send({ owner: 'injected' }).expect(400);
  });
  it('returns explicit source rejection and suppresses a quote after revocation', async () => {
    await post().send({ ...body(), evidence: [{ excerptId: 'missing', startOffset: 0, endOffset: 1 }] }).expect(422);
    const view = (await post().send(body()).expect(201)).body;
    await database.client.sourceLibrarySource.update({ where: { id: sourceFixture.id }, data: { permissions: { ...sourceFixture.permissions, quote: 'denied' } } });
    const read = (await request(app.getHttpServer()).get(`/cross-references/${view.id}`).auth(token, { type: 'bearer' }).expect(200)).body; expect(read.evidence[0]).toMatchObject({ availability: 'restricted', quote: null }); await post().send(body()).expect(422);
  });
  it('maps real SQL failure to a sanitized unavailable response', async () => {
    await database.client.$executeRawUnsafe('ALTER TABLE app.cross_reference RENAME TO cross_reference_test_unavailable');
    try { const response = await list().expect(503); expect(response.body).toEqual({ error: { code: 'RELATION_UNAVAILABLE', message: 'Relações temporariamente indisponíveis.' } }); }
    finally { await database.client.$executeRawUnsafe('ALTER TABLE app.cross_reference_test_unavailable RENAME TO cross_reference'); }
  });
  it('describes the actual routes, bearer access, cursor and evidence rejection in OpenAPI', async () => {
    const openapi = (await request(app.getHttpServer()).get('/openapi.json').expect(200)).body;
    expect(openapi.paths['/cross-references'].post.responses['201']).toBeDefined(); expect(openapi.paths['/cross-references'].post.responses['422']).toBeDefined(); expect(openapi.paths['/cross-references'].get.parameters.some((q: { name: string }) => q.name === 'cursor')).toBe(true); expect(openapi.paths['/cross-references/{id}'].delete.responses['204']).toBeDefined(); expect(openapi.paths['/cross-references'].post.security).toEqual([{ bearer: [] }]);
  });
});
