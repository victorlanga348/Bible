import { readCanonSnapshot } from '../../src/modules/biblical-canon/infrastructure/admitted-canon';
import { importTestCanonSnapshot } from '../../src/modules/biblical-canon/infrastructure/import-test-canon';
import { cleanCanon, openCanonTestDatabase } from '../helpers/canon';
import { expectNoApplicationSessions } from '../helpers/database-observation';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApplication } from '../../src/app';
import { parseRuntimeConfig } from '../../src/config/runtime-config';

// Mandatory full-corpus acceptance in normal/coverage CI; mutation uses directed
// genuine-record cases, including a batch boundary, for all the same src code.
it('imports and confronts every authenticated XML verse through guarded real PostgreSQL', async () => {
  const db = await openCanonTestDatabase();
  let app: INestApplication | undefined;
  const files = { archive: 'data/biblical-canon/porbr2018/source.zip', snapshot: 'data/biblical-canon/porbr2018/snapshot.json', manifest: 'test/fixtures/biblical-canon/porbr2018/manifest.json' };
  try {
    await cleanCanon(db);
    expect(await importTestCanonSnapshot(process.env, files)).toBe('imported');
    expect(await importTestCanonSnapshot(process.env, files)).toBe('unchanged');
    expect(await db.client.canonBook.count()).toBe(66); expect(await db.client.canonChapter.count()).toBe(1189); expect(await db.client.canonVerse.count()).toBe(31102);
    const rows = await db.client.canonVerse.findMany();
    const snapshot = await readCanonSnapshot(files);
    const lookup = new Map(snapshot.verses.map(v => [`${v.bookCode}:${v.chapter}:${v.number}`, v.text]));
    for (const row of rows) expect(row.text).toBe(lookup.get(`${row.bookCode}:${row.chapter}:${row.number}`));
    await expectNoApplicationSessions(db);
    app = await createApplication(parseRuntimeConfig(process.env)); await app.init();
    expect((await request(app.getHttpServer()).get('/translations').expect(200)).body).toEqual({ translations: [snapshot.translation] });
    expect((await request(app.getHttpServer()).get('/translations/porbr2018/books').expect(200)).body.books).toHaveLength(66);
    const chapter = (await request(app.getHttpServer()).get('/translations/porbr2018/books/GEN/chapters/1/verses').expect(200)).body;
    expect(chapter.verses).toEqual(snapshot.verses.filter(v => v.bookCode === 'GEN' && v.chapter === 1).map(v => ({ number: v.number, text: v.text })));
    expect((await request(app.getHttpServer()).post('/references/resolve').send({ translationId: 'porbr2018', reference: 'JHN 3:16' }).expect(200)).body.normalized).toBe('JHN 3:16');
  } finally { try { await app?.close(); } finally { try { await cleanCanon(db); } finally { await db.onModuleDestroy(); } } }
}, 60000);
