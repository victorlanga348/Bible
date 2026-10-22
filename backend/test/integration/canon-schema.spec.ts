import { assertTestTarget } from '../../src/config/runtime-config';
import { Database } from '../../src/infrastructure/database';

describe('canon migration on the guarded real test database', () => {
  let database: Database;
  beforeAll(async () => {
    database = new Database(assertTestTarget(process.env));
    expect(await database.client.$queryRaw`SELECT current_database() AS db, current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
  });
  afterAll(async () => { await database?.onModuleDestroy(); });
  it('places all four module tables in app, never public', async () => {
    expect(await database.client.$queryRaw`SELECT table_schema, table_name FROM information_schema.tables WHERE table_name IN ('canon_translation','canon_book','canon_chapter','canon_verse') ORDER BY table_name`).toEqual([
      { table_schema: 'app', table_name: 'canon_book' }, { table_schema: 'app', table_name: 'canon_chapter' },
      { table_schema: 'app', table_name: 'canon_translation' }, { table_schema: 'app', table_name: 'canon_verse' },
    ]);
  });
});
