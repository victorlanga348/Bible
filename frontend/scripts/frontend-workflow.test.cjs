const { test } = require('node:test');
// Executable guard for the complete frontend CI inventory.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

test('frontend CI measures global source coverage and mutation instead of the old session slice', () => {
  const root = path.resolve(__dirname, '../..');
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/frontend.yml'), 'utf8');
  const scripts = JSON.parse(fs.readFileSync(path.join(root, 'frontend/package.json'), 'utf8')).scripts;
  assert.match(workflow, /run: npm run test:coverage -- --maxWorkers=1/);
  assert.match(workflow, /run: npm run test:mutation:ci/);
  assert.doesNotMatch(workflow, /run: npm run test:(?:coverage|mutation):session/);
  assert.match(workflow, /frontend\/reports\/coverage\/global/);
  assert.match(workflow, /frontend\/reports\/mutation\/global/);
  assert.match(scripts['test:mutation:ci'], /^stryker run --concurrency 2 --incremental --incrementalFile reports\/mutation\/global\/incremental\.json && node scripts\/check-mutation\.cjs global$/);
  assert.match(scripts['test:mutation:ci:force'], /^stryker run --concurrency 2 --force --incremental --incrementalFile reports\/mutation\/global\/incremental\.json && node scripts\/check-mutation\.cjs global$/);
  assert.equal((workflow.match(/continue-on-error: true/g) ?? []).length, 1, 'Only the optional seed download may fail without failing the job');
  assert.match(workflow, /id: global-seed\s+continue-on-error: true/);
  assert.match(workflow, /run-id: 42224340418/);
  assert.match(workflow, /if: steps\.global-seed\.outcome == 'success'/);
  assert.match(workflow, /5a25792d3c0ca607d8752342920d85f473ca17c3eddca59a05daf91ac09197c0/);
  assert.match(workflow, /7ae83ffe19f5971f94586f516b8e2ffadc92b83d313ffede1640be124da17c38/);
  assert.match(workflow, /mutableFiles: 34, mutants: 3037/);
  assert.match(workflow, /require\('\.\/scripts\/restore-global-seed\.cjs'\)/);
  assert.match(workflow, /run: node --test \.\.\/scripts\/dev\.test\.cjs/);
  assert.match(workflow, /run: npm run test:mutation:ci\s/);
  assert.doesNotMatch(workflow, /run: npm run test:mutation:ci:force/);
  assert.match(workflow, /BIBLE_STYLE_REPORT: '1'/);
  assert.match(workflow, /frontend\/reports\/native-style-environment\.json/);
});

test('frontend source fixtures preserve the admitted backend fixture bytes across checkouts', () => {
  const directory = path.resolve(__dirname, '../src/test/fixtures/josephus-pg2848');
  for (const [name, expected] of Object.entries({
    'manifest.json': '292fce94d8c1a08dca6b6ff6f5b8fa22d53d40fdd3fde76692e96c9eab03e0a2',
    'excerpts.json': '2171bd34f61e74b22d61e58e6c71caa336716b8ad15e2c60f8210ce2e35d7f63',
    'ai-manifest.json': '46469116db968afc44f32d4e6cc5fecc5890910c038cbaac5363aa80dacb66d4',
  })) assert.equal(createHash('sha256').update(fs.readFileSync(path.join(directory, name))).digest('hex'), expected, name);
});
