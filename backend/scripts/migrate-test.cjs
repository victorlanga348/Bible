const { existsSync, readFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { Client } = require('pg');
const { assertTestTarget } = require('../dist/config/runtime-config.js');

async function migrate() {
  if (existsSync('.env')) process.loadEnvFile('.env');
  if (existsSync('.env.test')) Object.assign(process.env, require('node:util').parseEnv(readFileSync('.env.test', 'utf8')));
  const target = assertTestTarget(process.env);
  const connection = new Client({ connectionString: target, connectionTimeoutMillis: 2000, query_timeout: 2000 });
  try {
    await connection.connect();
    const { rows } = await connection.query('SELECT current_database() AS db, current_user AS role');
    if (rows[0]?.db !== 'biblia_test' || rows[0]?.role !== 'biblia_test') throw new Error('Unsafe identity');
  } finally { await connection.end(); }
  const result = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], {
    stdio: 'inherit', env: { ...process.env, TEST_DATABASE_URL: target },
  });
  if (result.error || result.status !== 0) throw new Error('Migration failed');
  const ai = spawnSync(process.execPath, ['scripts/migrate-ai.cjs', 'test'], { stdio: 'inherit', env: { ...process.env, TEST_DATABASE_URL: target } });
  if (ai.error || ai.status !== 0) throw new Error('AI migration failed');
}
migrate().catch(() => { console.error('Test migration failed; verify the isolated local test configuration.'); process.exitCode = 1; });
