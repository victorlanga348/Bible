import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { AuthenticationError } from '../../../infrastructure/access-token';
import { RelationInputError } from '../domain/relation';
import { RelationNotFoundError, RelationEvidenceError, RelationUnavailableError } from '../application/errors';
@Catch(AuthenticationError, RelationInputError, RelationNotFoundError, RelationEvidenceError, RelationUnavailableError)
export class RelationErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const [status, code, message] = exception instanceof AuthenticationError ? [401, 'UNAUTHORIZED', 'Autenticação necessária.']
      : exception instanceof RelationInputError ? [400, 'VALIDATION_ERROR', 'Entrada inválida.']
        : exception instanceof RelationNotFoundError ? [404, 'NOT_FOUND', 'Recurso não encontrado.']
          : exception instanceof RelationEvidenceError ? [422, 'RELATION_EVIDENCE_REJECTED', 'Não foi possível validar as evidências da relação.']
            : [503, 'RELATION_UNAVAILABLE', 'Relações temporariamente indisponíveis.'];
    console.info(JSON.stringify({ component: 'http', code, status }));
    host.switchToHttp().getResponse<Response>().status(status as number).json({ error: { code, message } });
  }
}
