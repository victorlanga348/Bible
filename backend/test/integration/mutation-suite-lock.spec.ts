import { Client } from 'pg';
import { acquireMutationSuiteLock } from '../helpers/mutation-suite-lock';

describe('real PostgreSQL coordination between mutation runners', () => {
  it('rejects non-test targets before acquiring a session', async () => {
    await expect(acquireMutationSuiteLock({ NODE_ENV: 'production', TEST_DATABASE_URL: process.env.TEST_DATABASE_URL })).rejects.toThrow('Unsafe mutation coordinator target');
    await expect(acquireMutationSuiteLock({ NODE_ENV: 'test', TEST_DATABASE_URL: 'postgresql://localhost/bible_db' })).rejects.toThrow('Unsafe mutation coordinator target');
  });

  it('holds a second session until the first releases, then leaves no lock', async () => {
    const release = await acquireMutationSuiteLock(process.env);
    const monitor = new Client({ connectionString: process.env.TEST_DATABASE_URL });
    let secondRelease: (() => Promise<void>) | undefined;
    const second = acquireMutationSuiteLock(process.env).then(unlock => { secondRelease = unlock; });
    try {
      await monitor.connect();
      let waiting = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        const result = await monitor.query<{ count: number }>("SELECT count(*)::int AS count FROM pg_locks WHERE locktype = 'advisory' AND classid = 13284417 AND objid = 2 AND NOT granted AND database = (SELECT oid FROM pg_database WHERE datname = current_database())");
        if (result.rows[0]?.count === 1) { waiting = true; break; }
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      expect(waiting).toBe(true);
      expect(secondRelease).toBeUndefined();
      await release();
      await second;
      expect(secondRelease).toBeDefined();
      await secondRelease!();
      const remaining = await monitor.query<{ count: number }>("SELECT count(*)::int AS count FROM pg_locks WHERE locktype = 'advisory' AND classid = 13284417 AND objid = 2 AND database = (SELECT oid FROM pg_database WHERE datname = current_database())");
      expect(remaining.rows[0]?.count).toBe(0);
    } finally {
      await release();
      await second;
      await secondRelease?.();
      await monitor.end();
    }
  });
});
