const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { readPinnedRuntimeProfile, VerifiedRuntimeArtifacts } = require('../dist/modules/ai-assistant/infrastructure/runtime-artifacts');
const { NativeRuntime } = require('../dist/modules/ai-assistant/infrastructure/native-runtime');
const { LocalModelProvider } = require('../dist/modules/ai-assistant/infrastructure/local-model-provider');
const { AiQuestion, SourceSentence } = require('../dist/modules/ai-assistant/domain/model-input');
const { AiResultRejectedError } = require('../dist/modules/ai-assistant/application/errors');

async function main() {
  const profile = await readPinnedRuntimeProfile('admissions/local-extractive-v1.json');
  const home = process.env.BIBLE_AI_HOME || (process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'BibleAI') : undefined);
  if (!home) throw new Error('AI_LOCAL_HOME_REQUIRED');
  const source = 'data/source-library/josephus-antiquities-pg2848-en';
  const pins = { 'source.html': '098d837010fea0f38b104d2c9397696ae5db9e5cbd15a8e8f400f36811fbcf99', 'operational/excerpts.json': '2171bd34f61e74b22d61e58e6c71caa336716b8ad15e2c60f8210ce2e35d7f63', 'operational/NOTICE.source.txt': '18bc5c6f86b23ade32c4d711e765328b0c642c383a993c8d7f11c7ee21da4bf1' };
  for (const [name, digest] of Object.entries(pins)) if (createHash('sha256').update(fs.readFileSync(path.join(source, name))).digest('hex') !== digest) throw new Error('AI_LOCAL_SOURCE_CHANGED');
  const excerpts = JSON.parse(fs.readFileSync(path.join(source, 'operational/excerpts.json'), 'utf8'));
  const text = excerpts[0].text;
  const context = [...text.matchAll(/\S[\s\S]*?(?:[.!?](?=\s|$)|$)/gu)].map((match, index) => {
    const value = match[0].trim(); const start = Array.from(text.slice(0, match.index)).length;
    return new SourceSentence({ id: `p1-s${index + 1}`, paragraph: 1, start, end: start + Array.from(value).length, text: value });
  });
  fs.mkdirSync('reports', { recursive: true });
  const directory = fs.mkdtempSync(path.join('reports', 'ai-provider-local-'));
  const runtime = new NativeRuntime(new VerifiedRuntimeArtifacts(profile, home));
  let scenario = ''; let ordinal = 0;
  const calls = [];
  // Capturing only approved verification inputs, never ordinary user requests.
  const recordingRuntime = { run: (kind, execute, signal) => runtime.run(kind, session => execute({ runtimeVersion: session.runtimeVersion, post: async (endpoint, body, budget) => {
    const record = { ordinal: ++ordinal, scenario, kind, endpoint, maxResponseBytes: budget };
    const stem = path.join(directory, String(ordinal).padStart(2, '0'));
    fs.writeFileSync(stem + '-request.json', JSON.stringify({ ...record, body }, null, 2) + '\n');
    const response = await session.post(endpoint, body, budget);
    fs.writeFileSync(stem + '-response.json', JSON.stringify(response, null, 2) + '\n');
    calls.push(record); return response;
  } }), signal) };
  const provider = new LocalModelProvider(profile, recordingRuntime);
  const started = performance.now();
  let report;
  try {
    scenario = 'source-embedding';
    const embedding = await provider.embed({ purpose: 'source', texts: [excerpts[0].text, excerpts[1].text] });
    scenario = 'query-embedding';
    const query = await provider.embed({ purpose: 'question', texts: ['Segundo estes excertos de Josefo, que significa Sabbath?'] });
    scenario = 'supported-source-report';
    const supported = await provider.select(new AiQuestion('Segundo estes excertos de Josefo, que significa Sabbath?'), context);
    if (supported.selection.citationId !== 'p1-s11') throw new Error('AI_LOCAL_SUPPORT_CHECK_FAILED');
    scenario = 'insufficient-evidence';
    const insufficient = await provider.select(new AiQuestion('Em que ano exato ocorreu a destruição de Jerusalém?'), context);
    if (insufficient.selection.citationId !== null) throw new Error('AI_LOCAL_ABSTENTION_CHECK_FAILED');
    scenario = 'technical-token-budget';
    let rejected = false;
    try { await provider.embed({ purpose: 'source', texts: ['z '.repeat(2000)] }); }
    catch (error) { if (!(error instanceof AiResultRejectedError)) throw error; rejected = true; }
    if (!rejected || calls.some(call => call.scenario === scenario && call.endpoint === '/v1/embeddings')) throw new Error('AI_LOCAL_TOKEN_BUDGET_CHECK_FAILED');
    report = { at: new Date().toISOString(), result: 'PASS', scope: 'Actual adapter/runtime verification only; Application/vector DB/business HTTP and fourteen-case gate remain separate', profileId: profile.id, sourceAdmissionId: profile.sourceAdmissionId, sourcePins: pins, sourceAttribution: 'Flavius Josephus, Antiquities of the Jews I.1.1–4, translation William Whiston, Project Gutenberg 2848.', sourceUrl: 'https://www.gutenberg.org/ebooks/2848', rightsAndPurpose: 'Limited local admission documented in docs/sprints/S05/DATA_ADMISSION.md; original full notice preserved.', rawSourcesUsed: true, fixturesUsedForInference: false,
      embedding: { dimensions: embedding.vectors.map(vector => vector.length), usage: embedding.usage, provenance: embedding.provenance },
      query: { dimensions: query.vectors.map(vector => vector.length), usage: query.usage, provenance: query.provenance },
      supported: { citationId: supported.selection.citationId, quote: supported.selection.sentence.text, usage: supported.usage, provenance: supported.provenance },
      insufficient: { citationId: insufficient.selection.citationId, usage: insufficient.usage }, tokenBudgetRejectedBeforeInference: rejected,
      limitations: ['One original work/four paragraphs; direct paragraph context here, no vector search.', 'Quotes report the source; they do not independently prove history or modern consensus.'], calls, seconds: (performance.now() - started) / 1000 };
  } catch (error) {
    report = { at: new Date().toISOString(), result: 'FAIL', scenario, type: error.constructor.name, code: error.message?.startsWith('AI_') ? error.message : 'sanitized', calls, seconds: (performance.now() - started) / 1000 };
    process.exitCode = 1;
  } finally { await runtime.close(); }
  report.ownedRuntimeClosed = true;
  fs.writeFileSync(path.join(directory, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ result: report.result, report: path.join(directory, 'report.json'), scope: 'actual adapter; not sprint closure' }));
}
main().catch(error => { console.error(JSON.stringify({ result: 'FAIL', type: error.constructor.name, code: error.message?.startsWith('AI_') ? error.message : 'sanitized' })); process.exitCode = 1; });
