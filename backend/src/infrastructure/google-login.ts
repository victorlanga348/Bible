import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { AuthenticationError, type LocalAccessTokens } from './access-token';
import { GoogleAuthUnavailableError, type GoogleIdentityVerifier } from './google-identity';

export interface GoogleLoginRequest { readonly credential: string; readonly csrfToken: string; readonly cookie: string | undefined; readonly origin: string | undefined; readonly contentType: string | undefined }
export interface GoogleAccess { readonly accessToken: string; readonly tokenType: 'Bearer'; readonly expiresIn: 3600 }
export class GoogleLoginService {
  private readonly pending = new Map<string, number>();
  constructor(private readonly port: number, private readonly tokens: LocalAccessTokens, private readonly identity: Pick<GoogleIdentityVerifier, 'verify'> | undefined, private readonly now: () => number = Date.now) {}
  challenge(): string {
    if (!this.identity) throw new GoogleAuthUnavailableError();
    for (const [key, expiresAt] of this.pending) if (expiresAt <= this.now()) this.pending.delete(key);
    if (this.pending.size >= 128) throw new GoogleAuthUnavailableError();
    const nonce = randomBytes(32).toString('base64url'); this.pending.set(nonce, this.now() + 300000); return nonce;
  }
  async login(input: GoogleLoginRequest): Promise<GoogleAccess> {
    if (!this.identity) throw new GoogleAuthUnavailableError();
    const origins = [`http://localhost:${this.port}`, `http://127.0.0.1:${this.port}`, 'http://127.0.0.1:5173', 'http://localhost:5173'];
    if (!origins.includes(input.origin ?? '') || input.contentType?.split(';')[0]?.trim().toLowerCase() !== 'application/json') throw new AuthenticationError();
    const cookies = (input.cookie ?? '').split(';').map(value => value.trim()).filter(value => value.startsWith('biblia_google_login='));
    const nonce = cookies.length === 1 ? cookies[0]!.slice('biblia_google_login='.length) : '';
    const validNonce = (value: string) => value.length === 43 && /^[A-Za-z0-9_-]+$/.test(value);
    if (!validNonce(nonce) || !validNonce(input.csrfToken) || !timingSafeEqual(Buffer.from(nonce), Buffer.from(input.csrfToken))) throw new AuthenticationError();
    const expiresAt = this.pending.get(nonce);
    if (expiresAt === undefined || expiresAt <= this.now()) throw new AuthenticationError();
    const subject = await this.identity.verify(input.credential, nonce);
    if (expiresAt <= this.now() || !this.pending.delete(nonce)) throw new AuthenticationError();
    const owner = 'google-' + createHash('sha256').update(subject).digest('base64url');
    return { accessToken: await this.tokens.issue(owner), tokenType: 'Bearer', expiresIn: 3600 };
  }
}
