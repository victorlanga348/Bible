const { existsSync, readFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { Client } = require('pg');
const { assertAiTestTarget, assertAiDevelopmentTarget } = require('../dist/config/ai-target');

async function migrateAi(environment) {
  if (!['test', 'development'].includes(environment.NODE_ENV)) throw new Error('Explicit AI migration mode required');
  const test = environment.NODE_ENV === 'test';
  const target = test ? assertAiTestTarget(environment) : assertAiDevelopmentTarget(environment);
  const connection = new Client({ connectionString: target, connectionTimeoutMillis: 3000, query_timeout: 3000 });
  try {
    await connection.connect();
    const { rows } = await connection.query("SELECT current_database() AS db,current_user AS role,current_setting('server_version_num') AS version,(SELECT default_version FROM pg_available_extensions WHERE name='vector') AS available,(SELECT extversion FROM pg_extension WHERE extname='vector') AS installed");
    const identity = rows[0];
    if (identity?.db !== (test ? 'biblia_test' : 'bible_ai') || identity.role !== (test ? 'biblia_test' : 'bible_ai_owner') || identity.version !== '170011' || identity.available !== '0.8.7' || (identity.installed !== null && identity.installed !== '0.8.7')) throw new Error('Unsafe AI database identity or extension');
  } finally { await connection.end(); }
  const result = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy', '--config', 'prisma-ai.config.ts'], { stdio: 'inherit', env: { ...environment, BIBLE_AI_DATABASE_URL: target } });
  if (result.error || result.status !== 0) throw new Error('AI migration failed');
}
module.exports = { migrateAi };

if (require.main === module) {
  const mode = process.argv[2];
  if (!['test', 'development'].includes(mode)) { console.error('Explicit AI migration mode required.'); process.exitCode = 1; }
  else {
    if (existsSync('.env')) process.loadEnvFile('.env');
    if (mode === 'test' && existsSync('.env.test')) Object.assign(process.env, require('node:util').parseEnv(readFileSync('.env.test', 'utf8')));
    migrateAi({ ...process.env, NODE_ENV: mode }).catch(() => { console.error('AI database migration failed; verify the isolated target and pinned extension.'); process.exitCode = 1; });
  }
}
