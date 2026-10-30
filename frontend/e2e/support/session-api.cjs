// Controlled native test composition. Technical RSA keys never replace Google's in production.
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { parseEnv } = require('node:util');
const { randomBytes } = require('node:crypto');
const backend = path.resolve(__dirname, '../../../backend');
const dependency = createRequire(path.join(backend, 'package.json'));
const own = name => dependency(path.join(backend, 'dist', name));
dependency('reflect-metadata');

exports.startSessionApi = async function startSessionApi() {
  const previousDirectory = process.cwd();
  process.chdir(backend); // Production admissions are resolved from the backend working directory.
  const { parseRuntimeConfig, assertTestTarget } = own('config/runtime-config.js');
  const env = { ...process.env, ...parseEnv(fs.readFileSync(path.join(backend, '.env.test'), 'utf8')), NODE_ENV: 'test', PORT: '32123',
    GOOGLE_CLIENT_ID: '123456789012-protocoltest.apps.googleusercontent.com', jwtSecret: randomBytes(40).toString('base64url') };
  const databaseUrl = assertTestTarget(env);
  const { Database } = own('infrastructure/database.js');
  const database = new Database(databaseUrl);
  let app;
  try {
    assert.deepEqual(await database.client.$queryRawUnsafe('SELECT current_database() AS db, current_user AS role'), [{ db: 'biblia_test', role: 'biblia_test' }]);
    const { Test } = dependency('@nestjs/testing');
    const { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } = dependency('jose');
    const pair = await generateKeyPair('RS256', { extractable: true });
    const config = parseRuntimeConfig(env);
    const { GoogleIdentityVerifier } = own('infrastructure/google-identity.js');
    const identity = new GoogleIdentityVerifier(config.googleClientId,
      createLocalJWKSet({ keys: [{ ...await exportJWK(pair.publicKey), kid: 'browser-protocol-one', alg: 'RS256', use: 'sig' }] }));
    const module = await Test.createTestingModule({
      controllers: [own('presentation/health.controller.js').HealthController],
      imports: [
        own('infrastructure/database.module.js').DatabaseModule.register(config.databaseUrl),
        own('infrastructure/access.module.js').AccessModule.register(config.jwtSecret),
        own('infrastructure/google-auth.module.js').GoogleAuthModule.register(config),
        own('modules/biblical-canon/module.js').BiblicalCanonModule,
        own('modules/source-library/module.js').SourceLibraryModule,
        own('modules/study/module.js').StudyModule,
        own('modules/study-workspace/module.js').WorkspaceModule.register(config),
        own('modules/cross-references/module.js').CrossReferencesModule,
      ],
    }).overrideProvider(GoogleIdentityVerifier).useValue(identity).compile();
    app = module.createNestApplication({ logger: false });
    own('app.js').configureTransport(app);
    // Preserve real behavior; expose only safe error codes if a native PG read fails.
    const studies = app.get(own('modules/study/application/study-library.js').StudyLibrary);
    const list = studies.list.bind(studies);
    studies.list = async (...args) => {
      try { return await list(...args); }
      catch (error) {
        const chain = [];
        for (let item = error; item; item = item.cause ?? item.meta?.driverAdapterError?.cause) {
          chain.push({ name: item.name, code: item.code, kind: item.kind, originalCode: item.originalCode });
        }
        console.info(JSON.stringify({ component: 'native-test-study-read', chain }));
        throw error;
      }
    };
    await app.init(); await app.listen(32123, '127.0.0.1');
    return {
      sign: async nonce => {
        const now = Math.floor(Date.now() / 1000);
        return new SignJWT({ sub: 'browser-protocol-sub-a', iss: 'https://accounts.google.com', aud: config.googleClientId, iat: now, exp: now + 3600, nonce })
          .setProtectedHeader({ alg: 'RS256', kid: 'browser-protocol-one' }).sign(pair.privateKey);
      },
      manualToken: () => new (own('infrastructure/access-token.js').LocalAccessTokens)(config.jwtSecret).issue('browser-protocol-owner-b'),
      close: async () => { try { await app.close(); } finally { await database.onModuleDestroy(); process.chdir(previousDirectory); } },
    };
  } catch (error) { try { await app?.close(); } finally { await database.onModuleDestroy(); process.chdir(previousDirectory); } throw error; }
};
