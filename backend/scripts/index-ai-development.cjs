require('reflect-metadata');
const { withDevelopmentDatabase, failed } = require('./development-operation.cjs');

async function run() {
  if (process.argv.length !== 2) throw new Error('This command accepts no model or path overrides');
  await withDevelopmentDatabase(async (_database, target) => {
    const { createApplication } = require('../dist/app.js');
    const { parseRuntimeConfig } = require('../dist/config/runtime-config.js');
    const { SourceIndexingLibrary } = require('../dist/modules/ai-assistant/application/source-indexing-library.js');
    const config = parseRuntimeConfig({ ...process.env, DATABASE_URL: target });
    if (!config.aiHome || !config.aiDatabaseUrl) throw new Error('Local AI runtime configuration required');
    const app = await createApplication(config); const controller = new globalThis.AbortController(); const abort = () => controller.abort();
    process.once('SIGINT', abort); process.once('SIGTERM', abort);
    try { await app.init(); const result = await app.get(SourceIndexingLibrary).rebuild(controller.signal); console.info(JSON.stringify({ component: 'ai-development-index', result })); }
    finally { process.removeListener('SIGINT', abort); process.removeListener('SIGTERM', abort); await app.close(); }
  });
}
run().catch(failed);
