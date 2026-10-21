import { readFileSync } from 'node:fs';
import { CanonDomainError } from '../../../src/modules/biblical-canon/domain/canon-domain-error';
import { Translation, type TranslationProps } from '../../../src/modules/biblical-canon/domain/translation';
import { Book } from '../../../src/modules/biblical-canon/domain/book';
import { Chapter } from '../../../src/modules/biblical-canon/domain/chapter';
import { Verse } from '../../../src/modules/biblical-canon/domain/verse';
import { PassageReference } from '../../../src/modules/biblical-canon/domain/passage-reference';

const base = 'test/fixtures/biblical-canon/porbr2018/';
const manifest = JSON.parse(readFileSync(`${base}manifest.json`, 'utf8')) as {
  translation: TranslationProps;
  catalog: { code: string; name: string; order: number }[];
};
const verses = JSON.parse(readFileSync(`${base}verses.json`, 'utf8')) as { bookCode: string; chapter: number; number: number; text: string }[];
const translation = manifest.translation;
const originalBook = manifest.catalog[0]!;
const book = { translationId: translation.id, code: originalBook.code, name: originalBook.name, order: originalBook.order };

describe('translation provenance from the admitted real snapshot', () => {
  it('preserves all identity, attribution and provenance fields without inventing values', () => {
    expect({ ...new Translation(translation) }).toEqual(translation);
  });
  it('does not allow later writes to replace the validated snapshot identity', () => {
    const entity = new Translation(translation);
    Reflect.set(entity, 'sourceSha256', '');
    expect(entity.sourceSha256).toBe(translation.sourceSha256);
  });
  it.each(['id', 'name', 'language', 'canonId', 'licenseId', 'attribution'] as const)('requires non-empty %s', (key) => {
    for (const value of ['', ' \n\t']) expect(() => new Translation({ ...translation, [key]: value })).toThrow(CanonDomainError);
  });
  it.each(['sourceUrl', 'licenseUrl'] as const)('requires a valid absolute %s', (key) => {
    for (const value of ['', 'not-a-url', 'https://']) expect(() => new Translation({ ...translation, [key]: value })).toThrow(CanonDomainError);
  });
  it('rejects an invalid retrieval date', () => {
    expect(() => new Translation({ ...translation, retrievedAt: 'not-a-date' })).toThrow(CanonDomainError);
  });
  it.each(['', 'a'.repeat(63), 'a'.repeat(65), 'g'.repeat(64), `${'a'.repeat(63)}\n`])('rejects malformed source checksums', (sourceSha256) => {
    expect(() => new Translation({ ...translation, sourceSha256 })).toThrow(CanonDomainError);
  });
  it('accepts uppercase hexadecimal as the same checksum identity', () => {
    expect(new Translation({ ...translation, sourceSha256: translation.sourceSha256.toUpperCase() }).sourceSha256).toBe(translation.sourceSha256);
  });
  it('requires the approved edition identifier syntax', () => {
    expect(() => new Translation({ ...translation, id: 'POR_BR' })).toThrow(CanonDomainError);
  });
});

describe('book and chapter identities remain specific to their edition', () => {
  it('preserves real catalog metadata and normalises only the code', () => {
    expect({ ...new Book({ ...book, code: book.code.toLowerCase() }) }).toEqual(book);
  });
  it('preserves a chapter identity', () => {
    expect({ ...new Chapter({ translationId: translation.id, bookCode: 'gen', number: 1 }) }).toEqual({ translationId: translation.id, bookCode: 'GEN', number: 1 });
  });
  it('does not allow later writes to invalidate book order or chapter identity', () => {
    const entity = new Book(book);
    const chapter = new Chapter({ translationId: translation.id, bookCode: 'GEN', number: 1 });
    Reflect.set(entity, 'order', 0);
    Reflect.set(chapter, 'number', 0);
    expect(entity.order).toBe(book.order);
    expect(chapter.number).toBe(1);
  });
  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects unsafe book order or chapter number %s', (number) => {
    expect(() => new Book({ ...book, order: number })).toThrow(CanonDomainError);
    expect(() => new Chapter({ translationId: translation.id, bookCode: 'GEN', number })).toThrow(CanonDomainError);
  });
  it('rejects a blank book name', () => {
    expect(() => new Book({ ...book, name: ' \n ' })).toThrow(CanonDomainError);
  });
  it('rejects invalid edition/code in both identities', () => {
    expect(() => new Book({ ...book, translationId: '' })).toThrow(CanonDomainError);
    expect(() => new Book({ ...book, code: 'GÉN' })).toThrow(CanonDomainError);
    expect(() => new Chapter({ translationId: '', bookCode: 'GEN', number: 1 })).toThrow(CanonDomainError);
    expect(() => new Chapter({ translationId: translation.id, bookCode: 'GEN\n', number: 1 })).toThrow(CanonDomainError);
  });
});

describe('verse preserves genuine source text and a singular identity', () => {
  it.each(verses)('preserves exact XML text for $bookCode $chapter:$number', (source) => {
    const reference = new PassageReference({ translationId: translation.id, bookCode: source.bookCode, chapter: source.chapter, fromVerse: source.number, toVerse: source.number });
    const verse = new Verse({ reference, text: source.text });
    expect(verse.reference).toBe(reference);
    expect(verse.text).toBe(source.text);
  });
  it.each(['', ' \t\n'])('rejects empty source text', (text) => {
    const reference = new PassageReference({ translationId: translation.id, bookCode: 'GEN', chapter: 1, fromVerse: 1, toVerse: 1 });
    expect(() => new Verse({ reference, text })).toThrow(CanonDomainError);
  });
  it('does not allow a verse entity to identify a range', () => {
    const reference = new PassageReference({ translationId: translation.id, bookCode: 'JHN', chapter: 3, fromVerse: 16, toVerse: 18 });
    expect(() => new Verse({ reference, text: verses[1]!.text })).toThrow(CanonDomainError);
  });
  it('does not allow later writes to erase already validated genuine text', () => {
    const source = verses[0]!;
    const reference = new PassageReference({ translationId: translation.id, bookCode: source.bookCode, chapter: source.chapter, fromVerse: source.number, toVerse: source.number });
    const entity = new Verse({ reference, text: source.text });
    Reflect.set(entity, 'text', '');
    expect(entity.text).toBe(source.text);
  });
});
