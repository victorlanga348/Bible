const assert = require('node:assert/strict');
const { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync, rmSync } = require('node:fs');
const { resolve, relative, join } = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync, spawnSync } = require('node:child_process');
const { verifyAiMutationReport } = require('./check-ai-mutation.cjs');

const normalize = value => value.replaceAll('\\', '/');
const text = name => readFileSync(name, 'utf8').replaceAll('\r\n', '\n');
const lexical = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const signature = m => JSON.stringify([m.mutatorName, m.replacement, m.location.start.line, m.location.start.column, m.location.end.line, m.location.end.column]);
const write = (name, value) => writeFileSync(name, JSON.stringify(value, null, 2) + '\n');
function collect(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === 'generated') return [];
    const name = join(folder, entry.name);
    assert.ok(!entry.isSymbolicLink(), 'No symlinks in mutation inventory');
    return entry.isDirectory() ? collect(name) : [normalize(name)];
  }).sort(lexical);
}
async function inventory(sources) {
  // Use the same locked Instrumenter and default operators as Stryker core10.
  const { Instrumenter } = await import('@stryker-mutator/instrumenter');
  const logger = { debug() {}, info() {}, warn() {}, error() {}, trace() {}, isDebugEnabled: () => false };
  const result = await new Instrumenter(logger).instrument(Object.entries(sources).sort(([a], [b]) => lexical(a, b)).map(([name, content]) => ({ name: resolve(name), content, mutate: true })), { ignorers: [], excludedMutations: [], plugins: null });
  const mutants = Object.fromEntries(Object.keys(sources).map(name => [name, []]));
  for (const m of result.mutants) {
    assert.equal(m.status, undefined, 'Ignored mutations are not allowed');
    const position = p => ({ line: p.line + 1, column: p.column + 1 });
    mutants[normalize(relative(process.cwd(), m.fileName))].push({ mutatorName: m.mutatorName, replacement: m.replacement, location: { start: position(m.location.start), end: position(m.location.end) } });
  }
  return mutants;
}
function partition(mutants, count) {
  assert.ok(Number.isInteger(count) && count > 0 && count <= 32, 'Invalid shard count');
  const groups = Array.from({ length: count }, () => []);
  const loads = Array(count).fill(0);
  for (const name of Object.keys(mutants).filter(name => mutants[name].length).sort((a, b) => mutants[b].length - mutants[a].length || lexical(a, b))) {
    const index = loads.indexOf(Math.min(...loads));
    groups[index].push(name); loads[index] += mutants[name].length;
  }
  return groups.map(group => group.sort(lexical));
}
function mergeReports(expected, shards, base) {
  const groups = partition(expected.mutants, expected.count);
  assert.equal(shards.length, expected.count, 'Missing or extra shard');
  const seen = new Set();
  const report = { schemaVersion: '1.0', thresholds: base.thresholds, projectRoot: process.cwd(), files: {}, testFiles: {} };
  for (const { stamp, report: part } of shards) {
    const { index } = stamp;
    assert.ok(Number.isInteger(index) && index >= 0 && index < expected.count && !seen.has(index), 'Duplicate or invalid shard');
    seen.add(index);
    assert.equal(stamp.count, expected.count);
    assert.equal(stamp.completed, true, 'Incomplete shard');
    assert.equal(stamp.revision, expected.revision, 'Stale revision');
    assert.equal(stamp.fingerprint, expected.fingerprint, 'Stale sources, tests or configuration');
    assert.deepEqual(part.config.mutate, groups[index], 'Changed shard scope');
    // Stryker's Jest plugin serializes this default into the final report.
    const resolvedBase = { ...base, jest: { enableFindRelatedTests: true, ...base.jest } };
    for (const key of Object.keys(resolvedBase).filter(key => key !== '$schema' && key !== 'mutate')) assert.deepEqual(part.config[key], resolvedBase[key], `Changed option: ${key}`);
    assert.equal(part.config.maxTestRunnerReuse, 25);
    // Default operators only; do not permit configuration to suppress inventory.
    if (part.config.mutator) assert.deepEqual(part.config.mutator.excludedMutations, []);
    if (part.config.ignorers) assert.deepEqual(part.config.ignorers, []);
    const entries = Object.entries(part.files).map(([name, value]) => [name.replace(/^\.\//, ''), value]);
    assert.deepEqual(entries.map(([name]) => name).sort(lexical), groups[index], 'Missing or extra files');
    const prefix = id => `${index}:${id}`;
    for (const [name, file] of entries) {
      assert.equal(file.source.replaceAll('\r\n', '\n'), expected.sources[name], 'Source mismatch');
      assert.deepEqual(file.mutants.map(signature).sort(lexical), expected.mutants[name].map(signature).sort(lexical), 'Missing, extra or altered mutations');
      assert.ok(!report.files[name], 'Overlapping file');
      report.files[name] = { ...file, mutants: file.mutants.map(m => ({ ...m, id: prefix(m.id), ...(m.coveredBy ? { coveredBy: m.coveredBy.map(prefix) } : {}), ...(m.killedBy ? { killedBy: m.killedBy.map(prefix) } : {}) })) };
    }
    for (const [name, file] of Object.entries(part.testFiles ?? {})) {
      if (report.testFiles[name]) assert.equal(report.testFiles[name].source, file.source, 'Test source mismatch');
      else report.testFiles[name] = { ...file, tests: [] };
      report.testFiles[name].tests.push(...file.tests.map(t => ({ ...t, id: prefix(t.id) })));
    }
  }
  return { report, gate: verifyAiMutationReport(report) };
}

async function currentInventory() {
  const base = JSON.parse(text('stryker.config.json'));
  assert.deepEqual(base.mutate, ['src/**/*.ts', '!src/generated/**']);
  assert.equal(base.mutator, undefined); assert.equal(base.ignorers, undefined);
  const sources = Object.fromEntries(collect('src').filter(name => name.endsWith('.ts')).map(name => [name, text(name)]));
  const files = [...new Set([...Object.keys(sources), ...collect('test'), ...collect('scripts'), ...collect('admissions'), ...readdirSync('.').filter(name => /^(package(-lock)?\.json|jest.*\.cjs|tsconfig.*\.json|stryker\.config\.json)$/.test(name))])].sort(lexical);
  const hash = createHash('sha256');
  for (const name of files) { hash.update(name); hash.update('\0'); hash.update(text(name)); hash.update('\0'); }
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  return { base, count: 6, revision, fingerprint: hash.digest('hex'), sources, mutants: await inventory(sources) };
}
async function main(args) {
  const expected = await currentInventory();
  if (args.length === 1 && args[0] === 'inventory') {
    const groups = partition(expected.mutants, expected.count);
    console.log(JSON.stringify({ revision: expected.revision, fingerprint: expected.fingerprint, files: Object.keys(expected.sources).length, mutableFiles: Object.values(expected.mutants).filter(m => m.length).length, mutants: Object.values(expected.mutants).flat().length, shards: groups.map(g => g.reduce((sum, name) => sum + expected.mutants[name].length, 0)) }));
    return;
  }
  if (args.length === 2 && args[0] === 'run' && /^[0-5]$/.test(args[1])) {
    const index = Number(args[1]);
    const folder = 'reports/mutation'; mkdirSync(folder, { recursive: true });
    for (const name of ['shard.json', 'mutation.json']) if (existsSync(`${folder}/${name}`)) rmSync(`${folder}/${name}`);
    const config = { ...expected.base, mutate: partition(expected.mutants, expected.count)[index], maxTestRunnerReuse: 25 };
    write(`${folder}/shard-config.json`, config);
    if (existsSync(`${folder}/seed/mutation.json`)) {
      const seedBytes = readFileSync(`${folder}/seed/mutation.json`);
      const seedSha256 = createHash('sha256').update(seedBytes).digest('hex');
      assert.equal(seedSha256, 'b5e6eb362d22ab1b8c847b65ce865daa9e226210cc99a6729412511def61d22a', 'Unverified complete seed');
      const seed = JSON.parse(seedBytes.toString('utf8')); verifyAiMutationReport(seed);
      const localBytes = existsSync(`${folder}/incremental.json`) ? readFileSync(`${folder}/incremental.json`) : null;
      const choice = chooseIncremental(localBytes ? JSON.parse(localBytes.toString('utf8')) : undefined, seed, expected, config.mutate);
      if (choice.selected === 'seed') {
        if (localBytes) writeFileSync(`${folder}/incremental-before-full-seed.json`, localBytes);
        writeFileSync(`${folder}/incremental.json`, seedBytes);
      }
      write(`${folder}/seed-selection.json`, { selected: choice.selected, matchingMutants: choice.matchingMutants, seedRevision: '61a94299c438992ac50f31f3134e8f5b9fa16daf', seedSha256, localSha256: localBytes ? createHash('sha256').update(localBytes).digest('hex') : null, reason: 'Input only; Stryker revalidates changes and the complete current gate remains mandatory' });
      console.log(JSON.stringify({ incrementalInput: choice.selected, matchingMutants: choice.matchingMutants }));
    }
    if (existsSync(`${folder}/incremental.json`)) {
      const bytes = readFileSync(`${folder}/incremental.json`);
      const revalidation = invalidateNonEvidence(JSON.parse(bytes.toString('utf8')));
      if (revalidation.invalidated.length) {
        writeFileSync(`${folder}/incremental-before-revalidation.json`, bytes);
        write(`${folder}/cache-revalidation.json`, { originalSha256: createHash('sha256').update(bytes).digest('hex'), invalidated: revalidation.invalidated, reason: 'Force actual re-execution; cached errors/uncovered results are not evidence' });
        write(`${folder}/incremental.json`, revalidation.report);
        console.log(JSON.stringify({ cacheEntriesRequiringActualRevalidation: revalidation.invalidated.length }));
      }
    }
    const result = spawnSync(process.execPath, ['node_modules/@stryker-mutator/core/bin/stryker.js', 'run', `${folder}/shard-config.json`, '--incremental', '--incrementalFile', `${folder}/incremental.json`], { stdio: 'inherit' });
    if (result.error || !existsSync(`${folder}/mutation.json`)) { process.exitCode = 1; return; }
    const report = JSON.parse(text(`${folder}/mutation.json`));
    if (analysisExitCode(report, result.status) !== 0) { process.exitCode = 1; return; }
    console.log(JSON.stringify({ partition: index, analysis: 'completed', qualityGate: 'NOT_RUN', reason: 'Quality is evaluated across the complete aggregate, not arbitrary file partitions' }));
    write(`${folder}/shard.json`, { index, count: expected.count, revision: expected.revision, fingerprint: expected.fingerprint, completed: true });
    return;
  }
  if (args.length === 1 && args[0] === 'merge') {
    const shards = Array.from({ length: expected.count }, (_, index) => {
      const root = `reports/shards/mutation-${index}`;
      return { stamp: JSON.parse(text(`${root}/shard.json`)), report: JSON.parse(text(`${root}/mutation.json`)) };
    });
    const result = mergeReports(expected, shards, expected.base);
    mkdirSync('reports/mutation', { recursive: true });
    write('reports/mutation/mutation.json', result.report);
    write('reports/mutation/shards-audit.json', { revision: expected.revision, fingerprint: expected.fingerprint, count: expected.count, gate: result.gate, sourceFiles: Object.keys(expected.sources).length, mutableFiles: Object.keys(result.report.files).length, mutants: Object.values(result.report.files).flatMap(f => f.mutants).length });
    console.log(JSON.stringify(result.gate)); return;
  }
  throw new Error('Use inventory, run <0..5>, or merge');
}
function analysisExitCode(report, exit) {
  if (![0, 1].includes(exit) || report?.config?.thresholds?.break !== 85 || !report.files || typeof report.files !== 'object') return 1;
  let detected = 0; let valid = 0;
  for (const file of Object.values(report.files)) {
    if (!Array.isArray(file.mutants)) return 1;
    for (const mutant of file.mutants) {
      if (mutant.status === 'Killed' || mutant.status === 'Timeout') { detected++; valid++; }
      else if (mutant.status === 'Survived' || mutant.status === 'NoCoverage') valid++;
      else if (mutant.status !== 'CompileError') return 1;
    }
  }
  if (!valid) return 1;
  // Stryker itself accepts exactly85; the final existing gate is strictly>85.
  const expectedExit = 100 * detected < 85 * valid ? 1 : 0;
  return exit === expectedExit ? 0 : 1;
}
function invalidateNonEvidence(report) {
  assert.ok(report && report.files && typeof report.files === 'object' && !Array.isArray(report.files), 'Malformed mutation cache');
  const copy = JSON.parse(JSON.stringify(report)); const invalidated = [];
  for (const [file, entry] of Object.entries(copy.files)) {
    assert.ok(entry && Array.isArray(entry.mutants), 'Malformed mutation cache');
    entry.mutants = entry.mutants.filter(mutant => {
      if (mutant.status === 'RuntimeError' || mutant.status === 'NoCoverage') { invalidated.push({ file, ...mutant }); return false; }
      return true;
    });
  }
  return { report: copy, invalidated };
}
function chooseIncremental(local, seed, expected, group) {
  const reusable = new Set(['Killed', 'Survived', 'Timeout', 'CompileError']);
  const score = report => group.reduce((sum, name) => {
    const file = report?.files?.[name];
    if (!file || file.source.replaceAll('\r\n', '\n') !== expected.sources[name]) return sum;
    const matches = new Set(file.mutants.filter(m => reusable.has(m.status)).map(signature));
    return sum + expected.mutants[name].filter(m => matches.has(signature(m))).length;
  }, 0);
  const current = score(local); const complete = score(seed);
  return complete > current ? { report: seed, selected: 'seed', matchingMutants: complete } : { report: local, selected: 'local', matchingMutants: current };
}
module.exports = { inventory, partition, mergeReports, analysisExitCode, invalidateNonEvidence, chooseIncremental };
if (require.main === module) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
