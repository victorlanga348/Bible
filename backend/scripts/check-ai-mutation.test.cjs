const { test } = require('node:test');
const assert = require('node:assert/strict');
const { verifyAiMutationReport } = require('./check-ai-mutation.cjs');

// Technical report shapes only: no invented claim about a real mutation run.
const file = statuses => ({ mutants: statuses.map(status => ({ status })) });
const ai = 'src/modules/ai-assistant/domain/technical.ts';
const other = 'src/modules/study/domain/technical.ts';
const statuses = (killed, survived) => [...Array(killed).fill('Killed'), ...Array(survived).fill('Survived')];
const report = states => ({ files: { [ai]: file(states) } });
test('accepts an own score above85 with no uncovered mutants and preserves the raw calculation', () => {
  const result = verifyAiMutationReport(report(statuses(86, 14)));
  assert.deepEqual(result, { global: { detected: 86, valid: 100, score: 86 }, ai: { detected: 86, valid: 100, score: 86 } });
});
test('rejects own NoCoverage even when the ordinary raw score exceeds85', () => {
  assert.throws(() => verifyAiMutationReport(report([...statuses(90, 9), 'NoCoverage'])), /NoCoverage/);
});
test('rejects NoCoverage elsewhere in the complete S05 scope', () => {
  assert.throws(() => verifyAiMutationReport({ files: { [ai]: file(statuses(90, 10)), [other]: file([...statuses(90, 9), 'NoCoverage']) } }), /NoCoverage/);
});
test('rejects a weak own module hidden by a strong global score', () => {
  assert.throws(() => verifyAiMutationReport({ files: { [ai]: file(statuses(80, 20)), [other]: file(statuses(1000, 0)) } }), /strictly greater than 85/);
});
test('rejects exactly85 in the own denominator even when global is higher', () => {
  assert.throws(() => verifyAiMutationReport({ files: { [ai]: file(statuses(17, 3)), [other]: file(statuses(100, 0)) } }), /strictly greater than 85/);
});
test('counts Timeout as detected and excludes CompileError by the existing policy', () => {
  const result = verifyAiMutationReport(report(['Killed', 'Timeout', 'CompileError']));
  assert.deepEqual(result.ai, { detected: 2, valid: 2, score: 100 });
});
test('rejects runtime errors instead of converting them to detections', () => {
  assert.throws(() => verifyAiMutationReport(report([...statuses(100, 0), 'RuntimeError'])), /Incomplete mutation report/);
});
test('rejects absence of valid own mutants and similarly prefixed unrelated modules', () => {
  assert.throws(() => verifyAiMutationReport({ files: { ['src/modules/ai-assistant-other/technical.ts']: file(statuses(100, 0)) } }), /No valid mutants/);
});
test('rejects malformed or empty report data', () => {
  for (const value of [undefined, {}, { files: {} }, { files: { [ai]: {} } }]) assert.throws(() => verifyAiMutationReport(value));
});
