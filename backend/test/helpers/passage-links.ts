import type { CuratedPassageLinkProps } from '../../src/modules/source-library/domain/curated-passage-link';
import { realEvidence } from './study';
import type { Database } from '../../src/infrastructure/database';

// This explicit relation was curated against the two authentic opening texts;
// it is a narrative parallel, never independent historical confirmation.
export function passageLinkProps(overrides: Partial<CuratedPassageLinkProps> = {}): CuratedPassageLinkProps {
  return { id: 'gen-creation-parallel', excerptId: realEvidence().excerptId, translationId: 'porbr2018', bookCode: 'GEN', chapter: 1,
    fromVerse: 1, toVerse: 1, nature: 'narrative-parallel', rationale: 'Paralelo narrativo da criação do céu e da terra; não é prova histórica independente.', ...overrides };
}

export async function seedPassageLink(database: Database, input: CuratedPassageLinkProps = passageLinkProps()): Promise<void> {
  // Raw admitted fixture setup: do not execute mutated business in lifecycle hooks.
  await database.client.sourceLibraryPassageLink.create({ data: { ...input, chapter: BigInt(input.chapter), fromVerse: BigInt(input.fromVerse), toVerse: BigInt(input.toVerse) } });
}
