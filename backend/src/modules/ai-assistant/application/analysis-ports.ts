import type { WriteScope } from '../../../application/write-scope';
import type { AnalysisDocument } from '../domain/analysis-document';
import type { ConsultedSegmentProps } from '../domain/analysis-values';
import type { AnalysisReferenceProps } from '../domain/analysis-values';

export interface AnalysisStorePort {
  create(document: AnalysisDocument, signal?: AbortSignal, scope?: WriteScope): Promise<void>;
  find(ownerId: string, id: string): Promise<AnalysisDocument | null>;
  delete(ownerId: string, id: string): Promise<boolean>;
}

export interface AiIndexConfiguration {
  readonly schemaVersion: 1; readonly runtimeProfileSha256: string; readonly sourceManifestSha256: string; readonly sourceSnapshotSha256: string; readonly sourceExcerptsSha256: string; readonly embeddingModelSha256: string;
  readonly dimensions: 1024; readonly segmentCodepoints: 1000; readonly overlapCodepoints: 100;
}
export interface AiIndexProfile { readonly id: string; readonly configuration: AiIndexConfiguration; readonly expectedSegments: readonly ConsultedSegmentProps[] }
export interface IndexedAiChunk { readonly metadata: ConsultedSegmentProps; readonly embedding: readonly number[] }
export interface EligibleAiSourceRef { readonly sourceId: string; readonly excerptId: string; readonly textSha256: string }
export interface RetrievedAiChunk extends ConsultedSegmentProps { readonly distance: number }
export interface VectorIndexPort {
  replace(profile: AiIndexProfile, chunks: readonly IndexedAiChunk[], completedAt: string): Promise<'indexed' | 'unchanged'>;
  readiness(profile: AiIndexProfile): Promise<boolean>;
  search(profile: AiIndexProfile, vector: readonly number[], eligible: readonly EligibleAiSourceRef[]): Promise<readonly RetrievedAiChunk[]>;
}

export interface AiTextHashPort { sha256(text: string): string }
export interface AdmittedAiExcerpt extends EligibleAiSourceRef {
  readonly locator: string; readonly paragraph: number; readonly text: string; readonly attribution: string; readonly rightsStatement: string; readonly rightsUrl: string;
}
export interface AiSourcesPort { listAdmitted(): readonly EligibleAiSourceRef[]; read(excerptId: string): Promise<AdmittedAiExcerpt | null> }
export interface AiStudyEvidenceRef extends EligibleAiSourceRef { readonly locator: string }
export interface AiStudyContext { readonly id: string; readonly version: number; readonly reference: AnalysisReferenceProps; readonly evidenceRefs: readonly AiStudyEvidenceRef[] }
export interface StudyContextPort { guardActive<T>(ownerId: string, studyId: string, write: (scope: WriteScope) => Promise<T>): Promise<T>; read(ownerId: string, studyId: string, version: number): Promise<AiStudyContext> }
export interface AiOperationPort { run<T>(execute: (signal: AbortSignal) => Promise<T>, signal?: AbortSignal): Promise<T> }
export interface AiIdentityClockPort { newId(): string; now(): string }
export interface AiAnalysisSettings {
  readonly profileId: string; readonly promptVersion: string; readonly modelId: string; readonly modelSha256: string;
  readonly embeddingModelId: string; readonly embeddingModelSha256: string; readonly embeddingContextLimit: number;
  readonly contextLimit: number; readonly outputLimit: number; readonly indexProfile: AiIndexProfile;
}
