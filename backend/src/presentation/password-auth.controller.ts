import { Body, Catch, Controller, Header, HttpCode, Inject, Post, Req, Res, UseFilters, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { PasswordAuthError, PasswordAuthService, type PasswordCredentials } from '../infrastructure/password-auth';

const credentialsBody = z.strictObject({
  email: z.string().trim().max(254).pipe(z.email()).transform(value => value.toLowerCase()),
  password: z.string().min(15).max(128),
});
const accessView = z.strictObject({ accessToken: z.string(), tokenType: z.literal('Bearer'), expiresIn: z.literal(3600) });
export const PASSWORD_AUTH_PORT = Symbol('PASSWORD_AUTH_PORT');

@Catch(PasswordAuthError)
export class PasswordAuthFilter implements ExceptionFilter {
  catch(error: PasswordAuthError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    if (error.status === 429) response.setHeader('Retry-After', '900');
    response.setHeader('Cache-Control', 'no-store').status(error.status).json({ error: { code: error.code, message: error.message } });
  }
}

@ApiTags('authentication')
@ApiResponse({ status: 400, description: 'Email ou palavra-passe fora do contrato.' })
@ApiResponse({ status: 403, description: 'Origem ou tipo de conteúdo recusado.' })
@ApiResponse({ status: 429, description: 'Limite de tentativas ou capacidade atingido.' })
@ApiResponse({ status: 503, description: 'Autenticação por conta indisponível.' })
@UseFilters(PasswordAuthFilter)
@Controller('auth')
export class PasswordAuthController {
  constructor(@Inject(PasswordAuthService) private readonly service: PasswordAuthService, @Inject(PASSWORD_AUTH_PORT) private readonly port: number) {}

  private authenticate(mode: 'register' | 'login', body: PasswordCredentials, request: Request, response: Response) {
    response.setHeader('Cache-Control', 'no-store');
    const origins = [`http://localhost:${this.port}`, `http://127.0.0.1:${this.port}`, 'http://localhost:5173', 'http://127.0.0.1:5173'];
    if (!origins.includes(request.get('origin') ?? '') || request.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') {
      throw new PasswordAuthError(403, 'AUTH_ORIGIN_REJECTED', 'Não foi possível confirmar a origem do pedido.');
    }
    return this.service.authenticate(mode, body, request.ip ?? 'unknown');
  }

  @Post('register')
  @Header('Cache-Control', 'no-store')
  @ApiResponse({ status: 201, standardSchema: accessView })
  @ApiResponse({ status: 409, description: 'Já existe uma conta com este email.' })
  register(@Body({ schema: credentialsBody }) body: z.infer<typeof credentialsBody>, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.authenticate('register', body, request, response);
  }

  @Post('login')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  @ApiResponse({ status: 200, standardSchema: accessView })
  @ApiResponse({ status: 401, description: 'Email ou palavra-passe incorretos.' })
  login(@Body({ schema: credentialsBody }) body: z.infer<typeof credentialsBody>, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.authenticate('login', body, request, response);
  }
}
