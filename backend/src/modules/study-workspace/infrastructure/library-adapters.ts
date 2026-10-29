import type { WriteScope } from '../../../application/write-scope';
import type { PageWindow } from '../../../application/pagination';
import type { StudyLibrary } from '../../study/application/study-library';
import { StudyNotFoundError } from '../../study/application/errors';
import type { AiHistoryLibrary } from '../../ai-assistant/application/ai-history-library';
import type { WorkspaceStudiesPort, WorkspaceHistoryPort } from '../application/ports';
import { WorkspaceNotFoundError, WorkspaceUnavailableError } from '../application/errors';
async function deliver<T>(execute: () => Promise<T>): Promise<T> {
  try { return await execute(); }
  catch (cause) {
    if (cause instanceof StudyNotFoundError) throw new WorkspaceNotFoundError();
    if (cause instanceof WorkspaceUnavailableError) throw cause;
    throw new WorkspaceUnavailableError('Workspace module operation failed', { cause });
  }
}
export class WorkspaceStudyAdapter implements WorkspaceStudiesPort {
  constructor(private readonly library: StudyLibrary) {}
  async metadata(owner: string, id: string, version?: number) { return deliver(() => this.library.metadata(owner, id, version)); }
  async list(owner: string, window: PageWindow) { return deliver(() => this.library.list(owner, window)); }
  async guardActive<T>(owner: string, id: string, write: (scope: WriteScope) => Promise<T>): Promise<T> { return deliver(() => this.library.guardActive(owner, id, write)); }
  async beginDelete(owner: string, id: string): Promise<void> { return deliver(() => this.library.beginDelete(owner, id)); }
  async finishDelete(owner: string, id: string): Promise<void> { return deliver(() => this.library.finishDelete(owner, id)); }
}
export class WorkspaceHistoryAdapter implements WorkspaceHistoryPort {
  constructor(private readonly library: AiHistoryLibrary) {}
  async listForStudy(owner: string, id: string, window: PageWindow) { return deliver(() => this.library.listForStudy(owner, id, window)); }
  async deleteForStudy(owner: string, id: string): Promise<void> { return deliver(() => this.library.deleteForStudy(owner, id)); }
}
