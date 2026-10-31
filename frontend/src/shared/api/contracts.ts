/**
 * Contratos de Dados e Tipos Normativos da API do Bíblia App
 * Derivados estritamente dos schemas Zod e DTOs do backend NestJS
 */

export type EpistemicClassification =
  | 'documented-fact'
  | 'inference'
  | 'tradition'
  | 'hypothesis'
  | 'insufficient-evidence';

export type SectionKind =
  | 'immediate-context'
  | 'book-argument'
  | 'history-culture'
  | 'authorship-audience-purpose'
  | 'comparison'
  | 'interpretations';

export type SectionStatus = 'available' | 'insufficient-evidence';

export type AvailabilityStatus = 'available' | 'restricted' | 'missing';

export type PermissionStatus = 'allowed' | 'pending' | 'denied';

export interface TranslationDto {
  id: string;
  name: string;
  language: string;
  canonId: string;
  sourceUrl: string;
  sourceSha256: string;
  retrievedAt: string;
  licenseId: string;
  licenseUrl: string;
  attribution: string;
}

export interface BookDto {
  code: string;
  name: string;
  order: number;
  chapterCount: number;
}

export interface VerseDto {
  number: number;
  text: string;
}

export interface PassageChapterDto {
  translationId: string;
  bookCode: string;
  chapter: number;
  verses: VerseDto[];
  previousChapter: { bookCode: string; chapter: number } | null;
  nextChapter: { bookCode: string; chapter: number } | null;
  attribution: string;
  licenseUrl: string;
}

export interface ResolvedReferenceDto {
  translationId: string;
  bookCode: string;
  chapter: number;
  fromVerse: number;
  toVerse: number;
  normalized: string;
}

export interface SourcePermissionsDto {
  ingest: PermissionStatus;
  store: PermissionStatus;
  index: PermissionStatus;
  display: PermissionStatus;
  quote: PermissionStatus;
  sendToAi: PermissionStatus;
}

export interface HistoricalSourceDto {
  id: string;
  title: string;
  author: string;
  translator: string | null;
  language: string;
  edition: string;
  kind: 'historical-work' | 'modern-study' | 'commentary';
  originUrl: string;
  snapshotSha256: string;
  retrievedAt: string;
  rightsStatement: string;
  rightsUrl: string;
  attribution: string;
  permissions: SourcePermissionsDto;
  limitations: string;
}

export interface SourceExcerptDto {
  id: string;
  sourceId: string;
  locator: string;
  order: number;
  text: string;
  textSha256: string;
  originUrl: string | null;
}

export interface StudySectionDto {
  kind: SectionKind;
  status: SectionStatus;
  text: string;
  evidenceIds: string[];
}

export interface StudyEvidenceDto {
  excerptId: string;
  sourceId: string;
  locator: string;
  quote: string | null;
  textSha256: string;
  attribution: string;
  rightsStatement: string;
  rightsUrl: string;
  availability: AvailabilityStatus;
  rightsSnapshot: SourcePermissionsDto;
}

export interface StudyInterpretationDto {
  classification: EpistemicClassification;
  text: string;
  evidenceIds: string[];
}

export interface StudyViewDto {
  id: string;
  version: number;
  createdAt: string;
  reference: ResolvedReferenceDto;
  passage: {
    verses: VerseDto[];
    attribution: string;
    licenseUrl: string;
  };
  sections: StudySectionDto[];
  evidence: StudyEvidenceDto[];
  interpretations: StudyInterpretationDto[];
  limitations: string[];
}

export interface WorkspaceStudyItemDto {
  id: string;
  version: number;
  createdAt: string;
  reference: ResolvedReferenceDto;
}

export interface WorkspaceStudiesPageDto {
  items: WorkspaceStudyItemDto[];
  nextCursor: string | null;
}

export interface WorkspaceNoteDto {
  id: string;
  studyId: string;
  studyVersion: number;
  revision: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceNotesPageDto {
  items: WorkspaceNoteDto[];
  nextCursor: string | null;
}

export interface WorkspaceFavoriteDto {
  id: string;
  studyId: string;
  studyVersion: number;
  createdAt: string;
}

export interface WorkspaceFavoritesPageDto {
  items: Array<WorkspaceFavoriteDto & { reference: ResolvedReferenceDto }>;
  nextCursor: string | null;
}

export interface AiAnalysisProvenanceDto {
  profileId: string;
  promptVersion: string;
  modelId: string | null;
  modelSha256: string | null;
  embeddingModelSha256: string | null;
  runtimeVersion: string | null;
  dimensions: 1024 | null;
  contextLimit: number;
  outputLimit: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  embeddingPromptTokens: number;
  consultedSegments: Array<{
    id: string;
    sourceId: string;
    excerptId: string;
    sourceDigest: string;
    textDigest: string;
    startOffset: number;
    endOffset: number;
  }>;
}

export interface AiAnalysisDto {
  id: string;
  studyId: string;
  studyVersion: number;
  createdAt: string;
  question: string;
  reference: ResolvedReferenceDto;
  status: 'supported' | 'insufficient-evidence' | 'restricted';
  evidence: Array<{
    sourceId: string;
    excerptId: string;
    locator: string;
    textSha256: string;
    startOffset: number;
    endOffset: number;
    quote: string;
    attribution: string;
    rightsStatement: string;
    rightsUrl: string;
  }>;
  limitations: string[];
  provenance: AiAnalysisProvenanceDto;
}

export interface ConversationTurnDto {
  number: number;
  question: string;
  analysisId: string;
  createdAt: string;
  contextTurnNumbers: number[];
  contextVersion: 'questions-v1' | 'questions-v2' | 'questions-v3';
  omittedTurns: number;
  revisesTurn: number | null;
  analysis: AiAnalysisDto | null;
  responseStatus: 'available' | 'unavailable';
}

export interface ConversationDto {
  id: string;
  studyId: string;
  studyVersion: number;
  createdAt: string;
  revision: number;
  turns: ConversationTurnDto[];
}

export interface WorkspaceConversationsPageDto {
  items: Array<Omit<ConversationDto, 'turns'>>;
  nextCursor: string | null;
}

export interface CrossReferenceRelationDto {
  id: string;
  from: ResolvedReferenceDto;
  to: ResolvedReferenceDto;
  type: 'direct-citation' | 'allusion' | 'prophetic-fulfillment' | 'thematic-parallel';
  reading: string;
  rationale: string;
  assessment: 'high' | 'moderate' | 'traditional' | 'disputed';
  createdAt: string;
  limitations: string[];
  evidence: Array<{
    sourceId: string;
    excerptId: string;
    locator: string;
    textSha256: string;
    startOffset: number;
    endOffset: number;
    availability: AvailabilityStatus;
    quote: string | null;
    attribution: string | null;
    rightsStatement: string | null;
    rightsUrl: string | null;
  }>;
}

export interface CrossReferencePageDto {
  items: CrossReferenceRelationDto[];
  nextCursor: string | null;
}
