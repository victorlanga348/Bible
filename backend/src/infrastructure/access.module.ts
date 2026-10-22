import { DynamicModule, Global, Module } from '@nestjs/common';
import { LocalAccessTokens } from './access-token';
import { LocalAccessGuard } from '../presentation/local-access.guard';

@Global()
@Module({})
export class AccessModule {
  static register(secret?: string): DynamicModule {
    return { module: AccessModule, providers: [{ provide: LocalAccessTokens, useFactory: () => new LocalAccessTokens(secret) }, LocalAccessGuard], exports: [LocalAccessTokens, LocalAccessGuard] };
  }
}
