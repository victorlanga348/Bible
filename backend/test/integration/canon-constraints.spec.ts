import type { Database } from '../../src/infrastructure/database';
import { canonSnapshot, cleanCanon, openCanonTestDatabase, seedCanon } from '../helpers/canon';
describe('canon constraints on real isolated PostgreSQL', () => {
  let db: Database;
  beforeAll(async () => { db = await openCanonTestDatabase(); });
  beforeEach(async () => { await cleanCanon(db); await seedCanon(db); });
  afterAll(async () => { if (db) { try { await cleanCanon(db); } finally { await db.onModuleDestroy(); } } });
  it.each(['name', 'language', 'canon_id', 'source_url', 'retrieved_at', 'license_id', 'license_url', 'attribution'])('rejects blank translation %s', async column => {
    // Column is selected from this literal test matrix, never transport input.
    await expect(db.client.$executeRawUnsafe(`UPDATE app.canon_translation SET "${column}" = $1`, ' ')).rejects.toThrow();
    expect(await db.client.canonTranslation.findUnique({ where: { id: 'porbr2018' } })).toMatchObject(canonSnapshot().translation);
  });
  it.each([0n, -1n, 9007199254740992n])('rejects out-of-contract numeric labels %s', async value => {
    await expect(db.client.canonBook.update({ where: { translationId_code: { translationId: 'porbr2018', code: 'GEN' } }, data: { order: value } })).rejects.toThrow();
    await expect(db.client.canonChapter.update({ where: { translationId_bookCode_number: { translationId: 'porbr2018', bookCode: 'GEN', number: 1n } }, data: { number: value } })).rejects.toThrow();
    await expect(db.client.canonVerse.update({ where: { translationId_bookCode_chapter_number: { translationId: 'porbr2018', bookCode: 'GEN', chapter: 1n, number: 1n } }, data: { number: value } })).rejects.toThrow();
  });
  it('enforces composite foreign keys, unique order, text and hash constraints', async () => {
    await expect(db.client.canonBook.create({ data: { translationId: 'absent', code: 'GEN', name: 'Gênesis', order: 1n } })).rejects.toThrow();
    await expect(db.client.canonChapter.create({ data: { translationId: 'porbr2018', bookCode: 'EXO', number: 1n } })).rejects.toThrow();
    await expect(db.client.canonVerse.create({ data: { translationId: 'porbr2018', bookCode: 'GEN', chapter: 2n, number: 1n, text: canonSnapshot().verses[0]!.text } })).rejects.toThrow();
    await expect(db.client.canonBook.updateMany({ data: { order: 1n } })).rejects.toThrow();
    await expect(db.client.canonVerse.updateMany({ data: { text: ' ' } })).rejects.toThrow();
    await expect(db.client.canonTranslation.updateMany({ data: { sourceSha256: 'not-a-hash' } })).rejects.toThrow();
    await expect(db.client.canonBook.updateMany({ data: { code: 'bad' } })).rejects.toThrow();
    await expect(db.client.canonTranslation.updateMany({ data: { id: 'INVALID' } })).rejects.toThrow();
    await expect(db.client.canonTranslation.deleteMany()).rejects.toThrow();
    expect(await db.client.canonVerse.count()).toBe(4);
  });
});
