const { assertDevelopmentTarget } = require('../dist/config/development-target.js');
const { Database } = require('../dist/infrastructure/database.js');
const { verifyDatabaseIdentity } = require('../dist/infrastructure/verify-database-identity.js');

async function withDevelopmentDatabase(operation) {
  const target = assertDevelopmentTarget(process.env);
  const database = new Database(target);
  try { await verifyDatabaseIdentity(database, target); return await operation(database, target); }
  finally { await database.onModuleDestroy(); }
}
function failed() {
  console.error('Development operation refused or failed; verify local configuration and admitted artefacts.');
  process.exitCode = 1;
}
module.exports = { withDevelopmentDatabase, failed };
