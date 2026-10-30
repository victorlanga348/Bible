import { apiClient } from './client';

export interface Translation {
  id: string;
  name: string;
  language: string;
  canonId: string;
  attribution: string;
  licenseId: string;
  licenseUrl: string;
}

export interface Book {
  code: string;
  name: string;
  order: number;
  chapterCount: number;
}

export interface Verse {
  number: number;
  text: string;
}

export interface ChapterPassage {
  translationId: string;
  bookCode: string;
  chapter: number;
  verses: Verse[];
  previousChapter: { bookCode: string; chapter: number } | null;
  nextChapter: { bookCode: string; chapter: number } | null;
  attribution: string;
  licenseUrl: string;
}

export interface ResolvedReference {
  translationId: string;
  bookCode: string;
  chapter: number;
  fromVerse: number;
  toVerse: number;
  normalized: string;
}

export interface HistoricalSource {
  id: string;
  title: string;
  author: string;
  translator?: string;
  language: string;
  edition: string;
  kind: string;
  originUrl: string;
  snapshotSha256: string;
  attribution: string;
  rightsStatement: string;
  rightsUrl: string;
  limitations: string;
  permissions: {
    ingest: string;
    store: string;
    index: string;
    display: string;
    quote: string;
    sendToAi: string;
  };
}

export interface WorkspaceStudyItem {
  id: string;
  version: number;
  createdAt: string;
  reference: {
    translationId: string;
    bookCode: string;
    chapter: number;
    fromVerse: number;
    toVerse: number;
    normalized: string;
  };
}

export interface WorkspaceStudiesResponse {
  items: WorkspaceStudyItem[];
  nextCursor: string | null;
}

export interface StudyView {
  id: string;
  version: number;
  createdAt: string;
  reference: ResolvedReference;
  passage: {
    verses: Verse[];
    attribution: string;
    licenseUrl: string;
  };
  sections: Array<{
    kind: string;
    status: 'available' | 'insufficient-evidence';
    text: string;
    evidenceIds: string[];
  }>;
  evidence: Array<{
    excerptId: string;
    sourceId: string;
    locator: string;
    quote: string | null;
    textSha256: string;
    attribution: string;
    rightsStatement: string;
    rightsUrl: string;
    availability: 'available' | 'restricted' | 'missing';
  }>;
  interpretations: Array<{
    classification: 'documented-fact' | 'inference' | 'tradition' | 'hypothesis';
    text: string;
    evidenceIds: string[];
  }>;
  limitations: string[];
}

export const api = {
  health: () => apiClient<{ status: string; database?: string }>('/health/ready'),

  translations: () => apiClient<{ translations: Translation[] }>('/translations'),

  books: (translationId: string) =>
    apiClient<{ books: Book[] }>(`/translations/${translationId}/books`),

  passage: (translationId: string, bookCode: string, chapter: number, from?: number, to?: number) =>
    apiClient<ChapterPassage>(`/translations/${translationId}/books/${bookCode}/chapters/${chapter}/verses`, {
      params: { from, to },
    }),

  resolveReference: (translationId: string, reference: string) =>
    apiClient<ResolvedReference>('/references/resolve', {
      method: 'POST',
      body: JSON.stringify({ translationId, reference }),
    }),

  sources: () => apiClient<{ sources: HistoricalSource[] }>('/sources'),

  workspaceStudies: (token: string, cursor?: string) =>
    apiClient<WorkspaceStudiesResponse>('/workspace/studies', {
      token,
      params: { cursor },
    }),

  study: (studyId: string, token: string, version?: number) =>
    apiClient<StudyView>(`/studies/${studyId}`, {
      token,
      params: { version },
    }),

  createStudy: (translationId: string, reference: string, token: string) =>
    apiClient<StudyView>('/studies', {
      method: 'POST',
      token,
      body: JSON.stringify({ translationId, reference }),
    }),
};
