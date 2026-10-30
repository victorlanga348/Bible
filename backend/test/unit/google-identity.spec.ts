import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTVerifyGetKey } from 'jose';
import { GoogleIdentityVerifier } from '../../src/infrastructure/google-identity';
import { AuthenticationError } from '../../src/infrastructure/access-token';

// Protocol fixtures signed with an ephemeral technical RSA key, never Google credentials.
const client = '123456789012-protocoltest.apps.googleusercontent.com';
const nonce = 'n'.repeat(43);
const instant = new Date('2026-10-30T10:00:00.000Z');
const seconds = instant.getTime() / 1000;
let privateKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
let resolver: JWTVerifyGetKey;
async function signed(claims: Record<string, unknown> = {}) {
  return new SignJWT({ sub: 'protocol-google-sub-1', iss: 'https://accounts.google.com', aud: client, iat: seconds, exp: seconds + 3600, nonce, ...claims })
    .setProtectedHeader({ alg: 'RS256', kid: 'protocol-one' }).sign(privateKey);
}
beforeAll(async () => {
  const pair = await generateKeyPair('RS256', { extractable: true }); privateKey = pair.privateKey;
  resolver = createLocalJWKSet({ keys: [{ ...await exportJWK(pair.publicKey), kid: 'protocol-one', alg: 'RS256', use: 'sig' }] });
});
describe('Google ID token verification with real technical RSA signatures', () => {
  it('accepts an authentic signature, audience, issuer, expiry and nonce, returning only sub', async () => {
    await expect(new GoogleIdentityVerifier(client, resolver, () => instant).verify(await signed(), nonce)).resolves.toBe('protocol-google-sub-1');
  });
  it('accepts the documented second issuer and matching optional azp', async () => {
    await expect(new GoogleIdentityVerifier(client, resolver, () => instant).verify(await signed({ iss: 'accounts.google.com', azp: client }), nonce)).resolves.toBe('protocol-google-sub-1');
  });
  it.each([
    ['missing issuer', { iss: undefined }], ['wrong issuer', { iss: 'https://evil.example' }],
    ['missing audience', { aud: undefined }], ['wrong audience', { aud: 'another-client' }], ['array audience', { aud: [client, 'another-client'] }],
    ['missing subject', { sub: undefined }], ['blank subject', { sub: '' }], ['spaced subject', { sub: 'other user' }],
    ['oversized subject', { sub: 'a'.repeat(256) }], ['subject trailing newline', { sub: 'user\n' }],
    ['missing nonce', { nonce: undefined }], ['wrong nonce', { nonce: 'x'.repeat(43) }],
    ['missing issued time', { iat: undefined }], ['fractional issued time', { iat: seconds - 0.5 }],
    ['future issued time', { iat: seconds + 31 }], ['old issued time', { iat: seconds - 3631 }],
    ['missing expiry', { exp: undefined }], ['fractional expiry', { exp: seconds + 3599.5 }],
    ['expired', { exp: seconds - 31 }], ['expiry before issuance', { iat: seconds + 10, exp: seconds + 5 }],
    ['wrong authorized party', { azp: 'another-client' }],
  ])('rejects %s despite a real trusted RSA signature', async (_label, claims) => {
    await expect(new GoogleIdentityVerifier(client, resolver, () => instant).verify(await signed(claims), nonce)).rejects.toThrow(AuthenticationError);
  });
  it('rejects forged signatures instead of decoding claims as identity', async () => {
    const other = await generateKeyPair('RS256');
    const forged = await new SignJWT({ sub: 'protocol-google-sub-1', iss: 'https://accounts.google.com', aud: client, iat: seconds, exp: seconds + 3600, nonce }).setProtectedHeader({ alg: 'RS256', kid: 'protocol-one' }).sign(other.privateKey);
    await expect(new GoogleIdentityVerifier(client, resolver, () => instant).verify(forged, nonce)).rejects.toThrow(AuthenticationError);
  });
  it('rejects malformed tokens with a generic authentication error', async () => {
    await expect(new GoogleIdentityVerifier(client, resolver, () => instant).verify('not-a-token', nonce)).rejects.toThrow(AuthenticationError);
  });
  it('distinguishes unavailable key transport without echoing its private cause', async () => {
    const failedTransport: JWTVerifyGetKey = async () => { throw new TypeError('private-transport-details'); };
    await expect(new GoogleIdentityVerifier(client, failedTransport, () => instant).verify(await signed(), nonce)).rejects.toThrow('Autenticação Google temporariamente indisponível.');
  });
  it('enforces RS256 even when another algorithm has a genuine technical signature', async () => {
    const token = await new SignJWT({ sub: 'protocol-google-sub-1', iss: 'https://accounts.google.com', aud: client, iat: seconds, exp: seconds + 3600, nonce }).setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode('technical-hmac-key-that-is-not-a-Google-key-12345'));
    await expect(new GoogleIdentityVerifier(client, resolver, () => instant).verify(token, nonce)).rejects.toThrow(AuthenticationError);
  });
  it('accepts the documented thirty-second issuance tolerance boundary', async () => {
    await expect(new GoogleIdentityVerifier(client, resolver, () => instant).verify(await signed({ iat: seconds + 30 }), nonce)).resolves.toBe('protocol-google-sub-1');
  });
});
