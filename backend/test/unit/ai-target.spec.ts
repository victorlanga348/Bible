import { resolve } from 'node:path';
import { assertAiDevelopmentTarget, assertAiTestTarget, parseAiRuntimeSettings } from '../../src/config/ai-target';
import { parseRuntimeConfig } from '../../src/config/runtime-config';

describe('guarded independent AI database targets; technical URLs only', () => {
  const development = 'postgresql://bible_ai_owner:technical@127.0.0.1:55436/bible_ai?schema=ai';
  const test = 'postgresql://biblia_test:technical@127.0.0.1:55433/biblia_test?schema=app';
  it.each(['127.0.0.1', 'localhost', '[::1]'])('accepts only the declared independent development identity on loopback %s', host => {
    const value = development.replace('127.0.0.1', host);
    expect(assertAiDevelopmentTarget({ NODE_ENV: 'development', BIBLE_AI_DATABASE_URL: value })).toBe(value);
  });
  it.each([
    {}, { NODE_ENV: 'test', BIBLE_AI_DATABASE_URL: development }, { NODE_ENV: 'production', BIBLE_AI_DATABASE_URL: development }, { BIBLE_AI_DATABASE_URL: development }, { NODE_ENV: 'development' },
    ...['invalid', 'https://localhost:55436/bible_ai?schema=ai', development.replace('127.0.0.1', 'remote.example'), development.replace('bible_ai_owner', 'biblia_test'), development.replace('/bible_ai?', '/bible_db?'), development.replace('/bible_ai?', '/biblia_test?'), development.replace('55436', '5432'), development.replace('bible_ai_owner', '%62ible_ai_owner'), development.replace('/bible_ai?', '/%62ible_ai?'), development.replace('schema=ai', 'schema=app'), development.replace('?schema=ai', ''), `${development}#fragment`, `${development}&schema=public`, `${development}&host=remote.example`, `${development}&options=-c%20search_path%3Dapp`, `${development}&user=biblia_test`, `${development}&port=5432`, `${development}&dbname=bible_db`].map(BIBLE_AI_DATABASE_URL => ({ NODE_ENV: 'development', BIBLE_AI_DATABASE_URL })),
  ])('rejects unsafe independent index target %j', input => {
    expect(() => assertAiDevelopmentTarget(input)).toThrow('Unsafe AI development database');
  });
  it('derives test schema only from the already guarded app target, never from a development AI override', () => {
    expect(assertAiTestTarget({ NODE_ENV: 'test', TEST_DATABASE_URL: test, BIBLE_AI_DATABASE_URL: development })).toBe(test.replace('schema=app', 'schema=ai'));
    expect(assertAiTestTarget({ NODE_ENV: 'test', TEST_DATABASE_URL: test.replace('55433', '57123') })).toContain(':57123/biblia_test?schema=ai');
  });
  it.each([{}, { NODE_ENV: 'development', TEST_DATABASE_URL: test }, { NODE_ENV: 'test' }, { NODE_ENV: 'test', TEST_DATABASE_URL: test.replace('biblia_test?', 'bible_db?') }, { NODE_ENV: 'test', TEST_DATABASE_URL: test.replace('127.0.0.1', 'remote.example') }, { NODE_ENV: 'test', TEST_DATABASE_URL: test + '&host=remote.example' }, { NODE_ENV: 'test', TEST_DATABASE_URL: test, DATABASE_URL: test.replace('127.0.0.1', 'localhost') }])('refuses an unsafe original test target %j', input => {
    expect(() => assertAiTestTarget(input)).toThrow('Unsafe AI test database');
  });
  it('sanitizes errors without reflecting a connection password or path', () => {
    expect(() => assertAiDevelopmentTarget({ NODE_ENV: 'development', BIBLE_AI_DATABASE_URL: 'postgresql://role:do-not-reflect-this@remote.example/db?schema=ai' })).toThrow(/^Unsafe AI development database$/);
  });
});

describe('optional trusted runtime settings, never supplied by HTTP', () => {
  const database = 'postgresql://local_operator:technical@localhost:5432/bible_db?schema=app';
  const ai = 'postgresql://bible_ai_owner:technical@127.0.0.1:55436/bible_ai?schema=ai';
  const home = resolve('reports/technical-ai-home');
  it('preserves optional absence and does not load a model implicitly', () => {
    expect(parseAiRuntimeSettings({ NODE_ENV: 'development' })).toEqual({});
    expect(parseRuntimeConfig({ DATABASE_URL: database })).toEqual({ environment: 'development', port: 3000, databaseUrl: database });
  });
  it('preserves a trusted absolute home and guarded development URL', () => {
    expect(parseAiRuntimeSettings({ NODE_ENV: 'development', BIBLE_AI_HOME: home, BIBLE_AI_DATABASE_URL: ai })).toEqual({ aiHome: home, aiDatabaseUrl: ai });
    expect(parseRuntimeConfig({ DATABASE_URL: database, BIBLE_AI_HOME: home, BIBLE_AI_DATABASE_URL: ai })).toEqual({ environment: 'development', port: 3000, databaseUrl: database, aiHome: home, aiDatabaseUrl: ai });
  });
  it('allows configuring runtime home or independent index separately', () => {
    expect(parseAiRuntimeSettings({ NODE_ENV: 'development', BIBLE_AI_HOME: home })).toEqual({ aiHome: home });
    expect(parseAiRuntimeSettings({ NODE_ENV: 'development', BIBLE_AI_DATABASE_URL: ai })).toEqual({ aiDatabaseUrl: ai });
  });
  it('always derives the test URL when optional AI configuration is enabled in test', () => {
    const testUrl = 'postgresql://biblia_test:technical@localhost:55433/biblia_test?schema=app';
    const parsed = parseRuntimeConfig({ NODE_ENV: 'test', TEST_DATABASE_URL: testUrl, BIBLE_AI_DATABASE_URL: ai, BIBLE_AI_HOME: home });
    expect(parsed.aiDatabaseUrl).toBe(testUrl.replace('schema=app', 'schema=ai')); expect(parsed.aiHome).toBe(home);
  });
  it.each(['', ' ', './relative', '../parent', '\ud800', null, 1])('rejects unsafe or ambiguous runtime home %p', BIBLE_AI_HOME => {
    expect(() => parseAiRuntimeSettings({ NODE_ENV: 'development', BIBLE_AI_HOME } as NodeJS.ProcessEnv)).toThrow('Invalid configuration: BIBLE_AI_HOME');
  });
  it('does not trim trusted paths or accept an empty explicitly configured URL', () => {
    expect(() => parseAiRuntimeSettings({ NODE_ENV: 'development', BIBLE_AI_HOME: `${home} ` })).toThrow('Invalid configuration: BIBLE_AI_HOME');
    expect(() => parseAiRuntimeSettings({ NODE_ENV: 'development', BIBLE_AI_DATABASE_URL: '' })).toThrow('Unsafe AI development database');
  });
});
