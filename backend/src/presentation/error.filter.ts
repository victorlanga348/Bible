import { Catch, HttpException, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const original = exception instanceof HttpException ? exception.getStatus() : 500;
    const status = original === 400 || original === 404 ? original : 500;
    const error = status === 400
      ? { code: 'VALIDATION_ERROR', message: 'Entrada inválida.' }
      : status === 404
        ? { code: 'NOT_FOUND', message: 'Recurso não encontrado.' }
        : { code: 'INTERNAL_ERROR', message: 'Erro interno.' };
    console.info(JSON.stringify({ component: 'http', code: error.code, status }));
    const response = host.switchToHttp().getResponse<Response>();
    response.status(status).json({ error });
  }
}
