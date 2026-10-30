import { Module, type DynamicModule } from '@nestjs/common';
import type { RuntimeConfig } from '../config/runtime-config';
import { GoogleAuthController } from '../presentation/google-auth.controller';
import { LocalAccessTokens } from './access-token';
import { GoogleIdentityVerifier } from './google-identity';
import { GoogleLoginService } from './google-login';

@Module({})
export class GoogleAuthModule {
  static register(config: RuntimeConfig): DynamicModule {
    return { module: GoogleAuthModule, controllers: [GoogleAuthController], providers: [
      { provide: GoogleIdentityVerifier, useFactory: () => new GoogleIdentityVerifier(config.googleClientId ?? '') },
      { provide: GoogleLoginService, useFactory: (tokens: LocalAccessTokens, identity: GoogleIdentityVerifier) => new GoogleLoginService(config.port, tokens, config.googleClientId ? identity : undefined), inject: [LocalAccessTokens, GoogleIdentityVerifier] },
    ], exports: [GoogleLoginService] };
  }
}
