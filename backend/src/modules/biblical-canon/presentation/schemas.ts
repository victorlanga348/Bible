import { z } from 'zod';
const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);
const nonblank = z.string().regex(/\S/);
const positive = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const count = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const bookCode = z.string().regex(/^[A-Z0-9]{3}$/);
const decimal = z.string().regex(/^\d+$/).transform(Number).pipe(positive);
export const emptyQuery = z.strictObject({});
export const translationParams = z.strictObject({ translationId: id });
export const bookParams = translationParams.extend({ bookCode: z.string().regex(/^[a-zA-Z0-9]{3}$/).transform(value => value.toUpperCase()) });
export const chapterParams = bookParams.extend({ chapter: decimal });
export const rangeQuery = z.strictObject({ from: decimal.optional(), to: decimal.optional() })
  .refine(value => (value.from === undefined && value.to === undefined) || (value.from !== undefined && value.to !== undefined && value.from <= value.to));
export const resolveBody = z.strictObject({ translationId: id, reference: z.string().trim().min(1) });
export const translationView = z.strictObject({ id, name: nonblank, language: nonblank, canonId: nonblank,
  sourceUrl: z.url(), sourceSha256: z.string().regex(/^[a-fA-F0-9]{64}$/), retrievedAt: z.string().refine(value => Number.isFinite(Date.parse(value))),
  licenseId: nonblank, licenseUrl: z.url(), attribution: nonblank });
export const translationsView = z.strictObject({ translations: z.array(translationView) });
export const booksView = z.strictObject({ books: z.array(z.strictObject({ code: bookCode, name: nonblank, order: positive, chapterCount: count })) });
export const chaptersView = z.strictObject({ chapters: z.array(z.strictObject({ number: positive, verseCount: count })) });
const position = z.strictObject({ bookCode, chapter: positive }).nullable();
export const passageView = z.strictObject({ translationId: id, bookCode, chapter: positive,
  verses: z.array(z.strictObject({ number: positive, text: nonblank })), previousChapter: position, nextChapter: position, attribution: nonblank, licenseUrl: z.url() });
export const resolvedView = z.strictObject({ translationId: id, bookCode, chapter: positive, fromVerse: positive, toVerse: positive, normalized: nonblank });
export const errorView = (code: string, message: string) => z.strictObject({ error: z.strictObject({ code: z.literal(code), message: z.literal(message) }) });
