import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApplication } from '../../src/app';
import { parseRuntimeConfig } from '../../src/config/runtime-config';
import type { Database } from '../../src/infrastructure/database';
import { cleanSourceTestData, openSourceTestDatabase, seedCuratedSource, sourceFixture, excerptFixture, sourceSnapshot } from '../helpers/source-library';

describe('source contracts with real Nest, Prisma and PostgreSQL', () => {
  let app: INestApplication;
  let database: Database;
  const base = `/sources/${sourceFixture.id}/excerpts`;
  beforeAll(async () => { database = await openSourceTestDatabase(); app = await createApplication(parseRuntimeConfig(process.env)); await app.init(); });
  beforeEach(async () => { await cleanSourceTestData(database); await seedCuratedSource(database); });
  afterAll(async () => {
    try { if (database) await cleanSourceTestData(database); }
    finally { try { await app?.close(); } finally { await database?.onModuleDestroy(); } }
  });
  it('returns the strict catalogue, provenance and original source permissions', async () => {
    const result = await request(app.getHttpServer()).get('/sources').expect(200);
    expect(result.body).toEqual({ sources: [JSON.parse(JSON.stringify(sourceSnapshot().source))] });
  });
  it('returns default pagination and exact coverage without inventing full-work coverage', async () => {
    const result = await request(app.getHttpServer()).get(base).expect(200);
    expect(result.body).toEqual({ excerpts: sourceSnapshot().excerpts, limit: 20, offset: 0, hasMore: false, coverage: { sourceId: sourceFixture.id, excerptCount: 4, limitations: sourceFixture.limitations } });
  });
  it('returns the exact excerpt and corresponding attribution', async () => {
    const snapshot = sourceSnapshot();
    const result = await request(app.getHttpServer()).get(`/source-excerpts/${snapshot.excerpts[0]!.id}`).expect(200);
    expect(result.body).toEqual({ excerpt: snapshot.excerpts[0], source: JSON.parse(JSON.stringify(snapshot.source)) });
  });
  it('trims q and pages ranked PostgreSQL results', async () => {
    const result = await request(app.getHttpServer()).get(base).query({ q: ' God ', limit: '1', offset: '1' }).expect(200);
    expect(result.body.excerpts).toEqual([sourceSnapshot().excerpts[0]]);
    expect(result.body).toMatchObject({ limit: 1, offset: 1, hasMore: true });
  });
  it('accepts boundary limits, safe offsets and no matches', async () => {
    const result = await request(app.getHttpServer()).get(base).query({ limit: '50', offset: String(Number.MAX_SAFE_INTEGER), q: 'no-match-at-all' }).expect(200);
    expect(result.body).toMatchObject({ excerpts: [], limit: 50, offset: Number.MAX_SAFE_INTEGER, hasMore: false });
  });
  it.each([{ q: '' }, { q: '   ' }, { q: 'x'.repeat(201) }, { q: ['God', 'man'] }, { limit: '0' }, { limit: '51' }, { limit: '1.5' }, { limit: '-1' }, { limit: '1e1' }, { limit: ['1', '2'] }, { offset: '-1' }, { offset: '0.5' }, { offset: '9007199254740992' }, { unexpected: 'x' }])('rejects malformed query %j with the sanitised contract', async query => {
    const result = await request(app.getHttpServer()).get(base).query(query).expect(400);
    expect(result.body).toEqual({ error: { code: 'VALIDATION_ERROR', message: 'Entrada inválida.' } });
  });
  it.each(['/sources?extra=x', `/source-excerpts/${excerptFixture[0]!.id}?q=God`, '/sources/INVALID/excerpts', '/source-excerpts/INVALID'])('validates strict query/path input %s', async path => {
    expect((await request(app.getHttpServer()).get(path).expect(400)).body).toEqual({ error: { code: 'VALIDATION_ERROR', message: 'Entrada inválida.' } });
  });
  it.each([' 1', '1 ', '1e1'])('requires plain decimal offset text, rejecting %j', async offset => {
    expect((await request(app.getHttpServer()).get(base).query({ offset }).expect(400)).body).toEqual({ error: { code: 'VALIDATION_ERROR', message: 'Entrada inválida.' } });
  });
  it.each(['/sources/absent/excerpts', '/source-excerpts/absent'])('returns typed absence for %s', async path => {
    expect((await request(app.getHttpServer()).get(path).expect(404)).body).toEqual({ error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' } });
  });
  it.each(['display', 'quote', 'index'] as const)('returns source-specific 403 for pending/denied %s', async permission => {
    for (const status of ['pending', 'denied']) {
      await database.client.sourceLibrarySource.update({ where: { id: sourceFixture.id }, data: { permissions: { ...sourceFixture.permissions, [permission]: status } } });
      const url = permission === 'index' ? `${base}?q=God` : base;
      expect((await request(app.getHttpServer()).get(url).expect(403)).body).toEqual({ error: { code: 'FORBIDDEN', message: 'Operação não autorizada.' } });
      if (permission !== 'index') {
        expect((await request(app.getHttpServer()).get(`/source-excerpts/${sourceSnapshot().excerpts[0]!.id}`).expect(403)).body).toEqual({ error: { code: 'FORBIDDEN', message: 'Operação não autorizada.' } });
        expect((await request(app.getHttpServer()).get('/sources').expect(200)).body).toEqual({ sources: [] });
      }
    }
  });
  it('publishes the three read operations, strict outputs, queries and errors in OpenAPI', async () => {
    const document = (await request(app.getHttpServer()).get('/openapi.json').expect(200)).body;
    for (const path of ['/sources', '/sources/{sourceId}/excerpts', '/source-excerpts/{excerptId}']) {
      expect(Object.keys(document.paths[path])).toEqual(['get']);
      for (const status of ['200', '400', '403', '404', '500']) expect(document.paths[path].get.responses[status].content['application/json'].schema).toBeDefined();
    }
    const page = document.paths['/sources/{sourceId}/excerpts'].get;
    expect(page.parameters.map((parameter: { name: string }) => parameter.name).sort()).toEqual(['limit', 'offset', 'q', 'sourceId']);
    const parameters = Object.fromEntries(page.parameters.map((parameter: { name: string }) => [parameter.name, parameter]));
    expect(parameters.sourceId).toMatchObject({ in: 'path', required: true, schema: { type: 'string', pattern: '^[a-z0-9-]+$' } });
    expect(parameters.q).toMatchObject({ in: 'query', required: false, schema: { type: 'string', minLength: 1, maxLength: 200 } });
    expect(parameters.limit).toMatchObject({ in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } });
    expect(parameters.offset).toMatchObject({ in: 'query', required: false, schema: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER, default: 0 } });
    expect(page.responses['200'].content['application/json'].schema.additionalProperties).toBe(false);
  });
  it('records only sanitised structured diagnostics for source-specific access and absence', async () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    try {
      await database.client.sourceLibrarySource.update({ where: { id: sourceFixture.id }, data: { permissions: { ...sourceFixture.permissions, display: 'denied' } } });
      await request(app.getHttpServer()).get(base).expect(403);
      await request(app.getHttpServer()).get('/source-excerpts/absent').expect(404);
      expect(log.mock.calls).toEqual([
        [JSON.stringify({ component: 'http', code: 'FORBIDDEN', status: 403 })],
        [JSON.stringify({ component: 'http', code: 'NOT_FOUND', status: 404 })],
      ]);
    } finally { log.mockRestore(); }
  });
  it('sanitises a real source database outage as 500 rather than empty results', async () => {
    const unavailable = await createApplication({ ...parseRuntimeConfig(process.env), databaseUrl: 'postgresql://localhost:9/biblia_test' });
    try {
      await unavailable.init();
      expect((await request(unavailable.getHttpServer()).get('/sources').expect(500)).body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno.' } });
    } finally { await unavailable.close(); }
  });
});
