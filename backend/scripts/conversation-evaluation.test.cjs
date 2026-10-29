const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { evaluationResult, incorporatedProof } = require('./conversation-evaluation.cjs');
const ids = ['C02-T01', 'C02-T02', 'C03-T01', 'C03-T02', 'C04-T01', 'C04-T02'];
const rows = () => ids.map(id => ({ id, result: 'PASS' }));
test('accepts only all six distinct successful pending native turns with closed and deleted resources', () => {
  assert.equal(evaluationResult(rows(), true, true), 'REVIEW');
  assert.equal(evaluationResult(rows(), false, true), 'FAIL');
  assert.equal(evaluationResult(rows(), true, false), 'FAIL');
  assert.equal(evaluationResult([...rows().slice(0, 5), rows()[0]], true, true), 'FAIL');
  assert.equal(evaluationResult([...rows(), { id: 'unexpected', result: 'PASS' }], true, true), 'FAIL');
});
test('keeps incomplete, blocked and failed dialogue results explicit', () => {
  assert.equal(evaluationResult([], true, true), 'BLOCKED');
  assert.equal(evaluationResult(rows().slice(0, 5), true, true), 'BLOCKED');
  assert.equal(evaluationResult(rows().map((r, i) => i ? r : { ...r, result: 'BLOCKED' }), true, true), 'BLOCKED');
  assert.equal(evaluationResult(rows().map((r, i) => i ? r : { ...r, result: 'FAIL' }), true, true), 'FAIL');
  assert.equal(evaluationResult(rows().map((r, i) => i ? r : { ...r, result: 'UNKNOWN' }), true, true), 'FAIL');
});
test('incorporates previous C01 proof only with exact bytes, successful cases and closed resources', () => {
  const report = { result: 'REVIEW', ownedResourcesClosed: true, conversationDeleted: true, cases: ['C01-T01', 'C01-T02', 'C01-T03'].map(id => ({ id, result: 'PASS' })) };
  const bytes = Buffer.from(JSON.stringify(report));
  const digest = createHash('sha256').update(bytes).digest('hex');
  assert.deepEqual(incorporatedProof(bytes, digest), report);
  assert.throws(() => incorporatedProof(Buffer.concat([bytes, Buffer.from(' ')]), digest));
  assert.throws(() => incorporatedProof(bytes, '0'.repeat(64)));
  for (const patch of [{ result: 'FAIL' }, { ownedResourcesClosed: false }, { conversationDeleted: false }, { cases: report.cases.slice(0, 2) }, { cases: [report.cases[0], report.cases[0], report.cases[2]] }]) {
    const changed = Buffer.from(JSON.stringify({ ...report, ...patch }));
    assert.throws(() => incorporatedProof(changed, createHash('sha256').update(changed).digest('hex')));
  }
});

test('dialogue CLI refuses overrides before reading private proof or touching database/model', () => {
  const { spawnSync } = require('node:child_process');
  const result = spawnSync(process.execPath, ['scripts/evaluate-conversations-local.cjs', '--override'], { encoding: 'utf8', timeout: 5000 });
  assert.equal(result.status, 1); assert.equal(result.stdout, ''); assert.match(result.stderr, /Dialogue evaluation refused/);
});
