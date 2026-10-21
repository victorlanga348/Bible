import { Controller, Get, Param, Query, UseFilters } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { SourceLibrary } from '../application/source-library';
import { SourceErrorFilter } from './source-error.filter';
import { catalogueView, emptyQuery, errorView, excerptDetailView, excerptPageView, excerptParams, excerptQuery, sourceParams } from './schemas';

@ApiTags('source-library')
@ApiResponse({ status: 400, standardSchema: errorView('VALIDATION_ERROR', 'Entrada inválida.') })
@ApiResponse({ status: 403, standardSchema: errorView('FORBIDDEN', 'Operação não autorizada.') })
@ApiResponse({ status: 404, standardSchema: errorView('NOT_FOUND', 'Recurso não encontrado.') })
@ApiResponse({ status: 500, standardSchema: errorView('INTERNAL_ERROR', 'Erro interno.') })
@UseFilters(SourceErrorFilter)
@Controller()
export class SourceController {
  constructor(private readonly library: SourceLibrary) {}

  @Get('sources')
  @ApiResponse({ status: 200, standardSchema: catalogueView })
  async catalogue(@Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) {
    void query;
    return catalogueView.parse({ sources: await this.library.listSources() });
  }

  @Get('sources/:sourceId/excerpts')
  @ApiParam({ name: 'sourceId', schema: { type: 'string', pattern: '^[a-z0-9-]+$' } })
  @ApiQuery({ name: 'q', required: false, schema: { type: 'string', minLength: 1, maxLength: 200 } })
  @ApiQuery({ name: 'limit', required: false, schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } })
  @ApiQuery({ name: 'offset', required: false, schema: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER, default: 0 } })
  @ApiResponse({ status: 200, standardSchema: excerptPageView })
  async excerpts(@Param({ schema: sourceParams }) params: z.infer<typeof sourceParams>, @Query({ schema: excerptQuery }) query: z.infer<typeof excerptQuery>) {
    return excerptPageView.parse(await this.library.listExcerpts(params.sourceId, {
      limit: query.limit, offset: query.offset, ...(query.q === undefined ? {} : { query: query.q }),
    }));
  }

  @Get('source-excerpts/:excerptId')
  @ApiParam({ name: 'excerptId', schema: { type: 'string', pattern: '^[a-z0-9-]+$' } })
  @ApiResponse({ status: 200, standardSchema: excerptDetailView })
  async excerpt(@Param({ schema: excerptParams }) params: z.infer<typeof excerptParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) {
    void query;
    return excerptDetailView.parse(await this.library.getExcerpt(params.excerptId));
  }
}
