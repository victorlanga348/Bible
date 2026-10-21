import { assertTestTarget } from '../../../src/config/runtime-config';
import { Database } from '../../../src/infrastructure/database';

describe('source-library migration on the confirmed isolated PostgreSQL target', () => {
  let database: Database;
  beforeAll(async () => {
    database = new Database(assertTestTarget(process.env));
    expect(await database.client.$queryRaw`SELECT current_database() AS db, current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
  });
  afterAll(async () => { await database?.onModuleDestroy(); });
  it('creates only the two module tables in app, without an automatic text index', async () => {
    const rows = await database.client.$queryRaw<{ table_schema: string; table_name: string }[]>`
      SELECT table_schema, table_name FROM information_schema.tables
      WHERE table_name IN ('source_library_source', 'source_library_excerpt') ORDER BY table_name`;
    expect(rows).toEqual([
      { table_schema: 'app', table_name: 'source_library_excerpt' },
      { table_schema: 'app', table_name: 'source_library_source' },
    ]);
    const indices = await database.client.$queryRaw<{ indexdef: string }[]>`
      SELECT indexdef FROM pg_indexes WHERE schemaname = 'app' AND tablename IN ('source_library_source', 'source_library_excerpt')`;
    expect(indices.length).toBeGreaterThan(0);
    expect(indices.some(row => /\bgin\b|tsvector/i.test(row.indexdef))).toBe(false);
  });
});
