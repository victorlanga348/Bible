import type { PageWindow } from '../../../application/pagination';
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { LocalAccessGuard } from '../../../presentation/local-access.guard';
import { CurrentOwner } from '../../../presentation/current-owner';
import { encodeCursor } from '../../../presentation/pagination';
import { WorkspaceLibrary } from '../application/workspace-library';
import { WorkspaceErrorFilter } from './workspace-error.filter';
import { studyParams, noteParams, favoriteParams, pageQuery, notesQuery, emptyQuery, emptyBody, noteBody, reviseBody, studyPage, conversationPage, noteView, notePage, favoriteView, favoritePage, errorView } from './schemas';
function pageWindow(query: z.infer<typeof pageQuery>): PageWindow { return { limit: query.limit, ...(query.cursor ? { cursor: query.cursor } : {}) }; }
@ApiTags('workspace')
@ApiBearerAuth()
@ApiResponse({ status: 400, standardSchema: errorView('VALIDATION_ERROR', 'Entrada inválida.') })
@ApiResponse({ status: 401, standardSchema: errorView('UNAUTHORIZED', 'Autenticação necessária.') })
@ApiResponse({ status: 404, standardSchema: errorView('NOT_FOUND', 'Recurso não encontrado.') })
@ApiResponse({ status: 503, standardSchema: errorView('WORKSPACE_UNAVAILABLE', 'Espaço de estudo temporariamente indisponível.') })
@UseGuards(LocalAccessGuard)
@UseFilters(WorkspaceErrorFilter)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly library: WorkspaceLibrary) {}
  @Get('studies')
  @ApiQuery({ name: 'limit', required: false, schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } })
  @ApiQuery({ name: 'cursor', required: false, schema: { type: 'string', maxLength: 256 } })
  @ApiResponse({ status: 200, standardSchema: studyPage })
  async studies(@CurrentOwner() owner: string, @Query({ schema: pageQuery }) query: z.infer<typeof pageQuery>, @Body({ schema: emptyBody }) body: z.infer<typeof emptyBody>) {
    void body; const page = await this.library.listStudies(owner, pageWindow(query)); return studyPage.parse({ items: page.items, nextCursor: encodeCursor(page.nextCursor) });
  }
  @Get('studies/:studyId/conversations')
  @ApiParam({ name: 'studyId', schema: { type: 'string', format: 'uuid' } })
  @ApiQuery({ name: 'limit', required: false, schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } })
  @ApiQuery({ name: 'cursor', required: false, schema: { type: 'string', maxLength: 256 } })
  @ApiResponse({ status: 200, standardSchema: conversationPage })
  async conversations(@CurrentOwner() owner: string, @Param({ schema: studyParams }) params: z.infer<typeof studyParams>, @Query({ schema: pageQuery }) query: z.infer<typeof pageQuery>, @Body({ schema: emptyBody }) body: z.infer<typeof emptyBody>) {
    void body; const page = await this.library.conversations(owner, params.studyId, pageWindow(query)); return conversationPage.parse({ items: page.items, nextCursor: encodeCursor(page.nextCursor) });
  }
  @Post('studies/:studyId/notes')
  @ApiParam({ name: 'studyId', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 201, standardSchema: noteView })
  async createNote(@CurrentOwner() owner: string, @Param({ schema: studyParams }) params: z.infer<typeof studyParams>, @Body({ schema: noteBody }) body: z.infer<typeof noteBody>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) {
    void query; return noteView.parse(await this.library.createNote(owner, params.studyId, body.studyVersion, body.content));
  }
  @Get('studies/:studyId/notes')
  @ApiParam({ name: 'studyId', schema: { type: 'string', format: 'uuid' } })
  @ApiQuery({ name: 'limit', required: false, schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } })
  @ApiQuery({ name: 'cursor', required: false, schema: { type: 'string', maxLength: 256 } })
  @ApiQuery({ name: 'studyVersion', required: false, schema: { type: 'integer', minimum: 1 } })
  @ApiResponse({ status: 200, standardSchema: notePage })
  async notes(@CurrentOwner() owner: string, @Param({ schema: studyParams }) params: z.infer<typeof studyParams>, @Query({ schema: notesQuery }) query: z.infer<typeof notesQuery>, @Body({ schema: emptyBody }) body: z.infer<typeof emptyBody>) {
    void body; const page = await this.library.listNotes(owner, params.studyId, pageWindow(query), query.studyVersion); return notePage.parse({ items: page.items, nextCursor: encodeCursor(page.nextCursor) });
  }
  @Patch('notes/:noteId')
  @ApiParam({ name: 'noteId', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 200, standardSchema: noteView })
  @ApiResponse({ status: 409, standardSchema: errorView('WORKSPACE_CONFLICT', 'Não foi possível atualizar esta revisão da nota.') })
  async reviseNote(@CurrentOwner() owner: string, @Param({ schema: noteParams }) params: z.infer<typeof noteParams>, @Body({ schema: reviseBody }) body: z.infer<typeof reviseBody>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>) {
    void query; return noteView.parse(await this.library.reviseNote(owner, params.noteId, body.expectedRevision, body.content));
  }
  @Delete('notes/:noteId')
  @HttpCode(204)
  @ApiParam({ name: 'noteId', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 204, description: 'Nota própria eliminada.' })
  async deleteNote(@CurrentOwner() owner: string, @Param({ schema: noteParams }) params: z.infer<typeof noteParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>, @Body({ schema: emptyBody }) body: z.infer<typeof emptyBody>): Promise<void> {
    void body; void query; await this.library.deleteNote(owner, params.noteId);
  }
  @Put('studies/:studyId/favorites/:studyVersion')
  @HttpCode(200)
  @ApiParam({ name: 'studyId', schema: { type: 'string', format: 'uuid' } })
  @ApiParam({ name: 'studyVersion', schema: { type: 'integer', minimum: 1 } })
  @ApiResponse({ status: 200, standardSchema: favoriteView })
  async favorite(@CurrentOwner() owner: string, @Param({ schema: favoriteParams }) params: z.infer<typeof favoriteParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>, @Body({ schema: emptyBody }) body: z.infer<typeof emptyBody>) {
    void body; void query; return favoriteView.parse(await this.library.favorite(owner, params.studyId, params.studyVersion));
  }
  @Delete('studies/:studyId/favorites/:studyVersion')
  @HttpCode(204)
  @ApiParam({ name: 'studyId', schema: { type: 'string', format: 'uuid' } })
  @ApiParam({ name: 'studyVersion', schema: { type: 'integer', minimum: 1 } })
  @ApiResponse({ status: 204, description: 'Favorito próprio eliminado ou já ausente.' })
  async deleteFavorite(@CurrentOwner() owner: string, @Param({ schema: favoriteParams }) params: z.infer<typeof favoriteParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>, @Body({ schema: emptyBody }) body: z.infer<typeof emptyBody>): Promise<void> {
    void body; void query; await this.library.deleteFavorite(owner, params.studyId, params.studyVersion);
  }
  @Get('favorites')
  @ApiQuery({ name: 'limit', required: false, schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } })
  @ApiQuery({ name: 'cursor', required: false, schema: { type: 'string', maxLength: 256 } })
  @ApiResponse({ status: 200, standardSchema: favoritePage })
  async favorites(@CurrentOwner() owner: string, @Query({ schema: pageQuery }) query: z.infer<typeof pageQuery>, @Body({ schema: emptyBody }) body: z.infer<typeof emptyBody>) {
    void body; const page = await this.library.favorites(owner, pageWindow(query)); return favoritePage.parse({ items: page.items, nextCursor: encodeCursor(page.nextCursor) });
  }
  @Delete('studies/:studyId')
  @HttpCode(204)
  @ApiParam({ name: 'studyId', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 204, description: 'Estudo e filhos eliminados pelos respetivos módulos.' })
  async deleteStudy(@CurrentOwner() owner: string, @Param({ schema: studyParams }) params: z.infer<typeof studyParams>, @Query({ schema: emptyQuery }) query: z.infer<typeof emptyQuery>, @Body({ schema: emptyBody }) body: z.infer<typeof emptyBody>): Promise<void> {
    void body; void query; await this.library.deleteStudy(owner, params.studyId);
  }
}
