import type { Database } from '../../../infrastructure/database';
import type { CanonReadPort, CanonImportPort, CanonSnapshot, BookView, ChapterView, VerseRow, Neighbours } from '../application/ports';
import { Translation } from '../domain/translation';
import { CanonConflictError } from '../application/errors';

export class PrismaCanonRepository implements CanonReadPort, CanonImportPort {
  constructor(private readonly database: Database) {}
  async translations(): Promise<Translation[]> { return (await this.database.client.canonTranslation.findMany({ orderBy: { id: 'asc' } })).map(row => new Translation(row)); }
  async translation(id: string): Promise<Translation | null> {
    const row = await this.database.client.canonTranslation.findUnique({ where: { id } });
    return row === null ? null : new Translation(row);
  }
  async books(id: string): Promise<BookView[]> {
    return (await this.database.client.canonBook.findMany({ where: { translationId: id }, orderBy: { order: 'asc' }, include: { _count: { select: { chapters: true } } } }))
      .map(row => ({ code: row.code, name: row.name, order: Number(row.order), chapterCount: row._count.chapters }));
  }
  async chapters(id: string, code: string): Promise<ChapterView[]> {
    return (await this.database.client.canonChapter.findMany({ where: { translationId: id, bookCode: code }, orderBy: { number: 'asc' }, include: { _count: { select: { verses: true } } } }))
      .map(row => ({ number: Number(row.number), verseCount: row._count.verses }));
  }
  async verses(id: string, code: string, chapter: number, from?: number, to?: number): Promise<VerseRow[]> {
    return (await this.database.client.canonVerse.findMany({ where: { translationId: id, bookCode: code, chapter: BigInt(chapter),
      number: { ...(from === undefined ? {} : { gte: BigInt(from) }), ...(to === undefined ? {} : { lte: BigInt(to) }) } }, orderBy: { number: 'asc' } }))
      .map(row => ({ bookCode: row.bookCode, chapter: Number(row.chapter), number: Number(row.number), text: row.text }));
  }
  async neighbours(id: string, code: string, chapter: number): Promise<Neighbours> {
    const positions = (await this.database.client.canonChapter.findMany({ where: { translationId: id }, orderBy: [{ book: { order: 'asc' } }, { number: 'asc' }] }))
      .map(row => ({ bookCode: row.bookCode, chapter: Number(row.number) }));
    const index = positions.findIndex(row => row.bookCode === code && row.chapter === chapter);
    return { previousChapter: positions[index - 1] ?? null, nextChapter: positions[index + 1] ?? null };
  }
  async importSnapshot(snapshot: CanonSnapshot): Promise<'imported' | 'unchanged'> {
    return this.database.client.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`canon:${snapshot.translation.id}`}, 0))`;
      const existing = await tx.canonTranslation.findUnique({ where: { id: snapshot.translation.id } });
      if (existing !== null) {
        if (existing.sourceSha256.toLowerCase() !== snapshot.translation.sourceSha256.toLowerCase()) throw new CanonConflictError();
        return 'unchanged';
      }
      await tx.canonTranslation.create({ data: snapshot.translation });
      await tx.canonBook.createMany({ data: snapshot.books.map(book => ({ ...book, order: BigInt(book.order) })) });
      await tx.canonChapter.createMany({ data: snapshot.chapters.map(chapter => ({ ...chapter, number: BigInt(chapter.number) })) });
      // Bound each statement and await it on the transaction's single client.
      for (let start = 0; start < snapshot.verses.length; start += 1000) {
        await tx.canonVerse.createMany({ data: snapshot.verses.slice(start, start + 1000).map(verse => ({ ...verse, translationId: snapshot.translation.id, chapter: BigInt(verse.chapter), number: BigInt(verse.number) })) });
      }
      return 'imported';
    }, { timeout: 30000 });
  }
}
