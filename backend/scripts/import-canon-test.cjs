const { existsSync, readFileSync } = require('node:fs');
const { parseEnv } = require('node:util');
const { importTestCanonSnapshot } = require('../dist/modules/biblical-canon/infrastructure/import-test-canon.js');
async function run() {
  if (existsSync('.env')) process.loadEnvFile('.env');
  if (existsSync('.env.test')) Object.assign(process.env, parseEnv(readFileSync('.env.test', 'utf8')));
  const paths = process.argv.slice(2);
  if (paths.length !== 3) throw new Error('Three explicit artefact paths required');
  const [archive, snapshot, manifest] = paths;
  console.info(JSON.stringify({ component: 'canon-test-import', result: await importTestCanonSnapshot(process.env, { archive, snapshot, manifest }) }));
}
run().catch(() => { console.error('Canon test import failed; verify the isolated test target and admitted artefacts.'); process.exitCode = 1; });
