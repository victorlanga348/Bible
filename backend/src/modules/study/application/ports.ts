import type { Study, StudyContent, StudyReference, PassageText, EvidenceProps, Availability } from '../domain/study';

export interface CanonicalStudyContent { readonly reference: StudyReference; readonly passage: PassageText; readonly chapter: PassageText }
export interface CollectedStudyEvidence { readonly evidence: readonly EvidenceProps[]; readonly comparison: string; readonly limitations: readonly string[] }
export interface StudyCanonPort { load(translationId: string, reference: string): Promise<CanonicalStudyContent> }
export interface StudySourcesPort {
  collect(reference: StudyReference): Promise<CollectedStudyEvidence>;
  availability(evidence: readonly EvidenceProps[]): Promise<Readonly<Record<string, Availability>>>;
}
export interface StudyBuilderPort { execute(translationId: string, reference: string): Promise<StudyContent> }
export interface StudyStorePort {
  create(ownerId: string, content: StudyContent): Promise<Study>;
  find(ownerId: string, id: string, version?: number): Promise<Study | null>;
  append(ownerId: string, id: string, expectedVersion: number, content: StudyContent): Promise<Study>;
}
