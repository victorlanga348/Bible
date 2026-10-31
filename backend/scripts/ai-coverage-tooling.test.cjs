const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { cases } = require('./ai-coverage-cases.cjs');
const sha = file => createHash('sha256').update(readFileSync(file)).digest('hex');
const fixture = 'test/fixtures/ai-assistant/coverage-v1/';

test('coverage canonical fixture consists only of the twelve exact original verses and unchanged metadata', () => {
  const originalFile = 'data/biblical-canon/porbr2018/snapshot.json';
  assert.equal(sha(originalFile), '14c2103dc8fedc80007b4c37a05f09c43926f05e8a0dc8ccd62b3443dccd0a27');
  assert.equal(sha(fixture + 'canon.json'), '40e759585755a5c3270d1181a796bc2899a2f57533e7a15c516ee67de6d263dc');
  const original = JSON.parse(readFileSync(originalFile)), actual = JSON.parse(readFileSync(fixture + 'canon.json'));
  assert.deepEqual(actual.translation, original.translation); assert.equal(actual.verses.length, 12);
  for (const verse of actual.verses) assert.deepEqual(verse, original.verses.find(v => v.bookCode === verse.bookCode && v.chapter === verse.chapter && v.number === verse.number));
  assert.deepEqual(actual.books, original.books.filter(b => b.code === 'GEN'));
  assert.deepEqual(actual.chapters, original.chapters.filter(c => c.bookCode === 'GEN' && [1, 2, 3].includes(c.number)));
});
test('coverage distributions retain separate purposes and the pinned unchanged source/runtime identities', () => {
  const paths = [['admissions/ai-coverage-v1.json', 'local-ai', 'f67ede1ba6c6146c39202699bcc0d812ada9e5b1a05f8ba7251d4a54c2d2274a'], [fixture + 'manifest.json', 'test-ai', 'a286a7f83aca32955b3d461c8a9532097abd843a34a33c1ed33b54041350137e']];
  for (const [file, purpose, pin] of paths) {
    assert.equal(sha(file), pin); const manifest = JSON.parse(readFileSync(file)); assert.equal(manifest.purpose, purpose);
    assert.equal(manifest.runtimeProfileSha256, sha('admissions/local-extractive-v1.json'));
    const sourceFile = purpose === 'local-ai' ? 'admissions/josephus-antiquities-pg2848-en-local-ai-v1/manifest.json' : 'test/fixtures/ai-assistant/source-library/josephus-antiquities-pg2848-en-local-ai-v1/manifest.json';
    assert.equal(manifest.sourceManifestSha256, sha(sourceFile)); assert.equal(manifest.curatedPassageLinks.length, 4);
  }
});
test('five frozen native cases carry exact authentic sentence IDs and offsets, outside API request bodies', () => {
  const excerpts = JSON.parse(readFileSync('admissions/josephus-antiquities-pg2848-en-local-ai-v1/excerpts.json'));
  assert.equal(cases.length, 5); assert.equal(new Set(cases.map(c => c.id)).size, 5);
  for (const entry of cases) {
    assert.ok(Object.isFrozen(entry)); if (entry.sentenceId === null) continue;
    const text = excerpts.find(row => row.order === entry.paragraph).text;
    const sentences = [...text.matchAll(/\S[\s\S]*?(?:[.!?](?=\s|$)|$)/gu)];
    const sentence = sentences[Number(entry.sentenceId.split('-s')[1]) - 1];
    assert.equal(Array.from(text.slice(0, sentence.index)).length, entry.start);
    assert.equal(Array.from(text.slice(0, sentence.index) + sentence[0].trimEnd()).length, entry.end);
  }
});
test('native coverage command refuses non-test configuration and overrides before data or model access', () => {
  for (const args of [[], ['--source', 'test/fixtures']]) {
    const result = spawnSync(process.execPath, ['scripts/evaluate-ai-coverage-test.cjs', ...args], { encoding: 'utf8', timeout: 15000,
      env: { ...process.env, NODE_ENV: 'development', TEST_DATABASE_URL: '', DATABASE_URL: '', BIBLE_AI_HOME: '' } });
    assert.equal(result.status, 1); assert.match(result.stderr, /^Native coverage evaluation refused or failed;/);
    assert.doesNotMatch(result.stdout + result.stderr, /postgres(?:ql)?:\/\/|runtime\.key/);
  }
});
