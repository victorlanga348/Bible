import { readFileSync } from 'node:fs';
import { assertTestTarget } from '../../src/config/runtime-config';
import { Database } from '../../src/infrastructure/database';
import { Source, type SourceProps } from '../../src/modules/source-library/domain/source';
import { SourceExcerpt, type SourceExcerptProps } from '../../src/modules/source-library/domain/source-excerpt';
import type { SourceSnapshot } from '../../src/modules/source-library/application/ports';

const base = 'test/fixtures/source-library/josephus-antiquities-pg2848-en/';
export const sourceFixture = (JSON.parse(readFileSync(base + 'manifest.json', 'utf8')) as { source: SourceProps }).source;
export const excerptFixture = JSON.parse(readFileSync(base + 'excerpts.json', 'utf8')) as SourceExcerptProps[];

// Identity/permission overrides are controlled test variants of the same real text,
// not additional admitted works or production seeds.
export function sourceSnapshot(overrides: Partial<SourceProps> = {}): SourceSnapshot {
  const source = new Source({ ...sourceFixture, ...overrides });
  return {
    source,
    excerpts: excerptFixture.map(row => new SourceExcerpt({ ...row, id: row.id.replace(sourceFixture.id, source.id), sourceId: source.id })),
  };
}

export async function openSourceTestDatabase(): Promise<Database> {
  const database = new Database(assertTestTarget(process.env));
  try {
    expect(await database.client.$queryRaw`SELECT current_database() AS db, current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
    return database;
  } catch (error) { await database.onModuleDestroy(); throw error; }
}

export async function cleanSourceTestData(database: Database): Promise<void> {
  await database.client.$transaction(async transaction => {
    // Serialise with writers left in flight by a failed/timed-out test. Lock
    // parent then child, and await each delete; only guarded module tables.
    await transaction.$executeRaw`LOCK TABLE app.source_library_source, app.source_library_excerpt IN EXCLUSIVE MODE`;
    await transaction.sourceLibraryExcerpt.deleteMany();
    await transaction.sourceLibrarySource.deleteMany();
  });
}

export async function seedCuratedSource(database: Database, snapshot = sourceSnapshot()): Promise<void> {
  const { permissions, ...fields } = snapshot.source;
  await database.client.sourceLibrarySource.create({ data: { ...fields, permissions: { ...permissions } } });
  await database.client.sourceLibraryExcerpt.createMany({ data: snapshot.excerpts.map(row => ({ ...row, order: BigInt(row.order) })) });
}
