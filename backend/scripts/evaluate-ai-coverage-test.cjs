require('reflect-metadata');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash, randomUUID } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { cases } = require('./ai-coverage-cases.cjs');
const sha = value => createHash('sha256').update(value).digest('hex');

async function run() {
  if (process.argv.length !== 2) throw new Error('No command-line overrides');
  const { assertTestTarget, parseRuntimeConfig } = require('../dist/config/runtime-config.js');
  const target = assertTestTarget(process.env);
  const { Database } = require('../dist/infrastructure/database.js');
  const database = new Database(target);
  let app, report, output, runtimeLocks;
  const save = () => { if (report) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 }); };
  try {
    assert.deepEqual(await database.client.$queryRawUnsafe('SELECT current_database() AS db, current_user AS role'), [{ db: 'biblia_test', role: 'biblia_test' }]);
    const config = parseRuntimeConfig(process.env);
    assert.ok(config.aiHome && config.jwtSecret, 'Real admitted test configuration required');
    const locks = () => ['.biblia-ai.lock', '.biblia-ai-operation.lock'].some(name => fs.existsSync(path.join(config.aiHome, name)));
    runtimeLocks = locks;
    assert.equal(locks(), false, 'Runtime already owned; never remove another operation locks');
    const directory = fs.mkdtempSync(path.resolve('reports/s10-coverage-native-'));
    output = path.join(directory, 'report.json');
    const profileBytes = fs.readFileSync('admissions/local-extractive-v1.json');
    assert.equal(sha(profileBytes), 'cf12565112a0c5b84a7065200ee01362052f1ae3dee6296c16a8dccabbc5dc0f');
    const profile = JSON.parse(profileBytes);
    const fixtureBytes = fs.readFileSync('test/fixtures/ai-assistant/coverage-v1/canon.json');
    assert.equal(sha(fixtureBytes), '40e759585755a5c3270d1181a796bc2899a2f57533e7a15c516ee67de6d263dc');
    report = { startedAt: new Date().toISOString(), result: 'IN_PROGRESS', semanticReview: 'PENDING', owner: `s10-coverage-${randomUUID()}`,
      sourceRevision: require('node:child_process').execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      profileSha256: sha(profileBytes), casesSha256: sha(fs.readFileSync(__dirname + '/ai-coverage-cases.cjs')), cases: [], studies: [], ownedResourcesClosed: false };
    save();
    app = await require('../dist/app.js').createApplication(config); await app.init();
    const { CanonLibrary } = require('../dist/modules/biblical-canon/application/canon-library.js');
    const { SourceLibrary } = require('../dist/modules/source-library/application/source-library.js');
    const { SourcePassageLinks } = require('../dist/modules/source-library/application/source-passage-links.js');
    await app.get(CanonLibrary).importSnapshot(JSON.parse(fixtureBytes));
    const sources = 'test/fixtures/ai-assistant/source-library/josephus-antiquities-pg2848-en-local-ai-v1';
    report.sourceAdmission = await require('../dist/operations/admit-ai-sources.js').admitAiSources(app.get(SourceLibrary), app.get(SourcePassageLinks), {
      source: 'data/source-library/josephus-antiquities-pg2848-en/source.html', manifest: `${sources}/manifest.json`, excerpts: `${sources}/excerpts.json`, notice: `${sources}/NOTICE.source.txt`,
    }, 'test-ai');
    report.coverageAdmission = await require('../dist/operations/admit-ai-coverage.js').admitAiCoverage(app.get(SourcePassageLinks), 'test/fixtures/ai-assistant/coverage-v1/manifest.json', 'test-ai');
    const { SourceIndexingLibrary } = require('../dist/modules/ai-assistant/application/source-indexing-library.js');
    report.index = await app.get(SourceIndexingLibrary).rebuild(new globalThis.AbortController().signal); assert.equal(report.index.chunkCount, 11);
    await app.listen(0, '127.0.0.1'); const base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
    const token = await new (require('../dist/infrastructure/access-token.js').LocalAccessTokens)(config.jwtSecret).issue(report.owner);
    const call = async (method, route, body) => {
      const response = await globalThis.fetch(base + route, { method, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: globalThis.AbortSignal.timeout(620000) });
      return { status: response.status, view: response.status === 204 ? null : await response.json() };
    };
    const studies = new Map();
    try {
      for (const entry of cases) {
        const started = performance.now(); const observation = { id: entry.id, result: 'IN_PROGRESS', semanticReview: 'PENDING' };
        report.cases.push(observation); save();
        try {
          let study = studies.get(entry.reference);
          if (!study) {
            const created = await call('POST', '/studies', { translationId: 'porbr2018', reference: entry.reference });
            assert.equal(created.status, 201); study = created.view; studies.set(entry.reference, study); report.studies.push({ id: study.id, version: study.version, reference: entry.reference });
          }
          const original = await app.get(SourceLibrary).getExcerpt(`josephus-antiquities-pg2848-en-local-ai-v1-b1-c1-p${entry.paragraph}`);
          const actual = await call('POST', `/studies/${study.id}/ai-analyses`, { studyVersion: study.version, question: entry.question });
          observation.httpStatus = actual.status; observation.response = actual.view; observation.elapsedMs = Math.round(performance.now() - started); save();
          assert.equal(actual.status, 201);
          verify(entry, actual.view, study, original, profile);
          observation.result = 'PASS'; observation.deterministic = 'PASS';
        } catch (error) { observation.result = 'FAIL'; observation.failureType = error.name; observation.elapsedMs = Math.round(performance.now() - started); }
        save(); console.info(JSON.stringify({ component: 'native-ai-coverage', id: entry.id, result: observation.result, httpStatus: observation.httpStatus, elapsedMs: observation.elapsedMs }));
      }
    } finally {
      report.ownedStudiesDeleted = true;
      for (const study of studies.values()) {
        try { assert.equal((await call('DELETE', `/studies/${study.id}`)).status, 204); }
        catch { report.ownedStudiesDeleted = false; }
      }
      save();
    }
    await app.close(); app = undefined;
    report.ownedResourcesClosed = !locks();
    report.result = report.cases.length === cases.length && report.cases.every(row => row.result === 'PASS') && report.ownedResourcesClosed && report.ownedStudiesDeleted ? 'REVIEW' : 'FAIL';
    save(); console.info(JSON.stringify({ component: 'native-ai-coverage-report', result: report.result, report: output }));
    if (report.result !== 'REVIEW') process.exitCode = 1;
  } catch (error) {
    if (report) {
      for (const entry of cases) if (!report.cases.some(row => row.id === entry.id)) report.cases.push({ id: entry.id, result: 'BLOCKED', semanticReview: 'PENDING' });
      report.result = report.cases.every(row => row.result === 'BLOCKED') ? 'BLOCKED' : 'FAIL'; report.failureType = error.name; save();
    }
    throw error;
  } finally {
    try { await app?.close(); } finally { await database.onModuleDestroy(); }
    if (report) { report.ownedResourcesClosed = !!runtimeLocks && !runtimeLocks(); save(); }
  }
}

function verify(entry, view, study, { source, excerpt }, profile) {
  assert.equal(view.studyId, study.id); assert.equal(view.studyVersion, study.version); assert.equal(view.question, entry.question);
  assert.deepEqual(view.reference, study.reference); assert.ok(view.limitations.length > 0);
  assert.equal(sha(excerpt.text), excerpt.textSha256); assert.equal(excerpt.order, entry.paragraph);
  for (const right of ['store', 'index', 'display', 'quote', 'sendToAi']) assert.equal(source.permissions[right], 'allowed');
  const p = view.provenance;
  for (const [key, expected] of Object.entries({ profileId: profile.id, promptVersion: profile.promptVersion, modelId: profile.generation.id, modelSha256: profile.generation.sha256,
    embeddingModelSha256: profile.embedding.sha256, runtimeVersion: profile.runtime.engineCommit, dimensions: 1024, contextLimit: profile.limits.generationContextTokens, outputLimit: profile.limits.generationOutputTokens })) assert.equal(p[key], expected);
  for (const key of ['promptTokens', 'completionTokens', 'totalTokens', 'embeddingPromptTokens']) assert.ok(Number.isSafeInteger(p[key]) && p[key] > 0, key);
  assert.equal(p.totalTokens, p.promptTokens + p.completionTokens); assert.ok(p.completionTokens <= p.outputLimit && p.promptTokens + p.outputLimit <= p.contextLimit);
  assert.ok(p.consultedSegments.length > 0 && p.consultedSegments.length <= 3);
  assert.equal(new Set(p.consultedSegments.map(row => row.id)).size, p.consultedSegments.length);
  const points = Array.from(excerpt.text);
  for (const row of p.consultedSegments) {
    assert.equal(row.sourceId, source.id); assert.equal(row.excerptId, excerpt.id); assert.equal(row.sourceDigest, excerpt.textSha256);
    assert.ok(Number.isSafeInteger(row.startOffset) && row.startOffset >= 0 && row.startOffset % 900 === 0 && row.startOffset < points.length);
    assert.equal(row.endOffset, Math.min(row.startOffset + 1000, points.length)); assert.equal(row.textDigest, sha(points.slice(row.startOffset, row.endOffset).join('')));
    assert.equal(row.id, `p${entry.paragraph}-c${row.startOffset / 900 + 1}`);
  }
  if (entry.sentenceId === null) { assert.equal(view.status, 'insufficient-evidence'); assert.deepEqual(view.evidence, []); return; }
  assert.equal(view.status, 'supported'); assert.equal(view.evidence.length, 1);
  const expected = { sourceId: source.id, excerptId: excerpt.id, locator: excerpt.locator, textSha256: excerpt.textSha256, startOffset: entry.start, endOffset: entry.end,
    quote: points.slice(entry.start, entry.end).join(''), attribution: source.attribution, rightsStatement: source.rightsStatement, rightsUrl: source.rightsUrl };
  for (const [key, value] of Object.entries(expected)) assert.equal(view.evidence[0][key], value, key);
  assert.ok(p.consultedSegments.slice(0, 2).some(row => row.startOffset < entry.end && row.endOffset > entry.start));
}
run().catch(() => { console.error('Native coverage evaluation refused or failed; verify the guarded test configuration and admitted artefacts.'); process.exitCode = 1; });
