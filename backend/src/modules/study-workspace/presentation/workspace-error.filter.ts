import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { AuthenticationError } from '../../../infrastructure/access-token';
import { WorkspaceInputError, WorkspaceConflictError } from '../domain/workspace';
import { WorkspaceNotFoundError, WorkspaceUnavailableError } from '../application/errors';
@Catch(AuthenticationError, WorkspaceInputError, WorkspaceConflictError, WorkspaceNotFoundError, WorkspaceUnavailableError)
export class WorkspaceErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const [status, code, message] = exception instanceof AuthenticationError ? [401, 'UNAUTHORIZED', 'Autenticação necessária.']
      : exception instanceof WorkspaceInputError ? [400, 'VALIDATION_ERROR', 'Entrada inválida.']
        : exception instanceof WorkspaceNotFoundError ? [404, 'NOT_FOUND', 'Recurso não encontrado.']
          : exception instanceof WorkspaceConflictError ? [409, 'WORKSPACE_CONFLICT', 'Não foi possível atualizar esta revisão da nota.']
            : [503, 'WORKSPACE_UNAVAILABLE', 'Espaço de estudo temporariamente indisponível.'];
    console.info(JSON.stringify({ component: 'http', code, status }));
    host.switchToHttp().getResponse<Response>().status(status as number).json({ error: { code, message } });
  }
}
