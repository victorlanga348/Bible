import type { Translation } from '../domain/translation';
import type { Book } from '../domain/book';
import type { Chapter } from '../domain/chapter';
export interface VerseRow { readonly bookCode: string; readonly chapter: number; readonly number: number; readonly text: string }
export interface CanonSnapshot { readonly translation: Translation; readonly books: readonly Book[]; readonly chapters: readonly Chapter[]; readonly verses: readonly VerseRow[] }
export interface BookView { readonly code: string; readonly name: string; readonly order: number; readonly chapterCount: number }
export interface ChapterView { readonly number: number; readonly verseCount: number }
export interface ChapterPosition { readonly bookCode: string; readonly chapter: number }
export interface Neighbours { readonly previousChapter: ChapterPosition | null; readonly nextChapter: ChapterPosition | null }
export interface PassageView extends Neighbours { readonly translationId: string; readonly bookCode: string; readonly chapter: number; readonly verses: readonly { number: number; text: string }[]; readonly attribution: string; readonly licenseUrl: string }
export interface CanonReadPort {
  translations(): Promise<Translation[]>;
  translation(id: string): Promise<Translation | null>;
  books(id: string): Promise<BookView[]>;
  chapters(id: string, code: string): Promise<ChapterView[]>;
  verses(id: string, code: string, chapter: number, from?: number, to?: number): Promise<VerseRow[]>;
  neighbours(id: string, code: string, chapter: number): Promise<Neighbours>;
}
export interface CanonImportPort { importSnapshot(snapshot: CanonSnapshot): Promise<'imported' | 'unchanged'> }
