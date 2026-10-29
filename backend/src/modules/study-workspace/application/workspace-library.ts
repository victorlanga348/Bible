import type { PageWindow, PageCursor } from '../../../application/pagination';
import type { WorkspaceStorePort, WorkspaceStudiesPort, WorkspaceHistoryPort, WorkspaceIdentityClockPort, WorkspacePage, WorkspaceStudySummary, WorkspaceConversationSummary, WorkspaceReference } from './ports';
import type { NoteProps, FavoriteProps } from '../domain/workspace';
import { WorkspaceNote, WorkspaceFavorite, WorkspaceInputError, WorkspaceConflictError, workspaceOwner, workspaceId, workspaceVersion, workspaceWindow, noteContent } from '../domain/workspace';
import { WorkspaceNotFoundError } from './errors';
export type NoteView = Omit<NoteProps, 'ownerId'>;
export type FavoriteView = Omit<FavoriteProps, 'ownerId'>;
export interface FavoriteSummary extends FavoriteView { readonly reference: WorkspaceReference }
const noteView = (note: WorkspaceNote): NoteView => ({ id: note.id, studyId: note.studyId, studyVersion: note.studyVersion, revision: note.revision, content: note.content, createdAt: note.createdAt, updatedAt: note.updatedAt });
const favoriteView = (favorite: WorkspaceFavorite): FavoriteView => ({ id: favorite.id, studyId: favorite.studyId, studyVersion: favorite.studyVersion, createdAt: favorite.createdAt });
function cursor(rows: readonly { id: string; createdAt: string }[], limit: number): PageCursor | null { const last = rows.slice(0, limit).at(-1); return rows.length > limit && last ? { id: last.id, createdAt: last.createdAt } : null; }
function target(owner: string, id: string, version?: number): void { workspaceOwner(owner); workspaceId(id); if (version !== undefined) workspaceVersion(version); }
export class WorkspaceLibrary {
  constructor(private readonly store: WorkspaceStorePort, private readonly studies: WorkspaceStudiesPort, private readonly history: WorkspaceHistoryPort, private readonly identity: WorkspaceIdentityClockPort) {}
  async listStudies(owner: string, window: PageWindow): Promise<WorkspacePage<WorkspaceStudySummary>> { workspaceWindow(owner, window); return this.studies.list(owner, window); }
  async conversations(owner: string, studyId: string, window: PageWindow): Promise<WorkspacePage<WorkspaceConversationSummary>> {
    workspaceWindow(owner, window); workspaceId(studyId); await this.studies.metadata(owner, studyId);
    return this.history.listForStudy(owner, studyId, window);
  }
  async createNote(owner: string, studyId: string, version: number, content: string): Promise<NoteView> {
    target(owner, studyId, version); const normalized = noteContent(content); await this.studies.metadata(owner, studyId, version);
    const now = this.identity.now(); const note = new WorkspaceNote({ id: this.identity.id(), ownerId: owner, studyId, studyVersion: version, revision: 1, content: normalized, createdAt: now, updatedAt: now });
    await this.studies.guardActive(owner, studyId, scope => this.store.createNote(note, scope)); return noteView(note);
  }
  async listNotes(owner: string, studyId: string, window: PageWindow, version?: number): Promise<WorkspacePage<NoteView>> {
    workspaceWindow(owner, window); workspaceId(studyId); if (version !== undefined) workspaceVersion(version); await this.studies.metadata(owner, studyId, version);
    const rows = await this.store.listNotes(owner, studyId, window, version);
    return { items: rows.slice(0, window.limit).map(noteView), nextCursor: cursor(rows, window.limit) };
  }
  private async loadNote(owner: string, id: string): Promise<WorkspaceNote> {
    target(owner, id); const note = await this.store.findNote(owner, id); if (!note) throw new WorkspaceNotFoundError();
    await this.studies.metadata(owner, note.studyId, note.studyVersion); return note;
  }
  async reviseNote(owner: string, id: string, expectedRevision: number, content: string): Promise<NoteView> {
    target(owner, id); const normalized = noteContent(content);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1 || expectedRevision > 2147483647) throw new WorkspaceInputError();
    const note = await this.loadNote(owner, id); const next = note.revise(expectedRevision, normalized, this.identity.now());
    if (!await this.studies.guardActive(owner, note.studyId, scope => this.store.replaceNote(next, expectedRevision, scope))) { await this.loadNote(owner, id); throw new WorkspaceConflictError(); }
    return noteView(next);
  }
  async deleteNote(owner: string, id: string): Promise<void> {
    const note = await this.loadNote(owner, id); if (!await this.studies.guardActive(owner, note.studyId, scope => this.store.deleteNote(owner, id, scope))) throw new WorkspaceNotFoundError();
  }
  async favorite(owner: string, studyId: string, version: number): Promise<FavoriteView> {
    target(owner, studyId, version); await this.studies.metadata(owner, studyId, version);
    const value = new WorkspaceFavorite({ id: this.identity.id(), ownerId: owner, studyId, studyVersion: version, createdAt: this.identity.now() });
    return favoriteView(await this.studies.guardActive(owner, studyId, scope => this.store.favorite(value, scope)));
  }
  async deleteFavorite(owner: string, studyId: string, version: number): Promise<void> { target(owner, studyId, version); await this.studies.metadata(owner, studyId, version); await this.studies.guardActive(owner, studyId, scope => this.store.deleteFavorite(owner, studyId, version, scope)); }
  async favorites(owner: string, window: PageWindow): Promise<WorkspacePage<FavoriteSummary>> {
    workspaceWindow(owner, window); const rows = await this.store.listFavorites(owner, window); const items: FavoriteSummary[] = [];
    for (const row of rows.slice(0, window.limit)) {
      try { const study = await this.studies.metadata(owner, row.studyId, row.studyVersion); items.push({ ...favoriteView(row), reference: study.reference }); }
      catch (cause) { if (!(cause instanceof WorkspaceNotFoundError)) throw cause; }
    }
    return { items, nextCursor: cursor(rows, window.limit) };
  }
  async deleteStudy(owner: string, studyId: string): Promise<void> { target(owner, studyId); await this.studies.beginDelete(owner, studyId); await this.history.deleteForStudy(owner, studyId); await this.store.deleteForStudy(owner, studyId); await this.studies.finishDelete(owner, studyId); }
}
