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
  WorkspaceConversationsPageDto,
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

export function useReviseStudy() {
  const { token } = useSession();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, expectedVersion, signal }: { id: string; expectedVersion: number; signal?: AbortSignal }) =>
      request<StudyViewDto>(`/studies/${id}/versions`, { method: 'POST', token, body: { expectedVersion }, signal }),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['workspace', 'studies'] }); },
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
    mutationFn: ({ translationId, reference, signal }: { translationId: string; reference: string; signal?: AbortSignal }) =>
      request<StudyViewDto>('/studies', {
        method: 'POST',
        token,
        body: { translationId, reference },
        signal,
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

export function useDeleteStudy() {
  const { token } = useSession();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<void>(`/workspace/studies/${id}`, { method: 'DELETE', token }),
    onSuccess: (_, id) => { client.removeQueries({ queryKey: ['studies', 'detail', id] }); },
    onSettled: () => { void client.invalidateQueries({ queryKey: ['workspace'] }); },
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
      qc.invalidateQueries({ queryKey: ['workspace', 'notes', vars.studyId] });
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
      signal,
    }: {
      studyId: string;
      studyVersion: number;
      question: string;
      signal?: AbortSignal;
    }) =>
      request<AiAnalysisDto>(`/studies/${studyId}/ai-analyses`, {
        method: 'POST',
        token,
        body: { studyVersion, question },
        signal,
      }),
  });
}

export function useConversation(conversationId?: string) {
  const { token } = useSession();
  return useQuery({
    queryKey: queryKeys.assistant.conversation(conversationId || ''),
    queryFn: ({ signal }) =>
      request<ConversationDto>(`/conversations/${conversationId}`, {
        token,
        signal,
      }),
    enabled: !!conversationId && !!token,
  });
}

export function useCreateConversation() {
  const { token } = useSession();
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, studyVersion, signal }: { studyId: string; studyVersion: number; signal?: AbortSignal }) =>
      request<ConversationDto>(`/studies/${studyId}/conversations`, {
        method: 'POST',
        token,
        body: { studyVersion },
        signal,
      }),
    onSuccess: (data, variables) => {
      if (variables.signal?.aborted) return;
      client.setQueryData(queryKeys.assistant.conversation(data.id), data);
      void client.invalidateQueries({ queryKey: ['assistant', 'conversations', data.studyId] });
    },
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
      signal,
    }: {
      conversationId: string;
      expectedRevision: number;
      question: string;
      revisesTurn?: number;
      signal?: AbortSignal;
    }) =>
      request<ConversationDto>(`/conversations/${conversationId}/turns`, {
        method: 'POST',
        token,
        body: { expectedRevision, question, revisesTurn },
        signal,
      }),
    onSuccess: (data, variables) => {
      if (variables.signal?.aborted) return;
      qc.setQueryData(queryKeys.assistant.conversation(data.id), data);
      void qc.invalidateQueries({ queryKey: ['assistant', 'conversations', data.studyId] });
    },
  });
}

export function useWorkspaceConversations(studyId?: string, cursor?: string | null) {
  const { token } = useSession();
  return useQuery({
    queryKey: ['assistant', 'conversations', studyId, { cursor }],
    queryFn: ({ signal }) => request<WorkspaceConversationsPageDto>(`/workspace/studies/${studyId}/conversations`, { token, params: { cursor }, signal }),
    enabled: !!studyId && !!token,
  });
}

export function useDeleteConversation() {
  const { token } = useSession();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<void>(`/conversations/${id}`, { method: 'DELETE', token }),
    onSuccess: async (_, id) => {
      client.removeQueries({ queryKey: queryKeys.assistant.conversation(id) });
      await client.invalidateQueries({ queryKey: ['assistant', 'conversations'] });
    },
  });
}
