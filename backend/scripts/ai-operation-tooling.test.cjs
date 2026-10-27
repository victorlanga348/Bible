const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, mkdtempSync, rmSync, writeFileSync, existsSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve, sep } = require('node:path');
const { spawnSync } = require('node:child_process');

function temporary(action) {
  const directory = mkdtempSync(join(tmpdir(), 'bible-ai-canon-'));
  try { action(directory); }
  finally { assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + 'bible-ai-canon-')); rmSync(directory, { recursive: true, force: true }); }
}
function prepare(originals, output) { return spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['scripts/prepare-ai-canon.py', originals, output], { encoding: 'utf8', timeout: 15000 }); }
test('AI canonical fixture exactly reproduces four authenticated XML verses and preserves source attribution', () => temporary(directory => {
  const output = join(directory, 'snapshot.json'); const result = prepare('data/biblical-canon/porbr2018', output); assert.equal(result.status, 0, result.stderr);
  const bytes = readFileSync(output); assert.deepEqual(bytes, readFileSync('test/fixtures/ai-assistant/biblical-canon/porbr2018/snapshot.json'));
  const value = JSON.parse(bytes); assert.deepEqual(value.verses.map(row => [row.bookCode, row.chapter, row.number]), [['GEN', 1, 1], ['GEN', 2, 7], ['GEN', 2, 10], ['GEN', 3, 1]]); assert.equal(value.translation.licenseId, 'CC-BY-4.0'); assert.ok(value.verses[0].text.endsWith(' '));
}));
test('AI canonical fixture refuses a modified original before creating output', () => temporary(directory => {
  writeFileSync(join(directory, 'source.zip'), 'Controlled technical corruption, not canonical data.');
  const output = join(directory, 'output.json'); const result = prepare(directory, output); assert.equal(result.status, 1); assert.equal(existsSync(output), false); assert.match(result.stderr, /refused/);
}));
for (const script of ['import-ai-development.cjs', 'index-ai-development.cjs', 'verify-ai-rag.cjs']) test(`${script} refuses test mode and command-line overrides before touching data or models`, () => {
  for (const args of [[], ['--source', 'test/fixtures']]) {
    const result = spawnSync(process.execPath, [join('scripts', script), ...args], { encoding: 'utf8', timeout: 15000, env: { ...process.env, NODE_ENV: 'test', DATABASE_URL: '', BIBLE_AI_HOME: '', BIBLE_AI_DATABASE_URL: '' } });
    assert.equal(result.status, 1); assert.match(result.stderr, /^Development operation refused or failed;/); assert.doesNotMatch(result.stdout + result.stderr, /postgres(?:ql)?:\/\/|runtime\.key|private-technical-marker/);
  }
});
