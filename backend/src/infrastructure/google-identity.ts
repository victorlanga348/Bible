import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { AuthenticationError } from './access-token';

export class GoogleAuthUnavailableError extends Error {
  constructor() { super('Autenticação Google temporariamente indisponível.'); }
}

export class GoogleIdentityVerifier {
  constructor(
    readonly clientId: string,
    private readonly keys: JWTVerifyGetKey = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'), { timeoutDuration: 5000, cooldownDuration: 30000, cacheMaxAge: 3600000 }),
    private readonly now: () => Date = () => new Date(),
  ) {}
  async verify(credential: string, nonce: string): Promise<string> {
    try {
      const { payload } = await jwtVerify(credential, this.keys, { algorithms: ['RS256'], issuer: ['accounts.google.com', 'https://accounts.google.com'], audience: this.clientId, requiredClaims: ['sub', 'iss', 'aud', 'iat', 'exp', 'nonce'], maxTokenAge: 3600, clockTolerance: 30, currentDate: this.now() });
      const { sub, iat, exp } = payload;
      if (payload.aud !== this.clientId || payload.nonce !== nonce || (payload.azp !== undefined && payload.azp !== this.clientId)
        || typeof sub !== 'string' || sub.length > 255 || sub !== sub.trim() || !/^[A-Za-z0-9_-]+$/.test(sub)
        || typeof iat !== 'number' || typeof exp !== 'number' || !Number.isSafeInteger(iat) || !Number.isSafeInteger(exp) || exp <= iat) throw new AuthenticationError();
      return sub;
    } catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string' ? error.code : '';
      if (error instanceof AuthenticationError || code.startsWith('ERR_JWT_') || code.startsWith('ERR_JWS_') || code === 'ERR_JOSE_ALG_NOT_ALLOWED' || code === 'ERR_JWKS_NO_MATCHING_KEY') throw new AuthenticationError();
      throw new GoogleAuthUnavailableError();
    }
  }
}
