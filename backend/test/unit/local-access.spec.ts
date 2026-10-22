import { randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify, decodeProtectedHeader } from 'jose';
import { LocalAccessTokens, AuthenticationError } from '../../src/infrastructure/access-token';
import { parseRuntimeConfig } from '../../src/config/runtime-config';

const secret = randomBytes(48).toString('base64url');
const key = new TextEncoder().encode(secret);
const instant = new Date('2026-10-22T12:00:00.000Z');
const seconds = instant.getTime() / 1000;
async function signed(claims: Record<string, unknown> = {}, header: Record<string, unknown> = {}) {
  return new SignJWT({ sub: 'owner-a', iss: 'biblia-local', aud: 'biblia-backend', iat: seconds, exp: seconds + 3600, ...claims })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT', ...header }).sign(key);
}

describe('real local JWT signing and server-side verification', () => {
  it('issues independently verifiable HS256 JWT claims for one hour', async () => {
    const service = new LocalAccessTokens(secret, () => instant);
    const token = await service.issue('Owner.A_1');
    const result = await jwtVerify(token, key, { algorithms: ['HS256'], issuer: 'biblia-local', audience: 'biblia-backend', currentDate: instant });
    expect(result.payload).toEqual({ sub: 'Owner.A_1', iss: 'biblia-local', aud: 'biblia-backend', iat: seconds, exp: seconds + 3600 });
    expect(decodeProtectedHeader(token)).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(await service.verify(token)).toBe('Owner.A_1');
  });
  it('accepts a real externally constructed token, proving verification separately from issuance', async () => {
    expect(await new LocalAccessTokens(secret, () => instant).verify(await signed())).toBe('owner-a');
  });
  it.each([
    ['missing issuer', { iss: undefined }], ['wrong issuer', { iss: 'another-issuer' }], ['missing audience', { aud: undefined }],
    ['wrong audience', { aud: 'another-audience' }], ['multiple audiences', { aud: ['biblia-backend', 'another-audience'] }],
    ['missing subject', { sub: undefined }], ['blank subject', { sub: '' }], ['non-string subject', { sub: 12 }],
    ['subject with whitespace', { sub: 'owner a' }], ['subject ending newline', { sub: 'owner-a\n' }], ['oversized subject', { sub: 'a'.repeat(65) }],
    ['missing expiry', { exp: undefined }], ['missing issued-at', { iat: undefined }], ['future issued-at', { iat: seconds + 1 }],
    ['expired', { iat: seconds - 3600, exp: seconds }], ['excess lifetime', { exp: seconds + 3601 }],
    ['zero lifetime', { exp: seconds }], ['fractional expiry', { exp: seconds + 3599.5 }], ['fractional issued-at', { iat: seconds - 0.5 }],
  ])('rejects %s despite an authentic signature', async (_label, claims) => {
    await expect(new LocalAccessTokens(secret, () => instant).verify(await signed(claims as Record<string, unknown>))).rejects.toThrow(AuthenticationError);
  });
  it.each([['unexpected algorithm', { alg: 'HS512' }], ['wrong type', { typ: 'another-type' }], ['missing type', { typ: undefined }]])('rejects %s with the same real signing key', async (_label, header) => {
    await expect(new LocalAccessTokens(secret, () => instant).verify(await signed({}, header as Record<string, unknown>))).rejects.toThrow(AuthenticationError);
  });
  it('rejects another genuine key, a modified signature and malformed compact tokens', async () => {
    const token = await signed();
    await expect(new LocalAccessTokens(randomBytes(48).toString('base64url'), () => instant).verify(token)).rejects.toThrow(AuthenticationError);
    const parts = token.split('.'); parts[2] = (parts[2]!.startsWith('A') ? 'B' : 'A') + parts[2]!.slice(1);
    await expect(new LocalAccessTokens(secret, () => instant).verify(parts.join('.'))).rejects.toThrow(AuthenticationError);
    for (const malformed of ['', 'not-a-token', 'a.b.c']) await expect(new LocalAccessTokens(secret, () => instant).verify(malformed)).rejects.toThrow(AuthenticationError);
  });
  it('honours the expiry boundary with a controlled clock and real signature', async () => {
    const token = await signed();
    expect(await new LocalAccessTokens(secret, () => new Date((seconds + 3599) * 1000)).verify(token)).toBe('owner-a');
    await expect(new LocalAccessTokens(secret, () => new Date((seconds + 3600) * 1000)).verify(token)).rejects.toThrow(AuthenticationError);
  });
  it.each(['', 'owner a', '.owner', 'a'.repeat(65), 'owner-a\n'])('refuses invalid local issuance subject %j', async subject => {
    await expect(new LocalAccessTokens(secret, () => instant).issue(subject)).rejects.toThrow(AuthenticationError);
  });
  it('preserves the maximum valid ASCII subject', async () => {
    const service = new LocalAccessTokens(secret, () => instant); const owner = 'A'.repeat(64);
    expect(await service.verify(await service.issue(owner))).toBe(owner);
  });
  it.each([undefined, ''])('fails closed when the configured local secret is %j', async value => {
    const service = new LocalAccessTokens(value, () => instant);
    await expect(service.issue('owner-a')).rejects.toThrow(AuthenticationError);
    await expect(service.verify(await signed())).rejects.toThrow(AuthenticationError);
  });
  it('rejects short keys and counts UTF-8 bytes without trimming the configured key', async () => {
    expect(() => new LocalAccessTokens('x'.repeat(31))).toThrow('Invalid configuration: jwtSecret');
    const service = new LocalAccessTokens('ç'.repeat(16), () => instant);
    expect(await service.verify(await service.issue('owner-a'))).toBe('owner-a');
  });
});

describe('optional local access runtime configuration', () => {
  const environment = { NODE_ENV: 'development', DATABASE_URL: 'postgresql://localhost/bible_db?schema=app' };
  it('uses the exact existing jwtSecret when valid', () => {
    expect(parseRuntimeConfig({ ...environment, jwtSecret: secret }).jwtSecret).toBe(secret);
    expect(parseRuntimeConfig({ ...environment, jwtSecret: 'ç'.repeat(16) }).jwtSecret).toBe('ç'.repeat(16));
  });
  it.each([undefined, ''])('preserves the public baseline when the key is %j', jwtSecret => {
    expect(parseRuntimeConfig({ ...environment, jwtSecret })).toEqual({ environment: 'development', port: 3000, databaseUrl: environment.DATABASE_URL });
  });
  it.each(['x', 'x'.repeat(31)])('rejects configured short key %j with a generic diagnostic', jwtSecret => {
    expect(() => parseRuntimeConfig({ ...environment, jwtSecret })).toThrow('Invalid configuration: jwtSecret');
  });
});
