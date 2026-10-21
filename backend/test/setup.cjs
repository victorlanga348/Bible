const { existsSync, readFileSync } = require('node:fs');
if (existsSync('.env.test')) Object.assign(process.env, require('node:util').parseEnv(readFileSync('.env.test', 'utf8')));
process.env.NODE_ENV = 'test';
// Only this Jest environment's process object is guarded. A defective provider
// or mutant must fail its test instead of killing Stryker's worker. Real DB/HTTP
// implementations and subprocess launchers retain their own lifecycle behaviour.
process.exit = (code) => { throw new Error(`Unexpected process exit: ${code}`); };
process.abort = () => { throw new Error('Unexpected process abort'); };
