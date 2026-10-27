const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { resolve } = require('node:path');

test('the packaged local model profile is an exact distribution copy of the admitted normative profile', () => {
  const normative = readFileSync(resolve(__dirname, '../../docs/ai/profiles/local-extractive-v1.json'));
  const packaged = readFileSync(resolve(__dirname, '../admissions/local-extractive-v1.json'));
  assert.deepEqual(packaged, normative);
  assert.equal(createHash('sha256').update(packaged).digest('hex'), 'cf12565112a0c5b84a7065200ee01362052f1ae3dee6296c16a8dccabbc5dc0f');
});
