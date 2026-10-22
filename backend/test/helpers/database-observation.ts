import type { Database } from '../../src/infrastructure/database';

// Disconnect completion and the server's activity view are not simultaneous.
// A persistent application session still fails; only observed disappearance wins.
export async function expectNoApplicationSessions(database: Database): Promise<void> {
  const read = () => database.client.$queryRaw<{ total: number }[]>`
    SELECT count(*)::int AS total FROM pg_stat_activity
    WHERE datname = current_database() AND pid <> pg_backend_pid()
      AND application_name <> 'biblia-mutation-coordinator'`;
  let sessions = await read();
  const deadline = Date.now() + 2000;
  while (sessions[0]?.total !== 0 && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 10));
    sessions = await read();
  }
  expect(sessions).toEqual([{ total: 0 }]);
}
