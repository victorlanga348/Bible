import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import type { Response } from 'express';
import { LocalAccessGuard } from '../../../presentation/local-access.guard';
import { CurrentOwner } from '../../../presentation/current-owner';
import { AiAnalysisLibrary } from '../application/ai-analysis-library';
import { AiErrorFilter } from './ai-error.filter';
import { analysisParams, analysisView, createAnalysisBody, emptyQuery, errorView, studyParams } from './schemas';

@ApiTags('ai-assistant')
@ApiBearerAuth()
@ApiResponse({ status: 400, standardSchema: errorView('VALIDATION_ERROR', 'Entrada inválida.') })
@ApiResponse({ status: 401, standardSchema: errorView('UNAUTHORIZED', 'Autenticação necessária.') })
@ApiResponse({ status: 404, standardSchema: errorView('NOT_FOUND', 'Recurso não encontrado.') })
@ApiResponse({ status: 500, standardSchema: errorView('INTERNAL_ERROR', 'Erro interno.') })
@UseFilters(AiErrorFilter)
@UseGuards(LocalAccessGuard)
@Controller()
export class AiAnalysisController {
  constructor(private readonly library: AiAnalysisLibrary) {}
  @Post('studies/:studyId/ai-analyses')
  @ApiParam({ name: 'studyId', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 201, standardSchema: analysisView })
  @ApiResponse({ status: 422, standardSchema: errorView('AI_RESULT_REJECTED', 'Não foi possível fundamentar esta análise.') })
  @ApiResponse({ status: 503, standardSchema: errorView('AI_UNAVAILABLE', 'Assistente temporariamente indisponível.') })
  @ApiResponse({ status: 504, standardSchema: errorView('AI_TIMEOUT', 'O assistente excedeu o tempo de execução.') })
  async create(@CurrentOwner() owner: string, @Param({ schema: studyParams }) params: z.infer<typeof studyParams>, @Body({ schema: createAnalysisBody }) body: z.infer<typeof createAnalysisBody>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>, @Res({ passthrough: true }) response: Response) {
    void query;
    const controller = new AbortController();
    const closed = () => { if (!response.writableEnded) controller.abort(); };
    response.once('close', closed);
    try { return analysisView.parse(await this.library.create(owner, params.studyId, body.studyVersion, body.question, controller.signal)); }
    finally { response.removeListener('close', closed); }
  }
  @Get('ai-analyses/:analysisId')
  @ApiParam({ name: 'analysisId', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, standardSchema: analysisView })
  async read(@CurrentOwner() owner: string, @Param({ schema: analysisParams }) params: z.infer<typeof analysisParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) {
    void query; return analysisView.parse(await this.library.read(owner, params.analysisId));
  }
  @Delete('ai-analyses/:analysisId')
  @HttpCode(204)
  @ApiParam({ name: 'analysisId', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 204, description: 'Análise eliminada.' })
  async delete(@CurrentOwner() owner: string, @Param({ schema: analysisParams }) params: z.infer<typeof analysisParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) {
    void query; await this.library.delete(owner, params.analysisId);
  }
}
