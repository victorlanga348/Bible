export class WorkspaceInputError extends Error {}
export class WorkspaceConflictError extends Error {}
export interface NoteProps { readonly id: string; readonly ownerId: string; readonly studyId: string; readonly studyVersion: number; readonly revision: number; readonly content: string; readonly createdAt: string; readonly updatedAt: string }
export interface FavoriteProps { readonly id: string; readonly ownerId: string; readonly studyId: string; readonly studyVersion: number; readonly createdAt: string }
export interface WorkspaceWindow { readonly limit: number; readonly cursor?: { readonly id: string; readonly createdAt: string } }
function check(value: boolean): asserts value { if (!value) throw new WorkspaceInputError('Invalid workspace value'); }
export function workspaceOwner(value: string): void { check(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value)); }
export function workspaceId(value: string): void { check(typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)); }
export function workspaceVersion(value: number): void { check(Number.isSafeInteger(value) && value > 0); }
function date(value: string): void { check(typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value); }
export function workspaceWindow(owner: string, value: WorkspaceWindow): void {
  workspaceOwner(owner); check(value !== null && typeof value === 'object' && Number.isSafeInteger(value.limit) && value.limit >= 1 && value.limit <= 50);
  if (value.cursor !== undefined) { check(value.cursor !== null && typeof value.cursor === 'object'); workspaceId(value.cursor.id); date(value.cursor.createdAt); }
}
export function noteContent(value: string): string {
  check(typeof value === 'string'); const content = value.trim();
  check(content.length > 0 && !/[\uD800-\uDFFF]/u.test(content) && !/\p{Cc}/u.test(content.replace(/[\t\r\n]/g, '')) && new TextEncoder().encode(content).byteLength <= 8000);
  return content;
}
function target(input: FavoriteProps): void { check(input !== null && typeof input === 'object'); workspaceId(input.id); workspaceOwner(input.ownerId); workspaceId(input.studyId); workspaceVersion(input.studyVersion); date(input.createdAt); }
export class WorkspaceNote implements NoteProps {
  readonly id: string; readonly ownerId: string; readonly studyId: string; readonly studyVersion: number; readonly revision: number; readonly content: string; readonly createdAt: string; readonly updatedAt: string;
  constructor(input: NoteProps) {
    target(input); check(Number.isInteger(input.revision) && input.revision >= 1 && input.revision <= 2147483647); date(input.updatedAt); check(input.updatedAt >= input.createdAt);
    this.id = input.id; this.ownerId = input.ownerId; this.studyId = input.studyId; this.studyVersion = input.studyVersion; this.revision = input.revision; this.content = noteContent(input.content); this.createdAt = input.createdAt; this.updatedAt = input.updatedAt;
    Object.freeze(this);
  }
  revise(expectedRevision: number, content: string, updatedAt: string): WorkspaceNote {
    if (expectedRevision !== this.revision || this.revision === 2147483647) throw new WorkspaceConflictError();
    date(updatedAt); check(updatedAt >= this.updatedAt);
    return new WorkspaceNote({ ...this, revision: this.revision + 1, content, updatedAt });
  }
}
export class WorkspaceFavorite implements FavoriteProps {
  readonly id: string; readonly ownerId: string; readonly studyId: string; readonly studyVersion: number; readonly createdAt: string;
  constructor(input: FavoriteProps) { target(input); this.id = input.id; this.ownerId = input.ownerId; this.studyId = input.studyId; this.studyVersion = input.studyVersion; this.createdAt = input.createdAt; Object.freeze(this); }
}
