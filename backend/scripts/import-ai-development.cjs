require('reflect-metadata');
const { withDevelopmentDatabase, failed } = require('./development-operation.cjs');

async function run() {
  if (process.argv.length !== 2) throw new Error('This command accepts no path or purpose overrides');
  await withDevelopmentDatabase(async (_database, target) => {
    const { createApplication } = require('../dist/app.js');
    const { parseRuntimeConfig } = require('../dist/config/runtime-config.js');
    const { SourceLibrary } = require('../dist/modules/source-library/application/source-library.js');
    const { SourcePassageLinks } = require('../dist/modules/source-library/application/source-passage-links.js');
    const { admitAiSources } = require('../dist/operations/admit-ai-sources.js');
    const app = await createApplication(parseRuntimeConfig({ ...process.env, DATABASE_URL: target }));
    try {
      await app.init();
      const directory = 'admissions/josephus-antiquities-pg2848-en-local-ai-v1';
      const result = await admitAiSources(app.get(SourceLibrary), app.get(SourcePassageLinks), {
        source: 'data/source-library/josephus-antiquities-pg2848-en/source.html', manifest: `${directory}/manifest.json`, excerpts: `${directory}/excerpts.json`, notice: `${directory}/NOTICE.source.txt`,
      }, 'local-ai');
      console.info(JSON.stringify({ component: 'ai-development-source-admission', result }));
    } finally { await app.close(); }
  });
}
run().catch(failed);
