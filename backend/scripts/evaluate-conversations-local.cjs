require('reflect-metadata');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { join, resolve } = require('node:path');
const { randomUUID, createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { dialogueCases, evaluationResult, incorporatedProof } = require('./conversation-evaluation.cjs');
const { studies } = require('./ai-evaluation-cases.cjs');
const { validateEvaluation } = require('./ai-evaluation-result.cjs');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function run() {
  if (process.argv.length !== 2) throw Error('No overrides');
  const c01Digest = 'bc08ff2b5caa5888e9a42eb391419f73ab4e2dd3ddef2ac3206553322e7da601';
  const c01 = incorporatedProof(await fs.readFile('reports/ai-conversation-local-lET67M/report.json'), c01Digest);
  execFileSync('git', ['diff', '--exit-code', '4a34ddb694f7740348e955fd09dcce2dbd784896', '--', 'src', 'test'], { stdio: 'pipe' });
  const { withDevelopmentDatabase } = require('./development-operation.cjs');
  await withDevelopmentDatabase(async (_database, target) => {
    const { createApplication } = require('../dist/app.js');
    const { parseRuntimeConfig } = require('../dist/config/runtime-config.js');
    const { LocalAccessTokens } = require('../dist/infrastructure/access-token.js');
    const { SourceIndexingLibrary } = require('../dist/modules/ai-assistant/application/source-indexing-library.js');
    const { SourceLibrary } = require('../dist/modules/source-library/application/source-library.js');
    const config = parseRuntimeConfig({ ...process.env, DATABASE_URL: target });
    if (!config.aiHome || !config.aiDatabaseUrl || !config.jwtSecret) throw Error('Native configuration required');
    const profileBytes = await fs.readFile('admissions/local-extractive-v1.json');
    const profile = JSON.parse(profileBytes); assert.equal(hash(profileBytes), c01.profileSha256);
    const excerpts = JSON.parse(await fs.readFile('admissions/josephus-antiquities-pg2848-en-local-ai-v1/excerpts.json', 'utf8'));
    const directory = await fs.mkdtemp(join(resolve('reports'), 'ai-dialogue-local-')); const file = join(directory, 'report.json');
    const report = { startedAt: new Date().toISOString(), result: 'IN_PROGRESS', semanticReview: 'PENDING', owner: `local-conv-eval-${randomUUID()}`, sourceRevision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), equivalentProductRevision: c01.sourceRevision, incorporatedC01Sha256: c01Digest, profileSha256: hash(profileBytes), casesSha256: hash(await fs.readFile(join(__dirname, 'conversation-evaluation.cjs'))), sessions: [], cases: [] };
    const save = () => fs.writeFile(file, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 }); await save();
    const controller = new globalThis.AbortController(); const abort = () => controller.abort(); process.once('SIGINT', abort); process.once('SIGTERM', abort);
    const app = await createApplication(config); let closed = false; let call;
    try {
      for (const name of ['.biblia-ai.lock', '.biblia-ai-operation.lock']) { try { await fs.access(join(config.aiHome, name)); throw Error('Resources owned'); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
      await app.init(); report.index = await app.get(SourceIndexingLibrary).rebuild(controller.signal); assert.equal(report.index.chunkCount, 11);
      await app.listen(0, '127.0.0.1'); const base = `http://127.0.0.1:${app.getHttpServer().address().port}`; const tokens = new LocalAccessTokens(config.jwtSecret);
      call = async (method, path, body, expected, owner = report.owner, cleanup = false) => {
        const response = await globalThis.fetch(base + path, { method, headers: { authorization: `Bearer ${await tokens.issue(owner)}`, 'content-type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: globalThis.AbortSignal.any([...(cleanup ? [] : [controller.signal]), globalThis.AbortSignal.timeout(cleanup ? 20000 : 620000)]) });
        if (response.status !== expected) throw Error(`HTTP_${response.status}`); return response.status === 204 ? null : response.json();
      };
      for (const group of ['C02', 'C03', 'C04']) {
        const entries = dialogueCases.filter(row => row.id.startsWith(group)); const definition = studies[entries[0].study];
        const session = { group, deleted: true }; report.sessions.push(session);
        session.study = await call('POST', '/studies', { translationId: 'porbr2018', reference: definition.reference }, 201); await save();
        const original = await app.get(SourceLibrary).getExcerpt(excerpts.find(row => row.order === definition.paragraph).id);
        session.conversation = await call('POST', `/studies/${session.study.id}/conversations`, { studyVersion: session.study.version }, 201); session.deleted = false; await save();
        for (const [index, entry] of entries.entries()) {
          const result = { id: entry.id, question: entry.question, startedAt: new Date().toISOString(), result: 'FAIL', semanticReview: 'PENDING' }; report.cases.push(result); const start = Date.now();
          try {
            result.view = await call('POST', `/conversations/${session.conversation.id}/turns`, { expectedRevision: index, question: entry.question }, 201); await save();
            assert.equal(result.view.revision, index + 1); assert.equal('ownerId' in result.view, false);
            const turn = result.view.turns[index]; assert.equal(turn.number, index + 1); assert.equal(turn.question, entry.question); assert.deepEqual(turn.contextTurnNumbers, index ? [1] : []); assert.equal(turn.contextVersion, 'questions-v3'); assert.equal(turn.omittedTurns, 0); assert.equal(turn.revisesTurn, null); assert.equal(turn.responseStatus, 'available'); assert.equal(turn.analysisId, turn.analysis.id);
            Object.assign(result, validateEvaluation(entry, turn.analysis, { original, study: session.study, profile }));
            assert.deepEqual(await call('GET', `/conversations/${session.conversation.id}`, undefined, 200), result.view);
            assert.deepEqual(await call('GET', `/ai-analyses/${turn.analysisId}`, undefined, 200), turn.analysis);
            await call('GET', `/conversations/${session.conversation.id}`, undefined, 404, 'local-conversation-other'); result.result = 'PASS';
          } catch (error) { result.reason = error.code === 'ERR_ASSERTION' ? 'Expected conversation/evidence mismatch' : /^HTTP_\d+$/.test(error.message) ? error.message : 'Technical verification failed'; if (error.message === 'HTTP_503') result.result = 'BLOCKED'; }
          result.finishedAt = new Date().toISOString(); result.elapsedMs = Date.now() - start; await save(); console.info(JSON.stringify({ case: result.id, result: result.result, elapsedMs: result.elapsedMs }));
          if (!result.view) break;
        }
      }
    } catch { report.setup = 'BLOCKED'; }
    finally {
      await save();
      for (const session of report.sessions) if (session.conversation?.id && call) {
        try { await call('DELETE', `/conversations/${session.conversation.id}`, undefined, 204, report.owner, true); session.deleted = true;
          for (const result of report.cases) if (result.id.startsWith(session.group)) for (const turn of result.view?.turns ?? []) await call('GET', `/ai-analyses/${turn.analysisId}`, undefined, 404, report.owner, true);
        } catch { session.deleted = false; }
      }
      try { await app.close(); closed = true; } catch { report.cleanup = 'FAIL'; }
      process.removeListener('SIGINT', abort); process.removeListener('SIGTERM', abort);
    }
    for (const name of ['.biblia-ai.lock', '.biblia-ai-operation.lock']) { try { await fs.access(join(config.aiHome, name)); closed = false; } catch (error) { if (error.code !== 'ENOENT') throw error; } }
    for (const entry of dialogueCases) if (!report.cases.some(row => row.id === entry.id)) report.cases.push({ id: entry.id, result: 'BLOCKED', reason: 'Dependent native turn was not reached', semanticReview: 'PENDING' });
    report.ownedResourcesClosed = closed; report.conversationsDeleted = report.sessions.every(row => row.deleted); report.result = evaluationResult(report.cases, closed, report.conversationsDeleted); report.finishedAt = new Date().toISOString(); await save();
    console.info(JSON.stringify({ result: report.result, report: file, sha256: hash(await fs.readFile(file)), cases: report.cases.length, semanticReview: 'PENDING' })); if (report.result !== 'REVIEW') process.exitCode = 1;
  });
}
run().catch(() => { console.error('Dialogue evaluation refused or failed; no configuration printed.'); process.exitCode = 1; });
