import { Body, Controller, Get, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { LocalAccessGuard } from '../../../presentation/local-access.guard';
import { CurrentOwner } from '../../../presentation/current-owner';
import { StudyLibrary } from '../application/study-library';
import { StudyErrorFilter } from './study-error.filter';
import { createStudyBody, emptyQuery, errorView, reviseStudyBody, studyParams, studyQuery, studyView } from './schemas';

@ApiTags('study')
@ApiBearerAuth()
@ApiResponse({ status: 400, standardSchema: errorView('VALIDATION_ERROR', 'Entrada inválida.') })
@ApiResponse({ status: 401, standardSchema: errorView('UNAUTHORIZED', 'Autenticação necessária.') })
@ApiResponse({ status: 404, standardSchema: errorView('NOT_FOUND', 'Recurso não encontrado.') })
@ApiResponse({ status: 500, standardSchema: errorView('INTERNAL_ERROR', 'Erro interno.') })
@UseFilters(StudyErrorFilter)
@UseGuards(LocalAccessGuard)
@Controller('studies')
export class StudyController {
  constructor(private readonly library: StudyLibrary) {}
  @Post()
  @ApiResponse({ status: 201, standardSchema: studyView })
  async create(@CurrentOwner() owner: string, @Body({ schema: createStudyBody }) body: z.infer<typeof createStudyBody>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) {
    void query; return studyView.parse(await this.library.create(owner, body.translationId, body.reference));
  }
  @Get(':id')
  @ApiParam({ name: 'id', schema: { type: 'string', format: 'uuid' } })
  @ApiQuery({ name: 'version', required: false, schema: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER } })
  @ApiResponse({ status: 200, standardSchema: studyView })
  async read(@CurrentOwner() owner: string, @Param({ schema: studyParams }) params: z.infer<typeof studyParams>, @Query({ schema: studyQuery }) query: z.infer<typeof studyQuery>) {
    return studyView.parse(await this.library.read(owner, params.id, query.version));
  }
  @Post(':id/versions')
  @ApiParam({ name: 'id', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 201, standardSchema: studyView })
  @ApiResponse({ status: 409, standardSchema: errorView('CONFLICT', 'Não foi possível criar esta versão.') })
  async revise(@CurrentOwner() owner: string, @Param({ schema: studyParams }) params: z.infer<typeof studyParams>, @Body({ schema: reviseStudyBody }) body: z.infer<typeof reviseStudyBody>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) {
    void query; return studyView.parse(await this.library.revise(owner, params.id, body.expectedVersion));
  }
}
