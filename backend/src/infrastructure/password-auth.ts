import { randomUUID } from 'node:crypto';
import type { LocalAccessTokens } from './access-token';
import type { Database } from './database';
import { dummyPasswordHash, hashPassword, verifyPassword } from './password-hash';

export class PasswordAuthError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message); }
}
const limited = () => new PasswordAuthError(429, 'AUTH_RATE_LIMITED', 'Demasiadas tentativas. Tenta novamente daqui a 15 minutos.');
export interface PasswordCredentials { email: string; password: string }

export class PasswordAuthService {
  private readonly attempts = new Map<string, { count: number; expiresAt: number }>();
  private active = 0;
  constructor(private readonly database: Database, private readonly tokens: LocalAccessTokens,
    private readonly configured: boolean, private readonly now: () => number = Date.now) {}

  async authenticate(mode: 'register' | 'login', credentials: PasswordCredentials, ip: string) {
    if (!this.configured) throw new PasswordAuthError(503, 'ACCOUNT_AUTH_UNAVAILABLE', 'Acesso à conta temporariamente indisponível.');
    const now = this.now();
    for (const [key, value] of this.attempts) if (value.expiresAt <= now) this.attempts.delete(key);
    const attempt = this.attempts.get(ip);
    if ((!attempt && this.attempts.size >= 1024) || (attempt && attempt.count >= 10) || this.active >= 2) throw limited();
    this.attempts.set(ip, { count: (attempt?.count ?? 0) + 1, expiresAt: attempt?.expiresAt ?? now + 900000 });
    this.active++;
    try {
      let ownerId: string;
      if (mode === 'register') {
        const id = randomUUID();
        ownerId = `account-${id}`;
        // Verify signing is usable before creating an account.
        const accessToken = await this.tokens.issue(ownerId);
        const passwordHash = await hashPassword(credentials.password);
        try { await this.database.client.passwordAccount.create({ data: { id, email: credentials.email, passwordHash } }); }
        catch (error) {
          if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            throw new PasswordAuthError(409, 'ACCOUNT_EXISTS', 'Já existe uma conta com este email. Escolhe Entrar.');
          }
          throw error;
        }
        return { accessToken, tokenType: 'Bearer' as const, expiresIn: 3600 as const };
      }
      const account = await this.database.client.passwordAccount.findUnique({ where: { email: credentials.email } });
      const valid = await verifyPassword(credentials.password, account?.passwordHash ?? dummyPasswordHash);
      if (!account || !valid) throw new PasswordAuthError(401, 'INVALID_CREDENTIALS', 'Email ou palavra-passe incorretos.');
      ownerId = `account-${account.id}`;
      return { accessToken: await this.tokens.issue(ownerId), tokenType: 'Bearer' as const, expiresIn: 3600 as const };
    } finally { this.active--; }
  }
}
