import type { Database } from '../../../src/infrastructure/database';
import { cleanSourceTestData, openSourceTestDatabase, sourceSnapshot } from '../../helpers/source-library';

describe('deterministic cleanup of the isolated module test tables', () => {
  let database: Database;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => { await cleanSourceTestData(database); });
  afterAll(async () => { if (database) { try { await cleanSourceTestData(database); } finally { await database.onModuleDestroy(); } } });
  it('lets an in-flight child insert finish its foreign-key read while cleanup waits', async () => {
    const snapshot = sourceSnapshot({ id: 'cleanup-child-controlled-fixture' });
    const writer = await openSourceTestDatabase();
    await database.client.sourceLibrarySource.create({ data: { ...snapshot.source, permissions: { ...snapshot.source.permissions } } });
    let release!: () => void;
    let acquired!: () => void;
    const inserted = new Promise<void>(resolve => { acquired = resolve; });
    const unblock = new Promise<void>(resolve => { release = resolve; });
    const writing = writer.client.$transaction(async transaction => {
      await transaction.$executeRaw`LOCK TABLE app.source_library_excerpt IN ROW EXCLUSIVE MODE`;
      acquired();
      await unblock;
      const excerpt = snapshot.excerpts[0]!;
      await transaction.sourceLibraryExcerpt.create({ data: { ...excerpt, order: BigInt(excerpt.order) } });
    });
    // Observe both outcomes immediately, including failures, to avoid leaving a
    // rejected writer/cleanup alive while the next test starts.
    const observedWriter = writing.then(() => ({ ok: true }), () => ({ ok: false }));
    try {
      await Promise.race([inserted, writing]);
      const cleaning = cleanSourceTestData(database).then(() => ({ ok: true }), () => ({ ok: false }));
      let blocked = false;
      try {
        for (let attempt = 0; attempt < 40; attempt++) {
          const rows = await database.client.$queryRaw<{ waiting: number }[]>`
            SELECT count(*)::int AS waiting FROM pg_stat_activity
            WHERE datname = current_database() AND usename = current_user
              AND wait_event_type = 'Lock' AND query LIKE 'LOCK TABLE app.source_library_source,%'
              AND pid <> pg_backend_pid()`;
          if (rows[0]!.waiting > 0) { blocked = true; break; }
          await new Promise(resolve => setTimeout(resolve, 15));
        }
      } finally { release(); }
      const outcomes = await Promise.all([observedWriter, cleaning]);
      expect(blocked).toBe(true);
      expect(outcomes).toEqual([{ ok: true }, { ok: true }]);
      expect(await database.client.sourceLibrarySource.count()).toBe(0);
      expect(await database.client.sourceLibraryExcerpt.count()).toBe(0);
    } finally { release(); await observedWriter; await writer.onModuleDestroy(); }
  });
  it('waits for an in-flight writer before deleting its source and excerpts', async () => {
    const snapshot = sourceSnapshot({ id: 'cleanup-controlled-fixture' });
    const writer = await openSourceTestDatabase();
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
            WHERE datname = current_database() AND usename = current_user AND wait_event_type = 'Lock' AND pid <> pg_backend_pid()
              AND query LIKE 'LOCK TABLE app.source_library_source,%'`;
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
