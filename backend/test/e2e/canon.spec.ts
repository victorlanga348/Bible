import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApplication } from '../../src/app';
import { parseRuntimeConfig } from '../../src/config/runtime-config';
import type { Database } from '../../src/infrastructure/database';
import { canonSnapshot, canonVerses, cleanCanon, openCanonTestDatabase, seedCanon } from '../helpers/canon';

describe('five canonical operations with real Nest and PostgreSQL', () => {
  let app: INestApplication;
  let database: Database;
  const base = '/translations/porbr2018/books';
  beforeAll(async () => { database = await openCanonTestDatabase(); await cleanCanon(database); await seedCanon(database); app = await createApplication(parseRuntimeConfig(process.env)); await app.init(); });
  afterAll(async () => { try { if (database) await cleanCanon(database); } finally { try { await app?.close(); } finally { await database?.onModuleDestroy(); } } });
  it('returns exact translation provenance and books/chapters in canonical order', async () => {
    expect((await request(app.getHttpServer()).get('/translations').expect(200)).body).toEqual({ translations: [canonSnapshot().translation] });
    expect((await request(app.getHttpServer()).get(base).expect(200)).body).toEqual({ books: [
      { code: 'GEN', name: 'Gênesis', order: 1, chapterCount: 1 }, { code: 'JHN', name: 'João', order: 43, chapterCount: 1 },
    ] });
    expect((await request(app.getHttpServer()).get(`${base}/jhn/chapters`).expect(200)).body).toEqual({ chapters: [{ number: 3, verseCount: 3 }] });
  });
  it('returns the complete available chapter or exact requested interval with credits', async () => {
    const path = `${base}/JHN/chapters/3/verses`;
    const full = (await request(app.getHttpServer()).get(path).expect(200)).body;
    expect(full).toEqual({ translationId: 'porbr2018', bookCode: 'JHN', chapter: 3, verses: canonVerses.slice(1).map(v => ({ number: v.number, text: v.text })), previousChapter: { bookCode: 'GEN', chapter: 1 }, nextChapter: null, attribution: canonSnapshot().translation.attribution, licenseUrl: canonSnapshot().translation.licenseUrl });
    expect((await request(app.getHttpServer()).get(path).query({ from: '16', to: '16' }).expect(200)).body.verses).toEqual([{ number: 16, text: canonVerses[1]!.text }]);
  });
  it('resolves existing references with HTTP200 and makes no persistent write', async () => {
    expect((await request(app.getHttpServer()).post('/references/resolve').send({ translationId: 'porbr2018', reference: ' jhn 3:16-18 ' }).expect(200)).body).toEqual({ translationId: 'porbr2018', bookCode: 'JHN', chapter: 3, fromVerse: 16, toVerse: 18, normalized: 'JHN 3:16-18' });
    expect(await database.client.canonVerse.count()).toBe(4);
  });
  it.each(['/translations?extra=x', `${base}?extra=x`, `${base}/GEN/chapters?extra=x`, `${base}/INVALID/chapters`, `${base}/GEN/chapters/0/verses`, `${base}/GEN/chapters/1e1/verses`, `${base}/GEN/chapters/9007199254740992/verses`])('rejects invalid path/query %s', async path => {
    expect((await request(app.getHttpServer()).get(path).expect(400)).body).toEqual({ error: { code: 'VALIDATION_ERROR', message: 'Entrada inválida.' } });
  });
  it.each([{ from: '16' }, { to: '18' }, { from: '18', to: '16' }, { from: '0', to: '1' }, { from: '1.5', to: '2' }, { from: ['16', '17'], to: '18' }, { from: '16', to: '9007199254740992' }, { other: 'x' }])('rejects malformed ranges %j', async query => {
    expect((await request(app.getHttpServer()).get(`${base}/JHN/chapters/3/verses`).query(query).expect(400)).body).toEqual({ error: { code: 'VALIDATION_ERROR', message: 'Entrada inválida.' } });
  });
  it.each([{}, { translationId: 'porbr2018', reference: '' }, { translationId: 'porbr2018', reference: 'João 3:16' }, { translationId: 'porbr2018', reference: 'JHN 3:16', extra: true }, { translationId: 1, reference: 'JHN 3:16' }])('rejects malformed resolution body %j', async body => {
    expect((await request(app.getHttpServer()).post('/references/resolve').send(body).expect(400)).body).toEqual({ error: { code: 'VALIDATION_ERROR', message: 'Entrada inválida.' } });
  });
  it.each(['/translations/missing/books', `${base}/EXO/chapters`, `${base}/GEN/chapters/2/verses`, `${base}/JHN/chapters/3/verses?from=16&to=19`])('reports well formed absence %s as 404', async path => {
    expect((await request(app.getHttpServer()).get(path).expect(404)).body).toEqual({ error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' } });
  });
  it('reports absent resolved scripture as 404 and rejects resolution query extras', async () => {
    expect((await request(app.getHttpServer()).post('/references/resolve').send({ translationId: 'porbr2018', reference: 'GEN 1:2' }).expect(404)).body).toEqual({ error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' } });
    await request(app.getHttpServer()).post('/references/resolve?extra=x').send({ translationId: 'porbr2018', reference: 'GEN 1:1' }).expect(400);
  });
  it('publishes all five strict operations and DTOs in OpenAPI', async () => {
    const doc = (await request(app.getHttpServer()).get('/openapi.json').expect(200)).body;
    for (const path of ['/translations', '/translations/{translationId}/books', '/translations/{translationId}/books/{bookCode}/chapters', '/translations/{translationId}/books/{bookCode}/chapters/{chapter}/verses', '/references/resolve']) {
      const operation = doc.paths[path][path === '/references/resolve' ? 'post' : 'get'];
      for (const status of ['200', '400', '404', '500']) expect(operation.responses[status].content['application/json'].schema).toBeDefined();
      expect(operation.responses['200'].content['application/json'].schema.additionalProperties).toBe(false);
    }
    expect(doc.paths['/references/resolve'].post.requestBody.content['application/json'].schema.additionalProperties).toBe(false);
  });
  it('records only the approved structured code/status for canonical failures', async () => {
    const logs = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    try {
      await request(app.getHttpServer()).get('/translations/missing/books').expect(404);
      await request(app.getHttpServer()).post('/references/resolve').send({ translationId: 'porbr2018', reference: 'unrecognised reference' }).expect(400);
      expect(logs.mock.calls.map(call => JSON.parse(String(call[0])))).toEqual([
        { component: 'http', code: 'NOT_FOUND', status: 404 },
        { component: 'http', code: 'VALIDATION_ERROR', status: 400 },
      ]);
    } finally { logs.mockRestore(); }
  });
  it('sanitises real database failure as 500, preserving operational distinction', async () => {
    const unavailable = await createApplication({ ...parseRuntimeConfig(process.env), databaseUrl: 'postgresql://localhost:9/biblia_test' });
    try { await unavailable.init(); expect((await request(unavailable.getHttpServer()).get('/translations').expect(500)).body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno.' } }); }
    finally { await unavailable.close(); }
  });
});
