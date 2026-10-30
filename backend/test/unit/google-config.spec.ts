import { parseRuntimeConfig } from '../../src/config/runtime-config';

const base = { NODE_ENV: 'development', DATABASE_URL: 'postgresql://config-protocol@localhost:5432/config_protocol?schema=app' };
const client = '123456789012-protocoltest.apps.googleusercontent.com';
const key = 'protocol-secret-not-a-real-deployment-key-12345';
describe('optional Google web client configuration', () => {
  it('retains the configured client ID for server-side audience verification', () => {
    expect(parseRuntimeConfig({ ...base, jwtSecret: key, GOOGLE_CLIENT_ID: client })).toHaveProperty('googleClientId', client);
  });
  it('keeps Google unconfigured when the setting is absent or empty', () => {
    expect(parseRuntimeConfig(base)).not.toHaveProperty('googleClientId');
    expect(parseRuntimeConfig({ ...base, GOOGLE_CLIENT_ID: '' })).not.toHaveProperty('googleClientId');
  });
  it.each(['wrong', ' client.apps.googleusercontent.com', `${client}\n`, 'https://evil.example/client', 'x'.repeat(257)])('rejects a malformed client without echoing it', value => {
    expect(() => parseRuntimeConfig({ ...base, jwtSecret: key, GOOGLE_CLIENT_ID: value })).toThrow('Invalid configuration: GOOGLE_CLIENT_ID');
  });
  it('requires the local signing secret before enabling Google login', () => {
    expect(() => parseRuntimeConfig({ ...base, GOOGLE_CLIENT_ID: client })).toThrow('Invalid configuration: jwtSecret');
  });
});
