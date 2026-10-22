import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { AuthenticationError } from '../../../infrastructure/access-token';
import { StudyInputError, StudyNotFoundError, StudyConflictError } from '../application/errors';

@Catch(AuthenticationError, StudyInputError, StudyNotFoundError, StudyConflictError)
export class StudyErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const [status, code, message] = exception instanceof AuthenticationError ? [401, 'UNAUTHORIZED', 'Autenticação necessária.']
      : exception instanceof StudyInputError ? [400, 'VALIDATION_ERROR', 'Entrada inválida.']
        : exception instanceof StudyNotFoundError ? [404, 'NOT_FOUND', 'Recurso não encontrado.']
          : [409, 'CONFLICT', 'Não foi possível criar esta versão.'];
    console.info(JSON.stringify({ component: 'http', code, status }));
    host.switchToHttp().getResponse<Response>().status(status as number).json({ error: { code, message } });
  }
}
