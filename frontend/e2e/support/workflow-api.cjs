// Native test infrastructure. Imports authentic pinned snapshots only into the guarded test DB.
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { parseEnv } = require('node:util');
const { randomUUID } = require('node:crypto');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const diagnostics = require('node:diagnostics_channel');
const backend = path.resolve(__dirname, '../../../backend');
const dependency = createRequire(path.join(backend, 'package.json'));
const own = name => dependency(path.join(backend, 'dist', name));
dependency('reflect-metadata');

exports.startWorkflowApi = async function startWorkflowApi({ index = false } = {}) {
  const previousDirectory = process.cwd();
  process.chdir(backend);
  const env = { ...process.env, ...parseEnv(fs.readFileSync(path.join(backend, '.env.test'), 'utf8')), NODE_ENV: 'test', PORT: '32124' };
  const { parseRuntimeConfig, assertTestTarget } = own('config/runtime-config.js');
  const databaseUrl = assertTestTarget(env);
  const { Database } = own('infrastructure/database.js');
  const database = new Database(databaseUrl);
  let app;
  const rpcEvents = [], subscriptions = [];
  const stopTrace = () => { for (const [name, callback] of subscriptions) diagnostics.unsubscribe(name, callback); };
  try {
    assert.equal(new URL(databaseUrl).port, '61073', 'This run owns only the documented isolated DB');
    assert.deepEqual(await database.client.$queryRawUnsafe('SELECT current_database() AS db, current_user AS role'), [{ db: 'biblia_test', role: 'biblia_test' }]);
    assert.ok(env.S10_CANON_DIRECTORY, 'Provide the admitted original canon directory');
    assert.ok(env.S10_SOURCE_FILE, 'Provide the admitted historical source file');
    const canon = env.S10_CANON_DIRECTORY;
    await own('modules/biblical-canon/infrastructure/import-test-canon.js').importTestCanonSnapshot(env, {
      archive: path.join(canon, 'source.zip'), snapshot: path.join(canon, 'snapshot.json'),
      manifest: path.join(backend, 'test/fixtures/biblical-canon/porbr2018/manifest.json'),
    });
    const sources = path.join(backend, 'test/fixtures/ai-assistant/source-library/josephus-antiquities-pg2848-en-local-ai-v1');
    const sourceFiles = {
      source: env.S10_SOURCE_FILE, manifest: path.join(sources, 'manifest.json'),
      excerpts: path.join(sources, 'excerpts.json'), notice: path.join(sources, 'NOTICE.source.txt'),
    };
    const config = parseRuntimeConfig(env);
    app = await own('app.js').createApplication(config);
    await app.init();
    const { SourceLibrary } = own('modules/source-library/application/source-library.js');
    const { SourcePassageLinks } = own('modules/source-library/application/source-passage-links.js');
    const admission = await own('operations/admit-ai-sources.js').admitAiSources(app.get(SourceLibrary), app.get(SourcePassageLinks), sourceFiles, 'test-ai');
    console.info(JSON.stringify({ component: 'native-workflows-admission', result: admission }));
    if (env.S10_NATIVE_TRACE === '1') {
      const requests = new WeakMap();
      const observe = (name, callback) => { diagnostics.subscribe(name, callback); subscriptions.push([name, callback]); };
      observe('undici:request:create', ({ request }) => {
        const origin = new URL(String(request.origin)), endpoint = request.path.split('?')[0];
        if (origin.hostname !== '127.0.0.1' || !['/health', '/tokenize', '/apply-template', '/v1/embeddings', '/v1/chat/completions'].includes(endpoint)) return;
        const row = { endpoint, port: Number(origin.port), startedAt: new Date().toISOString(), startedMs: performance.now() };
        rpcEvents.push(row); requests.set(request, row); // Never read headers, bodies, keys or command arguments.
      });
      observe('undici:request:headers', ({ request, response }) => {
        const row = requests.get(request); if (row) { row.status = response.statusCode; row.headersAfterMs = Math.round(performance.now() - row.startedMs); }
      });
      observe('undici:request:error', ({ request, error }) => {
        const row = requests.get(request); if (row) { row.errorCode = error.code ?? error.name; row.failedAfterMs = Math.round(performance.now() - row.startedMs); }
      });
    }
    const runtimeLocks = () => ['.biblia-ai.lock', '.biblia-ai-operation.lock'].some(name => config.aiHome && fs.existsSync(path.join(config.aiHome, name)));
    const nativeChildren = async () => {
      assert.equal(process.platform, 'win32', 'This proof uses the admitted Windows runtime');
      const script = `@(Get-CimInstance Win32_Process -Filter "ParentProcessId = ${process.pid}" | Where-Object { $_.Name -eq 'llama-server.exe' } | Select-Object -ExpandProperty ProcessId) | ConvertTo-Json -Compress`;
      const { stdout } = await promisify(execFile)('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script], { windowsHide: true, encoding: 'utf8' });
      const result = stdout.trim() ? JSON.parse(stdout) : [];
      return Array.isArray(result) ? result : [result];
    };
    if (index) {
      assert.equal(runtimeLocks(), false, 'Native resources already owned; never remove another operation’s locks');
      const { SourceIndexingLibrary } = own('modules/ai-assistant/application/source-indexing-library.js');
      const result = await app.get(SourceIndexingLibrary).rebuild(new AbortController().signal);
      console.info(JSON.stringify({ component: 'native-workflows-index', result }));
    }
    await app.listen(32124, '127.0.0.1');
    const turns = [];
    app.getHttpServer().on('request', (request, response) => {
      if (request.method !== 'POST' || !/^\/conversations\/[a-f0-9-]+\/turns$/.test(request.url)) return;
      const entry = { completed: false, closed: false }; turns.push(entry);
      response.once('finish', () => { entry.completed = true; });
      response.once('close', () => { entry.closed = true; });
    });
    const owner = `browser-workflow-${randomUUID()}`;
    const tokens = new (own('infrastructure/access-token.js').LocalAccessTokens)(config.jwtSecret);
    return {
      owner, token: () => tokens.issue(owner), otherToken: () => tokens.issue(`other-${randomUUID()}`),
      turns, runtimeLocks, nativeChildren, rpcEvents,
      query: (sql, values) => database.client.$queryRawUnsafe(sql, ...values),
      close: async () => { try { await app.close(); } finally { stopTrace(); await database.onModuleDestroy(); process.chdir(previousDirectory); } },
    };
  } catch (error) {
    try { await app?.close(); } finally { stopTrace(); await database.onModuleDestroy(); process.chdir(previousDirectory); }
    throw error;
  }
};
