require('reflect-metadata');
const assert = require('node:assert/strict');
const { mkdtemp, writeFile, access } = require('node:fs/promises');
const { resolve, join } = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { withDevelopmentDatabase, failed } = require('./development-operation.cjs');

async function run() {
  if (process.argv.length !== 2) throw new Error('No HTTP, model or path overrides allowed');
  await withDevelopmentDatabase(async (_database, target) => {
    const { createApplication } = require('../dist/app.js');
    const { parseRuntimeConfig } = require('../dist/config/runtime-config.js');
    const { LocalAccessTokens } = require('../dist/infrastructure/access-token.js');
    const { SourceIndexingLibrary } = require('../dist/modules/ai-assistant/application/source-indexing-library.js');
    const { SourceLibrary } = require('../dist/modules/source-library/application/source-library.js');
    const config = parseRuntimeConfig({ ...process.env, DATABASE_URL: target });
    if (!config.aiHome || !config.aiDatabaseUrl || !config.jwtSecret) throw new Error('Real local AI and access configuration required');
    const startedAt = new Date().toISOString(); const started = performance.now(); const app = await createApplication(config);
    const controller = new globalThis.AbortController(); const abort = () => controller.abort(); const owner = `local-ai-proof-${randomUUID()}`;
    process.once('SIGINT', abort); process.once('SIGTERM', abort);
    let report;
    try {
      await app.init(); const indexed = await app.get(SourceIndexingLibrary).rebuild(controller.signal); assert.equal(indexed.chunkCount, 11);
      await app.listen(0, '127.0.0.1'); const base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
      const tokens = new LocalAccessTokens(config.jwtSecret); const token = await tokens.issue(owner); const foreign = await tokens.issue('local-ai-proof-other');
      async function call(method, path, body, expected, accessToken = token) {
        const response = await globalThis.fetch(base + path, { method, headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: globalThis.AbortSignal.any([controller.signal, globalThis.AbortSignal.timeout(620000)]) });
        assert.equal(response.status, expected); return response.status === 204 ? null : response.json();
      }
      const study = await call('POST', '/studies', { translationId: 'porbr2018', reference: 'GEN 1:1' }, 201);
      const view = await call('POST', `/studies/${study.id}/ai-analyses`, { studyVersion: study.version, question: 'Which day does this source call Sabbath?' }, 201);
      assert.equal(view.status, 'supported'); assert.equal(view.evidence.length, 1); const evidence = view.evidence[0];
      const original = await app.get(SourceLibrary).getExcerpt(evidence.excerptId);
      assert.equal(evidence.quote, Array.from(original.excerpt.text).slice(evidence.startOffset, evidence.endOffset).join(''));
      assert.match(evidence.quote, /^And that the seventh day/); assert.ok(evidence.quote.includes('Sabbath'));
      assert.equal(view.provenance.profileId, 'local-extractive-v1'); assert.equal(view.provenance.runtimeVersion.includes('controlled'), false); assert.ok(view.provenance.embeddingPromptTokens > 0);
      assert.deepEqual(await call('GET', `/ai-analyses/${view.id}`, undefined, 200), view);
      await call('GET', `/ai-analyses/${view.id}`, undefined, 404, foreign); await call('DELETE', `/ai-analyses/${view.id}`, undefined, 404, foreign);
      await call('DELETE', `/ai-analyses/${view.id}`, undefined, 204); await call('GET', `/ai-analyses/${view.id}`, undefined, 404);
      report = { result: 'PASS', startedAt, owner, studyId: study.id, analysisId: view.id, analysisDeleted: true, index: indexed, analysis: view, inference: 'Actual native embeddings/generation through production composition and HTTP; not recorded responses or doubles.' };
    } finally { process.removeListener('SIGINT', abort); process.removeListener('SIGTERM', abort); await app.close(); }
    for (const file of ['.biblia-ai.lock', '.biblia-ai-operation.lock']) { let present = true; try { await access(join(config.aiHome, file)); } catch (error) { if (error.code !== 'ENOENT') throw error; present = false; } assert.equal(present, false); }
    report.finishedAt = new Date().toISOString(); report.elapsedMs = performance.now() - started; report.ownedResourcesClosed = true;
    const directory = await mkdtemp(join(resolve('reports'), 'ai-rag-local-')); const bytes = JSON.stringify(report, null, 2) + '\n'; const file = join(directory, 'report.json'); await writeFile(file, bytes, { mode: 0o600 });
    console.info(JSON.stringify({ result: report.result, report: file, sha256: createHash('sha256').update(bytes).digest('hex'), elapsedMs: report.elapsedMs, ownedResourcesClosed: true }));
  });
}
run().catch(failed);
