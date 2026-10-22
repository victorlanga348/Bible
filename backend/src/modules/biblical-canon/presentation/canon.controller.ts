import { Body, Controller, Get, HttpCode, Param, Post, Query, UseFilters } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { CanonLibrary } from '../application/canon-library';
import { CanonErrorFilter } from './canon-error.filter';
import { bookParams, booksView, chapterParams, chaptersView, emptyQuery, errorView, passageView, rangeQuery, resolveBody, resolvedView, translationParams, translationsView } from './schemas';

@ApiTags('biblical-canon')
@ApiResponse({ status: 400, standardSchema: errorView('VALIDATION_ERROR', 'Entrada inválida.') })
@ApiResponse({ status: 404, standardSchema: errorView('NOT_FOUND', 'Recurso não encontrado.') })
@ApiResponse({ status: 500, standardSchema: errorView('INTERNAL_ERROR', 'Erro interno.') })
@UseFilters(CanonErrorFilter)
@Controller()
export class CanonController {
  constructor(private readonly library: CanonLibrary) {}
  @Get('translations')
  @ApiResponse({ status: 200, standardSchema: translationsView })
  async translations(@Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) { void query; return translationsView.parse({ translations: await this.library.translations() }); }

  @Get('translations/:translationId/books')
  @ApiParam({ name: 'translationId', type: String })
  @ApiResponse({ status: 200, standardSchema: booksView })
  async books(@Param({ schema: translationParams }) params: z.infer<typeof translationParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) { void query; return booksView.parse({ books: await this.library.books(params.translationId) }); }

  @Get('translations/:translationId/books/:bookCode/chapters')
  @ApiParam({ name: 'translationId', type: String })
  @ApiParam({ name: 'bookCode', type: String })
  @ApiResponse({ status: 200, standardSchema: chaptersView })
  async chapters(@Param({ schema: bookParams }) params: z.infer<typeof bookParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) { void query; return chaptersView.parse({ chapters: await this.library.chapters(params.translationId, params.bookCode) }); }

  @Get('translations/:translationId/books/:bookCode/chapters/:chapter/verses')
  @ApiParam({ name: 'translationId', type: String })
  @ApiParam({ name: 'bookCode', type: String })
  @ApiParam({ name: 'chapter', schema: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER } })
  @ApiQuery({ name: 'from', required: false, schema: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER } })
  @ApiQuery({ name: 'to', required: false, schema: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER } })
  @ApiResponse({ status: 200, standardSchema: passageView })
  async passage(@Param({ schema: chapterParams }) params: z.infer<typeof chapterParams>, @Query({ schema: rangeQuery }) query: z.infer<typeof rangeQuery>) { return passageView.parse(await this.library.passage(params.translationId, params.bookCode, params.chapter, query.from, query.to)); }

  @Post('references/resolve')
  @HttpCode(200)
  @ApiResponse({ status: 200, standardSchema: resolvedView })
  async resolve(@Body({ schema: resolveBody }) body: z.infer<typeof resolveBody>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) { void query; const resolved = await this.library.resolve(body.translationId, body.reference); return resolvedView.parse({ ...resolved, normalized: resolved.toString() }); }
}
