import { CanonLibrary } from '../../src/modules/biblical-canon/application/canon-library';
import { CanonConflictError, CanonNotFoundError, CanonSnapshotError } from '../../src/modules/biblical-canon/application/errors';
import { CanonDomainError } from '../../src/modules/biblical-canon/domain/canon-domain-error';
import { Chapter } from '../../src/modules/biblical-canon/domain/chapter';
import { PrismaCanonRepository } from '../../src/modules/biblical-canon/infrastructure/prisma-canon-repository';
import { Database } from '../../src/infrastructure/database';
import { canonSnapshot, canonVerses, cleanCanon, openCanonTestDatabase, seedCanon } from '../helpers/canon';

describe('canon application through real Prisma and PostgreSQL', () => {
  let db: Database;
  let repository: PrismaCanonRepository;
  let library: CanonLibrary;
  beforeAll(async () => { db = await openCanonTestDatabase(); repository = new PrismaCanonRepository(db); library = new CanonLibrary(repository, repository); });
  beforeEach(async () => { await cleanCanon(db); await seedCanon(db); });
  afterAll(async () => { if (db) { try { await cleanCanon(db); } finally { await db.onModuleDestroy(); } } });
  const id = 'porbr2018';
  it('returns exact edition provenance and sorted real book/chapter counts', async () => {
    expect(await library.translations()).toEqual([canonSnapshot().translation]);
    expect(await library.books(id)).toEqual([
      { code: 'GEN', name: 'Gênesis', order: 1, chapterCount: 1 }, { code: 'JHN', name: 'João', order: 43, chapterCount: 1 },
    ]);
    expect(await library.chapters(id, 'jhn')).toEqual([{ number: 3, verseCount: 3 }]);
  });
  it('returns exact chapter text, attribution and navigation across available books', async () => {
    const result = await library.passage(id, 'gen', 1);
    expect(result).toEqual({ translationId: id, bookCode: 'GEN', chapter: 1,
      verses: [{ number: 1, text: canonVerses[0]!.text }], previousChapter: null, nextChapter: { bookCode: 'JHN', chapter: 3 },
      attribution: canonSnapshot().translation.attribution, licenseUrl: canonSnapshot().translation.licenseUrl });
    expect(await library.passage(id, 'JHN', 3, 16, 17)).toMatchObject({ verses: canonVerses.slice(1, 3).map(v => ({ number: v.number, text: v.text })), previousChapter: { bookCode: 'GEN', chapter: 1 }, nextChapter: null });
  });
  it('resolves only existing complete ranges, normalising the canonical grammar', async () => {
    expect(await library.resolve(id, ' jhn 3:16-18 ')).toMatchObject({ translationId: id, bookCode: 'JHN', chapter: 3, fromVerse: 16, toVerse: 18 });
    expect((await library.resolve(id, 'GEN 1:1')).toString()).toBe('GEN 1:1');
    expect(await db.client.canonTranslation.count()).toBe(1);
  });
  it.each([
    ['edition', () => library.books('missing')], ['book', () => library.chapters(id, 'EXO')],
    ['chapter', () => library.passage(id, 'GEN', 2)], ['verse', () => library.passage(id, 'JHN', 3, 15, 16)],
    ['resolved-range', () => library.resolve(id, 'JHN 3:17-19')], ['safe-large-label', () => library.passage(id, 'GEN', Number.MAX_SAFE_INTEGER)],
  ] as const)('distinguishes missing %s from malformed input', async (_label, action) => { await expect(action()).rejects.toThrow(CanonNotFoundError); });
  it('rejects a gap inside a requested interval without returning partial scripture', async () => {
    await db.client.canonVerse.delete({ where: { translationId_bookCode_chapter_number: { translationId: id, bookCode: 'JHN', chapter: 3n, number: 17n } } });
    await expect(library.passage(id, 'JHN', 3, 16, 18)).rejects.toThrow(CanonNotFoundError);
    expect((await library.passage(id, 'JHN', 3)).verses).toHaveLength(2);
  });
  it.each([[0, undefined, undefined], [1, 1, undefined], [1, undefined, 1], [1, 2, 1], [1, 0, 1]])('validates internal chapter/range input %j', async (chapter, from, to) => {
    await expect(library.passage(id, 'GEN', chapter!, from, to)).rejects.toThrow(CanonDomainError);
  });
  it('returns an empty catalogue only for a genuinely empty repository', async () => { await cleanCanon(db); expect(await library.translations()).toEqual([]); });
  it('propagates a real unavailable PostgreSQL rather than empty results', async () => {
    const unavailable = new Database('postgresql://localhost:9/biblia_test');
    try { const adapter = new PrismaCanonRepository(unavailable); await expect(new CanonLibrary(adapter, adapter).translations()).rejects.toThrow(); }
    finally { await unavailable.onModuleDestroy(); }
  });
  it('imports atomically and is unchanged for the same admitted identity', async () => {
    await cleanCanon(db);
    expect(await library.importSnapshot(canonSnapshot())).toBe('imported');
    expect(await library.importSnapshot(canonSnapshot())).toBe('unchanged');
    expect(await db.client.canonVerse.count()).toBe(4);
    await expect(library.importSnapshot(canonSnapshot({ sourceSha256: 'f'.repeat(64) }))).rejects.toThrow(CanonConflictError);
    expect((await library.passage(id, 'GEN', 1)).verses[0]!.text).toBe(canonVerses[0]!.text);
  });
  it('serialises concurrent imports through two independent real clients', async () => {
    await cleanCanon(db);
    const other = await openCanonTestDatabase();
    try {
      const adapter = new PrismaCanonRepository(other);
      const results = await Promise.all([library.importSnapshot(canonSnapshot()), new CanonLibrary(adapter, adapter).importSnapshot(canonSnapshot())]);
      expect(results.sort()).toEqual(['imported', 'unchanged']);
      expect(await db.client.canonVerse.count()).toBe(4);
    } finally { await other.onModuleDestroy(); }
  });
  it.each(['book', 'chapter', 'verse', 'foreign-chapter', 'foreign-verse', 'empty-text', 'missing-book', 'missing-chapter', 'book-order'] as const)('refuses inconsistent %s snapshots before persisting', async variation => {
    await cleanCanon(db);
    const snapshot = canonSnapshot();
    const invalid = { ...snapshot,
      books: variation === 'book' ? [...snapshot.books, snapshot.books[0]!] : variation === 'missing-book' ? [] : variation === 'book-order' ? [snapshot.books[0]!, { ...snapshot.books[1]!, order: 1 }] : snapshot.books,
      chapters: variation === 'chapter' ? [...snapshot.chapters, snapshot.chapters[0]!] : variation === 'foreign-chapter' ? [new Chapter({ translationId: 'other', bookCode: 'GEN', number: 1 })] : variation === 'missing-chapter' ? [] : snapshot.chapters,
      verses: variation === 'verse' ? [...snapshot.verses, snapshot.verses[0]!] : variation === 'foreign-verse' ? [{ ...snapshot.verses[0]!, bookCode: 'EXO' }] : variation === 'empty-text' ? [{ ...snapshot.verses[0]!, text: ' ' }] : snapshot.verses,
    };
    await expect(library.importSnapshot(invalid)).rejects.toThrow(CanonSnapshotError);
    expect(await db.client.canonTranslation.count()).toBe(0);
  });
  it('rolls back every row when an actual database constraint interrupts import', async () => {
    await cleanCanon(db);
    const snapshot = canonSnapshot();
    await expect(repository.importSnapshot({ ...snapshot, books: [...snapshot.books, snapshot.books[0]!] })).rejects.toThrow();
    expect(await db.client.canonTranslation.count()).toBe(0);
    expect(await db.client.canonBook.count()).toBe(0);
  });
  it('orders neighbours within a book using actual chapter labels', async () => {
    const original = await db.client.canonChapter.findUniqueOrThrow({ where: { translationId_bookCode_number: { translationId: id, bookCode: 'GEN', number: 1n } } });
    // Additional real chapter identity only; no invented scripture text.
    await db.client.canonChapter.create({ data: { ...original, number: 2n } });
    expect(await repository.neighbours(id, 'GEN', 1)).toEqual({ previousChapter: null, nextChapter: { bookCode: 'GEN', chapter: 2 } });
    expect(await repository.neighbours(id, 'GEN', 2)).toEqual({ previousChapter: { bookCode: 'GEN', chapter: 1 }, nextChapter: { bookCode: 'JHN', chapter: 3 } });
  });
  it('preserves a real1001-verse selection across the SQL batch boundary', async () => {
    const { readCanonSnapshot } = await import('../../src/modules/biblical-canon/infrastructure/admitted-canon.js');
    const full = await readCanonSnapshot({ archive: 'data/biblical-canon/porbr2018/source.zip', snapshot: 'data/biblical-canon/porbr2018/snapshot.json', manifest: 'test/fixtures/biblical-canon/porbr2018/manifest.json' });
    await cleanCanon(db);
    expect(await library.importSnapshot({ ...full, verses: full.verses.slice(0, 1001) })).toBe('imported');
    expect(await db.client.canonVerse.count()).toBe(1001);
    const boundary = full.verses[1000]!;
    expect(await db.client.canonVerse.findUnique({ where: { translationId_bookCode_chapter_number: { translationId: id, bookCode: boundary.bookCode, chapter: BigInt(boundary.chapter), number: BigInt(boundary.number) } } })).toMatchObject({ text: boundary.text });
  });
});
