import { Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { LocalAccessTokens, AuthenticationError } from '../infrastructure/access-token';

export interface OwnerRequest { headers: { authorization?: string | string[] }; ownerId?: string }
@Injectable()
export class LocalAccessGuard implements CanActivate {
  constructor(@Inject(LocalAccessTokens) private readonly tokens: LocalAccessTokens) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OwnerRequest>();
    const header = request.headers.authorization;
    if (typeof header !== 'string' || header !== header.trim()) throw new AuthenticationError();
    const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(header);
    if (!match) throw new AuthenticationError();
    request.ownerId = await this.tokens.verify(match[1]!);
    return true;
  }
}
