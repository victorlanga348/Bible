import type { RelationProps } from '../../src/modules/cross-references/domain/relation';
import { sourceFixture, excerptFixture } from './source-library';
// Actual canonical identities and source metadata; rationale is technical user data, no historical assertion.
export function relationProps(): RelationProps {
  const excerpt = excerptFixture[0]!;
  return { schemaVersion: 1, id: '11111111-1111-4111-8111-111111111111', ownerId: 'technical-owner',
    from: { translationId: 'porbr2018', bookCode: 'GEN', chapter: 1, fromVerse: 1, toVerse: 1, normalized: 'GEN 1:1' },
    to: { translationId: 'porbr2018', bookCode: 'JHN', chapter: 3, fromVerse: 16, toVerse: 16, normalized: 'JHN 3:16' },
    type: 'thematic-parallel', reading: 'textual', rationale: 'Anotação técnica de contrato; sem reivindicar ligação histórica.',
    evidence: [{ sourceId: sourceFixture.id, excerptId: excerpt.id, locator: excerpt.locator, textSha256: excerpt.textSha256, startOffset: 0, endOffset: 30 }], createdAt: '2026-10-29T00:00:00.000Z' };
}
