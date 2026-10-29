import type { Database } from '../../../src/infrastructure/database';
import { openSourceTestDatabase } from '../../helpers/source-library';
import { relationProps } from '../../helpers/cross-references';
describe('cross-reference additive schema and real constraints in isolated PostgreSQL', () => {
  let database: Database; let exists = false;
  beforeAll(async () => { database = await openSourceTestDatabase(); const rows = await database.client.$queryRaw<{ exists: boolean }[]>`SELECT to_regclass('app.cross_reference') IS NOT NULL AS exists`; exists = rows[0]!.exists; });
  beforeEach(async () => { if (exists) await database.client.$executeRaw`DELETE FROM app.cross_reference`; });
  afterAll(async () => { try { if (exists) await database.client.$executeRaw`DELETE FROM app.cross_reference`; } finally { await database?.onModuleDestroy(); } });
  const insert = async (patch: Record<string, unknown> = {}, docPatch: Record<string, unknown> = {}) => {
    const p = relationProps(); const row = { id: p.id, owner: p.ownerId, fromTranslation: p.from.translationId, fromBook: p.from.bookCode, fromChapter: p.from.chapter, fromStart: p.from.fromVerse, fromEnd: p.from.toVerse, toTranslation: p.to.translationId, toBook: p.to.bookCode, toChapter: p.to.chapter, toStart: p.to.fromVerse, toEnd: p.to.toVerse, ...patch };
    return database.client.$executeRaw`INSERT INTO app.cross_reference(id,owner_id,from_translation_id,from_book_code,from_chapter,from_verse_start,from_verse_end,to_translation_id,to_book_code,to_chapter,to_verse_start,to_verse_end,document,created_at) VALUES (${String(row.id)}::uuid,${String(row.owner)},${String(row.fromTranslation)},${String(row.fromBook)},${BigInt(row.fromChapter as number)},${BigInt(row.fromStart as number)},${BigInt(row.fromEnd as number)},${String(row.toTranslation)},${String(row.toBook)},${BigInt(row.toChapter as number)},${BigInt(row.toStart as number)},${BigInt(row.toEnd as number)},${JSON.stringify({ ...p, ...docPatch })}::jsonb,${new Date(p.createdAt)})`;
  };
  it('exists and stores a complete document without a foreign module FK', async () => {
    expect(exists).toBe(true); await expect(insert()).resolves.toBe(1);
    const constraints = await database.client.$queryRaw<{ foreign: boolean }[]>`SELECT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='app.cross_reference'::regclass AND contype='f') AS foreign`;
    expect(constraints).toEqual([{ foreign: false }]);
  });
  it.each([{ owner: '' }, { owner: 'x'.repeat(65) }, { fromChapter: 0 }, { fromStart: 0 }, { fromEnd: 0 }, { toStart: 17, toEnd: 16 }, { fromTranslation: '../x' }, { toBook: 'gen' }])('rejects invalid relational metadata %p in PostgreSQL', async patch => { expect(exists).toBe(true); await expect(insert(patch)).rejects.toThrow(); });
  it.each([{ schemaVersion: 2 }, { schemaVersion: null }, { evidence: [] }, { evidence: null }, { rationale: '' }, { rationale: 'x'.repeat(2001) }, { type: 'invented' }, { reading: 'historical' }])('rejects invalid internal JSON %p without SQL-null escape', async patch => { expect(exists).toBe(true); await expect(insert({}, patch)).rejects.toThrow(); });
});
