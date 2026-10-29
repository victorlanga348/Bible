import type { WriteScope } from '../../../application/write-scope';
import type { ConversationDocument, ConversationTurnProps } from '../domain/conversation';
import type { AiAnalysisView } from '../domain/analysis-document';

export interface ConversationStorePort {
  create(document: ConversationDocument, signal?: AbortSignal, scope?: WriteScope): Promise<void>;
  find(ownerId: string, id: string): Promise<ConversationDocument | null>;
  replace(document: ConversationDocument, expectedRevision: number, signal?: AbortSignal, scope?: WriteScope): Promise<boolean>;
  delete(ownerId: string, id: string): Promise<boolean>;
}
export interface ConversationAnalysesPort {
  create(ownerId: string, studyId: string, studyVersion: number, question: string, signal?: AbortSignal, retrievalInput?: string): Promise<AiAnalysisView>;
  read(ownerId: string, id: string): Promise<AiAnalysisView>;
  delete(ownerId: string, id: string): Promise<void>;
}
export interface ConversationTurnView extends ConversationTurnProps {
  readonly analysis: AiAnalysisView | null; readonly responseStatus: 'available' | 'unavailable';
}
export interface ConversationView {
  readonly id: string; readonly studyId: string; readonly studyVersion: number; readonly createdAt: string;
  readonly revision: number; readonly turns: readonly ConversationTurnView[];
}
