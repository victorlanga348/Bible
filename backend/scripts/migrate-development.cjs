const { spawnSync } = require('node:child_process');
const { withDevelopmentDatabase, failed } = require('./development-operation.cjs');

async function migrate() {
  const target = await withDevelopmentDatabase(async (_database, value) => value);
  const environment = { ...process.env, DATABASE_URL: target };
  // Prisma's test-aware config gives this variable precedence; development
  // must explicitly remove it even if an operator inherited a test shell.
  delete environment.TEST_DATABASE_URL;
  const result = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { stdio: 'inherit', env: environment });
  if (result.error || result.status !== 0) throw new Error('Development migration failed');
}
migrate().catch(failed);
