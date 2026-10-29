import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { LocalAccessGuard } from '../../../presentation/local-access.guard';
import { CurrentOwner } from '../../../presentation/current-owner';
import { encodeCursor } from '../../../presentation/pagination';
import { RelationLibrary } from '../application/relation-library';
import { RelationErrorFilter } from './relation-error.filter';
import { createRelationBody, emptyBody, emptyQuery, errorView, relationPageView, relationParams, relationQuery, relationView } from './schemas';
@ApiTags('cross-references')
@ApiBearerAuth()
@ApiResponse({ status: 400, standardSchema: errorView('VALIDATION_ERROR', 'Entrada inválida.') })
@ApiResponse({ status: 401, standardSchema: errorView('UNAUTHORIZED', 'Autenticação necessária.') })
@ApiResponse({ status: 404, standardSchema: errorView('NOT_FOUND', 'Recurso não encontrado.') })
@ApiResponse({ status: 503, standardSchema: errorView('RELATION_UNAVAILABLE', 'Relações temporariamente indisponíveis.') })
@UseGuards(LocalAccessGuard)
@UseFilters(RelationErrorFilter)
@Controller('cross-references')
export class RelationController {
  constructor(private readonly library: RelationLibrary) {}
  @Post()
  @ApiResponse({ status: 201, standardSchema: relationView })
  @ApiResponse({ status: 422, standardSchema: errorView('RELATION_EVIDENCE_REJECTED', 'Não foi possível validar as evidências da relação.') })
  async create(@CurrentOwner() owner: string, @Body({ schema: createRelationBody }) body: z.infer<typeof createRelationBody>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) {
    void query; return relationView.parse(await this.library.create(owner, body));
  }
  @Get()
  @ApiQuery({ name: 'translationId', required: true, schema: { type: 'string' } })
  @ApiQuery({ name: 'reference', required: true, schema: { type: 'string' } })
  @ApiQuery({ name: 'limit', required: false, schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } })
  @ApiQuery({ name: 'cursor', required: false, schema: { type: 'string', maxLength: 256 } })
  @ApiResponse({ status: 200, standardSchema: relationPageView })
  async list(@CurrentOwner() owner: string, @Query({ schema: relationQuery }) query: z.infer<typeof relationQuery>, @Body({ schema: emptyBody }) body: z.infer<typeof emptyBody>) {
    void body; const page = await this.library.list(owner, query.translationId, query.reference, { limit: query.limit, ...(query.cursor ? { cursor: query.cursor } : {}) });
    return relationPageView.parse({ items: page.items, nextCursor: encodeCursor(page.nextCursor) });
  }
  @Get(':id')
  @ApiParam({ name: 'id', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, standardSchema: relationView })
  async read(@CurrentOwner() owner: string, @Param({ schema: relationParams }) params: z.infer<typeof relationParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>, @Body({ schema: emptyBody }) body: z.infer<typeof emptyBody>) {
    void query; void body; return relationView.parse(await this.library.read(owner, params.id));
  }
  @Delete(':id')
  @HttpCode(204)
  @ApiParam({ name: 'id', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 204, description: 'Relação própria eliminada.' })
  async delete(@CurrentOwner() owner: string, @Param({ schema: relationParams }) params: z.infer<typeof relationParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>, @Body({ schema: emptyBody }) body: z.infer<typeof emptyBody>): Promise<void> {
    void query; void body; await this.library.delete(owner, params.id);
  }
}
