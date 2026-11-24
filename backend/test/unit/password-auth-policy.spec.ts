import type { Database } from '../../src/infrastructure/database';
import { LocalAccessTokens } from '../../src/infrastructure/access-token';
import { PasswordAuthService } from '../../src/infrastructure/password-auth';

// Explicit persistence failure doubles isolate overload/clock and failure paths.
// Real account persistence, hashing and HTTP are covered by password-auth e2e.
const input = { email: 'technical@example.test', password: 'Uma palavra-passe segura!' };
const tokens = new LocalAccessTokens('test-password-auth-signing-key-at-least-32-bytes');
const unavailable = new Error('controlled-storage-failure');
function failureDatabase(error: unknown = unavailable) {
  const create = jest.fn(async () => { throw error; });
  const findUnique = jest.fn(async () => { throw error; });
  return { database: { client: { passwordAccount: { create, findUnique } } } as unknown as Database, create, findUnique };
}

describe('bounded account authentication under failure and overload', () => {
  it('fails closed without signing configuration before touching persistence', async () => {
    const { database, create, findUnique } = failureDatabase();
    const service = new PasswordAuthService(database, tokens, false);
    await expect(service.authenticate('register', input, '127.0.0.1')).rejects.toMatchObject({ status: 503, code: 'ACCOUNT_AUTH_UNAVAILABLE' });
    expect(create).not.toHaveBeenCalled(); expect(findUnique).not.toHaveBeenCalled();
  });
  it('counts failed requests, enforces exactly ten attempts and resets only at expiry', async () => {
    const { database, findUnique } = failureDatabase(); let now = 0;
    const service = new PasswordAuthService(database, tokens, true, () => now);
    for (let count = 0; count < 10; count++) {
      now = count * 1000;
      await expect(service.authenticate('login', input, 'ip-a')).rejects.toBe(unavailable);
    }
    now = 899999;
    await expect(service.authenticate('login', input, 'ip-a')).rejects.toMatchObject({ status: 429, code: 'AUTH_RATE_LIMITED' });
    expect(findUnique).toHaveBeenCalledTimes(10);
    await expect(service.authenticate('login', input, 'ip-b')).rejects.toBe(unavailable);
    now = 900000;
    await expect(service.authenticate('login', input, 'ip-a')).rejects.toBe(unavailable);
    expect(findUnique).toHaveBeenCalledTimes(12);
  });
  it('bounds IP cardinality without evicting existing counters and admits new IPs after expiry', async () => {
    const { database, findUnique } = failureDatabase(); let now = 0;
    const service = new PasswordAuthService(database, tokens, true, () => now);
    for (let index = 0; index < 1024; index++) await expect(service.authenticate('login', input, `ip-${index}`)).rejects.toBe(unavailable);
    await expect(service.authenticate('login', input, 'new-ip')).rejects.toMatchObject({ status: 429 });
    await expect(service.authenticate('login', input, 'ip-0')).rejects.toBe(unavailable);
    expect(findUnique).toHaveBeenCalledTimes(1025);
    now = 900000;
    await expect(service.authenticate('login', input, 'new-ip')).rejects.toBe(unavailable);
  });
  it('allows two simultaneous operations, rejects excess immediately and releases failed slots', async () => {
    const { database, findUnique } = failureDatabase();
    let fail!: (error: Error) => void;
    const pending = new Promise<never>((_resolve, reject) => { fail = reject; });
    findUnique.mockImplementation(() => pending);
    const service = new PasswordAuthService(database, tokens, true);
    const first = service.authenticate('login', input, 'ip-a');
    const second = service.authenticate('login', input, 'ip-b');
    await expect(service.authenticate('login', input, 'ip-c')).rejects.toMatchObject({ status: 429 });
    fail(unavailable);
    expect(await Promise.allSettled([first, second])).toEqual([{ status: 'rejected', reason: unavailable }, { status: 'rejected', reason: unavailable }]);
    findUnique.mockImplementation(async () => { throw unavailable; });
    await expect(service.authenticate('login', input, 'ip-c')).rejects.toBe(unavailable);
  });
  it('checks actual signing availability before storing a new account', async () => {
    const { database, create } = failureDatabase();
    const service = new PasswordAuthService(database, new LocalAccessTokens(), true);
    await expect(service.authenticate('register', input, 'ip')).rejects.toThrow('Autenticação necessária.');
    expect(create).not.toHaveBeenCalled();
  });
  it.each([new Error('internal-only'), null, { code: 'OTHER' }])('preserves unexpected storage failures for the sanitized HTTP error handler', async error => {
    const { database } = failureDatabase(error);
    const service = new PasswordAuthService(database, tokens, true);
    await expect(service.authenticate('register', input, 'ip')).rejects.toBe(error);
  });
});
