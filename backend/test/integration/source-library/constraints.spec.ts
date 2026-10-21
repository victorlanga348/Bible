import type { Database } from '../../../src/infrastructure/database';
import { cleanSourceTestData, openSourceTestDatabase, seedCuratedSource, sourceFixture, sourceSnapshot } from '../../helpers/source-library';

describe('module constraints on real PostgreSQL rows', () => {
  let database: Database;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => { await cleanSourceTestData(database); await seedCuratedSource(database); });
  afterAll(async () => { if (database) { try { await cleanSourceTestData(database); } finally { await database.onModuleDestroy(); } } });
  it.each([
    {}, { ...sourceFixture.permissions, extra: 'allowed' }, { ...sourceFixture.permissions, index: 'unknown' },
    ...(['ingest', 'store', 'index', 'display', 'quote', 'sendToAi'] as const).map(key => ({ ...sourceFixture.permissions, [key]: null })),
  ])('rejects malformed permission JSON %j at the database boundary', async permissions => {
    await expect(database.client.$executeRaw`UPDATE app.source_library_source SET permissions = ${JSON.stringify(permissions)}::jsonb WHERE id = ${sourceFixture.id}`).rejects.toThrow();
    expect((await database.client.sourceLibrarySource.findUniqueOrThrow({ where: { id: sourceFixture.id } })).permissions).toEqual(sourceFixture.permissions);
  });
  it.each([0n, -1n, 9007199254740992n])('rejects excerpt order %s outside positive safe integers', async order => {
    await expect(database.client.sourceLibraryExcerpt.update({ where: { id: sourceSnapshot().excerpts[0]!.id }, data: { order } })).rejects.toThrow();
  });
  it('enforces both unique locators and unique source order', async () => {
    const [first, second] = sourceSnapshot().excerpts;
    await expect(database.client.sourceLibraryExcerpt.update({ where: { id: second!.id }, data: { locator: first!.locator } })).rejects.toThrow();
    await expect(database.client.sourceLibraryExcerpt.update({ where: { id: second!.id }, data: { order: BigInt(first!.order) } })).rejects.toThrow();
    expect(await database.client.sourceLibraryExcerpt.count()).toBe(4);
  });
  it('enforces primary keys, foreign keys and deletion restrictions', async () => {
    const first = sourceSnapshot().excerpts[0]!;
    await expect(database.client.sourceLibraryExcerpt.create({ data: { ...first, order: BigInt(first.order) } })).rejects.toThrow();
    await expect(database.client.sourceLibraryExcerpt.update({ where: { id: first.id }, data: { sourceId: 'missing' } })).rejects.toThrow();
    await expect(database.client.sourceLibrarySource.delete({ where: { id: sourceFixture.id } })).rejects.toThrow();
    expect(await database.client.sourceLibrarySource.count()).toBe(1);
    expect(await database.client.sourceLibraryExcerpt.count()).toBe(4);
  });
  it('rejects blank metadata/text, invalid kinds, identifiers and digests', async () => {
    for (const data of [{ title: ' \n' }, { kind: 'invented' }, { id: 'INVALID' }, { snapshotSha256: 'z'.repeat(64) }, { translator: '' }]) {
      await expect(database.client.sourceLibrarySource.update({ where: { id: sourceFixture.id }, data })).rejects.toThrow();
    }
    for (const data of [{ text: ' \n' }, { locator: '' }, { textSha256: 'short' }, { originUrl: '' }]) {
      await expect(database.client.sourceLibraryExcerpt.update({ where: { id: sourceSnapshot().excerpts[0]!.id }, data })).rejects.toThrow();
    }
  });
});
