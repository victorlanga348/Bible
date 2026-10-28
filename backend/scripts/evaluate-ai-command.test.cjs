const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
test('evaluation refuses HTTP/model/path overrides before opening a database or model', () => {
  const result = spawnSync(process.execPath, ['scripts/evaluate-ai-local.cjs', '--technical-forbidden-override'], { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'test' } });
  assert.equal(result.status, 1); assert.match(result.stderr, /Development operation refused or failed/);
});
