import { readFileSync } from 'node:fs';
import { assertTestTarget } from '../../src/config/runtime-config';
import { Database } from '../../src/infrastructure/database';
import { Translation, type TranslationProps } from '../../src/modules/biblical-canon/domain/translation';
import { Book } from '../../src/modules/biblical-canon/domain/book';
import { Chapter } from '../../src/modules/biblical-canon/domain/chapter';
import type { CanonSnapshot, VerseRow } from '../../src/modules/biblical-canon/application/ports';

const base = 'test/fixtures/biblical-canon/porbr2018/';
const manifest = JSON.parse(readFileSync(base + 'manifest.json', 'utf8')) as { translation: TranslationProps; catalog: { code: string; name: string; order: number }[] };
export const canonVerses = JSON.parse(readFileSync(base + 'verses.json', 'utf8')) as VerseRow[];
export function canonSnapshot(overrides: Partial<TranslationProps> = {}): CanonSnapshot {
  const translation = new Translation({ ...manifest.translation, ...overrides });
  return { translation,
    books: manifest.catalog.filter(book => canonVerses.some(v => v.bookCode === book.code)).map(book => new Book({ ...book, translationId: translation.id })),
    chapters: [{ bookCode: 'GEN', number: 1 }, { bookCode: 'JHN', number: 3 }].map(chapter => new Chapter({ ...chapter, translationId: translation.id })),
    verses: canonVerses,
  };
}
export async function openCanonTestDatabase(): Promise<Database> {
  const database = new Database(assertTestTarget(process.env));
  try { expect(await database.client.$queryRaw`SELECT current_database() AS db, current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]); return database; }
  catch (error) { await database.onModuleDestroy(); throw error; }
}
export async function cleanCanon(database: Database): Promise<void> {
  await database.client.$transaction(async tx => {
    await tx.$executeRaw`LOCK TABLE app.canon_translation, app.canon_book, app.canon_chapter, app.canon_verse IN SHARE ROW EXCLUSIVE MODE`;
    await tx.canonVerse.deleteMany(); await tx.canonChapter.deleteMany(); await tx.canonBook.deleteMany(); await tx.canonTranslation.deleteMany();
  });
}
export async function seedCanon(database: Database, snapshot?: CanonSnapshot): Promise<void> {
  const translation = snapshot?.translation ?? manifest.translation;
  const verses = snapshot?.verses ?? canonVerses;
  const books = snapshot?.books ?? manifest.catalog.filter(book => canonVerses.some(v => v.bookCode === book.code)).map(({ code, name, order }) => ({ code, name, order, translationId: translation.id }));
  const chapters = snapshot?.chapters ?? [...new Map(canonVerses.map(v => [`${v.bookCode}:${v.chapter}`, { translationId: translation.id, bookCode: v.bookCode, number: v.chapter }])).values()];
  await database.client.canonTranslation.create({ data: translation });
  await database.client.canonBook.createMany({ data: books.map(b => ({ ...b, order: BigInt(b.order) })) });
  await database.client.canonChapter.createMany({ data: chapters.map(c => ({ ...c, number: BigInt(c.number) })) });
  await database.client.canonVerse.createMany({ data: verses.map(v => ({ ...v, translationId: translation.id, chapter: BigInt(v.chapter), number: BigInt(v.number) })) });
}
