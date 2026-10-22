import { SignJWT, jwtVerify } from 'jose';

export class AuthenticationError extends Error {
  constructor() { super('Autenticação necessária.'); }
}

function validSubject(subject: unknown): subject is string {
  return typeof subject === 'string' && subject === subject.trim() && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(subject);
}

export class LocalAccessTokens {
  readonly #key: Uint8Array | undefined;
  constructor(secret?: string, private readonly now: () => Date = () => new Date()) {
    const key = secret ? new TextEncoder().encode(secret) : undefined;
    if (key && key.byteLength < 32) throw new Error('Invalid configuration: jwtSecret');
    this.#key = key;
  }
  async issue(subject: string): Promise<string> {
    if (!this.#key || !validSubject(subject)) throw new AuthenticationError();
    const issuedAt = Math.floor(this.now().getTime() / 1000);
    return new SignJWT({}).setProtectedHeader({ alg: 'HS256', typ: 'JWT' }).setIssuer('biblia-local').setAudience('biblia-backend')
      .setSubject(subject).setIssuedAt(issuedAt).setExpirationTime(issuedAt + 3600).sign(this.#key);
  }
  async verify(token: string): Promise<string> {
    if (!this.#key) throw new AuthenticationError();
    try {
      const { payload } = await jwtVerify(token, this.#key, { algorithms: ['HS256'], typ: 'JWT', issuer: 'biblia-local', audience: 'biblia-backend',
        requiredClaims: ['sub', 'iat', 'exp'], maxTokenAge: 3600, currentDate: this.now() });
      const issuedAt = payload.iat; const expiresAt = payload.exp;
      if (!validSubject(payload.sub) || payload.aud !== 'biblia-backend' || typeof issuedAt !== 'number' || typeof expiresAt !== 'number'
        || !Number.isSafeInteger(issuedAt) || !Number.isSafeInteger(expiresAt) || expiresAt <= issuedAt || expiresAt - issuedAt > 3600) throw new AuthenticationError();
      return payload.sub;
    } catch { throw new AuthenticationError(); }
  }
}
