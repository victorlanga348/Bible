import type { Database } from '../../../src/infrastructure/database';
import { cleanSourceTestData, openSourceTestDatabase, sourceSnapshot } from '../../helpers/source-library';

describe('deterministic cleanup of the isolated module test tables', () => {
  let database: Database;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => { await cleanSourceTestData(database); });
  afterAll(async () => { if (database) { try { await cleanSourceTestData(database); } finally { await database.onModuleDestroy(); } } });
  it('waits for an in-flight writer before deleting its source and excerpts', async () => {
    const writer = await openSourceTestDatabase();
    const snapshot = sourceSnapshot({ id: 'cleanup-controlled-fixture' });
    let release!: () => void;
    let acquired!: () => void;
    const inserted = new Promise<void>(resolve => { acquired = resolve; });
    const unblock = new Promise<void>(resolve => { release = resolve; });
    const writing = writer.client.$transaction(async transaction => {
      await transaction.sourceLibrarySource.create({ data: { ...snapshot.source, permissions: { ...snapshot.source.permissions } } });
      acquired();
      await unblock;
      await transaction.sourceLibraryExcerpt.createMany({ data: snapshot.excerpts.map(excerpt => ({ ...excerpt, order: BigInt(excerpt.order) })) });
    });
    try {
      await Promise.race([inserted, writing]);
      let finished = false;
      const cleaning = cleanSourceTestData(database).then(() => { finished = true; }).catch(error => error as Error);
      let blocked = false;
      try {
        for (let attempt = 0; attempt < 40; attempt++) {
          const rows = await database.client.$queryRaw<{ waiting: number }[]>`
            SELECT count(*)::int AS waiting FROM pg_stat_activity
            WHERE datname = current_database() AND usename = current_user AND wait_event_type = 'Lock' AND pid <> pg_backend_pid()`;
          if (rows[0]!.waiting > 0) { blocked = true; break; }
          if (finished) break;
          await new Promise(resolve => setTimeout(resolve, 15));
        }
      } finally { release(); await writing; }
      expect(await cleaning).toBeUndefined();
      expect(blocked).toBe(true);
      expect(await database.client.sourceLibrarySource.count()).toBe(0);
      expect(await database.client.sourceLibraryExcerpt.count()).toBe(0);
    } finally { release(); await writer.onModuleDestroy(); }
  });
});
