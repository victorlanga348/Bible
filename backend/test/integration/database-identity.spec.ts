import { assertTestTarget } from '../../src/config/runtime-config';
import { verifyDatabaseIdentity } from '../../src/infrastructure/verify-database-identity';
import { openSourceTestDatabase } from '../helpers/source-library';
import type { Database } from '../../src/infrastructure/database';

describe('operational preflight compares requested and actual database identities', () => {
  let database: Database;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  afterAll(async () => { await database?.onModuleDestroy(); });
  it('accepts the actual isolated role/database identity without writing', async () => {
    await expect(verifyDatabaseIdentity(database, assertTestTarget(process.env))).resolves.toBeUndefined();
    expect(await database.client.$queryRaw`SELECT current_setting('statement_timeout') AS timeout`).toEqual([{ timeout: '2s' }]);
  });
  it.each(['database', 'role'])('rejects a different requested %s even though the connection is usable', async field => {
    const target = new URL(assertTestTarget(process.env));
    if (field === 'database') target.pathname = '/different-technical-database'; else target.username = 'different-technical-role';
    await expect(verifyDatabaseIdentity(database, target.href)).rejects.toThrow('Unexpected database identity');
  });
});
