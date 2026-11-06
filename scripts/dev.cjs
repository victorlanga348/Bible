const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { spawn, execFile } = require('node:child_process');
const { promisify } = require('node:util');
const execute = promisify(execFile);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

function assertDevelopmentConfig(config) {
  const target = new URL(config.databaseUrl);
  assert.equal(config.environment, 'development');
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(target.hostname));
  assert.equal(target.port || '5432', '5432');
  assert.equal(target.pathname, '/bible_db');
  assert.ok(config.jwtSecret && config.googleClientId && config.aiHome && config.aiDatabaseUrl);
  assert.notEqual(config.port, 5173);
}
function assertAiContainer(container) {
  assert.equal(container.Name, '/biblia-ai-index-development');
  assert.equal(container.Config.Labels['com.biblia.owner'], 'ai-assistant');
  assert.equal(container.Config.Labels['com.biblia.target'], 'development-index');
  assert.ok(container.Config.Env.includes('POSTGRES_DB=bible_ai'));
  assert.ok(container.Config.Env.includes('POSTGRES_USER=bible_ai_owner'));
  assert.deepEqual(container.HostConfig.PortBindings, { '5432/tcp': [{ HostIp: '127.0.0.1', HostPort: '55436' }] });
}
async function launchDevelopment(io) {
  try {
    for (const stage of ['buildBackend', 'loadConfig', 'ensurePorts', 'ensurePostgres', 'ensureAiContainer', 'verifyAi', 'startBackend', 'waitForApi', 'startTypeScriptWatch', 'startFrontend', 'waitForProxy']) {
      io.stage = stage;
      await io[stage]();
      if (stage === 'loadConfig') assertDevelopmentConfig(io.config);
    }
    io.ready();
  } catch (error) { await io.stopChildren(); throw error; }
}

function createRuntime(root) {
  const backend = path.join(root, 'backend'), frontend = path.join(root, 'frontend');
  const children = new Set(), intentional = new WeakSet();
  let stopping = false, watcher, restartTimer, api, restart = Promise.resolve();
  const io = { stage: 'buildBackend' };
  const command = (file, args) => execute(file, args, { windowsHide: true, timeout: 10000, maxBuffer: 1024 * 1024 });
  async function stopChild(child) {
    if (child.exitCode !== null || child.signalCode !== null) return;
    intentional.add(child);
    await new Promise(resolve => {
      const timer = setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 5000);
      child.once('exit', () => { clearTimeout(timer); resolve(); });
      child.kill();
    });
  }
  io.stopChildren = async () => {
    stopping = true; clearTimeout(restartTimer); watcher?.close();
    await Promise.all([...children].map(stopChild));
  };
  function start(args, cwd, env = process.env, persistent = true) {
    const child = spawn(process.execPath, args, { cwd, env, windowsHide: true, stdio: 'inherit' });
    children.add(child);
    child.on('error', () => { console.error('Falha ao iniciar um processo da aplicação.'); void io.stopChildren(); process.exitCode = 1; });
    child.on('exit', code => {
      children.delete(child);
      if (persistent && !stopping && !intentional.has(child)) {
        console.error(`Um processo da aplicação terminou (${code ?? 'sinal'}).`);
        void io.stopChildren(); process.exitCode = 1;
      }
    });
    return child;
  }
  async function waitUntil(check, timeout) {
    const deadline = Date.now() + timeout;
    do { if (stopping) throw new Error('Stopped'); if (await check()) return; await pause(1000); } while (Date.now() < deadline);
    throw new Error('Readiness timeout');
  }
  async function healthy(url) {
    try { const r = await fetch(url, { signal: AbortSignal.timeout(3000) }); const body = await r.json(); return r.ok && body.status === 'ok' && body.database === 'up'; } catch { return false; }
  }
  io.buildBackend = async () => {
    console.log('A compilar o backend…');
    const child = start(['node_modules/typescript/bin/tsc', '-p', 'tsconfig.build.json'], backend, process.env, false);
    await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', code => code === 0 ? resolve() : reject(new Error('Build failed'))); });
  };
  io.loadConfig = () => {
    process.chdir(backend);
    const envFile = path.join(backend, '.env');
    if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
    io.config = require(path.join(backend, 'dist/config/runtime-config.js')).parseRuntimeConfig(process.env);
  };
  io.ensurePorts = async () => {
    for (const port of [io.config.port, 5173]) {
      const server = net.createServer();
      await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
      await new Promise(resolve => server.close(resolve));
    }
  };
  io.ensurePostgres = async () => {
    console.log('A verificar PostgreSQL local…');
    const { Client } = require(path.join(backend, 'node_modules/pg'));
    const probe = async () => {
      const client = new Client({ connectionString: io.config.databaseUrl, connectionTimeoutMillis: 2000, query_timeout: 3000 });
      try { await client.connect(); const { rows } = await client.query('SELECT current_database() AS name'); assert.equal(rows[0].name, 'bible_db'); } finally { await client.end(); }
    };
    try { await probe(); }
    catch (error) {
      if (process.platform !== 'win32' || !(error.code === 'ECONNREFUSED' || error.errors?.some(item => item.code === 'ECONNREFUSED'))) throw error;
      await command('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', "Start-Service -Name 'postgresql-x64-16' -ErrorAction Stop"]);
      await waitUntil(async () => { try { await probe(); return true; } catch { return false; } }, 30000);
    }
  };
  io.ensureAiContainer = async () => {
    console.log('A verificar o índice de IA local…');
    const engineReady = async () => { try { await command('docker', ['info', '--format', '{{.ServerVersion}}']); return true; } catch { return false; } };
    if (!await engineReady()) {
      const desktop = 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe';
      assert.ok(process.platform === 'win32' && fs.existsSync(desktop));
      await command('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', "Start-Process -FilePath 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe' -WindowStyle Hidden"]);
      await waitUntil(engineReady, 180000);
    }
    const { stdout } = await command('docker', ['inspect', 'biblia-ai-index-development']);
    const [container] = JSON.parse(stdout);
    assertAiContainer(container);
    if (!container.State.Running) await command('docker', ['start', 'biblia-ai-index-development']);
  };
  io.verifyAi = async () => {
    console.log('A verificar os artefactos e o índice admitidos de IA (sem inferência)…');
    const from = file => require(path.join(backend, 'dist/modules/ai-assistant/infrastructure', file));
    const { readPinnedRuntimeProfile, VerifiedRuntimeArtifacts } = from('runtime-artifacts.js');
    const profile = await readPinnedRuntimeProfile('admissions/local-extractive-v1.json');
    const artifacts = new VerifiedRuntimeArtifacts(profile, io.config.aiHome);
    await artifacts.verify('generation'); await artifacts.verify('embedding');
    const policy = await from('source-policy.js').readAiSourcePolicy({ manifest: 'admissions/josephus-antiquities-pg2848-en-local-ai-v1/manifest.json', excerpts: 'admissions/josephus-antiquities-pg2848-en-local-ai-v1/excerpts.json' }, 'local-ai');
    const database = new (from('index-database.js').AiIndexDatabase)(io.config.aiDatabaseUrl);
    try {
      const index = new (from('prisma-vector-index.js').PrismaVectorIndex)(database);
      await waitUntil(() => index.readiness(policy.indexProfile).catch(() => false), 30000);
    } finally { await database.onModuleDestroy(); }
  };
  io.startBackend = () => { api = start(['--env-file-if-exists=.env', 'scripts/start.cjs'], backend); };
  io.waitForApi = () => waitUntil(() => healthy(`http://127.0.0.1:${io.config.port}/health/ready`), 60000);
  io.startTypeScriptWatch = () => {
    start(['node_modules/typescript/bin/tsc', '-p', 'tsconfig.build.json', '--watch', '--preserveWatchOutput'], backend);
    watcher = fs.watch(path.join(backend, 'dist'), { recursive: true }, () => {
      clearTimeout(restartTimer);
      restartTimer = setTimeout(() => {
        restart = restart.then(async () => { if (stopping) return; await stopChild(api); if (!stopping) io.startBackend(); });
        restart.catch(() => { console.error('Falha ao reiniciar a API após compilação.'); void io.stopChildren(); process.exitCode = 1; });
      }, 500);
    });
  };
  io.startFrontend = () => { start(['node_modules/vite/bin/vite.js'], frontend, { ...process.env, BIBLE_API_PROXY_TARGET: `http://127.0.0.1:${io.config.port}` }); };
  io.waitForProxy = () => waitUntil(() => healthy('http://127.0.0.1:5173/api/health/ready'), 60000);
  io.ready = () => console.log('\nBíblia App pronta: http://127.0.0.1:5173\nAPI, PostgreSQL, Google e IA local configurados. Login Google pessoal requer o teu consentimento.\nFrontend com HMR; backend recompila/reinicia automaticamente. Ctrl+C encerra só esta aplicação.\n');
  return io;
}

if (require.main === module) {
  const io = createRuntime(path.resolve(__dirname, '..'));
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void io.stopChildren().then(() => { process.exitCode = 0; }); });
  launchDevelopment(io).catch(() => {
    console.error(`Arranque interrompido na etapa ${io.stage}. Consulta docs/operations/DEV_STARTUP.md; não alteres passwords nem bases por tentativa.`);
    process.exitCode = 1;
  });
}
module.exports = { launchDevelopment, assertDevelopmentConfig, assertAiContainer };
