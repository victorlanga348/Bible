const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function readEnvironment(bytes) {
  const value = JSON.parse(bytes);
  assert.equal(typeof value.browserVersion, 'string', 'Invalid native environment');
  assert.ok(value.browserVersion.length > 0, 'Invalid native environment');
  for (const key of ['cssSha256', 'cssSourceSha256', 'harnessSha256']) {
    assert.match(value[key] ?? '', /^[a-f0-9]{64}$/, 'Invalid native environment');
  }
  return value;
}

// Pinned bytes establish provenance; a changed legitimate environment needs full analysis.
function restoreGlobalSeed({ root = process.cwd(), identities, reportSha256, environmentSha256, mutableFiles, mutants }) {
  const read = (file, encoding) => fs.readFileSync(path.join(root, file), encoding);
  for (const [file, expected] of Object.entries(identities)) {
    assert.equal(sha(read(file, 'utf8').replaceAll('\r\n', '\n')), expected, 'Toolchain/helper identity differs');
  }
  const bytes = read('reports/global-seed/mutation/global/mutation.json');
  assert.equal(sha(bytes), reportSha256, 'Global seed identity differs');
  const environmentBytes = read('reports/global-seed/native-style-environment.json');
  assert.equal(sha(environmentBytes), environmentSha256, 'Seed environment identity differs');
  const previous = readEnvironment(environmentBytes);
  const current = readEnvironment(read('reports/native-style-environment.json'));
  const report = JSON.parse(bytes);
  assert.equal(Object.keys(report.files).length, mutableFiles, 'Global seed file inventory differs');
  assert.equal(Object.values(report.files).reduce((sum, row) => sum + row.mutants.length, 0), mutants, 'Global seed mutant inventory differs');
  const target = path.join(root, 'reports/mutation/global/incremental.json');
  if (Object.keys(previous).some(key => previous[key] !== current[key]) || Object.keys(current).length !== Object.keys(previous).length) {
    fs.rmSync(target, { force: true });
    return false;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  return true;
}

module.exports = { restoreGlobalSeed };
