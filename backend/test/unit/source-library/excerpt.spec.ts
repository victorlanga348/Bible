import { readFileSync } from 'node:fs';
import { SourceExcerpt, type SourceExcerptProps } from '../../../src/modules/source-library/domain/source-excerpt';
import { SourceDomainError } from '../../../src/modules/source-library/domain/source-domain-error';

const excerpts = JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json', 'utf8')) as SourceExcerptProps[];
const base = excerpts[0]!;

describe('real source excerpt identities and text', () => {
  it.each(excerpts)('preserves exact extracted text, hash and location of $locator', input => {
    expect({ ...new SourceExcerpt(input) }).toEqual(input);
  });
  it('can preserve absence of a direct link without inventing a URL', () => {
    expect(new SourceExcerpt({ ...base, originUrl: null }).originUrl).toBeNull();
  });
  it.each(['id', 'sourceId'] as const)('requires valid lowercase ASCII %s', key => {
    for (const value of ['', 'SOURCE', 'x/y', 'with_space', 'x\n', 'não-ascii']) expect(() => new SourceExcerpt({ ...base, [key]: value })).toThrow(SourceDomainError);
  });
  it.each(['locator', 'text'] as const)('rejects blank %s', key => {
    for (const value of ['', ' \t\n']) expect(() => new SourceExcerpt({ ...base, [key]: value })).toThrow(SourceDomainError);
  });
  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid order %s', order => {
    expect(() => new SourceExcerpt({ ...base, order })).toThrow(SourceDomainError);
  });
  it('accepts positive safe order without pretending to verify it against a catalogue', () => {
    expect(new SourceExcerpt({ ...base, order: Number.MAX_SAFE_INTEGER }).order).toBe(Number.MAX_SAFE_INTEGER);
  });
  it.each(['', 'a'.repeat(63), 'a'.repeat(65), 'g'.repeat(64), 'a'.repeat(63) + '\n'])('rejects invalid text checksum', textSha256 => {
    expect(() => new SourceExcerpt({ ...base, textSha256 })).toThrow(SourceDomainError);
  });
  it('preserves a valid uppercase checksum without asserting a digest calculation in the domain', () => {
    const textSha256 = base.textSha256.toUpperCase();
    expect(new SourceExcerpt({ ...base, textSha256 }).textSha256).toBe(textSha256);
  });
  it.each(['', '/relative', 'not-a-url', 'https://'])('rejects an invalid supplied origin link %s', originUrl => {
    expect(() => new SourceExcerpt({ ...base, originUrl })).toThrow(SourceDomainError);
  });
  it('does not trim the source text, check catalogue membership or invent a source', () => {
    const text = ' ' + base.text + '\n';
    const excerpt = new SourceExcerpt({ ...base, sourceId: 'not-in-admitted-catalogue', text });
    expect(excerpt.sourceId).toBe('not-in-admitted-catalogue');
    expect(excerpt.text).toBe(text);
  });
  it('cannot lose its valid text or location through later writes', () => {
    const input = { ...base };
    const excerpt = new SourceExcerpt(input);
    Reflect.set(input, 'text', '');
    Reflect.set(excerpt, 'text', '');
    Reflect.set(excerpt, 'locator', '');
    expect(excerpt.text).toBe(base.text);
    expect(excerpt.locator).toBe(base.locator);
  });
});
