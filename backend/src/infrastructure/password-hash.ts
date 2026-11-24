import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error); else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt-v1$${salt.toString('hex')}$${key.toString('hex')}`;
}

// Missing accounts still pay the same scrypt cost as incorrect passwords.
export const dummyPasswordHash = `scrypt-v1$${'00'.repeat(16)}$${'00'.repeat(64)}`;
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!/^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(hash)) return false;
  const [, salt, expected] = hash.split('$');
  const actual = await derive(password, Buffer.from(salt!, 'hex'));
  return timingSafeEqual(actual, Buffer.from(expected!, 'hex'));
}
