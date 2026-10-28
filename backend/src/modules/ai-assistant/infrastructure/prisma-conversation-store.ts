import type { Database } from '../../../infrastructure/database';
import type { ConversationStorePort } from '../application/conversation-ports';
import { ConversationDocument, type ConversationProps } from '../domain/conversation';
import { AiModelInputError } from '../domain/model-input';
import { AiUnavailableError } from '../application/errors';
import type { Prisma } from '../../../generated/prisma/client';

interface StoredConversation {
  readonly id: string; readonly ownerId: string; readonly studyId: string; readonly studyVersion: bigint;
  readonly revision: number; readonly createdAt: Date; readonly document: unknown;
}
const json = (document: ConversationDocument): Prisma.InputJsonValue => JSON.parse(JSON.stringify(document)) as Prisma.InputJsonValue;
function active(signal?: AbortSignal): void { if (signal?.aborted) throw new AiUnavailableError(); }
function unavailable(cause: unknown): never {
  if (cause instanceof AiUnavailableError) throw cause;
  throw new AiUnavailableError('Conversation persistence failed', { cause });
}
function hydrate(row: StoredConversation): ConversationDocument {
  const document = new ConversationDocument(row.document as ConversationProps);
  if (document.id !== row.id || document.ownerId !== row.ownerId || document.studyId !== row.studyId || BigInt(document.studyVersion) !== row.studyVersion || document.revision !== row.revision || document.createdAt !== row.createdAt.toISOString()) throw new Error('Incoherent conversation metadata');
  return document;
}

export class PrismaConversationStore implements ConversationStorePort {
  constructor(private readonly database: Database) {}
  async create(input: ConversationDocument, signal?: AbortSignal): Promise<void> {
    try {
      active(signal); const document = new ConversationDocument(input);
      if (document.revision !== 0) throw new AiModelInputError();
      await this.database.client.$transaction(async transaction => {
        active(signal);
        await transaction.aiConversation.create({ data: { id: document.id, ownerId: document.ownerId, studyId: document.studyId, studyVersion: BigInt(document.studyVersion), revision: 0, document: json(document), createdAt: new Date(document.createdAt) } });
        active(signal);
      });
    } catch (cause) { unavailable(cause); }
  }
  async find(ownerId: string, id: string): Promise<ConversationDocument | null> {
    try { const row = await this.database.client.aiConversation.findFirst({ where: { id, ownerId } }); return row ? hydrate(row) : null; }
    catch (cause) { return unavailable(cause); }
  }
  async replace(input: ConversationDocument, expectedRevision: number, signal?: AbortSignal): Promise<boolean> {
    try {
      active(signal); const document = new ConversationDocument(input);
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || document.revision !== expectedRevision + 1) throw new AiModelInputError();
      return await this.database.client.$transaction(async transaction => {
        active(signal);
        const result = await transaction.aiConversation.updateMany({ where: { id: document.id, ownerId: document.ownerId, studyId: document.studyId, studyVersion: BigInt(document.studyVersion), createdAt: new Date(document.createdAt), revision: expectedRevision }, data: { document: json(document), revision: document.revision } });
        active(signal); return result.count === 1;
      });
    } catch (cause) { return unavailable(cause); }
  }
  async delete(ownerId: string, id: string): Promise<boolean> {
    try {
      await this.database.client.$transaction(async transaction => {
        const row = await transaction.aiConversation.delete({ where: { id, ownerId } }); const document = hydrate(row);
        await transaction.aiAnalysis.deleteMany({ where: { id: { in: document.turns.map(turn => turn.analysisId) }, ownerId, studyId: document.studyId, studyVersion: BigInt(document.studyVersion) } });
      });
      return true;
    } catch (cause) {
      if (typeof cause === 'object' && cause !== null && 'code' in cause && cause.code === 'P2025') return false;
      return unavailable(cause);
    }
  }
}
