import type { Database } from '../../src/infrastructure/database';
const pairs = [
  ['workspace_note','workspace_http_offline'], ['workspace_note','workspace_test_offline'],
  ['source_library_source','workspace_test_source_offline'], ['study_record','workspace_test_study_offline'],
  ['study_version','workspace_test_version_offline'], ['study_record','ai_guard_test_study_offline'],
  ['ai_conversation','history_test_offline'],
] as const;
/** Restores only named fault fixtures after the previous worker released the suite lock. */
export async function recoverWorkspaceTestSchema(database: Database): Promise<void> {
  const identity = await database.client.$queryRaw<{ db: string; role: string }[]>`SELECT current_database() AS db,current_user AS role`;
  if (identity[0]?.db !== 'biblia_test' || identity[0].role !== 'biblia_test') throw new Error('Unsafe workspace fixture target');
  const sql = pairs.map(([base, alias]) => `SELECT '${base}' AS base_name,'${alias}' AS alias_name,to_regclass('app.${base}') IS NOT NULL AS base_exists,to_regclass('app.${alias}') IS NOT NULL AS alias_exists`).join(' UNION ALL ');
  const rows = await database.client.$queryRawUnsafe<{ base_name: string; alias_name: string; base_exists: boolean; alias_exists: boolean }[]>(sql);
  for (const base of new Set(pairs.map(([base]) => base))) {
    const group = rows.filter(row => row.base_name === base); const aliases = group.filter(row => row.alias_exists); const exists = group.some(row => row.base_exists);
    if (aliases.length > 1 || exists && aliases.length) throw new Error('Ambiguous workspace fault fixture');
    if (!exists && !aliases.length) throw new Error('Missing workspace fault base table');
  }
  for (const [base, alias] of pairs) {
    if (rows.some(row => row.base_name === base && row.alias_name === alias && row.alias_exists)) await database.client.$executeRawUnsafe(`ALTER TABLE app.${alias} RENAME TO ${base}`);
  }
  await database.client.$executeRaw`DROP TRIGGER IF EXISTS workspace_test_fail_cleanup ON app.workspace_favorite`;
  await database.client.$executeRaw`DROP FUNCTION IF EXISTS app.workspace_test_fail_cleanup()`;
}
