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
    { chapter: 0 }, { chapter: 1.5 }, { fromVerse: 0 }, { toVerse: 0 }, { fromVerse: 2, toVerse: 1 }, { translationId: '../x' }, { bookCode: 'gen' }, { normalized: 'GEN 1:2' },
  ])('rejects malformed canonical metadata %p', patch => expect(() => new CrossReference({ ...relationProps(), from: { ...relationProps().from, ...patch } })).toThrow(RelationInputError));
  it('rejects the identical endpoint but preserves different editions and real ranges', () => {
    const props = relationProps(); expect(() => new CrossReference({ ...props, to: props.from })).toThrow(RelationInputError);
    expect(new CrossReference({ ...props, to: { ...props.from, translationId: 'another-edition' } }).to.translationId).toBe('another-edition');
    expect(new CrossReference({ ...props, from: { ...props.from, toVerse: 2, normalized: 'GEN 1:1-2' } }).from.toVerse).toBe(2);
  });
  it.each([{ sourceId: '' }, { excerptId: '../bad' }, { locator: '' }, { textSha256: 'bad' }, { startOffset: -1 }, { startOffset: 0.5 }, { endOffset: 0 }, { endOffset: Number.MAX_SAFE_INTEGER + 1 }])('rejects invalid evidence metadata %p', patch => {
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
