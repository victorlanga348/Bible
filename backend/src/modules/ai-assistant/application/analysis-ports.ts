import type { AnalysisDocument } from '../domain/analysis-document';

export interface AnalysisStorePort {
  create(document: AnalysisDocument): Promise<void>;
  find(ownerId: string, id: string): Promise<AnalysisDocument | null>;
  delete(ownerId: string, id: string): Promise<boolean>;
}
