const { test } = require('node:test');
const assert = require('node:assert/strict');
const { inventory, partition, mergeReports, analysisExitCode, invalidateNonEvidence, chooseIncremental, currentPartition } = require('./mutation-shards.cjs');

// Technical code/report fixtures only, never claimed as actual mutation evidence.
const ai = 'src/modules/ai-assistant/domain/technical.ts';
const other = 'src/config.ts';
const sources = { [ai]: 'export const f = (x: number) => x > 0;', [other]: 'export const active = true;' };
const config = require('../stryker.config.json');
const clone = value => JSON.parse(JSON.stringify(value));
function example() {
  const mutation = replacement => ({ mutatorName: 'BooleanLiteral', replacement, location: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } } });
  const expected = { count: 2, revision: 'a'.repeat(40), fingerprint: 'b'.repeat(64), sources, mutants: { [ai]: [mutation('false')], [other]: [mutation('true')] } };
  const groups = partition(expected.mutants, 2);
  const shards = groups.map((files, index) => ({
    stamp: { index, count: 2, revision: expected.revision, fingerprint: expected.fingerprint, completed: true },
    report: { config: { ...config, jest: { ...config.jest, enableFindRelatedTests: true }, mutate: files, maxTestRunnerReuse: 25 }, files: Object.fromEntries(files.map(name => [name, { source: sources[name], mutants: expected.mutants[name].map((m, id) => ({ ...clone(m), id: String(id), status: 'Killed', killedBy: ['0'], coveredBy: ['0'] })) }])), testFiles: { 'test/technical.spec.ts': { source: 'technical', tests: [{ id: '0', name: 'technical' }] } } },
  }));
  return { expected, shards };
}
test('generates genuine Stryker10 mutants from technical TypeScript', async () => {
  const result = await inventory(sources);
  assert.equal(Object.keys(result).length, 2);
  assert.ok(result[ai].some(m => m.mutatorName === 'EqualityOperator' && m.replacement === 'x >= 0'));
  assert.ok(result[other].some(m => m.replacement === 'false'));
  assert.ok(Object.values(result).flat().every(m => m.location.start.line >= 1 && m.location.start.column >= 1));
});
test('partitions every mutable file exactly once, balances counts and is deterministic', () => {
  const input = { a: Array(10), b: Array(8), c: Array(2), d: [], e: Array(1) };
  const result = partition(input, 2);
  assert.deepEqual(result, [['a', 'e'], ['b', 'c']]);
  assert.deepEqual(partition(Object.fromEntries(Object.entries(input).reverse()), 2), result);
  assert.throws(() => partition(input, 0));
});
test('aggregates all states and namespaces mutant/test identifiers without collisions', () => {
  const { expected, shards } = example();
  const result = mergeReports(expected, shards, config);
  assert.equal(result.gate.global.score, 100);
  assert.equal(result.gate.ai.score, 100);
  assert.equal(Object.values(result.report.files).flatMap(f => f.mutants).length, 2);
  assert.equal(new Set(Object.values(result.report.files).flatMap(f => f.mutants.map(m => m.id))).size, 2);
  assert.equal(result.report.testFiles['test/technical.spec.ts'].tests.length, 2);
  for (const [i, shard] of shards.entries()) for (const name of Object.keys(shard.report.files)) {
    assert.deepEqual(result.report.files[name].mutants[0].killedBy, [`${i}:0`]);
    assert.deepEqual(result.report.files[name].mutants[0].coveredBy, [`${i}:0`]);
  }
});
test('rejects missing/duplicate/uncompleted partitions and stale revision or fingerprint', () => {
  for (const alter of [s => s.pop(), s => s.push(s[0]), s => { s[0].stamp.completed = false; }, s => { s[0].stamp.index = 1; }, s => { s[0].stamp.revision = 'c'.repeat(40); }, s => { s[0].stamp.fingerprint = 'd'.repeat(64); }]) {
    const { expected, shards } = example(); alter(shards);
    assert.throws(() => mergeReports(expected, shards, config));
  }
});
test('rejects missing/extra/duplicate/altered mutants, source mismatch and reassigned files', () => {
  for (const alter of [
    f => { f.mutants = []; }, f => { f.mutants.push({ ...f.mutants[0] }); },
    f => { f.mutants[0].replacement = 'altered'; }, f => { f.source += '// changed'; },
    f => { f.mutants[0].location.start.column++; },
  ]) {
    const { expected, shards } = example(); alter(Object.values(shards[0].report.files)[0]);
    assert.throws(() => mergeReports(expected, shards, config));
  }
  const { expected, shards } = example();
  shards[0].report.files['src/unexpected.ts'] = { source: 'technical', mutants: [] };
  assert.throws(() => mergeReports(expected, shards, config));
});
test('rejects weakened checker/scope/coverage/options rather than trusting a completion stamp', () => {
  for (const alter of [c => { c.checkers = []; }, c => { c.coverageAnalysis = 'off'; }, c => { c.mutate = []; }, c => { c.thresholds.break = 0; }, c => { c.timeoutMS = 1; }, c => { c.maxTestRunnerReuse = 0; }]) {
    const { expected, shards } = example(); shards[0].report.config = clone(shards[0].report.config); alter(shards[0].report.config);
    assert.throws(() => mergeReports(expected, shards, config));
  }
});
test('applies existing raw score and zeroNoCoverage/RuntimeError gates after merging', () => {
  for (const status of ['Survived', 'NoCoverage', 'RuntimeError', 'Pending', 'Ignored']) {
    const { expected, shards } = example(); Object.values(shards[0].report.files)[0].mutants[0].status = status;
    assert.throws(() => mergeReports(expected, shards, config));
  }
});
test('rejects a changed resolved Jest default, runner or project configuration', () => {
  for (const alter of [c => { c.jest.enableFindRelatedTests = false; }, c => { c.jest.configFile = 'unexpected.cjs'; }, c => { c.jest.projectType = 'react'; }]) {
    const { expected, shards } = example(); shards[0].report.config = clone(shards[0].report.config); alter(shards[0].report.config);
    assert.throws(() => mergeReports(expected, shards, config));
  }
});
const fragment = statuses => ({ config: { thresholds: { break: 85 } }, files: { 'src/technical.ts': { mutants: statuses.map(status => ({ status })) } } });
test('completes partition analysis when exit1 is solely its local score, leaving quality to the aggregate', () => {
  assert.equal(analysisExitCode(fragment(['Killed', 'Survived']), 1), 0);
});
test('preserves successful complete analysis and counts compilation separately', () => {
  assert.equal(analysisExitCode(fragment(['Killed', 'CompileError']), 0), 0);
});
test('refuses technical exits even when a stale or contradictory report has a good score', () => {
  assert.equal(analysisExitCode(fragment(['Killed']), 1), 1);
  assert.equal(analysisExitCode(fragment(['Killed']), 2), 1);
  assert.equal(analysisExitCode(fragment(['Killed']), null), 1);
  assert.equal(analysisExitCode(fragment(['Killed', 'Survived']), 0), 1);
});
test('never absorbs RuntimeError or incomplete/unknown statuses as an analysis success', () => {
  for (const status of ['RuntimeError', 'Pending', 'Ignored', '']) for (const exit of [0, 1]) assert.equal(analysisExitCode(fragment(['Killed', status]), exit), 1);
});
test('refuses malformed reports, empty valid populations and different local thresholds', () => {
  for (const report of [{}, fragment([]), fragment(['CompileError']), { ...fragment(['Killed']), config: { thresholds: { break: 0 } } }]) assert.equal(analysisExitCode(report, 0), 1);
});
test('keeps NoCoverage visible for the unchanged strict aggregate gate rather than altering its state', () => {
  const report = fragment(['Killed', 'NoCoverage']);
  assert.equal(analysisExitCode(report, 1), 0); assert.equal(report.files['src/technical.ts'].mutants[1].status, 'NoCoverage');
  assert.throws(() => require('./check-ai-mutation.cjs').verifyAiMutationReport(report), /strictly greater than 85|NoCoverage/);
});
test('invalidates only failed non-evidence in the cache to require actual reruns, preserving the original object', () => {
  const original = fragment(['Killed', 'RuntimeError', 'Timeout', 'Survived', 'CompileError', 'NoCoverage']); const before = clone(original);
  const result = invalidateNonEvidence(original);
  assert.deepEqual(original, before);
  assert.deepEqual(result.report.files['src/technical.ts'].mutants.map(m => m.status), ['Killed', 'Timeout', 'Survived', 'CompileError']);
  assert.deepEqual(result.invalidated.map(m => m.status), ['RuntimeError', 'NoCoverage']);
  assert.deepEqual(result.report.config, original.config);
});
test('preserves valid cache results and metadata without creating detections', () => {
  const original = { ...fragment(['Killed', 'Survived', 'CompileError', 'Timeout']), testFiles: { technical: { source: 'technical fixture', tests: [] } } };
  const result = invalidateNonEvidence(original);
  assert.deepEqual(result.report, original); assert.deepEqual(result.invalidated, []);
});
test('rejects malformed cache rather than fabricating a complete report', () => {
  for (const value of [undefined, {}, { files: null }, { files: [] }, { files: { technical: null } }, { files: { technical: { mutants: null } } }]) assert.throws(() => invalidateNonEvidence(value));
});

test('selects the intact complete cache when balancing moved files, without rewriting either report or identifiers', () => {
  const { expected, shards } = example(); const seed = mergeReports(expected, shards, config).report;
  const local = { ...seed, files: { [ai]: seed.files[ai] } }; const before = clone({ local, seed });
  const result = chooseIncremental(local, seed, expected, [ai, other]);
  assert.equal(result.report, seed); assert.equal(result.selected, 'seed');
  assert.equal(result.matchingMutants, Object.values(expected.mutants).flat().length);
  assert.deepEqual({ local, seed }, before);
});
test('keeps local input on a tie or when its exact current sources provide better evidence than the old seed', () => {
  const { expected, shards } = example(); const local = mergeReports(expected, shards, config).report; const seed = clone(local);
  assert.equal(chooseIncremental(local, seed, expected, [ai, other]).report, local);
  seed.files[other].source += '\n// different source';
  assert.equal(chooseIncremental(local, seed, expected, [ai, other]).report, local);
  assert.equal(chooseIncremental(undefined, local, expected, [ai, other]).report, local);
});
test('does not count cached errors, unmatched mutations or duplicated identifiers as reusable evidence', () => {
  const { expected, shards } = example(); const seed = mergeReports(expected, shards, config).report;
  const local = clone(seed); for (const entry of Object.values(local.files)) for (const m of entry.mutants) m.status = 'NoCoverage';
  const result = chooseIncremental(local, seed, expected, [ai, other]); assert.equal(result.report, seed);
  const extra = clone(seed); extra.files[ai].mutants.push({ ...clone(extra.files[ai].mutants[0]), replacement: 'not in inventory', id: 'extra' });
  extra.files[ai].mutants.push(clone(extra.files[ai].mutants[0]));
  assert.equal(chooseIncremental(undefined, extra, expected, [ai, other]).matchingMutants, Object.values(expected.mutants).flat().length);
});

test('projects only the declared partition while retaining raw output and unchanged cached history as separate evidence', () => {
  const { expected, shards } = example(); const input = mergeReports(expected, shards, config).report; const raw = clone(input);
  raw.files[ai].mutants[0].status = 'Survived'; const before = clone(raw);
  const result = currentPartition(raw, [ai], input);
  assert.deepEqual(Object.keys(result.report.files), [ai]); assert.equal(result.report.files[ai], raw.files[ai]);
  assert.equal(result.report.files[ai].mutants[0].status, 'Survived'); assert.deepEqual(raw, before);
  assert.deepEqual(result.history, [{ file: other, mutants: input.files[other].mutants.length }]);
});
test('rejects missing current files, unknown extras and changed historical sources or mutant states', () => {
  const { expected, shards } = example(); const input = mergeReports(expected, shards, config).report;
  const missing = clone(input); delete missing.files[ai]; assert.throws(() => currentPartition(missing, [ai], input));
  assert.throws(() => currentPartition(input, [ai], undefined));
  const source = clone(input); source.files[other].source += ' changed'; assert.throws(() => currentPartition(source, [ai], input));
  const state = clone(input); state.files[other].mutants[0].status = 'RuntimeError'; assert.throws(() => currentPartition(state, [ai], input));
  const extra = clone(input); extra.files['src/unexpected.ts'] = extra.files[other]; assert.throws(() => currentPartition(extra, [ai], input));
});
test('audits Stryker-updated out-of-scope source only when it exactly matches the independent current inventory', () => {
  const { expected, shards } = example(); const input = mergeReports(expected, shards, config).report; const raw = clone(input);
  raw.files[other].source += '\n// current source outside this partition';
  const sourcesNow = { ...expected.sources, [other]: raw.files[other].source };
  const result = currentPartition(raw, [ai], input, sourcesNow);
  assert.equal(result.report.files[ai], raw.files[ai]); assert.deepEqual(Object.keys(result.report.files), [ai]);
  assert.equal(result.history[0].kind, 'updated-out-of-scope');
  assert.equal(raw.files[other].source, sourcesNow[other]);
  assert.throws(() => currentPartition(raw, [ai], input, expected.sources));
});
