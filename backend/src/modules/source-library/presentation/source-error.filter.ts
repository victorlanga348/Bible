import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { SourceAccessError, SourceNotFoundError } from '../application/errors';

@Catch(SourceAccessError, SourceNotFoundError)
export class SourceErrorFilter implements ExceptionFilter {
  catch(exception: SourceAccessError | SourceNotFoundError, host: ArgumentsHost): void {
    const forbidden = exception instanceof SourceAccessError;
    const status = forbidden ? 403 : 404;
    const error = forbidden ? { code: 'FORBIDDEN', message: 'Operação não autorizada.' } : { code: 'NOT_FOUND', message: 'Recurso não encontrado.' };
    console.info(JSON.stringify({ component: 'http', code: error.code, status }));
    host.switchToHttp().getResponse<Response>().status(status).json({ error });
  }
}
