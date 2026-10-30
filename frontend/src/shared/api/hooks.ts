import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from './http-client';
import { queryKeys } from './query-client';
import { useSession } from '../hooks/use-session';
import type {
  TranslationDto,
  BookDto,
  PassageChapterDto,
  ResolvedReferenceDto,
  HistoricalSourceDto,
  SourceExcerptDto,
  StudyViewDto,
  WorkspaceStudiesPageDto,
  WorkspaceNoteDto,
  WorkspaceNotesPageDto,
  WorkspaceFavoriteDto,
  WorkspaceFavoritesPageDto,
  ConversationDto,
  CrossReferencePageDto,
  CrossReferenceRelationDto,
  AiAnalysisDto,
} from './contracts';

// 1. Health
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: () => request<{ status: string; database?: string }>('/health/ready'),
  });
}

// 2. Canon
export function useTranslations() {
  return useQuery({
    queryKey: queryKeys.canon.translations(),
    queryFn: () =>
      request<{ translations: TranslationDto[] }>('/translations').then((res) => res.translations),
  });
}

export function useBooks(translationId = 'porbr2018') {
  return useQuery({
    queryKey: queryKeys.canon.books(translationId),
    queryFn: () =>
      request<{ books: BookDto[] }>(`/translations/${translationId}/books`).then((res) => res.books),
    enabled: !!translationId,
  });
}

export function usePassage(
  translationId = 'porbr2018',
  bookCode: string,
  chapter: number,
  from?: number,
  to?: number
) {
  return useQuery({
    queryKey: queryKeys.canon.passage(translationId, bookCode, chapter, from, to),
    queryFn: () =>
      request<PassageChapterDto>(
        `/translations/${translationId}/books/${bookCode}/chapters/${chapter}/verses`,
        { params: { from, to } }
      ),
    enabled: !!translationId && !!bookCode && chapter > 0,
  });
}

export function useResolveReference() {
  return useMutation({
    mutationFn: ({ translationId, reference }: { translationId: string; reference: string }) =>
      request<ResolvedReferenceDto>('/references/resolve', {
        method: 'POST',
        body: { translationId, reference },
      }),
  });
}

// 3. Historical Sources
export function useSources() {
  return useQuery({
    queryKey: queryKeys.sources.all(),
    queryFn: () =>
      request<{ sources: HistoricalSourceDto[] }>('/sources').then((res) => res.sources),
  });
}

export function useSourceExcerpts(sourceId: string, q?: string) {
  return useQuery({
    queryKey: queryKeys.sources.excerpts(sourceId, q),
    queryFn: () =>
      request<{ excerpts: SourceExcerptDto[] }>(`/sources/${sourceId}/excerpts`, {
        params: { q },
      }).then((res) => res.excerpts),
    enabled: !!sourceId,
  });
}

// 4. Studies
export function useStudy(studyId?: string, version?: number) {
  const { token } = useSession();
  return useQuery({
    queryKey: queryKeys.studies.detail(studyId || '', version),
    queryFn: () =>
      request<StudyViewDto>(`/studies/${studyId}`, {
        token,
        params: { version },
      }),
    enabled: !!studyId && !!token,
  });
}

export function useCreateStudy() {
  const { token } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ translationId, reference }: { translationId: string; reference: string }) =>
      request<StudyViewDto>('/studies', {
        method: 'POST',
        token,
        body: { translationId, reference },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace', 'studies'] });
    },
  });
}

// 5. Workspace (Studies, Notes, Favorites)
export function useWorkspaceStudies(cursor?: string | null) {
  const { token } = useSession();
  return useQuery({
    queryKey: queryKeys.workspace.studies(cursor),
    queryFn: () =>
      request<WorkspaceStudiesPageDto>('/workspace/studies', {
        token,
        params: { cursor },
      }),
    enabled: !!token,
  });
}

export function useWorkspaceNotes(studyId: string, studyVersion?: number) {
  const { token } = useSession();
  return useQuery({
    queryKey: queryKeys.workspace.notes(studyId, studyVersion),
    queryFn: () =>
      request<WorkspaceNotesPageDto>(`/workspace/studies/${studyId}/notes`, {
        token,
        params: { studyVersion },
      }),
    enabled: !!studyId && !!token,
  });
}

export function useCreateNote() {
  const { token } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      studyId,
      studyVersion,
      content,
    }: {
      studyId: string;
      studyVersion: number;
      content: string;
    }) =>
      request<WorkspaceNoteDto>(`/workspace/studies/${studyId}/notes`, {
        method: 'POST',
        token,
        body: { studyVersion, content },
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.workspace.notes(vars.studyId) });
    },
  });
}

export function useReviseNote() {
  const { token } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      expectedRevision,
      content,
    }: {
      noteId: string;
      expectedRevision: number;
      content: string;
    }) =>
      request<WorkspaceNoteDto>(`/workspace/notes/${noteId}`, {
        method: 'PATCH',
        token,
        body: { expectedRevision, content },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace', 'notes'] });
    },
  });
}

export function useDeleteNote() {
  const { token } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) =>
      request<void>(`/workspace/notes/${noteId}`, {
        method: 'DELETE',
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace', 'notes'] });
    },
  });
}

export function useWorkspaceFavorites(cursor?: string | null) {
  const { token } = useSession();
  return useQuery({
    queryKey: queryKeys.workspace.favorites(cursor),
    queryFn: () =>
      request<WorkspaceFavoritesPageDto>('/workspace/favorites', {
        token,
        params: { cursor },
      }),
    enabled: !!token,
  });
}

export function useToggleFavorite() {
  const { token } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studyId,
      studyVersion,
      isFavorite,
    }: {
      studyId: string;
      studyVersion: number;
      isFavorite: boolean;
    }): Promise<WorkspaceFavoriteDto | undefined> => {
      if (isFavorite) {
        await request<void>(`/workspace/studies/${studyId}/favorites/${studyVersion}`, {
          method: 'DELETE',
          token,
        });
        return undefined;
      }
      return request<WorkspaceFavoriteDto>(`/workspace/studies/${studyId}/favorites/${studyVersion}`, {
        method: 'PUT',
        token,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace', 'favorites'] });
    },
  });
}

// 6. Cross References
export function useCrossReferences(translationId = 'porbr2018', reference: string) {
  const { token } = useSession();
  return useQuery({
    queryKey: queryKeys.crossReferences.relations(translationId, reference),
    queryFn: () =>
      request<CrossReferencePageDto>('/cross-references', {
        token,
        params: { translationId, reference },
      }),
    enabled: !!reference && !!token,
  });
}

export function useCreateCrossReference() {
  const { token } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: unknown) =>
      request<CrossReferenceRelationDto>('/cross-references', {
        method: 'POST',
        token,
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cross-references'] });
    },
  });
}

// 7. AI Assistant
export function useCreateAiAnalysis() {
  const { token } = useSession();

  return useMutation({
    mutationFn: ({
      studyId,
      studyVersion,
      question,
    }: {
      studyId: string;
      studyVersion: number;
      question: string;
    }) =>
      request<AiAnalysisDto>(`/studies/${studyId}/ai-analyses`, {
        method: 'POST',
        token,
        body: { studyVersion, question },
      }),
  });
}

export function useConversation(conversationId?: string) {
  const { token } = useSession();
  return useQuery({
    queryKey: queryKeys.assistant.conversation(conversationId || ''),
    queryFn: () =>
      request<ConversationDto>(`/conversations/${conversationId}`, {
        token,
      }),
    enabled: !!conversationId && !!token,
  });
}

export function useCreateConversation() {
  const { token } = useSession();

  return useMutation({
    mutationFn: ({ studyId, studyVersion }: { studyId: string; studyVersion: number }) =>
      request<ConversationDto>(`/studies/${studyId}/conversations`, {
        method: 'POST',
        token,
        body: { studyVersion },
      }),
  });
}

export function useAppendConversationTurn() {
  const { token } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      expectedRevision,
      question,
      revisesTurn,
    }: {
      conversationId: string;
      expectedRevision: number;
      question: string;
      revisesTurn?: number;
    }) =>
      request<ConversationDto>(`/conversations/${conversationId}/turns`, {
        method: 'POST',
        token,
        body: { expectedRevision, question, revisesTurn },
      }),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.assistant.conversation(data.id), data);
    },
  });
}
