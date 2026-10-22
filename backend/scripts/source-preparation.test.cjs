const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, readFileSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { createHash } = require('node:crypto');
const originals = resolve('data/source-library/josephus-antiquities-pg2848-en');
function prepare(html, txt, output) {
  return spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['scripts/prepare-sources.py', html, txt, output], { encoding: 'utf8', timeout: 15000 });
}
test('operational preparation derives genuine paragraphs and full notice from raw originals', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bible-operational-source-'));
  try {
    const result = prepare(join(originals, 'source.html'), join(originals, 'source.txt'), directory);
    assert.equal(result.status, 0, result.stderr);
    // Fixture is an independent oracle only in this test; the preparation
    // command must derive its output from the original HTML and sibling TXT.
    assert.deepEqual(JSON.parse(readFileSync(join(directory, 'excerpts.json'), 'utf8')), JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json', 'utf8')));
    assert.equal(createHash('sha256').update(readFileSync(join(directory, 'NOTICE.source.txt'))).digest('hex'), '18bc5c6f86b23ade32c4d711e765328b0c642c383a993c8d7f11c7ee21da4bf1');
    assert.doesNotMatch(readFileSync('scripts/prepare-sources.py', 'utf8'), /test[\\/]fixtures/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
test('operational preparation refuses changed original bytes and writes no excerpts', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bible-operational-tamper-'));
  try {
    const path = join(directory, 'changed.html'); writeFileSync(path, Buffer.concat([readFileSync(join(originals, 'source.html')), Buffer.from('changed')]));
    assert.notEqual(prepare(path, join(originals, 'source.txt'), directory).status, 0);
    assert.throws(() => readFileSync(join(directory, 'excerpts.json')));
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
test('operational preparation refuses a changed sibling notice container', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bible-operational-notice-'));
  try {
    const path = join(directory, 'changed.txt'); writeFileSync(path, Buffer.concat([readFileSync(join(originals, 'source.txt')), Buffer.from('changed')]));
    assert.notEqual(prepare(join(originals, 'source.html'), path, directory).status, 0);
    assert.throws(() => readFileSync(join(directory, 'excerpts.json')));
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
