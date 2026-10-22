import { assertDevelopmentTarget } from '../../src/config/development-target';

describe('explicit guarded local development operations', () => {
  // Technical URLs only; no credentials copied from .env.
  const target = 'postgresql://local_operator@127.0.0.1:5432/bible_db?schema=app';
  it.each(['127.0.0.1', 'localhost', '[::1]'])('accepts explicit development and loopback host %s', host => {
    const value = target.replace('127.0.0.1', host);
    expect(assertDevelopmentTarget({ NODE_ENV: 'development', DATABASE_URL: value })).toBe(value);
  });
  it.each([
    {}, { NODE_ENV: 'test', DATABASE_URL: target }, { DATABASE_URL: target },
    { NODE_ENV: 'production', DATABASE_URL: target }, { NODE_ENV: 'development' },
    { NODE_ENV: 'development', DATABASE_URL: 'invalid' },
    ...['postgresql://user@remote.example/bible_db?schema=app', 'http://localhost/bible_db?schema=app',
      'postgresql://user@localhost/biblia_test?schema=app', 'postgresql://biblia_test@localhost/bible_db?schema=app',
      'postgresql://user@localhost/bible_db', 'postgresql://user@localhost/bible_db?schema=public',
      'postgresql://localhost/bible_db?schema=app', 'postgresql://user@localhost/?schema=app',
      'postgresql://user@localhost/bible_db?schema=app&schema=public', 'postgresql://user@localhost/bible_db?schema=app#fragment']
      .map(DATABASE_URL => ({ NODE_ENV: 'development', DATABASE_URL })),
  ])('rejects ambiguous, non-development, remote or test targets %j', environment => {
    expect(() => assertDevelopmentTarget(environment)).toThrow('Unsafe development database');
  });
});
