import { RelationLibrary } from '../../../src/modules/cross-references/application/relation-library';
import { RelationInputError } from '../../../src/modules/cross-references/domain/relation';
import type { RelationCreate } from '../../../src/modules/cross-references/application/ports';
import { relationProps } from '../../helpers/cross-references';
// Local rejecting ports prove validation precedes I/O; integration is covered by the actual PG suite.
it('rejects malformed requests before any storage/canon/source effect', async () => {
  const p = relationProps(); const calls: string[] = []; const forbidden = async () => { calls.push('unexpected I/O'); throw new Error('Unexpected port access'); };
  const library = new RelationLibrary({ create: forbidden, find: forbidden, list: forbidden, delete: forbidden }, { resolve: forbidden }, { capture: forbidden, deliver: forbidden }, { nextId: () => p.id, now: () => p.createdAt });
  const valid: RelationCreate = { from: { translationId: p.from.translationId, reference: p.from.normalized }, to: { translationId: p.to.translationId, reference: p.to.normalized }, type: p.type, reading: p.reading, rationale: p.rationale, evidence: p.evidence };
  await expect(library.create('', valid)).rejects.toThrow(RelationInputError);
  for (const patch of [{ evidence: [] }, { evidence: null }, { evidence: {} }, { evidence: Array.from({ length: 5 }, () => p.evidence[0]) }, { rationale: 1 }]) await expect(library.create(p.ownerId, { ...valid, ...patch } as RelationCreate)).rejects.toThrow(RelationInputError);
  await expect(library.delete('', p.id)).rejects.toThrow(RelationInputError); await expect(library.delete(p.ownerId, 'invalid')).rejects.toThrow(RelationInputError);
  expect(calls).toEqual([]);
});
