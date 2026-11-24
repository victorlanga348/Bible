import { Module, type DynamicModule } from '@nestjs/common';
import type { RuntimeConfig } from '../config/runtime-config';
import { PASSWORD_AUTH_PORT, PasswordAuthController } from '../presentation/password-auth.controller';
import { LocalAccessTokens } from './access-token';
import { Database } from './database';
import { PasswordAuthService } from './password-auth';

@Module({})
export class PasswordAuthModule {
  static register(config: RuntimeConfig): DynamicModule {
    return { module: PasswordAuthModule, controllers: [PasswordAuthController], providers: [
      { provide: PASSWORD_AUTH_PORT, useValue: config.port },
      { provide: PasswordAuthService, useFactory: (database: Database, tokens: LocalAccessTokens) => new PasswordAuthService(database, tokens, Boolean(config.jwtSecret)), inject: [Database, LocalAccessTokens] },
    ] };
  }
}
