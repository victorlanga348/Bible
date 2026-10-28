require('reflect-metadata');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { join, resolve } = require('node:path');
const { randomUUID, createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { nativeCases, proofResult } = require('./conversation-proof.cjs');
const { validateEvaluation } = require('./ai-evaluation-result.cjs');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function run() {
  if (process.argv.length !== 2) throw Error('No overrides');
  const { withDevelopmentDatabase } = require('./development-operation.cjs');
  await withDevelopmentDatabase(async (_database, target) => {
    const { createApplication } = require('../dist/app.js'); const { parseRuntimeConfig } = require('../dist/config/runtime-config.js');
    const { LocalAccessTokens } = require('../dist/infrastructure/access-token.js');
    const { SourceIndexingLibrary } = require('../dist/modules/ai-assistant/application/source-indexing-library.js');
    const { SourceLibrary } = require('../dist/modules/source-library/application/source-library.js');
    const config = parseRuntimeConfig({ ...process.env, DATABASE_URL: target });
    if (!config.aiHome || !config.aiDatabaseUrl || !config.jwtSecret) throw Error('Native configuration required');
    const directory = await fs.mkdtemp(join(resolve('reports'), 'ai-conversation-local-')); const file = join(directory, 'report.json');
    const profileBytes = await fs.readFile('admissions/local-extractive-v1.json'); const profile = JSON.parse(profileBytes);
    const excerpts = JSON.parse(await fs.readFile('admissions/josephus-antiquities-pg2848-en-local-ai-v1/excerpts.json', 'utf8'));
    const report = { startedAt: new Date().toISOString(), result: 'IN_PROGRESS', semanticReview: 'PENDING', inferenceMode: 'Native production HTTP; per-response provenance/usage proves actual calls, never assumed for blocked cases.', owner: `local-conversation-${randomUUID()}`, sourceRevision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), profileSha256: hash(profileBytes), casesSha256: hash(await fs.readFile(join(__dirname, 'conversation-proof.cjs'))), cases: [] };
    const save = () => fs.writeFile(file, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 }); await save();
    const controller = new globalThis.AbortController(); const abort = () => controller.abort(); process.once('SIGINT', abort); process.once('SIGTERM', abort);
    const app = await createApplication(config); let closed = false; let deleted = true; let call;
    try {
      for (const name of ['.biblia-ai.lock', '.biblia-ai-operation.lock']) { try { await fs.access(join(config.aiHome, name)); throw Error('Resources owned'); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
      await app.init(); report.index = await app.get(SourceIndexingLibrary).rebuild(controller.signal); assert.equal(report.index.chunkCount, 11);
      await app.listen(0, '127.0.0.1'); const base = `http://127.0.0.1:${app.getHttpServer().address().port}`; const tokens = new LocalAccessTokens(config.jwtSecret);
      call = async (method, path, body, expected, owner = report.owner, cleanup = false) => {
        const token = await tokens.issue(owner); const response = await globalThis.fetch(base + path, { method, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: globalThis.AbortSignal.any([...(cleanup ? [] : [controller.signal]), globalThis.AbortSignal.timeout(cleanup ? 20000 : 620000)]) });
        if (response.status !== expected) throw Error(`HTTP_${response.status}`); return response.status === 204 ? null : response.json();
      };
      report.study = await call('POST', '/studies', { translationId: 'porbr2018', reference: 'GEN 2:7' }, 201);
      const original = await app.get(SourceLibrary).getExcerpt(excerpts.find(row => row.order === 2).id);
      report.conversation = await call('POST', `/studies/${report.study.id}/conversations`, { studyVersion: report.study.version }, 201); deleted = false; await save();
      for (const [index, entry] of nativeCases.entries()) {
        const result = { id: entry.id, question: entry.question, startedAt: new Date().toISOString(), result: 'FAIL', semanticReview: 'PENDING' }; report.cases.push(result); const start = Date.now();
        try {
          result.view = await call('POST', `/conversations/${report.conversation.id}/turns`, { expectedRevision: index, question: entry.question }, 201); await save();
          assert.equal(result.view.revision, index + 1); assert.equal('ownerId' in result.view, false);
          const turn = result.view.turns[index]; assert.equal(turn.number, index + 1); assert.equal(turn.question, entry.question); assert.deepEqual(turn.contextTurnNumbers, entry.contextTurnNumbers); assert.equal(turn.omittedTurns, 0); assert.equal(turn.revisesTurn, null); assert.equal(turn.responseStatus, 'available'); assert.equal(turn.analysisId, turn.analysis.id);
          Object.assign(result, validateEvaluation({ ...entry, question: entry.expectedQuestion }, turn.analysis, { original, study: report.study, profile }));
          assert.deepEqual(await call('GET', `/conversations/${report.conversation.id}`, undefined, 200), result.view);
          assert.deepEqual(await call('GET', `/ai-analyses/${turn.analysisId}`, undefined, 200), turn.analysis);
          await call('GET', `/conversations/${report.conversation.id}`, undefined, 404, 'local-conversation-other');
          result.result = 'PASS';
        } catch (error) { result.reason = error.code === 'ERR_ASSERTION' ? 'Expected conversation/evidence mismatch' : /^HTTP_\d+$/.test(error.message) ? error.message : 'Technical verification failed'; if (error.message === 'HTTP_503') result.result = 'BLOCKED'; }
        result.finishedAt = new Date().toISOString(); result.elapsedMs = Date.now() - start; await save(); console.info(JSON.stringify({ case: result.id, result: result.result, elapsedMs: result.elapsedMs }));
        if (!result.view) break;
      }
    } catch { report.setup = 'BLOCKED'; }
    finally {
      await save();
      if (report.conversation?.id && call) { try { await call('DELETE', `/conversations/${report.conversation.id}`, undefined, 204, report.owner, true); deleted = true; for (const result of report.cases) for (const turn of result.view?.turns ?? []) await call('GET', `/ai-analyses/${turn.analysisId}`, undefined, 404, report.owner, true); } catch { deleted = false; } }
      try { await app.close(); closed = true; } catch { report.cleanup = 'FAIL'; }
      process.removeListener('SIGINT', abort); process.removeListener('SIGTERM', abort);
    }
    for (const name of ['.biblia-ai.lock', '.biblia-ai-operation.lock']) { try { await fs.access(join(config.aiHome, name)); closed = false; } catch (error) { if (error.code !== 'ENOENT') throw error; } }
    for (const entry of nativeCases) if (!report.cases.some(row => row.id === entry.id)) report.cases.push({ id: entry.id, result: 'BLOCKED', reason: 'Dependent native turn was not reached', semanticReview: 'PENDING' });
    report.ownedResourcesClosed = closed; report.conversationDeleted = deleted; report.result = proofResult(report.cases, closed, deleted); report.finishedAt = new Date().toISOString(); await save();
    console.info(JSON.stringify({ result: report.result, report: file, sha256: hash(await fs.readFile(file)), cases: report.cases.length, semanticReview: 'PENDING' })); if (report.result !== 'REVIEW') process.exitCode = 1;
  });
}
run().catch(() => { console.error('Conversation verification refused or failed; no configuration printed.'); process.exitCode = 1; });
