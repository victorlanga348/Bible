import { createHash } from 'node:crypto';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTVerifyGetKey } from 'jose';
import { AuthenticationError, LocalAccessTokens } from '../../src/infrastructure/access-token';
import { GoogleAuthUnavailableError, GoogleIdentityVerifier } from '../../src/infrastructure/google-identity';
import { GoogleLoginService, type GoogleLoginRequest } from '../../src/infrastructure/google-login';

// These are technical protocol identities/keys, not a real Google account or provider call.
const client = '123456789012-protocoltest.apps.googleusercontent.com';
const initial = Date.parse('2026-10-30T10:00:00.000Z');
let privateKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
let resolver: JWTVerifyGetKey;
let clock: number, tokens: LocalAccessTokens, service: GoogleLoginService;
beforeAll(async () => { const pair = await generateKeyPair('RS256', { extractable: true }); privateKey = pair.privateKey; resolver = createLocalJWKSet({ keys: [{ ...await exportJWK(pair.publicKey), kid: 'protocol-one', alg: 'RS256' }] }); });
beforeEach(() => { clock = initial; tokens = new LocalAccessTokens('technical-protocol-local-key-not-deployment-12345', () => new Date(clock)); service = new GoogleLoginService(3000, tokens, new GoogleIdentityVerifier(client, resolver, () => new Date(clock)), () => clock); });
async function input(nonce: string, sub = 'protocol-google-sub-1'): Promise<GoogleLoginRequest> {
  const credential = await new SignJWT({ sub, email: 'same-technical-email@example.invalid', iss: 'https://accounts.google.com', aud: client, iat: initial / 1000, exp: initial / 1000 + 3600, nonce }).setProtectedHeader({ alg: 'RS256', kid: 'protocol-one' }).sign(privateKey);
  return { credential, csrfToken: nonce, cookie: `biblia_google_login=${nonce}`, origin: 'http://localhost:3000', contentType: 'application/json' };
}
describe('one-use Google login challenge and local access with real technical RSA/HS256', () => {
  it('issues independent 256-bit base64url challenges', () => {
    const first = service.challenge(), second = service.challenge(); expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/); expect(second).not.toBe(first);
  });
  it('issues a local Bearer token for the hashed Google sub and exposes no profile', async () => {
    const result = await service.login(await input(service.challenge()));
    expect(Object.keys(result).sort()).toEqual(['accessToken', 'expiresIn', 'tokenType']); expect(result).toMatchObject({ tokenType: 'Bearer', expiresIn: 3600 });
    expect(await tokens.verify(result.accessToken)).toBe('google-' + createHash('sha256').update('protocol-google-sub-1').digest('base64url'));
  });
  it('keeps one Google subject stable and different subjects separate despite the same email', async () => {
    const a = await service.login(await input(service.challenge())); const aAgain = await service.login(await input(service.challenge())); const b = await service.login(await input(service.challenge(), 'protocol-google-sub-2'));
    expect(await tokens.verify(a.accessToken)).toBe(await tokens.verify(aAgain.accessToken)); expect(await tokens.verify(b.accessToken)).not.toBe(await tokens.verify(a.accessToken));
  });
  it('consumes the challenge only once', async () => {
    const request = await input(service.challenge()); await service.login(request); await expect(service.login(request)).rejects.toThrow(AuthenticationError);
  });
  it('allows at most one concurrent exchange for one challenge', async () => {
    const request = await input(service.challenge()); const results = await Promise.allSettled([service.login(request), service.login(request)]);
    expect(results.filter(row => row.status === 'fulfilled')).toHaveLength(1); expect(results.filter(row => row.status === 'rejected')).toHaveLength(1);
  });
  it.each([
    ['missing cookie', { cookie: undefined }], ['wrong cookie', { cookie: 'biblia_google_login=' + 'x'.repeat(43) }],
    ['duplicate cookie', { cookie: 'biblia_google_login=x; biblia_google_login=y' }], ['unrelated cookie', { cookie: 'other=x' }],
    ['missing origin', { origin: undefined }], ['foreign origin', { origin: 'https://evil.example' }], ['wrong port', { origin: 'http://localhost:3001' }],
    ['missing JSON type', { contentType: undefined }], ['form type', { contentType: 'application/x-www-form-urlencoded' }],
    ['wrong csrf', { csrfToken: 'x'.repeat(43) }], ['short csrf', { csrfToken: 'x' }], ['csrf trailing newline', { csrfToken: 'n'.repeat(43) + '\n' }],
  ])('rejects %s before issuing any local access', async (_label, overrides) => {
    await expect(service.login({ ...await input(service.challenge()), ...overrides })).rejects.toThrow(AuthenticationError);
  });
  it('refuses a valid technical token and matching cookie whose nonce was never issued', async () => {
    await expect(service.login(await input('z'.repeat(43)))).rejects.toThrow(AuthenticationError);
  });
  it('expires challenges at five minutes exactly', async () => {
    const request = await input(service.challenge()); clock += 300000; await expect(service.login(request)).rejects.toThrow(AuthenticationError);
  });
  it('rechecks expiry after asynchronous Google verification, before signing local access', async () => {
    // Explicit latency/clock double for the expiry boundary, not provider integration.
    const delayed = new GoogleLoginService(3000, tokens, { verify: async () => { clock += 300000; return 'protocol-google-sub-1'; } }, () => clock);
    await expect(delayed.login(await input(delayed.challenge()))).rejects.toThrow(AuthenticationError);
  });
  it('bounds pending challenges and recovers capacity after expiry', () => {
    for (let index = 0; index < 128; index++) service.challenge(); expect(() => service.challenge()).toThrow(GoogleAuthUnavailableError);
    clock += 300000; expect(service.challenge()).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
  it('does not consume a valid challenge for an invalid Google token', async () => {
    const request = await input(service.challenge()); await expect(service.login({ ...request, credential: 'invalid' })).rejects.toThrow(AuthenticationError);
    expect(await tokens.verify((await service.login(request)).accessToken)).toMatch(/^google-/);
  });
  it('accepts the configured loopback alias and JSON charset', async () => {
    const request = await input(service.challenge()); await expect(service.login({ ...request, origin: 'http://127.0.0.1:3000', contentType: 'application/json; charset=utf-8' })).resolves.toHaveProperty('accessToken');
  });
  it('reports unavailable Google configuration separately from invalid authentication', async () => {
    const disabled = new GoogleLoginService(3000, tokens, undefined); expect(() => disabled.challenge()).toThrow(GoogleAuthUnavailableError);
    await expect(disabled.login(await input('n'.repeat(43)))).rejects.toThrow(GoogleAuthUnavailableError);
  });
});
