import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { AuthenticationError } from '../infrastructure/access-token';
import { GoogleAuthUnavailableError } from '../infrastructure/google-identity';

@Catch(AuthenticationError, GoogleAuthUnavailableError)
export class GoogleAuthFilter implements ExceptionFilter {
  catch(exception: AuthenticationError | GoogleAuthUnavailableError, host: ArgumentsHost): void {
    const unavailable = exception instanceof GoogleAuthUnavailableError;
    const status = unavailable ? 503 : 401;
    const error = unavailable ? { code: 'GOOGLE_AUTH_UNAVAILABLE', message: 'Autenticação Google temporariamente indisponível.' } : { code: 'AUTH_REQUIRED', message: 'Autenticação necessária.' };
    console.info(JSON.stringify({ component: 'http', code: error.code, status }));
    host.switchToHttp().getResponse<Response>().setHeader('Cache-Control', 'no-store').status(status).json({ error });
  }
}
