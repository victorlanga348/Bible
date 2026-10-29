import { CrossReference, RelationInputError, validateWindow, type RelationProps } from '../../../src/modules/cross-references/domain/relation';
import { relationProps } from '../../helpers/cross-references';
describe('immutable personal cross-reference metadata, not a historical truth classifier', () => {
  it('preserves validated values in an isolated immutable document', () => {
    const props = relationProps(); const relation = new CrossReference(props);
    expect(JSON.parse(JSON.stringify(relation))).toEqual(props); expect(Object.isFrozen(relation)).toBe(true);
    expect(Object.isFrozen(relation.from)).toBe(true); expect(Object.isFrozen(relation.to)).toBe(true); expect(Object.isFrozen(relation.evidence)).toBe(true); expect(Object.isFrozen(relation.evidence[0])).toBe(true);
    expect(relation.from).not.toBe(props.from); expect(relation.evidence[0]).not.toBe(props.evidence[0]);
  });
  it.each(['citation', 'allusion', 'thematic-parallel'] as const)('keeps textual %s distinct', type => expect(new CrossReference({ ...relationProps(), type }).type).toBe(type));
  it.each(['historical', 'messianic', 'eschatological'] as const)('keeps prophetic reading %s explicit', reading => expect(new CrossReference({ ...relationProps(), type: 'prophetic-relation', reading }).reading).toBe(reading));
  it.each([
    { schemaVersion: 2 }, { id: 'not-a-uuid' }, { id: 'AAAAAAAA-1111-4111-8111-111111111111' }, { ownerId: '' }, { ownerId: ' owner' }, { ownerId: 'a'.repeat(65) }, { ownerId: 'a/b' },
    { type: 'invented' }, { reading: 'invented' }, { type: 'citation', reading: 'historical' }, { type: 'prophetic-relation', reading: 'textual' },
    { rationale: '' }, { rationale: ' leading' }, { rationale: 'a'.repeat(2001) }, { rationale: '\u0000' }, { rationale: '\ud800' },
    { createdAt: '2026-02-30T00:00:00.000Z' }, { createdAt: 'yesterday' }, { createdAt: '2026-10-29T00:00:00.000+00:00' },
    { evidence: [] }, { evidence: Array.from({ length: 5 }, () => relationProps().evidence[0]) },
  ])('rejects malformed document %p', patch => expect(() => new CrossReference({ ...relationProps(), ...patch } as RelationProps)).toThrow(RelationInputError));
  it.each([
    { chapter: 0, normalized: 'GEN 0:1' }, { chapter: 1.5, normalized: 'GEN 1.5:1' }, { fromVerse: 0, normalized: 'GEN 1:0-1' }, { toVerse: 0 }, { toVerse: 1.5, normalized: 'GEN 1:1-1.5' }, { fromVerse: 2, toVerse: 1, normalized: 'GEN 1:2-1' }, { translationId: '../x' }, { translationId: 'porbr2018/' }, { bookCode: 'gen', normalized: 'gen 1:1' }, { bookCode: '#GEN', normalized: '#GEN 1:1' }, { bookCode: 'GEN#', normalized: 'GEN# 1:1' }, { normalized: 'GEN 1:2' },
  ])('rejects malformed canonical metadata %p', patch => expect(() => new CrossReference({ ...relationProps(), from: { ...relationProps().from, ...patch } })).toThrow(RelationInputError));
  it('rejects the identical endpoint but preserves different editions and real ranges', () => {
    const props = relationProps(); expect(() => new CrossReference({ ...props, to: props.from })).toThrow(RelationInputError);
    expect(new CrossReference({ ...props, to: { ...props.from, translationId: 'another-edition' } }).to.translationId).toBe('another-edition');
    expect(new CrossReference({ ...props, from: { ...props.from, toVerse: 2, normalized: 'GEN 1:1-2' } }).from.toVerse).toBe(2);
  });
  it.each([{ sourceId: '' }, { excerptId: '../bad' }, { locator: '' }, { textSha256: 'bad' }, { startOffset: -1 }, { startOffset: 0.5 }, { endOffset: 0 }, { startOffset: 1, endOffset: 1 }, { endOffset: Number.MAX_SAFE_INTEGER + 1 }])('rejects invalid evidence metadata %p', patch => {
    const props = relationProps(); expect(() => new CrossReference({ ...props, evidence: [{ ...props.evidence[0]!, ...patch }] })).toThrow(RelationInputError);
  });
  it('rejects duplicate spans, accepts four distinct actual-metadata spans and rationale UTF-8 boundary', () => {
    const props = relationProps(); expect(() => new CrossReference({ ...props, evidence: [props.evidence[0]!, props.evidence[0]!] })).toThrow(RelationInputError);
    const evidence = Array.from({ length: 4 }, (_, i) => ({ ...props.evidence[0]!, startOffset: i, endOffset: i + 1 }));
    expect(new CrossReference({ ...props, evidence, rationale: 'é'.repeat(1000) }).evidence).toHaveLength(4);
    expect(() => new CrossReference({ ...props, rationale: 'é'.repeat(1001) })).toThrow(RelationInputError);
    expect(new CrossReference({ ...props, rationale: 'Technical\nuser\tannotation' }).rationale).toContain('\n');
  });
  it('validates direct list requests before any repository query', () => {
    for (const limit of [1, 20, 50]) expect(() => validateWindow('technical-owner', { limit })).not.toThrow();
    expect(() => validateWindow('technical-owner', { limit: 1, cursor: { id: relationProps().id, createdAt: relationProps().createdAt } })).not.toThrow();
    for (const limit of [0, -1, 51, 1.5, NaN]) expect(() => validateWindow('technical-owner', { limit })).toThrow(RelationInputError);
    expect(() => validateWindow('', { limit: 1 })).toThrow(RelationInputError);
    expect(() => validateWindow('technical-owner', { limit: 1, cursor: { id: 'invalid', createdAt: relationProps().createdAt } })).toThrow(RelationInputError);
    expect(() => validateWindow('technical-owner', { limit: 1, cursor: { id: relationProps().id, createdAt: 'invalid' } })).toThrow(RelationInputError);
  });
});

describe('mutation regressions: isolate each declared invariant instead of masking failures', () => {
  it('rejects five distinct real-metadata spans and noncanonical UUID/digest suffixes', () => {
    const p = relationProps(); const five = Array.from({ length: 5 }, (_, startOffset) => ({ ...p.evidence[0]!, startOffset, endOffset: startOffset + 1 }));
    expect(() => new CrossReference({ ...p, evidence: five })).toThrow(RelationInputError);
    for (const id of [`#${p.id}`, `${p.id}#`]) expect(() => new CrossReference({ ...p, id })).toThrow(RelationInputError);
    for (const textSha256 of [`#${p.evidence[0]!.textSha256}`, `${p.evidence[0]!.textSha256}#`]) expect(() => new CrossReference({ ...p, evidence: [{ ...p.evidence[0]!, textSha256 }] })).toThrow(RelationInputError);
    expect(() => new CrossReference({ ...p, evidence: [{ ...p.evidence[0]!, sourceId: p.evidence[0]!.sourceId + '/' }] })).toThrow(RelationInputError);
  });
  it.each([null, undefined])('rejects nullish nested JSON as domain input, including cursor and window: %p', value => {
    const p = relationProps(); expect(() => new CrossReference(value as unknown as RelationProps)).toThrow(RelationInputError);
    expect(() => new CrossReference({ ...p, from: value } as unknown as RelationProps)).toThrow(RelationInputError);
    expect(() => new CrossReference({ ...p, evidence: [value] } as unknown as RelationProps)).toThrow(RelationInputError);
    expect(() => validateWindow(p.ownerId, value as unknown as { limit: number })).toThrow(RelationInputError);
    if (value === null) expect(() => validateWindow(p.ownerId, { limit: 1, cursor: value } as unknown as { limit: number })).toThrow(RelationInputError);
  });
  it('refuses JSON scalar/array coercion for owner, identifiers, passage and text', () => {
    const p = relationProps(); const variants: unknown[] = [{ ...p, id: [p.id] }, { ...p, ownerId: 1 }, { ...p, rationale: ['technical text'] }, { ...p, from: { ...p.from, translationId: [p.from.translationId] } }, { ...p, evidence: [{ ...p.evidence[0]!, sourceId: [p.evidence[0]!.sourceId] }] }, { ...p, evidence: [{ ...p.evidence[0]!, textSha256: [p.evidence[0]!.textSha256] }] }];
    for (const value of variants) expect(() => new CrossReference(value as RelationProps)).toThrow(RelationInputError);
  });
  it('preserves well-formed supplementary Unicode and UTF-8 boundaries without accepting lone surrogates', () => {
    const p = relationProps(); expect(new CrossReference({ ...p, rationale: '😀'.repeat(500) }).rationale).toHaveLength(1000);
    expect(() => new CrossReference({ ...p, rationale: '😀'.repeat(501) })).toThrow(RelationInputError);
  });
});
