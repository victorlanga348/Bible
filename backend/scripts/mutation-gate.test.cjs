const { test } = require('node:test');
const assert = require('node:assert/strict');
const { verifyMutationReport } = require('./check-mutation.cjs');

function report(statuses) {
  return { files: { 'src/config.ts': { mutants: statuses.map((status) => ({ status })) } } };
}
test('rejects exactly 85%, before rounding', () => {
  assert.throws(() => verifyMutationReport(report([...Array(17).fill('Killed'), ...Array(3).fill('Survived')])), /Mutation score/);
});
test('accepts a raw score strictly greater than 85', () => {
  assert.equal(verifyMutationReport(report([...Array(6).fill('Killed'), 'Survived'])).valid, 7);
});
test('counts timeouts as detected and uncovered mutants as valid', () => {
  const result = verifyMutationReport(report([...Array(9).fill('Timeout'), 'NoCoverage']));
  assert.deepEqual(result, { detected: 9, valid: 10, score: 90 });
});
test('does not fabricate a score when no mutants are valid', () => {
  assert.throws(() => verifyMutationReport(report([])), /No valid mutants/);
  assert.throws(() => verifyMutationReport(report(['CompileError'])), /No valid mutants/);
});
test('does not treat compilation errors as detections', () => {
  assert.deepEqual(verifyMutationReport(report(['Killed', 'CompileError'])), { detected: 1, valid: 1, score: 100 });
});
test('rejects runtime failures and incomplete/unknown results', () => {
  for (const status of ['RuntimeError', 'Pending', 'Ignored', '']) {
    assert.throws(() => verifyMutationReport(report(['Killed', status])), /Incomplete mutation report/);
  }
  assert.throws(() => verifyMutationReport({}), /Incomplete mutation report/);
});
