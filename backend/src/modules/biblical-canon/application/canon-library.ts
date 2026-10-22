import type { CanonReadPort, CanonImportPort, CanonSnapshot, PassageView, BookView, ChapterView } from './ports';
import { Translation } from '../domain/translation';
import { PassageReference } from '../domain/passage-reference';
import { Verse } from '../domain/verse';
import { Book } from '../domain/book';
import { Chapter } from '../domain/chapter';
import { assertPositiveInteger, assertTranslationId, normaliseBookCode } from '../domain/invariants';
import { parseReference } from '../domain/reference-parser';
import { CanonDomainError } from '../domain/canon-domain-error';
import { CanonNotFoundError, CanonSnapshotError } from './errors';

export class CanonLibrary {
  constructor(private readonly reader: CanonReadPort, private readonly importer: CanonImportPort) {}
  async translations(): Promise<Translation[]> { return this.reader.translations(); }
  private async translation(id: string): Promise<Translation> {
    assertTranslationId(id);
    const translation = await this.reader.translation(id);
    if (translation === null) throw new CanonNotFoundError();
    return translation;
  }
  async books(id: string): Promise<BookView[]> { await this.translation(id); return this.reader.books(id); }
  async chapters(id: string, code: string): Promise<ChapterView[]> {
    const bookCode = normaliseBookCode(code);
    if (!(await this.books(id)).some(book => book.code === bookCode)) throw new CanonNotFoundError();
    return this.reader.chapters(id, bookCode);
  }
  async passage(id: string, code: string, chapter: number, from?: number, to?: number): Promise<PassageView> {
    assertPositiveInteger(chapter);
    const bookCode = normaliseBookCode(code);
    if ((from === undefined) !== (to === undefined)) throw new CanonDomainError();
    if (from !== undefined) new PassageReference({ translationId: id, bookCode, chapter, fromVerse: from, toVerse: to! });
    if (!(await this.chapters(id, bookCode)).some(row => row.number === chapter)) throw new CanonNotFoundError();
    const verses = await this.reader.verses(id, bookCode, chapter, from, to);
    if (verses.length === 0 || (from !== undefined && verses.length !== to! - from + 1)) throw new CanonNotFoundError();
    const translation = await this.translation(id);
    return { translationId: id, bookCode, chapter, verses: verses.map(({ number, text }) => ({ number, text })),
      ...await this.reader.neighbours(id, bookCode, chapter), attribution: translation.attribution, licenseUrl: translation.licenseUrl };
  }
  async resolve(id: string, reference: string): Promise<PassageReference> {
    const parsed = parseReference(id, reference);
    await this.passage(id, parsed.bookCode, parsed.chapter, parsed.fromVerse, parsed.toVerse);
    return parsed;
  }
  async importSnapshot(snapshot: CanonSnapshot): Promise<'imported' | 'unchanged'> {
    try {
      const id = new Translation(snapshot.translation).id;
      const books = new Set<string>(); const orders = new Set<number>(); const chapters = new Set<string>(); const verses = new Set<string>();
      for (const book of snapshot.books) {
        new Book(book);
        if (book.translationId !== id || books.has(book.code) || orders.has(book.order)) throw new CanonSnapshotError();
        books.add(book.code); orders.add(book.order);
      }
      for (const chapter of snapshot.chapters) {
        new Chapter(chapter);
        const key = `${chapter.bookCode}:${chapter.number}`;
        if (chapter.translationId !== id || !books.has(chapter.bookCode) || chapters.has(key)) throw new CanonSnapshotError();
        chapters.add(key);
      }
      for (const verse of snapshot.verses) {
        const chapter = `${verse.bookCode}:${verse.chapter}`; const key = `${chapter}:${verse.number}`;
        new Verse({ reference: new PassageReference({ translationId: id, bookCode: verse.bookCode, chapter: verse.chapter, fromVerse: verse.number, toVerse: verse.number }), text: verse.text });
        if (!chapters.has(chapter) || verses.has(key)) throw new CanonSnapshotError();
        verses.add(key);
      }
    } catch { throw new CanonSnapshotError(); }
    return this.importer.importSnapshot(snapshot);
  }
}
