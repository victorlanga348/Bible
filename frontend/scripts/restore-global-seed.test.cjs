const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { restoreGlobalSeed } = require('./restore-global-seed.cjs');

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bible-seed-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('bible-seed-'));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const write = (file, bytes) => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
  };
  const environment = {
    browserVersion: '156.0.0.0', cssSha256: 'a'.repeat(64),
    cssSourceSha256: 'b'.repeat(64), harnessSha256: 'c'.repeat(64),
  };
  const report = Buffer.from(JSON.stringify({ files: { 'src/example.ts': { mutants: [{ id: '0' }] } } }));
  const manifest = Buffer.from(JSON.stringify(environment));
  write('package-lock.json', 'lock\r\n');
  write('reports/global-seed/mutation/global/mutation.json', report);
  write('reports/global-seed/native-style-environment.json', manifest);
  write('reports/native-style-environment.json', manifest);
  const options = { root, identities: { 'package-lock.json': sha('lock\n') }, reportSha256: sha(report), environmentSha256: sha(manifest), mutableFiles: 1, mutants: 1 };
  return { root, write, report, environment, options, target: path.join(root, 'reports/mutation/global/incremental.json') };
}

test('restores only the exact complete report with the same native environment', t => {
  const f = fixture(t);
  assert.equal(restoreGlobalSeed(f.options), true);
  assert.deepEqual(fs.readFileSync(f.target), f.report);
});

for (const [file, message] of [
  ['reports/global-seed/mutation/global/mutation.json', /Global seed identity differs/],
  ['reports/global-seed/native-style-environment.json', /Seed environment identity differs/],
  ['package-lock.json', /Toolchain\/helper identity differs/],
]) test(`rejects corrupted ${file} before copying a report`, t => {
  const f = fixture(t);
  fs.appendFileSync(path.join(f.root, file), ' ');
  assert.throws(() => restoreGlobalSeed(f.options), message);
  assert.equal(fs.existsSync(f.target), false);
});

for (const field of ['browserVersion', 'cssSha256', 'cssSourceSha256', 'harnessSha256']) {
  test(`requires a fresh full analysis when ${field} changes`, t => {
    const f = fixture(t);
    f.write('reports/native-style-environment.json', JSON.stringify({ ...f.environment, [field]: field === 'browserVersion' ? '157.0.0.0' : 'd'.repeat(64) }));
    f.write('reports/mutation/global/incremental.json', 'stale cache');
    f.write('reports/mutation/global/keep.json', 'unrelated evidence');
    assert.equal(restoreGlobalSeed(f.options), false);
    assert.equal(fs.existsSync(f.target), false);
    assert.equal(fs.readFileSync(path.join(f.root, 'reports/mutation/global/keep.json'), 'utf8'), 'unrelated evidence');
  });
}

test('does not treat a malformed current native environment as compatible', t => {
  const f = fixture(t);
  f.write('reports/native-style-environment.json', '{}');
  assert.throws(() => restoreGlobalSeed(f.options), /Invalid native environment/);
  assert.equal(fs.existsSync(f.target), false);
});

test('rejects incomplete report counts even when its bytes have the pinned identity', t => {
  const f = fixture(t);
  assert.throws(() => restoreGlobalSeed({ ...f.options, mutants: 2 }), /Global seed mutant inventory differs/);
  assert.equal(fs.existsSync(f.target), false);
});
