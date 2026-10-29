import type { WriteScope } from '../../../application/write-scope';
import type { PageCursor, PageWindow } from '../../../application/pagination';
import type { WorkspaceNote, WorkspaceFavorite } from '../domain/workspace';
export interface WorkspaceReference { readonly translationId: string; readonly bookCode: string; readonly chapter: number; readonly fromVerse: number; readonly toVerse: number; readonly normalized: string }
export interface WorkspaceStudySummary { readonly id: string; readonly version: number; readonly createdAt: string; readonly reference: WorkspaceReference }
export interface WorkspaceConversationSummary { readonly id: string; readonly studyId: string; readonly studyVersion: number; readonly revision: number; readonly createdAt: string }
export interface WorkspacePage<T> { readonly items: readonly T[]; readonly nextCursor: PageCursor | null }
export interface WorkspaceStudiesPort {
 metadata(owner: string, id: string, version?: number): Promise<WorkspaceStudySummary>;
 list(owner: string, window: PageWindow): Promise<WorkspacePage<WorkspaceStudySummary>>;
 guardActive<T>(owner: string, id: string, write: (scope: WriteScope) => Promise<T>): Promise<T>;
 beginDelete(owner: string, id: string): Promise<void>;
 finishDelete(owner: string, id: string): Promise<void>;
}
export interface WorkspaceHistoryPort {
 listForStudy(owner: string, id: string, window: PageWindow): Promise<WorkspacePage<WorkspaceConversationSummary>>;
 deleteForStudy(owner: string, id: string): Promise<void>;
}
export interface WorkspaceIdentityClockPort { id(): string; now(): string }
export interface WorkspaceStorePort {
 createNote(note: WorkspaceNote, scope?: WriteScope): Promise<void>;
 findNote(owner: string, id: string): Promise<WorkspaceNote | null>;
 listNotes(owner: string, studyId: string, window: PageWindow, version?: number): Promise<readonly WorkspaceNote[]>;
 replaceNote(note: WorkspaceNote, expectedRevision: number, scope?: WriteScope): Promise<boolean>;
 deleteNote(owner: string, id: string, scope?: WriteScope): Promise<boolean>;
 favorite(value: WorkspaceFavorite, scope?: WriteScope): Promise<WorkspaceFavorite>;
 deleteFavorite(owner: string, studyId: string, version: number, scope?: WriteScope): Promise<void>;
 listFavorites(owner: string, window: PageWindow): Promise<readonly WorkspaceFavorite[]>;
 deleteForStudy(owner: string, studyId: string): Promise<void>;
}
