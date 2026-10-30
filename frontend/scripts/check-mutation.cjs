const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const normalize = value => value.replaceAll('\\', '/');
const text = file => fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
const signature = mutant => JSON.stringify([mutant.mutatorName, mutant.replacement,
  mutant.location.start.line, mutant.location.start.column, mutant.location.end.line, mutant.location.end.column]);
const fail = message => { throw new Error(message); };
const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right);

function verifyFrontendMutationReport(report, expected) {
  if (!report || !report.files || !expected) fail('Incomplete mutation report');
  const files = Object.fromEntries(Object.entries(report.files).map(([name, value]) => [normalize(name).replace(/^\.\//, ''), value]));
  const names = Object.keys(expected).filter(name => expected[name].mutants.length).sort();
  if (Object.keys(files).length !== Object.keys(report.files).length || !equal(Object.keys(files).sort(), names)) fail('Mutation file inventory differs');
  let detected = 0, valid = 0;
  for (const name of names) {
    const file = files[name];
    if (typeof file.source !== 'string' || file.source.replaceAll('\r\n', '\n') !== expected[name].source) fail('Mutation source differs');
    if (!Array.isArray(file.mutants) || !equal(file.mutants.map(signature).sort(), expected[name].mutants.map(signature).sort())) fail('Mutation signatures differ');
    for (const mutant of file.mutants) {
      if (mutant.status === 'Killed' || mutant.status === 'Timeout') { detected++; valid++; }
      else if (mutant.status === 'Survived') valid++;
      else if (mutant.status === 'NoCoverage') fail('NoCoverage is not accepted');
      else if (mutant.status !== 'CompileError') fail('Incomplete mutation report');
    }
  }
  if (!valid) fail('No valid mutants');
  if (100 * detected <= 85 * valid) fail('Mutation score must be strictly greater than 85%');
  return { detected, valid, score: 100 * detected / valid };
}
function frontendMutationScope(mode) {
  const transport = ['src/shared/api/api-url.ts', 'src/shared/api/client.ts', 'src/shared/api/http-client.ts', 'src/server/api-proxy.ts', 'vite.config.ts'];
  if (mode === 'transport') return transport;
  if (mode === 'session') return [...transport, 'src/App.tsx', 'src/shared/api/query-client.ts', 'src/shared/hooks/use-session.tsx', 'src/shared/auth/google-identity.ts', 'src/shared/auth/google-sign-in.tsx', 'src/shared/ui/shell.tsx'];
  if (mode === 'global') return ['src/**/*.ts', 'src/**/*.tsx', '!src/test/**', '!src/**/*.d.ts', 'vite.config.ts'];
  fail('Invalid mutation scope');
}
module.exports = { verifyFrontendMutationReport, frontendMutationScope };

function collect(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) fail('Unexpected source symlink');
    const name = normalize(path.join(directory, entry.name));
    return entry.isDirectory() ? collect(name) : [name];
  });
}
async function main(mode = 'global') {
  const patterns = frontendMutationScope(mode);
  const config = JSON.parse(text(mode === 'global' ? 'stryker.config.json' : `stryker.${mode}.config.json`));
  if (!equal(config.mutate, patterns)
    || config.mutator || config.ignorers || config.thresholds?.break !== 85) fail('Mutation scope configuration differs');
  const names = mode === 'global' ? [...collect('src').filter(name => /\.tsx?$/.test(name) && !name.startsWith('src/test/') && !name.endsWith('.d.ts')), 'vite.config.ts'] : patterns;
  const expected = Object.fromEntries(names.sort().map(name => [name, { source: text(name), mutants: [] }]));
  const { Instrumenter } = await import('@stryker-mutator/instrumenter');
  const logger = { debug() {}, info() {}, warn() {}, error() {}, trace() {}, isDebugEnabled: () => false };
  const result = await new Instrumenter(logger).instrument(Object.entries(expected).map(([name, value]) => ({ name: path.resolve(name), content: value.source, mutate: true })), { ignorers: [], excludedMutations: [], plugins: null });
  for (const mutant of result.mutants) {
    if (mutant.status !== undefined) fail('Ignored mutations are not accepted');
    const position = point => ({ line: point.line + 1, column: point.column + 1 });
    expected[normalize(path.relative(process.cwd(), mutant.fileName))].mutants.push({
      mutatorName: mutant.mutatorName, replacement: mutant.replacement,
      location: { start: position(mutant.location.start), end: position(mutant.location.end) },
    });
  }
  const directory = `reports/mutation/${mode}`;
  const bytes = fs.readFileSync(`${directory}/mutation.json`), report = JSON.parse(bytes);
  const gate = verifyFrontendMutationReport(report, expected);
  const counts = {};
  for (const file of Object.values(report.files)) for (const mutant of file.mutants) counts[mutant.status] = (counts[mutant.status] || 0) + 1;
  const fingerprint = crypto.createHash('sha256');
  for (const [name, value] of Object.entries(expected)) fingerprint.update(name).update('\0').update(value.source).update('\0');
  const audit = { result: 'PASS', scope: mode, revision: cp.execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    at: new Date().toISOString(), sources: names.length, mutableFiles: Object.keys(report.files).length,
    mutants: Object.values(expected).reduce((sum, value) => sum + value.mutants.length, 0),
    sourceFingerprint: fingerprint.digest('hex'), reportSha256: crypto.createHash('sha256').update(bytes).digest('hex'), counts, gate };
  fs.writeFileSync(`${directory}/audit.json`, JSON.stringify(audit, null, 2) + '\n');
  console.log(JSON.stringify(audit));
}
if (require.main === module) main(process.argv[2]).catch(error => { console.error(error.message); process.exitCode = 1; });
