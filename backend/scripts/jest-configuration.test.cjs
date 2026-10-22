const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
for (const file of ['jest.config.cjs', 'jest.mutation.config.cjs']) {
  test(`${file} applies the intended 15-second test/hook deadline through Jest's actual loader`, () => {
    const child = spawnSync(process.execPath, ['node_modules/jest/bin/jest.js', '--config', path.join(root, file), '--watchman=false', '--showConfig'], { cwd: root, encoding: 'utf8', timeout: 30000 });
    assert.equal(child.status, 0, child.stderr);
    const configuration = JSON.parse(child.stdout);
    assert.equal(configuration.globalConfig.testTimeout, 15000);
  });
}
