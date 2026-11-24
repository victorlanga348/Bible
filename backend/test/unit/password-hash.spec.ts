import { scryptSync } from 'node:crypto';
import { dummyPasswordHash, hashPassword, verifyPassword } from '../../src/infrastructure/password-hash';

describe('real scrypt password protection', () => {
  const password = '  Uma frase segura: Bíblia!  ';
  it('rejects a cryptographic provider failure instead of accepting an incomplete key', async () => {
    // Explicit provider failure double; other cases exercise real scrypt.
    const cryptography = jest.requireActual<typeof import('node:crypto')>('node:crypto');
    const failure = new Error('controlled-crypto-failure');
    const provider = jest.spyOn(cryptography, 'scrypt').mockImplementation((...args: unknown[]) => {
      const callback = args.at(-1) as (error: Error, key: Buffer) => void;
      callback(failure, Buffer.alloc(0));
    });
    try { await expect(hashPassword(password)).rejects.toBe(failure); }
    finally { provider.mockRestore(); }
  });
  it('uses distinct random salts and interoperable memory-hard password hashes', async () => {
    const first = await hashPassword(password), second = await hashPassword(password);
    expect(first).not.toBe(second);
    expect(first).toMatch(/^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
    const [, salt, key] = first.split('$');
    const independent = scryptSync(password, Buffer.from(salt!, 'hex'), 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 });
    expect(independent.toString('hex')).toBe(key);
    await expect(verifyPassword(password, first)).resolves.toBe(true);
    await expect(verifyPassword(password.trim(), first)).resolves.toBe(false);
    await expect(verifyPassword('Palavra-passe errada', first)).resolves.toBe(false);
    await expect(verifyPassword(password, dummyPasswordHash)).resolves.toBe(false);
  });
  it.each(['', 'scrypt-v2$' + '00'.repeat(16) + '$' + '00'.repeat(64),
    'prefix' + dummyPasswordHash, dummyPasswordHash + 'suffix',
    dummyPasswordHash.replace('scrypt-v1$', 'scrypt-v1$gg'),
    'scrypt-v1$' + '0'.repeat(31) + '$' + '0'.repeat(128),
    'scrypt-v1$' + '0'.repeat(33) + '$' + '0'.repeat(128),
    'scrypt-v1$' + '0'.repeat(32) + '$' + '0'.repeat(127),
    'scrypt-v1$' + '0'.repeat(32) + '$' + '0'.repeat(129),
  ])('rejects corrupted or unsupported stored hashes safely: %s', async hash => {
    await expect(verifyPassword(password, hash)).resolves.toBe(false);
  });
});
