const { test } = require('node:test');
const assert = require('node:assert/strict');
const { nativeCases, proofResult } = require('./conversation-proof.cjs');
const rows = () => nativeCases.map(entry => ({ id: entry.id, result: 'PASS' }));
// Technical result states only; no model/database calls or historical answers.
test('requires the exact three distinct successful cases and closed/deleted owned resources before REVIEW', () => {
  assert.equal(proofResult(rows(), true, true), 'REVIEW');
  assert.equal(proofResult(rows(), false, true), 'FAIL'); assert.equal(proofResult(rows(), true, false), 'FAIL');
  assert.equal(proofResult([rows()[0], rows()[0], rows()[2]], true, true), 'FAIL');
});
test('never replaces a failed or incomplete native execution with success', () => {
  const failed = rows(); failed[1].result = 'FAIL'; assert.equal(proofResult(failed, true, true), 'FAIL');
  assert.equal(proofResult([], true, true), 'BLOCKED'); assert.equal(proofResult(rows().slice(0, 2), true, true), 'BLOCKED');
  const blocked = rows(); blocked[1].result = 'BLOCKED'; assert.equal(proofResult(blocked, true, true), 'BLOCKED');
});
