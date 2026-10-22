const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { LocalAccessTokens } = require('../dist/infrastructure/access-token.js');
const secret = 'local-cli-test-only-signing-material-2026';
function run(script, args, environment = {}) {
  // Child does not load .env automatically; this test passes only explicit
  // technical signing material and never prints the captured token.
  return spawnSync(process.execPath, [`scripts/${script}.cjs`, ...args], { encoding: 'utf8', timeout: 15000,
    env: { ...process.env, NODE_ENV: 'development', jwtSecret: secret, ...environment } });
}
test('local token CLI emits one verifiable hour-long token for the explicit subject', async () => {
  const result = run('issue-local-token', ['local-owner']); assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\r?\n$/);
  assert.equal(await new LocalAccessTokens(secret).verify(result.stdout.trim()), 'local-owner');
  assert.equal(result.stderr, '');
});
test('local token CLI sanitises missing key and invalid subject/arguments', () => {
  for (const [args, environment] of [[[], {}], [['bad owner'], {}], [['owner', 'extra'], {}], [['owner'], { jwtSecret: '' }], [['owner'], { jwtSecret: 'short' }]]) {
    const result = run('issue-local-token', args, environment); assert.equal(result.status, 1);
    assert.equal(result.stdout, ''); assert.match(result.stderr, /^Local token issuance failed\.\r?\n$/);
    assert.ok(!result.stderr.includes(secret));
  }
});
test('development migration and source commands refuse test environment before database work', () => {
  for (const script of ['migrate-development', 'import-sources-development']) {
    const result = run(script, [], { NODE_ENV: 'test' }); assert.equal(result.status, 1); assert.equal(result.stdout, '');
    assert.match(result.stderr, /^Development operation refused or failed; verify local configuration and admitted artefacts\.\r?\n$/);
  }
});
