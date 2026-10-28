const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
test('native conversation command refuses overrides before database/model access', () => {
  const result = spawnSync(process.execPath, ['scripts/verify-conversations-local.cjs', '--override'], { encoding: 'utf8', timeout: 5000 });
  assert.equal(result.status, 1); assert.equal(result.stdout, ''); assert.match(result.stderr, /Conversation verification refused/);
});
