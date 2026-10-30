import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { GoogleLoginService } from '../infrastructure/google-login';
import { GoogleAuthUnavailableError, GoogleIdentityVerifier } from '../infrastructure/google-identity';
import { LocalAccessGuard } from './local-access.guard';
import { CurrentOwner } from './current-owner';
import { GoogleAuthFilter } from './google-auth.filter';
import { googleAuthClient, googleAuthPage } from './google-auth-page';

const exchangeBody = z.strictObject({ credential: z.string().min(1).max(16384).regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/), csrfToken: z.string().length(43).regex(/^[A-Za-z0-9_-]+$/) });
const accessView = z.strictObject({ accessToken: z.string(), tokenType: z.literal('Bearer'), expiresIn: z.literal(3600) });
const bootstrapView = z.strictObject({ clientId: z.string(), nonce: z.string().length(43).regex(/^[A-Za-z0-9_-]+$/) });

@ApiTags('authentication')
@UseFilters(GoogleAuthFilter)
@Controller('auth')
export class GoogleAuthController {
  constructor(@Inject(GoogleLoginService) private readonly service: GoogleLoginService, @Inject(GoogleIdentityVerifier) private readonly identity: GoogleIdentityVerifier) {}
  @Get('google/bootstrap')
  @ApiResponse({ status: 200, standardSchema: bootstrapView })
  @ApiResponse({ status: 503, description: 'Google não configurado ou capacidade de desafios esgotada.' })
  bootstrap(@Res({ passthrough: true }) response: Response) {
    const nonce = this.service.challenge();
    response.setHeader('Cache-Control', 'no-store');
    response.cookie('biblia_google_login', nonce, { httpOnly: true, sameSite: 'strict', path: '/auth/google', maxAge: 300000 });
    return bootstrapView.parse({ clientId: this.identity.clientId, nonce });
  }
  @Get('google')
  @ApiResponse({ status: 200, description: 'Página Google local com desafio de uso único.' })
  @ApiResponse({ status: 503, description: 'Google não configurado ou temporariamente indisponível.' })
  page(@Res({ passthrough: true }) response: Response): string {
    const nonce = this.service.challenge();
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    response.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
    response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self' https://accounts.google.com/gsi/client; style-src 'unsafe-inline' https://accounts.google.com/gsi/style; frame-src https://accounts.google.com/gsi/; connect-src 'self' https://accounts.google.com/gsi/; img-src 'self' data: https://lh3.googleusercontent.com; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    response.cookie('biblia_google_login', nonce, { httpOnly: true, sameSite: 'strict', path: '/auth/google', maxAge: 300000 });
    response.type('html'); return googleAuthPage(this.identity.clientId, nonce);
  }
  @Get('google/client.js')
  script(@Res({ passthrough: true }) response: Response): string {
    if (!this.identity.clientId) throw new GoogleAuthUnavailableError();
    response.setHeader('Cache-Control', 'no-store'); response.type('application/javascript'); return googleAuthClient;
  }
  @Post('google')
  @HttpCode(200)
  @ApiResponse({ status: 200, standardSchema: accessView })
  @ApiResponse({ status: 400, description: 'JSON/credential/CSRF fora do contrato.' })
  @ApiResponse({ status: 401, description: 'Origem, desafio ou token Google inválido.' })
  @ApiResponse({ status: 503, description: 'Google não configurado ou JWKS indisponível.' })
  async exchange(@Body({ schema: exchangeBody }) body: z.infer<typeof exchangeBody>, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const access = await this.service.login({ ...body, cookie: request.headers.cookie, origin: request.get('origin'), contentType: request.get('content-type') });
    response.setHeader('Cache-Control', 'no-store');
    response.cookie('biblia_google_login', '', { httpOnly: true, sameSite: 'strict', path: '/auth/google', maxAge: 0 });
    return accessView.parse(access);
  }
  @Get('me')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, standardSchema: z.strictObject({ ownerId: z.string() }) })
  @ApiResponse({ status: 401, description: 'Bearer inválido ou ausente.' })
  @UseGuards(LocalAccessGuard)
  me(@CurrentOwner() ownerId: string, @Res({ passthrough: true }) response: Response) { response.setHeader('Cache-Control', 'no-store'); return { ownerId }; }
}
