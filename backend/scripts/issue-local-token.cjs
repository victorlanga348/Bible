const { LocalAccessTokens } = require('../dist/infrastructure/access-token.js');

async function issue() {
  const args = process.argv.slice(2);
  if (args.length !== 1) throw new Error('One subject required');
  // Deliberate operator output only: never call this from the public HTTP API.
  console.log(await new LocalAccessTokens(process.env.jwtSecret).issue(args[0]));
}
issue().catch(() => { console.error('Local token issuance failed.'); process.exitCode = 1; });
