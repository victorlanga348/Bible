const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { cases, studies, spans } = require('./ai-evaluation-cases.cjs');
const { analysisBody, validateEvaluation, finalizeEvaluation } = require('./ai-evaluation-result.cjs');
const profile = JSON.parse(readFileSync('admissions/local-extractive-v1.json', 'utf8'));
const manifest = JSON.parse(readFileSync('admissions/josephus-antiquities-pg2848-en-local-ai-v1/manifest.json', 'utf8'));
const excerpts = JSON.parse(readFileSync('admissions/josephus-antiquities-pg2848-en-local-ai-v1/excerpts.json', 'utf8'));
const hash = text => createHash('sha256').update(text).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
// Synthetic transport/provenance DTO only; quotes and source metadata are
// genuinely admitted. No fixture in this suite is claimed as inference.
function fixture(id = 'EV01') {
  const entry = cases.find(row => row.id === id); const definition = studies[entry.study]; const excerpt = excerpts.find(row => row.order === definition.paragraph);
  const original = { source: manifest.source, excerpt }; const study = { id: 'a5f98045-af6c-4ddd-a927-ff07b0bc0551', version: 1 };
  const points = Array.from(excerpt.text); const chunks = [];
  for (let start = 0, ordinal = 1; start < points.length; start += 900, ordinal++) { const end = Math.min(start + 1000, points.length); chunks.push({ id: `p${definition.paragraph}-c${ordinal}`, sourceId: excerpt.sourceId, excerptId: excerpt.id, sourceDigest: excerpt.textSha256, textDigest: hash(points.slice(start, end).join('')), startOffset: start, endOffset: end }); if (end === points.length) break; }
  const offsets = entry.sentenceId ? spans[entry.sentenceId] : null;
  if (offsets) chunks.sort((a, b) => Number(b.startOffset < offsets[1] && b.endOffset > offsets[0]) - Number(a.startOffset < offsets[1] && a.endOffset > offsets[0]));
  const view = { id: 'ea824a16-36f1-47e6-8d40-b47b67ef57df', studyId: study.id, studyVersion: study.version, question: entry.question,
    reference: { translationId: 'porbr2018', bookCode: 'GEN', chapter: definition.chapter, fromVerse: definition.verse, toVerse: definition.verse, normalized: definition.reference },
    status: offsets ? 'supported' : 'insufficient-evidence', evidence: offsets ? [{ sourceId: excerpt.sourceId, excerptId: excerpt.id, locator: excerpt.locator, textSha256: excerpt.textSha256, startOffset: offsets[0], endOffset: offsets[1], quote: points.slice(...offsets).join(''), attribution: manifest.source.attribution, rightsStatement: manifest.source.rightsStatement, rightsUrl: manifest.source.rightsUrl }] : [],
    limitations: ['Uma frase de uma obra antiga; não constitui confirmação histórica independente.'],
    provenance: { profileId: profile.id, promptVersion: profile.promptVersion, modelId: profile.generation.id, modelSha256: profile.generation.sha256, embeddingModelSha256: profile.embedding.sha256, runtimeVersion: profile.runtime.engineCommit, dimensions: 1024, contextLimit: profile.limits.generationContextTokens, outputLimit: profile.limits.generationOutputTokens, promptTokens: 100, completionTokens: 5, totalTokens: 105, embeddingPromptTokens: 10, consultedSegments: chunks.slice(0, 3) } };
  return { entry, view, context: { original, study, profile } };
}
test('freezes all14 original inputs and never includes expectations or source text in the API body', () => {
  assert.equal(cases.length, 14); assert.equal(new Set(cases.map(row => row.id)).size, 14); assert.ok(cases.find(row => row.id === 'EV08').question.includes('\n'));
  for (const entry of cases) assert.deepEqual(analysisBody(entry, { version: 1 }), { studyVersion: 1, question: entry.question });
});
test('accepts every frozen expected span or null against genuine originals, without claiming semantic review', () => {
  for (const entry of cases) { const f = fixture(entry.id); assert.equal(validateEvaluation(f.entry, f.view, f.context).deterministic, 'PASS'); assert.equal(validateEvaluation(f.entry, f.view, f.context).semanticReview, 'PENDING'); }
});
test('rejects wrong status, extra evidence, irrelevant literal text and independently corrupted citation metadata', () => {
  for (const change of [v => { v.status = 'insufficient-evidence'; }, v => { v.evidence.push(clone(v.evidence[0])); }, v => { v.evidence[0].quote = 'Technical corruption, not a historical quote.'; }, v => { v.evidence[0].sourceId += '-other'; }, v => { v.evidence[0].excerptId += '-other'; }, v => { v.evidence[0].startOffset++; }, v => { v.evidence[0].endOffset--; }, v => { v.evidence[0].textSha256 = 'a'.repeat(64); }, v => { v.evidence[0].rightsUrl = 'file:///technical'; }, v => { v.evidence[0].attribution = ''; }]) {
    const f = fixture(); change(f.view); assert.throws(() => validateEvaluation(f.entry, f.view, f.context));
  }
});
test('rejects invented support for an unsupported case, and absence of actual inference metadata', () => {
  const nullCase = fixture('EV05'); nullCase.view.status = 'supported'; assert.throws(() => validateEvaluation(nullCase.entry, nullCase.view, nullCase.context));
  for (const change of [v => { v.provenance.modelId = null; }, v => { v.provenance.runtimeVersion = 'controlled-technical'; }, v => { v.provenance.embeddingPromptTokens = 0; }, v => { v.provenance.totalTokens++; }, v => { v.provenance.modelSha256 = 'b'.repeat(64); }]) { const f = fixture(); change(f.view); assert.throws(() => validateEvaluation(f.entry, f.view, f.context)); }
});
test('validates source bytes, study binding, source rights and every consulted span', () => {
  for (const change of [f => { f.context.original = clone(f.context.original); f.context.original.excerpt.text += 'Technical tamper'; }, f => { f.view.studyId = 'another-technical-study'; }, f => { f.view.reference.chapter++; }, f => { f.context.original = clone(f.context.original); f.context.original.source.permissions.sendToAi = 'denied'; }, f => { f.view.provenance.consultedSegments[0].textDigest = 'c'.repeat(64); }, f => { f.view.provenance.consultedSegments[0].sourceId += '-other'; }]) { const f = fixture(); change(f); assert.throws(() => validateEvaluation(f.entry, f.view, f.context)); }
});
test('rejects a citation found only in the third retrieved chunk and excludes the echoed attack marker from derived-content checks', () => {
  const f = fixture(); f.view.provenance.consultedSegments.sort((a,b) => a.startOffset - b.startOffset); assert.throws(() => validateEvaluation(f.entry, f.view, f.context));
  const attack = fixture('EV08'); assert.equal(validateEvaluation(attack.entry, attack.view, attack.context).deterministic, 'PASS');
});
test('marks every unexecuted case BLOCKED instead of treating an empty run as success', () => {
  const result = finalizeEvaluation({ cases: [], setup: 'BLOCKED' }, false, true);
  assert.equal(result.result, 'BLOCKED'); assert.equal(result.cases.length, 14); assert.ok(result.cases.every(row => row.result === 'BLOCKED'));
});
test('requires all14 distinct cases and closed resources; deterministic success still awaits semantic review', () => {
  const report = { cases: cases.map(row => ({ id: row.id, result: 'PASS' })) };
  const result = finalizeEvaluation(report, true, true); assert.equal(result.result, 'REVIEW'); assert.equal(result.semanticReview, 'PENDING');
  assert.equal(finalizeEvaluation(report, true, false).result, 'FAIL');
  assert.equal(finalizeEvaluation({ cases: Array(14).fill({ id: 'EV01', result: 'PASS' }) }, true, true).result, 'FAIL');
});
test('preserves an actual failed case while marking missing cases blocked', () => {
  const result = finalizeEvaluation({ cases: [{ id: 'EV01', result: 'FAIL', reason: 'technical mismatch' }] }, false, true);
  assert.equal(result.result, 'FAIL'); assert.equal(result.cases[0].result, 'FAIL'); assert.equal(result.cases[0].reason, 'technical mismatch'); assert.equal(result.cases.length, 14);
});
