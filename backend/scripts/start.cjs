const { parseRuntimeConfig } = require('../dist/config/runtime-config.js');
const { startApplication } = require('../dist/main.js');

Promise.resolve().then(() => parseRuntimeConfig(process.env)).then(startApplication).catch(() => {
  console.error(JSON.stringify({ component: 'startup', code: 'STARTUP_FAILED' }));
  process.exitCode = 1;
});
