import { Client } from 'pg';
import { assertAiTestTarget } from '../../../src/config/ai-target';
import { assertTestTarget } from '../../../src/config/runtime-config';
import { AiIndexDatabase } from '../../../src/modules/ai-assistant/infrastructure/index-database';

describe('independent generated AI client with actual PostgreSQL lifecycle', () => {
  it('connects only to own test schema and closes the actual owned backend session', async () => {
    const database = new AiIndexDatabase(assertAiTestTarget(process.env));
    const observer = new Client({ connectionString: assertTestTarget(process.env), connectionTimeoutMillis: 3000, query_timeout: 3000 });
    try {
      expect(database.client).toBeDefined();
      await observer.connect();
      const rows = await database.client.$queryRaw<{ db: string; role: string; pid: number; statementTimeout: string }[]>`SELECT current_database() AS db,current_user AS role,pg_backend_pid() AS pid,current_setting('statement_timeout') AS "statementTimeout"`;
      expect(rows[0]).toMatchObject({ db: 'biblia_test', role: 'biblia_test', statementTimeout: '2s' });
      const profile = await database.client.embeddingProfile.count(); expect(profile).toBe(0);
      await database.onModuleDestroy();
      expect((await observer.query('SELECT pid FROM pg_stat_activity WHERE pid=$1', [rows[0]!.pid])).rows).toEqual([]);
    } finally { if (database.client) await database.client.$disconnect(); await observer.end(); }
  });
});
