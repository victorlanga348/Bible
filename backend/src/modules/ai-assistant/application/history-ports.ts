import type { PageWindow } from '../../../application/pagination';
export interface ConversationSummary { readonly id: string; readonly studyId: string; readonly studyVersion: number; readonly revision: number; readonly createdAt: string }
export interface AiHistoryStorePort {
  list(ownerId: string, studyId: string, window: PageWindow): Promise<readonly ConversationSummary[]>;
  deleteForStudy(ownerId: string, studyId: string): Promise<void>;
}
