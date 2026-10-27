const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { createHash } = require('node:crypto');
const originals = resolve('data/source-library/josephus-antiquities-pg2848-en');
const profileId = 'josephus-antiquities-pg2848-en-local-ai-v1';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
function prepare(purpose, html, txt, output) {
  return spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['scripts/prepare-ai-sources.py', purpose, html, txt, output], { encoding: 'utf8', timeout: 15000 });
}
function temporary(action) {
  const directory = mkdtempSync(join(tmpdir(), 'bible-ai-admission-'));
  try { action(directory); } finally { rmSync(directory, { recursive: true, force: true }); }
}
for (const purpose of ['local-ai', 'test-ai']) test(`AI preparation derives ${purpose} only from genuine original bytes and preserves the full notice`, () => temporary(directory => {
  const result = prepare(purpose, join(originals, 'source.html'), join(originals, 'source.txt'), directory);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(readFileSync(join(directory, 'manifest.json'), 'utf8'));
  const excerptBytes = readFileSync(join(directory, 'excerpts.json')); const excerpts = JSON.parse(excerptBytes);
  const raw = JSON.parse(readFileSync(join(originals, 'operational/excerpts.json'), 'utf8'));
  assert.equal(manifest.purpose, purpose); assert.equal(manifest.source.id, profileId); assert.equal(manifest.source.permissions.sendToAi, 'allowed');
  assert.equal(manifest.excerptsSha256, digest(excerptBytes)); assert.equal(manifest.source.snapshotSha256, digest(readFileSync(join(originals, 'source.html'))));
  assert.equal(manifest.rawExcerptsSha256, digest(readFileSync(join(originals, 'operational/excerpts.json'))));
  assert.equal(manifest.runtimeProfileSha256, 'cf12565112a0c5b84a7065200ee01362052f1ae3dee6296c16a8dccabbc5dc0f');
  assert.deepEqual(excerpts, raw.map(row => ({ ...row, id: `${profileId}-b1-c1-p${row.order}`, sourceId: profileId })));
  assert.equal(digest(readFileSync(join(directory, 'NOTICE.source.txt'))), '18bc5c6f86b23ade32c4d711e765328b0c642c383a993c8d7f11c7ee21da4bf1');
  assert.match(manifest.scope, purpose === 'test-ai' ? /not a development seed/ : /local personal/);
  assert.match(manifest.source.rightsStatement, /same work/);
  assert.deepEqual(manifest.curatedPassageLinks.map(row => [row.translationId, row.bookCode, row.chapter, row.fromVerse, row.toVerse, row.excerptId, row.nature]), [
    ['porbr2018', 'GEN', 1, 1, 1, `${profileId}-b1-c1-p1`, 'narrative-parallel'], ['porbr2018', 'GEN', 2, 7, 7, `${profileId}-b1-c1-p2`, 'narrative-parallel'],
    ['porbr2018', 'GEN', 2, 10, 10, `${profileId}-b1-c1-p3`, 'narrative-parallel'], ['porbr2018', 'GEN', 3, 1, 1, `${profileId}-b1-c1-p4`, 'narrative-parallel'],
  ]);
  const before = [readFileSync(join(directory, 'manifest.json')), excerptBytes];
  assert.equal(prepare(purpose, join(originals, 'source.html'), join(originals, 'source.txt'), directory).status, 0);
  assert.deepEqual([readFileSync(join(directory, 'manifest.json')), readFileSync(join(directory, 'excerpts.json'))], before);
  assert.doesNotMatch(readFileSync('scripts/prepare-ai-sources.py', 'utf8'), /test[\\/]fixtures/);
}));
for (const key of ['source.html', 'source.txt']) test(`AI preparation rejects altered ${key} before writing any admission`, () => temporary(directory => {
  const changed = join(directory, 'changed'); writeFileSync(changed, Buffer.concat([readFileSync(join(originals, key)), Buffer.from('changed')]));
  const result = prepare('local-ai', key === 'source.html' ? changed : join(originals, 'source.html'), key === 'source.txt' ? changed : join(originals, 'source.txt'), directory);
  assert.notEqual(result.status, 0); assert.equal(existsSync(join(directory, 'manifest.json')), false); assert.equal(existsSync(join(directory, 'excerpts.json')), false);
}));
test('AI preparation rejects unknown purpose and missing arguments without promoting another admission', () => temporary(directory => {
  assert.notEqual(prepare('local-development', join(originals, 'source.html'), join(originals, 'source.txt'), directory).status, 0);
  assert.equal(existsSync(join(directory, 'manifest.json')), false);
  assert.notEqual(spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['scripts/prepare-ai-sources.py'], { encoding: 'utf8', timeout: 15000 }).status, 0);
}));
