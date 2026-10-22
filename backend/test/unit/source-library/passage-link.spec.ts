import { CuratedPassageLink, assertPassageSelection, type CuratedPassageLinkProps } from '../../../src/modules/source-library/domain/curated-passage-link';
import { SourceDomainError } from '../../../src/modules/source-library/domain/source-domain-error';
import { passageLinkProps } from '../../helpers/passage-links';

describe('explicit curated source-to-passage relation', () => {
  it('preserves the admitted explicit relation without promoting narrative to historical proof', () => {
    const input = passageLinkProps();
    expect(new CuratedPassageLink(input)).toEqual(input);
    expect(() => assertPassageSelection(input)).not.toThrow();
  });
  it('copies and freezes the association instead of trusting readonly caller data', () => {
    const input = passageLinkProps(); const result = new CuratedPassageLink(input);
    Reflect.set(input, 'rationale', 'changed'); Reflect.set(result, 'rationale', 'changed');
    expect(result.rationale).toBe(passageLinkProps().rationale);
    expect(Object.isFrozen(result)).toBe(true);
  });
  it.each(['', '-invalid', 'UPPER', '../source'])('rejects out-of-profile identity %j', invalid => {
    for (const key of ['id', 'excerptId', 'translationId']) expect(() => new CuratedPassageLink({ ...passageLinkProps(), [key]: invalid })).toThrow(SourceDomainError);
  });
  it.each(['gen', 'GE', 'GENX', 'G?N'])('rejects malformed canonical code %j', bookCode => {
    expect(() => new CuratedPassageLink(passageLinkProps({ bookCode }))).toThrow(SourceDomainError);
  });
  it.each(['chapter', 'fromVerse', 'toVerse'] as const)('requires a safe positive %s', key => {
    for (const invalid of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) expect(() => new CuratedPassageLink(passageLinkProps({ [key]: invalid }))).toThrow(SourceDomainError);
  });
  it('refuses a reversed range, unsupported nature and empty rationale', () => {
    expect(() => new CuratedPassageLink(passageLinkProps({ fromVerse: 2, toVerse: 1 }))).toThrow(SourceDomainError);
    expect(() => new CuratedPassageLink({ ...passageLinkProps(), nature: 'historical-proof' } as unknown as CuratedPassageLinkProps)).toThrow(SourceDomainError);
    expect(() => new CuratedPassageLink(passageLinkProps({ rationale: ' \n\t' }))).toThrow(SourceDomainError);
  });
  it.each([{ id: null }, { excerptId: 12 }, { translationId: [] }, { bookCode: 123 }, { rationale: null }])('rejects a malformed JSON field with the domain error %j', invalid => {
    expect(() => new CuratedPassageLink({ ...passageLinkProps(), ...invalid } as unknown as CuratedPassageLinkProps)).toThrow(SourceDomainError);
  });
  it('validates a selection without requiring a fabricated association identity', () => {
    const { translationId, bookCode, chapter, fromVerse, toVerse } = passageLinkProps();
    expect(() => assertPassageSelection({ translationId, bookCode, chapter, fromVerse, toVerse })).not.toThrow();
    expect(() => assertPassageSelection({ translationId, bookCode, chapter: 0, fromVerse, toVerse })).toThrow(SourceDomainError);
  });
  it.each((['id', 'excerptId', 'translationId', 'bookCode'] as const).flatMap(key => ['\n', '\r', '\r\n', '\u2028', '\u2029'].map(ending => ({ key, ending }))))('rejects final line terminator $ending in curated $key', ({ key, ending }) => {
    const valid = passageLinkProps();
    expect(() => new CuratedPassageLink({ ...valid, [key]: valid[key]+ending })).toThrow(SourceDomainError);
  });
});
