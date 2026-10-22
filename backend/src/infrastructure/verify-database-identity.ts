import type { Database } from './database';

export async function verifyDatabaseIdentity(database: Database, target: string): Promise<void> {
  const expected = new URL(target);
  const rows = await database.client.$queryRaw<{ db: string; role: string }[]>`SELECT current_database() AS db, current_user AS role`;
  if (rows[0]?.db !== decodeURIComponent(expected.pathname.slice(1)) || rows[0]?.role !== decodeURIComponent(expected.username)) throw new Error('Unexpected database identity');
}
