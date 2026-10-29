import type { WriteScope } from '../../../application/write-scope';
import type { PageWindow } from '../../../application/pagination';
import type { Database } from '../../../infrastructure/database';
import { writeTransaction } from '../../../infrastructure/write-scope';
import type { WorkspaceNote as NoteRow, WorkspaceFavorite as FavoriteRow } from '../../../generated/prisma/client';
import type { WorkspaceStorePort } from '../application/ports';
import { WorkspaceUnavailableError } from '../application/errors';
import { WorkspaceNote, WorkspaceFavorite } from '../domain/workspace';
const hydrateNote = (row: NoteRow) => new WorkspaceNote({ ...row, studyVersion: Number(row.studyVersion), createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
const hydrateFavorite = (row: FavoriteRow) => new WorkspaceFavorite({ ...row, studyVersion: Number(row.studyVersion), createdAt: row.createdAt.toISOString() });
const cursor = (window: PageWindow) => window.cursor ? { OR: [{ createdAt: { lt: new Date(window.cursor.createdAt) } }, { createdAt: new Date(window.cursor.createdAt), id: { lt: window.cursor.id } }] } : {};
export class PrismaWorkspaceStore implements WorkspaceStorePort {
  constructor(private readonly database: Database) {}
  private async attempt<T>(execute: () => Promise<T>): Promise<T> {
    try { return await execute(); } catch (cause) { throw new WorkspaceUnavailableError('Workspace persistence failed', { cause }); }
  }
  async createNote(note: WorkspaceNote, scope?: WriteScope): Promise<void> {
    return this.attempt(async () => { await writeTransaction(this.database, scope, tx => tx.workspaceNote.create({ data: { ...note, studyVersion: BigInt(note.studyVersion), createdAt: new Date(note.createdAt), updatedAt: new Date(note.updatedAt) } })); });
  }
  async findNote(owner: string, id: string): Promise<WorkspaceNote | null> {
    return this.attempt(async () => { const row = await this.database.client.workspaceNote.findFirst({ where: { id, ownerId: owner } }); return row ? hydrateNote(row) : null; });
  }
  async listNotes(owner: string, studyId: string, window: PageWindow, version?: number): Promise<readonly WorkspaceNote[]> {
    return this.attempt(async () => {
      const rows = await this.database.client.workspaceNote.findMany({ where: { ownerId: owner, studyId, ...(version === undefined ? {} : { studyVersion: BigInt(version) }), ...cursor(window) }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: window.limit + 1 });
      return rows.map(hydrateNote);
    });
  }
  async replaceNote(note: WorkspaceNote, expectedRevision: number, scope?: WriteScope): Promise<boolean> {
    if (note.revision !== expectedRevision + 1) return false;
    return this.attempt(async () => {
      const result = await writeTransaction(this.database, scope, tx => tx.workspaceNote.updateMany({ where: { id: note.id, ownerId: note.ownerId, studyId: note.studyId, studyVersion: BigInt(note.studyVersion), createdAt: new Date(note.createdAt), revision: expectedRevision }, data: { revision: note.revision, content: note.content, updatedAt: new Date(note.updatedAt) } }));
      return result.count === 1;
    });
  }
  async deleteNote(owner: string, id: string, scope?: WriteScope): Promise<boolean> {
    return this.attempt(async () => (await writeTransaction(this.database, scope, tx => tx.workspaceNote.deleteMany({ where: { id, ownerId: owner } }))).count === 1);
  }
  async favorite(value: WorkspaceFavorite, scope?: WriteScope): Promise<WorkspaceFavorite> {
    return this.attempt(async () => writeTransaction(this.database, scope, async tx => {
      await tx.workspaceFavorite.createMany({ data: [{ ...value, studyVersion: BigInt(value.studyVersion), createdAt: new Date(value.createdAt) }], skipDuplicates: true });
      const row = await tx.workspaceFavorite.findUniqueOrThrow({ where: { ownerId_studyId_studyVersion: { ownerId: value.ownerId, studyId: value.studyId, studyVersion: BigInt(value.studyVersion) } } });
      return hydrateFavorite(row);
    }));
  }
  async deleteFavorite(owner: string, studyId: string, version: number, scope?: WriteScope): Promise<void> {
    return this.attempt(async () => { await writeTransaction(this.database, scope, tx => tx.workspaceFavorite.deleteMany({ where: { ownerId: owner, studyId, studyVersion: BigInt(version) } })); });
  }
  async listFavorites(owner: string, window: PageWindow): Promise<readonly WorkspaceFavorite[]> {
    return this.attempt(async () => (await this.database.client.workspaceFavorite.findMany({ where: { ownerId: owner, ...cursor(window) }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: window.limit + 1 })).map(hydrateFavorite));
  }
  async deleteForStudy(owner: string, studyId: string): Promise<void> {
    return this.attempt(async () => { await this.database.client.$transaction(async tx => { await tx.workspaceNote.deleteMany({ where: { ownerId: owner, studyId } }); await tx.workspaceFavorite.deleteMany({ where: { ownerId: owner, studyId } }); }); });
  }
}
