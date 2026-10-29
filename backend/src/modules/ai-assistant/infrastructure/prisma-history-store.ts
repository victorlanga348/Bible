import type { Database } from '../../../infrastructure/database';
import type { PageWindow } from '../../../application/pagination';
import type { Prisma } from '../../../generated/prisma/client';
import type { AiHistoryStorePort, ConversationSummary } from '../application/history-ports';
import { AiUnavailableError } from '../application/errors';
export class PrismaHistoryStore implements AiHistoryStorePort {
  constructor(private readonly database: Database) {}
  async list(ownerId: string, studyId: string, window: PageWindow): Promise<readonly ConversationSummary[]> {
    try {
      const after: Prisma.AiConversationWhereInput[] = window.cursor ? [{ OR: [{ createdAt: { lt: new Date(window.cursor.createdAt) } }, { createdAt: new Date(window.cursor.createdAt), id: { lt: window.cursor.id } }] }] : [];
      const rows = await this.database.client.aiConversation.findMany({ where: { ownerId, studyId, AND: after }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: window.limit + 1, select: { id: true, studyId: true, studyVersion: true, revision: true, createdAt: true } });
      return rows.map(row => ({ id: row.id, studyId: row.studyId, studyVersion: Number(row.studyVersion), revision: row.revision, createdAt: row.createdAt.toISOString() }));
    } catch (cause) { throw new AiUnavailableError('Conversation history failed', { cause }); }
  }
  async deleteForStudy(ownerId: string, studyId: string): Promise<void> {
    try {
      await this.database.client.$transaction(async transaction => {
        await transaction.aiConversation.deleteMany({ where: { ownerId, studyId } });
        await transaction.aiAnalysis.deleteMany({ where: { ownerId, studyId } });
      });
    } catch (cause) { throw new AiUnavailableError('Study AI cleanup failed', { cause }); }
  }
}
