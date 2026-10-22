import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { CanonDomainError } from '../domain/canon-domain-error';
import { CanonNotFoundError } from '../application/errors';
@Catch(CanonDomainError, CanonNotFoundError)
export class CanonErrorFilter implements ExceptionFilter {
  catch(exception: CanonDomainError | CanonNotFoundError, host: ArgumentsHost): void {
    const invalid = exception instanceof CanonDomainError;
    const status = invalid ? 400 : 404;
    const error = invalid ? { code: 'VALIDATION_ERROR', message: 'Entrada inválida.' } : { code: 'NOT_FOUND', message: 'Recurso não encontrado.' };
    console.info(JSON.stringify({ component: 'http', code: error.code, status }));
    host.switchToHttp().getResponse<Response>().status(status).json({ error });
  }
}
