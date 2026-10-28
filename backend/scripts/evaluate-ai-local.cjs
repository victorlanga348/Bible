require('reflect-metadata');
const assert = require('node:assert/strict');
const { readFile, mkdtemp, writeFile, access } = require('node:fs/promises');
const { resolve, join } = require('node:path');
const { randomUUID, createHash } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { execFileSync } = require('node:child_process');
const { withDevelopmentDatabase, failed } = require('./development-operation.cjs');
const { cases, studies } = require('./ai-evaluation-cases.cjs');
const { analysisBody, validateEvaluation, finalizeEvaluation } = require('./ai-evaluation-result.cjs');

async function run() {
  if (process.argv.length !== 2) throw new Error('No HTTP, model or path overrides allowed');
  await withDevelopmentDatabase(async (_database, target) => {
    const { createApplication } = require('../dist/app.js');
    const { parseRuntimeConfig } = require('../dist/config/runtime-config.js');
    const { LocalAccessTokens } = require('../dist/infrastructure/access-token.js');
    const { SourceIndexingLibrary } = require('../dist/modules/ai-assistant/application/source-indexing-library.js');
    const { SourceLibrary } = require('../dist/modules/source-library/application/source-library.js');
    const config = parseRuntimeConfig({ ...process.env, DATABASE_URL: target });
    if (!config.aiHome || !config.aiDatabaseUrl || !config.jwtSecret) throw new Error('Real local AI/access configuration required');
    const directory = await mkdtemp(join(resolve('reports'), 'ai-evaluation-local-')); const file = join(directory, 'report.json');
    const profileBytes = await readFile('admissions/local-extractive-v1.json'); const profile = JSON.parse(profileBytes.toString('utf8'));
    const excerpts = JSON.parse(await readFile('admissions/josephus-antiquities-pg2848-en-local-ai-v1/excerpts.json', 'utf8'));
    const report = { schemaVersion: 1, startedAt: new Date().toISOString(), result: 'IN_PROGRESS', semanticReview: 'PENDING', owner: `local-ai-eval-${randomUUID()}`, studies: {}, cases: [], inferenceMode: 'Native production HTTP; executed model usage is recorded per actual response, never assumed for a blocked case.', sourceRevision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), profileSha256: createHash('sha256').update(profileBytes).digest('hex'), casesSha256: createHash('sha256').update(await readFile(join(__dirname, 'ai-evaluation-cases.cjs'))).digest('hex') };
    const save = () => writeFile(file, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
    await save(); const controller = new globalThis.AbortController(); const abort = () => controller.abort();
    process.once('SIGINT', abort); process.once('SIGTERM', abort);
    const app = await createApplication(config); let completed = false; let resourcesClosed = false;
    try {
      for (const name of ['.biblia-ai.lock', '.biblia-ai-operation.lock']) { try { await access(join(config.aiHome, name)); throw new Error('AI resource already owned'); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
      await app.init(); report.index = await app.get(SourceIndexingLibrary).rebuild(controller.signal); assert.equal(report.index.chunkCount, 11);
      await app.listen(0, '127.0.0.1'); const base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
      const tokens = new LocalAccessTokens(config.jwtSecret);
      const call = async (method, path, body, expected, subject = report.owner) => {
        const token = await tokens.issue(subject);
        const response = await globalThis.fetch(base + path, { method, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: globalThis.AbortSignal.any([controller.signal, globalThis.AbortSignal.timeout(620000)]) });
        if (response.status !== expected) throw new Error(`HTTP_${response.status}`);
        return response.status === 204 ? null : response.json();
      };
      const originals = {};
      for (const [key, definition] of Object.entries(studies)) {
        report.studies[key] = await call('POST', '/studies', { translationId: 'porbr2018', reference: definition.reference }, 201);
        const excerpt = excerpts.find(row => row.order === definition.paragraph); originals[key] = await app.get(SourceLibrary).getExcerpt(excerpt.id);
      }
      await save();
      for (const entry of cases) {
        if (controller.signal.aborted) { report.cases.push({ id: entry.id, result: 'BLOCKED', reason: 'Operation cancelled before case' }); await save(); continue; }
        const started = performance.now(); const result = { id: entry.id, study: entry.study, question: entry.question, expectedSentenceId: entry.sentenceId, startedAt: new Date().toISOString(), result: 'FAIL', semanticReview: 'PENDING' };
        report.cases.push(result);
        try {
          const study = report.studies[entry.study]; const view = await call('POST', `/studies/${study.id}/ai-analyses`, analysisBody(entry, study), 201);
          result.view = view; result.inferenceRoundTripMs = performance.now() - started; await save();
          Object.assign(result, validateEvaluation(entry, view, { original: originals[entry.study], study, profile }));
          assert.deepEqual(await call('GET', `/ai-analyses/${view.id}`, undefined, 200), view);
          await call('GET', `/ai-analyses/${view.id}`, undefined, 404, 'local-ai-eval-other');
          await call('DELETE', `/ai-analyses/${view.id}`, undefined, 404, 'local-ai-eval-other');
          result.result = 'PASS';
        } catch (error) { result.reason = error.code === 'ERR_ASSERTION' ? 'Evaluation contract/expected evidence mismatch' : /^HTTP_\d+$/.test(error.message) ? error.message : 'Technical operation failed'; if (error.message === 'HTTP_503') result.result = 'BLOCKED'; }
        finally {
          await save();
          if (result.view?.id) { try { await call('DELETE', `/ai-analyses/${result.view.id}`, undefined, 204); result.analysisDeleted = true; } catch { result.cleanup = 'FAIL'; result.result = 'FAIL'; } }
          result.finishedAt = new Date().toISOString(); result.elapsedMs = performance.now() - started; await save();
          console.info(JSON.stringify({ case: result.id, result: result.result, elapsedMs: result.elapsedMs, semanticReview: 'PENDING' }));
        }
      }
      completed = true;
    } catch { report.setup = 'BLOCKED'; }
    finally { process.removeListener('SIGINT', abort); process.removeListener('SIGTERM', abort); try { await app.close(); resourcesClosed = true; } catch { report.cleanup = 'FAIL'; } }
    for (const name of ['.biblia-ai.lock', '.biblia-ai-operation.lock']) { try { await access(join(config.aiHome, name)); resourcesClosed = false; } catch (error) { if (error.code !== 'ENOENT') throw error; } }
    Object.assign(report, finalizeEvaluation(report, completed, resourcesClosed));
    report.finishedAt = new Date().toISOString(); await save();
    const bytes = await readFile(file); console.info(JSON.stringify({ result: report.result, report: file, sha256: createHash('sha256').update(bytes).digest('hex'), cases: report.cases.length, ownedResourcesClosed: report.ownedResourcesClosed, semanticReview: 'PENDING' }));
    if (report.result !== 'REVIEW') process.exitCode = 1;
  });
}
run().catch(failed);
