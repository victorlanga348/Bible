import type { AiHistoryStorePort, ConversationSummary } from './history-ports';
import type { PageWindow, PageCursor } from '../../../application/pagination';
import { AiModelInputError } from '../domain/model-input';
function identity(owner: string, id: string): void {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(owner) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) throw new AiModelInputError();
}
export class AiHistoryLibrary {
  constructor(private readonly store: AiHistoryStorePort) {}
  async listForStudy(ownerId: string, studyId: string, window: PageWindow): Promise<{ items: readonly ConversationSummary[]; nextCursor: PageCursor | null }> {
    identity(ownerId, studyId);
    if (!Number.isSafeInteger(window.limit) || window.limit < 1 || window.limit > 50) throw new AiModelInputError();
    if (window.cursor !== undefined) {
      identity(ownerId, window.cursor.id);
      if (!Number.isFinite(Date.parse(window.cursor.createdAt)) || new Date(window.cursor.createdAt).toISOString() !== window.cursor.createdAt) throw new AiModelInputError();
    }
    const rows = await this.store.list(ownerId, studyId, window); const items = rows.slice(0, window.limit); const last = items.at(-1);
    return { items, nextCursor: rows.length > window.limit && last ? { id: last.id, createdAt: last.createdAt } : null };
  }
  async deleteForStudy(ownerId: string, studyId: string): Promise<void> { identity(ownerId, studyId); await this.store.deleteForStudy(ownerId, studyId); }
}
