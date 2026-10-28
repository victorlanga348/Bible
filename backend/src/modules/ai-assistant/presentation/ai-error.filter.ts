import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { AuthenticationError } from '../../../infrastructure/access-token';
import { AiNotFoundError, AiResultRejectedError, AiTimeoutError, AiUnavailableError } from '../application/errors';
import { AiModelInputError } from '../domain/model-input';
import { ConversationConflictError } from '../domain/conversation';

@Catch(AuthenticationError, AiModelInputError, AiNotFoundError, AiResultRejectedError, AiTimeoutError, AiUnavailableError, ConversationConflictError)
export class AiErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const [status, code, message] = exception instanceof AuthenticationError ? [401, 'UNAUTHORIZED', 'Autenticação necessária.']
      : exception instanceof AiModelInputError ? [400, 'VALIDATION_ERROR', 'Entrada inválida.']
        : exception instanceof AiNotFoundError ? [404, 'NOT_FOUND', 'Recurso não encontrado.']
          : exception instanceof ConversationConflictError ? [409, 'CONVERSATION_CONFLICT', 'A conversa foi alterada ou atingiu o limite de turnos.']
          : exception instanceof AiResultRejectedError ? [422, 'AI_RESULT_REJECTED', 'Não foi possível fundamentar esta análise.']
            : exception instanceof AiTimeoutError ? [504, 'AI_TIMEOUT', 'O assistente excedeu o tempo de execução.']
              : [503, 'AI_UNAVAILABLE', 'Assistente temporariamente indisponível.'];
    console.info(JSON.stringify({ component: 'http', code, status }));
    host.switchToHttp().getResponse<Response>().status(status as number).json({ error: { code, message } });
  }
}
