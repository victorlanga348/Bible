import { CanonDomainError } from '../../../src/modules/biblical-canon/domain/canon-domain-error';
import { PassageReference, type PassageReferenceProps } from '../../../src/modules/biblical-canon/domain/passage-reference';
import { parseReference } from '../../../src/modules/biblical-canon/domain/reference-parser';

const props: PassageReferenceProps = { translationId: 'porbr2018', bookCode: 'JHN', chapter: 3, fromVerse: 16, toVerse: 18 };

describe('edition-specific reference value object', () => {
  it('preserves edition, normalises the ASCII book code and formats a range', () => {
    const reference = new PassageReference({ ...props, bookCode: 'jhn' });
    expect({ ...reference }).toEqual(props);
    expect(reference.toString()).toBe('JHN 3:16-18');
  });
  it('formats a single verse without a redundant interval', () => {
    expect(new PassageReference({ ...props, toVerse: 16 }).toString()).toBe('JHN 3:16');
  });
  it('keeps a different syntactically valid edition explicit', () => {
    expect(new PassageReference({ ...props, translationId: 'edition-2' }).translationId).toBe('edition-2');
    expect(new PassageReference({ ...props, translationId: '0edition' }).translationId).toBe('0edition');
  });
  it('does not allow later writes to invalidate an already validated interval', () => {
    const reference = new PassageReference(props);
    Reflect.set(reference, 'fromVerse', 19);
    expect(reference.fromVerse).toBe(16);
    expect(reference.toString()).toBe('JHN 3:16-18');
  });
  it.each(['', '-por', 'POR', 'por_br', 'por br', 'porbr2018\n'])('rejects malformed translation identity %j', (translationId) => {
    expect(() => new PassageReference({ ...props, translationId })).toThrow(CanonDomainError);
  });
  it.each(['', 'JO', 'JOHN', 'JHN\n', 'J H', 'JHÉ', 'KHN'])('rejects a non-ASCII or malformed book code %j', (bookCode) => {
    expect(() => new PassageReference({ ...props, bookCode })).toThrow(CanonDomainError);
  });
  it.each(['chapter', 'fromVerse', 'toVerse'] as const)('requires a positive safe integer for %s', (key) => {
    for (const value of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => new PassageReference({ ...props, [key]: value })).toThrow(CanonDomainError);
    }
  });
  it('rejects reversed ranges', () => {
    expect(() => new PassageReference({ ...props, fromVerse: 19 })).toThrow(CanonDomainError);
  });
  it('accepts numeric boundaries structurally without claiming existence in a Bible', () => {
    const reference = new PassageReference({ ...props, bookCode: 'XYZ', chapter: Number.MAX_SAFE_INTEGER, fromVerse: 1, toVerse: Number.MAX_SAFE_INTEGER });
    expect(reference.chapter).toBe(Number.MAX_SAFE_INTEGER);
    expect(reference.toString()).toBe(`XYZ ${Number.MAX_SAFE_INTEGER}:1-${Number.MAX_SAFE_INTEGER}`);
  });
});

describe('pure approved reference grammar', () => {
  it.each([
    ['GEN 1:1', 'GEN 1:1', 'GEN', 1, 1, 1],
    ['  jhn 3:16-18\n', 'JHN 3:16-18', 'JHN', 3, 16, 18],
    ['1jn 2:3-3', '1JN 2:3', '1JN', 2, 3, 3],
    ['XYZ 1:1', 'XYZ 1:1', 'XYZ', 1, 1, 1],
  ] as const)('parses and canonicalises %j without catalog access', (input, formatted, bookCode, chapter, fromVerse, toVerse) => {
    const reference = parseReference('porbr2018', input);
    expect({ ...reference }).toEqual({ translationId: 'porbr2018', bookCode, chapter, fromVerse, toVerse });
    expect(reference.toString()).toBe(formatted);
  });
  it.each([
    '', 'João 3:16', 'XGEN 1:1', 'JHN3:16', 'JHN  3:16', 'JHN\t3:16', 'JHN 3 :16',
    'JHN 0:16', 'JHN 03:16', 'JHN +3:16', 'JHN -3:16', 'JHN 3.0:16', 'JHN 3e0:16',
    'JHN 3:0', 'JHN 3:016', 'JHN 3:16-018', 'JHN 3:18-16', 'JHN 3:16,18', 'JHN 3:16-4:1',
    'GEN 1:1; EXO 1:1', 'JHN 3:16x', 'JHN 3:16-18x', 'JHÉ 3:16', 'KHN 3:16',
    'JHN 9007199254740992:16', 'JHN 3:9007199254740992', 'JHN 3:16-9007199254740992',
  ])('rejects unsupported syntax or invalid numeric boundaries %j', (input) => {
    expect(() => parseReference('porbr2018', input)).toThrow(CanonDomainError);
  });
  it('allows exterior whitespace but never rewrites internal separators', () => {
    expect(parseReference('porbr2018', '\nGEN 1:1\t').toString()).toBe('GEN 1:1');
    expect(() => parseReference('porbr2018', 'GEN\n1:1')).toThrow(CanonDomainError);
  });
  it('validates the explicitly supplied edition even when reference syntax is valid', () => {
    expect(() => parseReference('', 'GEN 1:1')).toThrow(CanonDomainError);
  });
});
