import { readFileSync } from 'node:fs';
import type { Database } from '../../src/infrastructure/database';
import type { SourceProps } from '../../src/modules/source-library/domain/source';
import type { SourceExcerptProps } from '../../src/modules/source-library/domain/source-excerpt';
import type { CuratedPassageLinkProps } from '../../src/modules/source-library/domain/curated-passage-link';

export const aiFixtureFiles = {
  manifest: 'test/fixtures/ai-assistant/source-library/josephus-antiquities-pg2848-en-local-ai-v1/manifest.json',
  excerpts: 'test/fixtures/ai-assistant/source-library/josephus-antiquities-pg2848-en-local-ai-v1/excerpts.json',
};
const manifest = JSON.parse(readFileSync(aiFixtureFiles.manifest, 'utf8')) as { source: SourceProps; curatedPassageLinks: CuratedPassageLinkProps[] };
export const aiSourceFixture = manifest.source;
export const aiCurations = manifest.curatedPassageLinks;
export const aiExcerptFixtures = JSON.parse(readFileSync(aiFixtureFiles.excerpts, 'utf8')) as SourceExcerptProps[];

export async function seedAiSource(database: Database): Promise<void> {
  // Caller has already checked biblia_test identity. Raw authenticated fixture
  // setup keeps mutated business constructors/importers out of lifecycle hooks.
  await database.client.sourceLibrarySource.create({ data: { ...aiSourceFixture, permissions: { ...aiSourceFixture.permissions } } });
  await database.client.sourceLibraryExcerpt.createMany({ data: aiExcerptFixtures.map(row => ({ ...row, order: BigInt(row.order) })) });
}
