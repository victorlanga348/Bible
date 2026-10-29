import type { WriteScope } from '../../../application/write-scope';
import type { PageWindow } from '../../../application/pagination';
import type { Study, StudyContent, StudyReference, PassageText, EvidenceProps, Availability } from '../domain/study';

export interface CanonicalStudyContent { readonly reference: StudyReference; readonly passage: PassageText; readonly chapter: PassageText }
export interface CollectedStudyEvidence { readonly evidence: readonly EvidenceProps[]; readonly comparison: string; readonly limitations: readonly string[] }
export interface StudyCanonPort { load(translationId: string, reference: string): Promise<CanonicalStudyContent> }
export interface StudySourcesPort {
  collect(reference: StudyReference): Promise<CollectedStudyEvidence>;
  availability(evidence: readonly EvidenceProps[]): Promise<Readonly<Record<string, Availability>>>;
}
export interface StudyBuilderPort { execute(translationId: string, reference: string): Promise<StudyContent> }
export interface StudySummary { readonly id: string; readonly version: number; readonly createdAt: string; readonly reference: StudyReference }
export interface StudyStorePort {
  metadata(ownerId: string, id: string, version?: number): Promise<StudySummary | null>;
  list(ownerId: string, window: PageWindow): Promise<readonly StudySummary[]>;
  guardActive<T>(ownerId: string, id: string, write: (scope: WriteScope) => Promise<T>): Promise<T>;
  beginDelete(ownerId: string, id: string): Promise<void>;
  finishDelete(ownerId: string, id: string): Promise<void>;
  create(ownerId: string, content: StudyContent): Promise<Study>;
  find(ownerId: string, id: string, version?: number): Promise<Study | null>;
  append(ownerId: string, id: string, expectedVersion: number, content: StudyContent): Promise<Study>;
}
