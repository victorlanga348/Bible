import { parseRuntimeConfig, assertTestTarget } from '../../src/config/runtime-config';

describe('runtime configuration', () => {
  const dev = { DATABASE_URL: 'postgresql://localhost/biblia_dev' };
  it('uses explicit local development defaults', () => {
    expect(parseRuntimeConfig(dev)).toEqual({ environment: 'development', port: 3000, databaseUrl: dev.DATABASE_URL });
  });
  it('accepts a configured port and postgres URL', () => {
    expect(parseRuntimeConfig({ ...dev, PORT: '4300', DATABASE_URL: 'postgres://localhost/biblia_dev' }).port).toBe(4300);
  });
  it.each(['0', '65536', '1.5', 'abc', ''])('rejects invalid port %s', (PORT) => {
    expect(() => parseRuntimeConfig({ ...dev, PORT })).toThrow('Invalid configuration');
  });
  it.each(['production', 'invalid'])('rejects unsupported environment %s', (NODE_ENV) => {
    expect(() => parseRuntimeConfig({ ...dev, NODE_ENV })).toThrow('Invalid configuration');
  });
  it.each([undefined, '', 'invalid', 'https://localhost/db', 'xpostgresql://localhost/db', 'postgresqlx://localhost/db', 'postgresql://localhost/'])('rejects invalid DB URL without exposing it', (DATABASE_URL) => {
    expect(() => parseRuntimeConfig({ DATABASE_URL })).toThrow('Invalid configuration: DATABASE_URL');
  });
  it('selects the dedicated test URL', () => {
    expect(parseRuntimeConfig({ ...dev, NODE_ENV: 'test', TEST_DATABASE_URL: 'postgresql://biblia_test@localhost/biblia_test' }).databaseUrl)
      .toBe('postgresql://biblia_test@localhost/biblia_test');
  });
  it('does not fall back to development for tests', () => {
    expect(() => parseRuntimeConfig({ ...dev, NODE_ENV: 'test' })).toThrow('Invalid configuration: TEST_DATABASE_URL');
  });
});

describe('destructive test target guard', () => {
  const target = { NODE_ENV: 'test', TEST_DATABASE_URL: 'postgresql://biblia_test@127.0.0.1:55433/biblia_test?schema=app' };
  it.each(['localhost', '127.0.0.1', '[::1]'])('accepts the isolated test target through %s', (host) => {
    const TEST_DATABASE_URL = `postgresql://biblia_test@${host}:55433/biblia_test?schema=app`;
    expect(assertTestTarget({ NODE_ENV: 'test', TEST_DATABASE_URL })).toBe(TEST_DATABASE_URL);
  });
  it('accepts the named CI service', () => {
    const TEST_DATABASE_URL = 'postgresql://biblia_test@postgres:5432/biblia_test?schema=app';
    expect(assertTestTarget({ NODE_ENV: 'test', TEST_DATABASE_URL })).toBe(TEST_DATABASE_URL);
  });
  it.each([
    { TEST_DATABASE_URL: 'postgresql://biblia_test@127.0.0.1/biblia_test?schema=app', DATABASE_URL: 'postgresql://biblia_dev@localhost:5432/biblia_test?schema=other' },
    { TEST_DATABASE_URL: 'postgresql://biblia_test@localhost:5432/biblia_test?schema=app', DATABASE_URL: 'postgresql://biblia_dev@127.0.0.1/biblia_test?schema=other' },
    { TEST_DATABASE_URL: 'postgresql://biblia_test@[::1]/biblia_test?schema=app', DATABASE_URL: 'postgresql://biblia_dev@localhost/biblia_test?schema=other' },
  ])('recognises loopback aliases and default ports as the same physical database', (input) => {
    expect(() => assertTestTarget({ NODE_ENV: 'test', ...input })).toThrow('Unsafe test database');
  });
  it.each([
    { DATABASE_URL: 'postgresql://biblia_dev@127.0.0.1:55433/biblia_dev' },
    { DATABASE_URL: 'postgresql://biblia_dev@127.0.0.1:55432/biblia_test' },
    { DATABASE_URL: 'postgresql://biblia_dev@postgres:55433/biblia_test' },
  ])('allows a distinct development database without weakening test target checks', (input) => {
    expect(assertTestTarget({ ...target, ...input })).toBe(target.TEST_DATABASE_URL);
  });
  it.each([
    { NODE_ENV: 'development' },
    { TEST_DATABASE_URL: 'postgresql://biblia_test@remote.example/biblia_test?schema=app' },
    { TEST_DATABASE_URL: 'postgresql://biblia_test@localhost/biblia_dev?schema=app' },
    { TEST_DATABASE_URL: 'postgresql://biblia_dev@localhost/biblia_test?schema=app' },
    { TEST_DATABASE_URL: 'postgresql://biblia_test@localhost/biblia_test?schema=public' },
    { TEST_DATABASE_URL: 'postgresql://biblia_test@localhost/biblia_test' },
    { DATABASE_URL: target.TEST_DATABASE_URL },
    { DATABASE_URL: 'postgresql://biblia_test@127.0.0.1:55433/biblia_test?schema=other' },
  ])('rejects an unsafe target before any connection', (override) => {
    expect(() => assertTestTarget({ ...target, ...override })).toThrow('Unsafe test database');
  });
});
