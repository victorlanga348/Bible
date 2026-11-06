const { test } = require('node:test');
const assert = require('node:assert/strict');
const { launchDevelopment, assertDevelopmentConfig, assertAiContainer } = require('./dev.cjs');

const config = { environment: 'development', port: 3000, databaseUrl: 'postgresql://local:technical@localhost:5432/bible_db', jwtSecret: 'technical-test-double'.repeat(3), googleClientId: 'configured', aiHome: 'configured', aiDatabaseUrl: 'configured' };
function container() {
  return { Name: '/biblia-ai-index-development', Config: { Labels: { 'com.biblia.owner': 'ai-assistant', 'com.biblia.target': 'development-index' }, Env: ['POSTGRES_DB=bible_ai', 'POSTGRES_USER=bible_ai_owner'] }, HostConfig: { PortBindings: { '5432/tcp': [{ HostIp: '127.0.0.1', HostPort: '55436' }] } } };
}
test('development target keeps the existing local database and all configured integrations', () => {
  assert.doesNotThrow(() => assertDevelopmentConfig(config));
  for (const patch of [{ environment: 'test' }, { databaseUrl: 'postgresql://local:technical@remote:5432/bible_db' }, { databaseUrl: 'postgresql://local:technical@localhost:5432/biblia_test' }, { googleClientId: undefined }, { jwtSecret: undefined }, { aiHome: undefined }, { aiDatabaseUrl: undefined }, { port: 5173 }]) {
    assert.throws(() => assertDevelopmentConfig({ ...config, ...patch }));
  }
});
test('only the existing labelled AI container with a private binding may be started', () => {
  assert.doesNotThrow(() => assertAiContainer(container()));
  for (const mutate of [c => c.Name = '/other', c => c.Config.Labels = {}, c => c.Config.Env = ['POSTGRES_DB=other', 'POSTGRES_USER=bible_ai_owner'], c => c.HostConfig.PortBindings['5432/tcp'][0].HostIp = '0.0.0.0', c => c.HostConfig.PortBindings['5432/tcp'].push({ HostIp: '::', HostPort: '55436' })]) {
    const c = container(); mutate(c); assert.throws(() => assertAiContainer(c));
  }
});
function harness(failingStage) {
  const calls = [];
  const io = { config, stage: '', ready() { calls.push('ready'); } };
  for (const name of ['buildBackend', 'loadConfig', 'ensurePorts', 'ensurePostgres', 'ensureAiContainer', 'verifyAi', 'startBackend', 'waitForApi', 'startTypeScriptWatch', 'startFrontend', 'waitForProxy', 'stopChildren']) {
    io[name] = async () => { calls.push(name); if (name === failingStage) throw new Error('technical failure'); return name === 'loadConfig' ? config : undefined; };
  }
  return { io, calls };
}
test('announces ready only after real API and frontend proxy readiness steps', async () => {
  const { io, calls } = harness();
  await launchDevelopment(io);
  assert.deepEqual(calls, ['buildBackend', 'loadConfig', 'ensurePorts', 'ensurePostgres', 'ensureAiContainer', 'verifyAi', 'startBackend', 'waitForApi', 'startTypeScriptWatch', 'startFrontend', 'waitForProxy', 'ready']);
});
for (const stage of ['ensurePorts', 'ensurePostgres', 'ensureAiContainer', 'verifyAi', 'waitForApi', 'waitForProxy']) {
  test(`failure at ${stage} stops own processes and never reports ready`, async () => {
    const { io, calls } = harness(stage);
    await assert.rejects(launchDevelopment(io), /technical failure/);
    assert.equal(calls.at(-1), 'stopChildren');
    assert.equal(calls.includes('ready'), false);
    if (['ensurePorts', 'ensurePostgres', 'ensureAiContainer', 'verifyAi'].includes(stage)) assert.equal(calls.includes('startBackend'), false);
    if (stage === 'waitForApi') assert.equal(calls.includes('startFrontend'), false);
    assert.equal(io.stage, stage);
  });
}
