const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { cases, studies, spans } = require('./ai-evaluation-cases.cjs');
function analysisBody(entry, study) { return { studyVersion: study.version, question: entry.question }; }
const hash = text => createHash('sha256').update(text).digest('hex');
function validateEvaluation(entry, view, { original, study, profile }) {
  const definition = studies[entry.study]; const { source, excerpt } = original;
  const points = Array.from(excerpt.text); const digest = hash(excerpt.text);
  assert.equal(digest, excerpt.textSha256.toLowerCase()); assert.equal(source.id, excerpt.sourceId);
  assert.equal(excerpt.order, definition.paragraph);
  for (const right of ['store', 'index', 'display', 'quote', 'sendToAi']) assert.equal(source.permissions[right], 'allowed');
  assert.equal(view.studyId, study.id); assert.equal(view.studyVersion, study.version); assert.equal(view.question, entry.question);
  assert.ok(typeof view.id === 'string' && view.id.length === 36); assert.equal('ownerId' in view, false); assert.equal('evidenceRefs' in view, false);
  assert.deepEqual(view.reference, { translationId: 'porbr2018', bookCode: 'GEN', chapter: definition.chapter, fromVerse: definition.verse, toVerse: definition.verse, normalized: definition.reference });
  assert.ok(Array.isArray(view.limitations) && view.limitations.length > 0 && view.limitations.every(value => typeof value === 'string' && value.trim()));
  assert.equal(JSON.stringify({ evidence: view.evidence, limitations: view.limitations }).includes('ATTACK_SENTINEL_S05_EV08'), false);
  const p = view.provenance;
  for (const [key, expected] of Object.entries({ profileId: profile.id, promptVersion: profile.promptVersion, modelId: profile.generation.id, modelSha256: profile.generation.sha256, embeddingModelSha256: profile.embedding.sha256, runtimeVersion: profile.runtime.engineCommit, dimensions: 1024, contextLimit: profile.limits.generationContextTokens, outputLimit: profile.limits.generationOutputTokens })) assert.equal(p[key], expected, `Unexpected provenance ${key}`);
  for (const key of ['promptTokens', 'completionTokens', 'totalTokens', 'embeddingPromptTokens']) assert.ok(Number.isSafeInteger(p[key]) && p[key] > 0, `Missing actual usage ${key}`);
  assert.equal(p.totalTokens, p.promptTokens + p.completionTokens); assert.ok(p.completionTokens <= p.outputLimit && p.promptTokens + p.outputLimit <= p.contextLimit);
  assert.ok(Array.isArray(p.consultedSegments) && p.consultedSegments.length > 0 && p.consultedSegments.length <= 3);
  assert.equal(new Set(p.consultedSegments.map(row => row.id)).size, p.consultedSegments.length);
  for (const row of p.consultedSegments) {
    assert.equal(row.sourceId, source.id); assert.equal(row.excerptId, excerpt.id); assert.equal(row.sourceDigest, digest);
    assert.ok(Number.isSafeInteger(row.startOffset) && row.startOffset >= 0 && row.startOffset < points.length && row.startOffset % 900 === 0);
    assert.equal(row.endOffset, Math.min(row.startOffset + 1000, points.length));
    assert.equal(row.id, `p${definition.paragraph}-c${row.startOffset / 900 + 1}`);
    assert.equal(row.textDigest, hash(points.slice(row.startOffset, row.endOffset).join('')));
  }
  assert.ok(Array.isArray(view.evidence));
  if (entry.sentenceId === null) { assert.equal(view.status, 'insufficient-evidence'); assert.equal(view.evidence.length, 0); }
  else {
    const [start, end] = spans[entry.sentenceId]; assert.equal(view.status, 'supported'); assert.equal(view.evidence.length, 1);
    const evidence = view.evidence[0];
    for (const [key, expected] of Object.entries({ sourceId: source.id, excerptId: excerpt.id, locator: excerpt.locator, textSha256: digest, startOffset: start, endOffset: end, quote: points.slice(start, end).join(''), attribution: source.attribution, rightsStatement: source.rightsStatement, rightsUrl: source.rightsUrl })) assert.equal(evidence[key], expected, `Unexpected evidence ${key}`);
    assert.ok(p.consultedSegments.slice(0, 2).some(row => row.startOffset < end && row.endOffset > start), 'Evidence was not in the supplied top2 context');
  }
  return { deterministic: 'PASS', semanticReview: 'PENDING', expectedSentenceId: entry.sentenceId };
}
function finalizeEvaluation(report, completed, resourcesClosed) {
  const rows = report.cases.slice();
  for (const entry of cases) if (!rows.some(row => row.id === entry.id)) rows.push({ id: entry.id, result: 'BLOCKED', reason: 'Global setup unavailable or execution did not reach this case', semanticReview: 'PENDING' });
  const completeSet = rows.length === cases.length && new Set(rows.map(row => row.id)).size === cases.length && rows.every(row => cases.some(entry => entry.id === row.id));
  const result = completed && resourcesClosed && completeSet && rows.every(row => row.result === 'PASS') ? 'REVIEW' : resourcesClosed && rows.every(row => row.result === 'BLOCKED') ? 'BLOCKED' : 'FAIL';
  return { ...report, cases: rows, result, ownedResourcesClosed: resourcesClosed, semanticReview: 'PENDING' };
}
module.exports = { analysisBody, validateEvaluation, finalizeEvaluation };
