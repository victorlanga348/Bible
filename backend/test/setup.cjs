const { existsSync, readFileSync } = require('node:fs');
if (existsSync('.env.test')) Object.assign(process.env, require('node:util').parseEnv(readFileSync('.env.test', 'utf8')));
process.env.NODE_ENV = 'test';
