const { existsSync, readFileSync } = require('node:fs');
const { parseEnv } = require('node:util');
const { importTestSnapshot } = require('../dist/modules/source-library/infrastructure/import-test-snapshot.js');

async function run() {
  if (existsSync('.env')) process.loadEnvFile('.env');
  if (existsSync('.env.test')) Object.assign(process.env, parseEnv(readFileSync('.env.test', 'utf8')));
  const paths = process.argv.slice(2);
  if (paths.length !== 4) throw new Error('Four explicit artefact paths required');
  const [source, manifest, excerpts, notice] = paths;
  const result = await importTestSnapshot(process.env, { source, manifest, excerpts, notice });
  console.info(JSON.stringify({ component: 'source-library-test-import', result }));
}
run().catch(() => { console.error('Source test import failed; verify the isolated test target and admitted artefacts.'); process.exitCode = 1; });
