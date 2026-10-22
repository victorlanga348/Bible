import { Client } from 'pg';

// Test coordination is deliberately independent of mutated application guards.
// The dedicated session owns no application transaction or table data.
export async function acquireMutationSuiteLock(environment: NodeJS.ProcessEnv): Promise<() => Promise<void>> {
  let target: URL;
  try { target = new URL(environment.TEST_DATABASE_URL ?? ''); }
  catch { throw new Error('Unsafe mutation coordinator target'); }
  if (environment.NODE_ENV !== 'test' || !['postgresql:', 'postgres:'].includes(target.protocol)
    || !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)
    || target.pathname !== '/biblia_test' || target.username !== 'biblia_test') {
    throw new Error('Unsafe mutation coordinator target');
  }
  const client = new Client({ connectionString: target.toString(), application_name: 'biblia-mutation-coordinator', connectionTimeoutMillis: 10000, query_timeout: 90000, statement_timeout: 90000 });
  try {
    await client.connect();
    const identity = await client.query<{ db: string; role: string }>('SELECT current_database() AS db, current_user AS role');
    if (identity.rows[0]?.db !== 'biblia_test' || identity.rows[0]?.role !== 'biblia_test') throw new Error('Unsafe mutation coordinator identity');
    await client.query('SELECT pg_advisory_lock(13284417, 2)');
  } catch (error) { await client.end(); throw error; }
  let released = false;
  return async () => {
    if (released) return;
    released = true;
    try {
      const result = await client.query<{ unlocked: boolean }>('SELECT pg_advisory_unlock(13284417, 2) AS unlocked');
      if (result.rows[0]?.unlocked !== true) throw new Error('Mutation coordinator lost ownership');
    } finally { await client.end(); }
  };
}
