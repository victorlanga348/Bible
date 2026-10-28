import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import type { Response } from 'express';
import { LocalAccessGuard } from '../../../presentation/local-access.guard';
import { CurrentOwner } from '../../../presentation/current-owner';
import { ConversationLibrary } from '../application/conversation-library';
import type { ConversationView } from '../application/conversation-ports';
import { AiErrorFilter } from './ai-error.filter';
import { studyParams, emptyQuery, errorView } from './schemas';
import { conversationParams, createConversationBody, appendConversationBody, emptyConversationBody, conversationView } from './conversation-schemas';

@ApiTags('conversations')
@ApiBearerAuth()
@ApiResponse({ status: 400, standardSchema: errorView('VALIDATION_ERROR', 'Entrada inválida.') })
@ApiResponse({ status: 401, standardSchema: errorView('UNAUTHORIZED', 'Autenticação necessária.') })
@ApiResponse({ status: 404, standardSchema: errorView('NOT_FOUND', 'Recurso não encontrado.') })
@ApiResponse({ status: 500, standardSchema: errorView('INTERNAL_ERROR', 'Erro interno.') })
@UseFilters(AiErrorFilter)
@UseGuards(LocalAccessGuard)
@Controller()
export class ConversationController {
  constructor(private readonly library: ConversationLibrary) {}
  private async cancellable(response: Response, execute: (signal: AbortSignal) => Promise<ConversationView>): Promise<ConversationView> {
    const controller = new AbortController(); const closed = () => { if (!response.writableEnded) controller.abort(); };
    response.once('close', closed);
    try { return await execute(controller.signal); } finally { response.removeListener('close', closed); }
  }
  @Post('studies/:studyId/conversations')
  @ApiParam({ name: 'studyId', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 201, standardSchema: conversationView })
  async create(@CurrentOwner() owner: string, @Param({ schema: studyParams }) params: z.infer<typeof studyParams>, @Body({ schema: createConversationBody }) body: z.infer<typeof createConversationBody>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>, @Res({ passthrough: true }) response: Response) {
    void query; return conversationView.parse(await this.cancellable(response, signal => this.library.create(owner, params.studyId, body.studyVersion, signal)));
  }
  @Get('conversations/:conversationId')
  @ApiParam({ name: 'conversationId', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, standardSchema: conversationView })
  async read(@CurrentOwner() owner: string, @Param({ schema: conversationParams }) params: z.infer<typeof conversationParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>, @Body({ schema: emptyConversationBody }) body: z.infer<typeof emptyConversationBody>) {
    void query; void body; return conversationView.parse(await this.library.read(owner, params.conversationId));
  }
  @Post('conversations/:conversationId/turns')
  @ApiParam({ name: 'conversationId', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 201, standardSchema: conversationView })
  @ApiResponse({ status: 409, standardSchema: errorView('CONVERSATION_CONFLICT', 'A conversa foi alterada ou atingiu o limite de turnos.') })
  @ApiResponse({ status: 422, standardSchema: errorView('AI_RESULT_REJECTED', 'Não foi possível fundamentar esta análise.') })
  @ApiResponse({ status: 503, standardSchema: errorView('AI_UNAVAILABLE', 'Assistente temporariamente indisponível.') })
  @ApiResponse({ status: 504, standardSchema: errorView('AI_TIMEOUT', 'O assistente excedeu o tempo de execução.') })
  async append(@CurrentOwner() owner: string, @Param({ schema: conversationParams }) params: z.infer<typeof conversationParams>, @Body({ schema: appendConversationBody }) body: z.infer<typeof appendConversationBody>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>, @Res({ passthrough: true }) response: Response) {
    void query; return conversationView.parse(await this.cancellable(response, signal => this.library.append(owner, params.conversationId, body.expectedRevision, body.question, body.revisesTurn ?? null, signal)));
  }
  @Delete('conversations/:conversationId')
  @HttpCode(204)
  @ApiParam({ name: 'conversationId', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 204, description: 'Conversa e análises associadas eliminadas.' })
  async delete(@CurrentOwner() owner: string, @Param({ schema: conversationParams }) params: z.infer<typeof conversationParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>, @Body({ schema: emptyConversationBody }) body: z.infer<typeof emptyConversationBody>) {
    void query; void body; await this.library.delete(owner, params.conversationId);
  }
}
