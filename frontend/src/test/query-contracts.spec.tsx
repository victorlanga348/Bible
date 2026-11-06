import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient, queryKeys } from '../shared/api/query-client';
import {
  useBooks,
  useCreateStudy,
  useReviseStudy,
  useDeleteStudy,
  useCreateNote,
  useReviseNote,
  useDeleteNote,
  useCreateConversation,
  useAppendConversationTurn,
  useDeleteConversation,
  usePassage,
  useStudy,
  useConversation,
  useCrossReferences,
} from '../shared/api/hooks';
import {
  studyId,
  secondStudyId,
  studyFixture,
  noteFixture,
} from './workflow-fixtures';

const mockRequest = vi.fn();
const mockUseSession = vi.fn();
// Technical transport/session doubles; the QueryClient and its cache are real.

vi.mock('../shared/api/http-client', () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

vi.mock('../shared/hooks/use-session', () => ({
  useSession: () => mockUseSession(),
}));

const technicalToken = 'session-token-technical-double';
const clients: QueryClient[] = [];

function createClient(): QueryClient {
  const client = createQueryClient();
  clients.push(client);
  return client;
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  mockRequest.mockReset(); mockUseSession.mockReset();
  mockUseSession.mockReturnValue({ token: technicalToken });
});

afterEach(() => {
  for (const client of clients) {
    client.clear();
  }
  clients.length = 0;
  vi.clearAllMocks();
});

describe('query contracts regression suite', () => {
  describe('1. useCreateStudy e useReviseStudy', () => {
    it('useCreateStudy sends POST with exact body/token, invalidates workspace studies across two pages, and keeps source/canon fresh', async () => {
      const client = createClient();
      const page1Key = queryKeys.workspace.studies(undefined);
      const page2Key = queryKeys.workspace.studies('cursor-p2');
      const sourceKey = queryKeys.sources.all();
      const canonKey = queryKeys.canon.passage('porbr2018', 'GEN', 1);

      client.setQueryData(page1Key, { items: ['study-item-1'] });
      client.setQueryData(page2Key, { items: ['study-item-2'] });
      client.setQueryData(sourceKey, [{ id: 'source-1' }]);
      client.setQueryData(canonKey, studyFixture().passage);

      mockRequest.mockResolvedValueOnce(studyFixture({ id: studyId }));

      const { result } = renderHook(() => useCreateStudy(), {
        wrapper: createWrapper(client),
      });

      await act(async () => {
        await result.current.mutateAsync({
          translationId: 'porbr2018',
          reference: 'GEN 1:1',
        });
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
      expect(mockRequest).toHaveBeenCalledWith('/studies', {
        method: 'POST',
        token: technicalToken,
        body: { translationId: 'porbr2018', reference: 'GEN 1:1' },
      });

      expect(client.getQueryState(page1Key)?.isInvalidated).toBe(true);
      expect(client.getQueryState(page2Key)?.isInvalidated).toBe(true);
      expect(client.getQueryState(sourceKey)?.isInvalidated).toBe(false);
      expect(client.getQueryState(canonKey)?.isInvalidated).toBe(false);
    });

    it('useReviseStudy sends POST with exact body/token, invalidates revised study detail and workspace pages, and keeps other study detail and source/canon fresh', async () => {
      const client = createClient();
      const targetStudyDetailKey = queryKeys.studies.detail(studyId);
      const otherStudyDetailKey = queryKeys.studies.detail(secondStudyId);
      const page1Key = queryKeys.workspace.studies(undefined);
      const page2Key = queryKeys.workspace.studies('cursor-p2');
      const sourceKey = queryKeys.sources.all();
      const canonKey = queryKeys.canon.passage('porbr2018', 'GEN', 1);

      client.setQueryData(targetStudyDetailKey, studyFixture({ id: studyId, version: 3 }));
      client.setQueryData(otherStudyDetailKey, studyFixture({ id: secondStudyId, version: 1 }));
      client.setQueryData(page1Key, { items: ['study-item-1'] });
      client.setQueryData(page2Key, { items: ['study-item-2'] });
      client.setQueryData(sourceKey, [{ id: 'source-1' }]);
      client.setQueryData(canonKey, studyFixture().passage);

      mockRequest.mockResolvedValueOnce(studyFixture({ id: studyId, version: 4 }));

      const { result } = renderHook(() => useReviseStudy(), {
        wrapper: createWrapper(client),
      });

      await act(async () => {
        await result.current.mutateAsync({
          studyId,
          expectedVersion: 3,
        });
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
      expect(mockRequest).toHaveBeenCalledWith(`/studies/${studyId}/versions`, {
        method: 'POST',
        token: technicalToken,
        body: { expectedVersion: 3 },
      });

      expect(client.getQueryState(targetStudyDetailKey)?.isInvalidated).toBe(true);
      expect(client.getQueryState(otherStudyDetailKey)?.isInvalidated).toBe(false);
      expect(client.getQueryState(page1Key)?.isInvalidated).toBe(true);
      expect(client.getQueryState(page2Key)?.isInvalidated).toBe(true);
      expect(client.getQueryState(sourceKey)?.isInvalidated).toBe(false);
      expect(client.getQueryState(canonKey)?.isInvalidated).toBe(false);
    });
  });

  describe('2. useCreateNote, useReviseNote e useDeleteNote', () => {
    it('useCreateNote uses POST with exact endpoint, method, body, token and invalidates notes only for target study', async () => {
      const client = createClient();
      const targetNotesKey = queryKeys.workspace.notes(studyId);
      const otherNotesKey = queryKeys.workspace.notes(secondStudyId);
      const sourceKey = queryKeys.sources.all();
      const favoritesKey = queryKeys.workspace.favorites(undefined);

      client.setQueryData(targetNotesKey, { items: [noteFixture({ studyId })] });
      client.setQueryData(otherNotesKey, { items: [noteFixture({ id: '20000000-0000-4000-8000-000000000002', studyId: secondStudyId })] });
      client.setQueryData(sourceKey, [{ id: 'source-1' }]);
      client.setQueryData(favoritesKey, { items: [] });

      mockRequest.mockResolvedValueOnce(
        noteFixture({ id: '20000000-0000-4000-8000-000000000003', studyId, studyVersion: 3, content: 'Nota técnica nova' })
      );

      const { result } = renderHook(() => useCreateNote(), {
        wrapper: createWrapper(client),
      });

      await act(async () => {
        await result.current.mutateAsync({
          studyId,
          studyVersion: 3,
          content: 'Nota técnica nova',
        });
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
      expect(mockRequest).toHaveBeenCalledWith(`/workspace/studies/${studyId}/notes`, {
        method: 'POST',
        token: technicalToken,
        body: { studyVersion: 3, content: 'Nota técnica nova' },
      });

      expect(client.getQueryState(targetNotesKey)?.isInvalidated).toBe(true);
      expect(client.getQueryState(otherNotesKey)?.isInvalidated).toBe(false);
      expect(client.getQueryState(sourceKey)?.isInvalidated).toBe(false);
      expect(client.getQueryState(favoritesKey)?.isInvalidated).toBe(false);
    });

    it('useReviseNote uses PATCH with exact endpoint, method, body, token and invalidates notes pages without invalidating source or favorites', async () => {
      const client = createClient();
      const notesPage1Key = queryKeys.workspace.notes(studyId, 3, undefined);
      const notesPage2Key = queryKeys.workspace.notes(studyId, 3, 'cursor-p2');
      const sourceKey = queryKeys.sources.all();
      const favoritesKey = queryKeys.workspace.favorites(undefined);

      client.setQueryData(notesPage1Key, { items: [noteFixture({ studyId })] });
      client.setQueryData(notesPage2Key, { items: [] });
      client.setQueryData(sourceKey, [{ id: 'source-1' }]);
      client.setQueryData(favoritesKey, { items: [] });

      mockRequest.mockResolvedValueOnce(noteFixture({ revision: 2, content: 'Nota técnica revisada' }));

      const { result } = renderHook(() => useReviseNote(), {
        wrapper: createWrapper(client),
      });

      await act(async () => {
        await result.current.mutateAsync({
          noteId: '20000000-0000-4000-8000-000000000001',
          expectedRevision: 1,
          content: 'Nota técnica revisada',
        });
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
      expect(mockRequest).toHaveBeenCalledWith('/workspace/notes/20000000-0000-4000-8000-000000000001', {
        method: 'PATCH',
        token: technicalToken,
        body: { expectedRevision: 1, content: 'Nota técnica revisada' },
      });

      expect(client.getQueryState(notesPage1Key)?.isInvalidated).toBe(true);
      expect(client.getQueryState(notesPage2Key)?.isInvalidated).toBe(true);
      expect(client.getQueryState(sourceKey)?.isInvalidated).toBe(false);
      expect(client.getQueryState(favoritesKey)?.isInvalidated).toBe(false);
    });

    it('useDeleteNote uses DELETE with exact endpoint, method, token and invalidates notes pages without invalidating source or favorites', async () => {
      const client = createClient();
      const notesPage1Key = queryKeys.workspace.notes(studyId, 3, undefined);
      const notesPage2Key = queryKeys.workspace.notes(studyId, 3, 'cursor-p2');
      const sourceKey = queryKeys.sources.all();
      const favoritesKey = queryKeys.workspace.favorites(undefined);

      client.setQueryData(notesPage1Key, { items: [noteFixture({ studyId })] });
      client.setQueryData(notesPage2Key, { items: [] });
      client.setQueryData(sourceKey, [{ id: 'source-1' }]);
      client.setQueryData(favoritesKey, { items: [] });

      mockRequest.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteNote(), {
        wrapper: createWrapper(client),
      });

      await act(async () => {
        await result.current.mutateAsync('20000000-0000-4000-8000-000000000001');
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
      expect(mockRequest).toHaveBeenCalledWith('/workspace/notes/20000000-0000-4000-8000-000000000001', {
        method: 'DELETE',
        token: technicalToken,
      });

      expect(client.getQueryState(notesPage1Key)?.isInvalidated).toBe(true);
      expect(client.getQueryState(notesPage2Key)?.isInvalidated).toBe(true);
      expect(client.getQueryState(sourceKey)?.isInvalidated).toBe(false);
      expect(client.getQueryState(favoritesKey)?.isInvalidated).toBe(false);
    });
  });

  describe('3. useDeleteStudy', () => {
    it('removes detail and notes of deleted study, invalidates workspace, while preserving other study detail/notes and source cache', async () => {
      const client = createClient();
      const targetDetailKey = queryKeys.studies.detail(studyId);
      const targetNotesKey = queryKeys.workspace.notes(studyId);
      const otherDetailKey = queryKeys.studies.detail(secondStudyId);
      const otherNotesKey = queryKeys.workspace.notes(secondStudyId);
      const workspaceStudiesKey = queryKeys.workspace.studies(undefined);
      const sourceKey = queryKeys.sources.all();

      client.setQueryData(targetDetailKey, studyFixture({ id: studyId }));
      client.setQueryData(targetNotesKey, { items: [noteFixture({ studyId })] });
      client.setQueryData(otherDetailKey, studyFixture({ id: secondStudyId }));
      client.setQueryData(otherNotesKey, { items: [noteFixture({ id: '20000000-0000-4000-8000-000000000002', studyId: secondStudyId })] });
      client.setQueryData(workspaceStudiesKey, { items: [studyId, secondStudyId] });
      client.setQueryData(sourceKey, [{ id: 'source-1' }]);

      mockRequest.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteStudy(), {
        wrapper: createWrapper(client),
      });

      await act(async () => {
        await result.current.mutateAsync(studyId);
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
      expect(mockRequest).toHaveBeenCalledWith(`/workspace/studies/${studyId}`, {
        method: 'DELETE',
        token: technicalToken,
      });

      expect(client.getQueryData(targetDetailKey)).toBeUndefined();
      expect(client.getQueryData(targetNotesKey)).toBeUndefined();

      expect(client.getQueryState(workspaceStudiesKey)?.isInvalidated).toBe(true);

      expect(client.getQueryData(otherDetailKey)).toEqual(studyFixture({ id: secondStudyId }));
      expect(client.getQueryState(otherDetailKey)?.isInvalidated).toBe(false);
      expect(client.getQueryData(otherNotesKey)).toEqual({
        items: [noteFixture({ id: '20000000-0000-4000-8000-000000000002', studyId: secondStudyId })],
      });

      expect(client.getQueryData(sourceKey)).toEqual([{ id: 'source-1' }]);
      expect(client.getQueryState(sourceKey)?.isInvalidated).toBe(false);
    });
  });

  describe('4. useCreateConversation e useAppendConversationTurn', () => {
    it('useCreateConversation caches detail, invalidates two pages of study conversations, keeps other study and canon fresh', async () => {
      const client = createClient();
      const convListP1Key = queryKeys.assistant.conversations(studyId, undefined);
      const convListP2Key = queryKeys.assistant.conversations(studyId, 'cursor-p2');
      const otherConvListKey = queryKeys.assistant.conversations(secondStudyId, undefined);
      const canonKey = queryKeys.canon.translations();

      client.setQueryData(convListP1Key, { items: ['c1'] });
      client.setQueryData(convListP2Key, { items: ['c2'] });
      client.setQueryData(otherConvListKey, { items: ['other-c'] });
      client.setQueryData(canonKey, [{ id: 'porbr2018' }]);

      const createdConversation = {
        id: 'conv-101',
        studyId,
        studyVersion: 3,
        turns: [],
      };
      mockRequest.mockResolvedValueOnce(createdConversation);

      const { result } = renderHook(() => useCreateConversation(), {
        wrapper: createWrapper(client),
      });

      await act(async () => {
        await result.current.mutateAsync({ studyId, studyVersion: 3 });
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
      expect(mockRequest).toHaveBeenCalledWith(`/studies/${studyId}/conversations`, {
        method: 'POST',
        token: technicalToken,
        body: { studyVersion: 3 },
        signal: undefined,
      });

      expect(client.getQueryData(queryKeys.assistant.conversation('conv-101'))).toEqual(createdConversation);
      expect(client.getQueryState(convListP1Key)?.isInvalidated).toBe(true);
      expect(client.getQueryState(convListP2Key)?.isInvalidated).toBe(true);
      expect(client.getQueryState(otherConvListKey)?.isInvalidated).toBe(false);
      expect(client.getQueryState(canonKey)?.isInvalidated).toBe(false);
    });

    it('useCreateConversation with aborted controller before promise resolution does not publish late cache', async () => {
      const client = createClient();
      const controller = new AbortController();
      let resolvePromise: (value: unknown) => void;
      const requestTriggered = new Promise<void>((r) => {
        mockRequest.mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolvePromise = resolve;
              r();
            })
        );
      });

      const { result } = renderHook(() => useCreateConversation(), {
        wrapper: createWrapper(client),
      });

      const mutationPromise = result.current.mutateAsync({
        studyId,
        studyVersion: 3,
        signal: controller.signal,
      });

      await requestTriggered;
      controller.abort();

      await act(async () => {
        resolvePromise!({
          id: 'conv-aborted-1',
          studyId,
          studyVersion: 3,
          turns: [],
        });
        await mutationPromise;
      });

      expect(client.getQueryData(queryKeys.assistant.conversation('conv-aborted-1'))).toBeUndefined();
    });

    it('useAppendConversationTurn caches updated conversation, invalidates two pages of study conversations, keeps other study and canon fresh', async () => {
      const client = createClient();
      const convListP1Key = queryKeys.assistant.conversations(studyId, undefined);
      const convListP2Key = queryKeys.assistant.conversations(studyId, 'cursor-p2');
      const otherConvListKey = queryKeys.assistant.conversations(secondStudyId, undefined);
      const canonKey = queryKeys.canon.translations();

      client.setQueryData(convListP1Key, { items: ['c1'] });
      client.setQueryData(convListP2Key, { items: ['c2'] });
      client.setQueryData(otherConvListKey, { items: ['other-c'] });
      client.setQueryData(canonKey, [{ id: 'porbr2018' }]);

      const updatedConversation = {
        id: 'conv-101',
        studyId,
        studyVersion: 3,
        turns: [{ turn: 1, question: 'Pergunta técnica', answer: 'Resposta técnica' }],
      };
      mockRequest.mockResolvedValueOnce(updatedConversation);

      const { result } = renderHook(() => useAppendConversationTurn(), {
        wrapper: createWrapper(client),
      });

      await act(async () => {
        await result.current.mutateAsync({
          conversationId: 'conv-101',
          expectedRevision: 0,
          question: 'Pergunta técnica',
        });
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
      expect(mockRequest).toHaveBeenCalledWith('/conversations/conv-101/turns', {
        method: 'POST',
        token: technicalToken,
        body: { expectedRevision: 0, question: 'Pergunta técnica', revisesTurn: undefined },
        signal: undefined,
      });

      expect(client.getQueryData(queryKeys.assistant.conversation('conv-101'))).toEqual(updatedConversation);
      expect(client.getQueryState(convListP1Key)?.isInvalidated).toBe(true);
      expect(client.getQueryState(convListP2Key)?.isInvalidated).toBe(true);
      expect(client.getQueryState(otherConvListKey)?.isInvalidated).toBe(false);
      expect(client.getQueryState(canonKey)?.isInvalidated).toBe(false);
    });

    it('useAppendConversationTurn with aborted controller before promise resolution does not publish late cache', async () => {
      const client = createClient();
      const controller = new AbortController();
      let resolvePromise: (value: unknown) => void;
      const requestTriggered = new Promise<void>((r) => {
        mockRequest.mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolvePromise = resolve;
              r();
            })
        );
      });

      const { result } = renderHook(() => useAppendConversationTurn(), {
        wrapper: createWrapper(client),
      });

      const mutationPromise = result.current.mutateAsync({
        conversationId: 'conv-turn-aborted-1',
        expectedRevision: 0,
        question: 'Pergunta técnica',
        signal: controller.signal,
      });

      await requestTriggered;
      controller.abort();

      await act(async () => {
        resolvePromise!({
          id: 'conv-turn-aborted-1',
          studyId,
          studyVersion: 3,
          turns: [],
        });
        await mutationPromise;
      });

      expect(client.getQueryData(queryKeys.assistant.conversation('conv-turn-aborted-1'))).toBeUndefined();
    });
  });

  describe('5. useDeleteConversation', () => {
    it('removes only chosen detail, invalidates conversations list, and preserves other detail and canon', async () => {
      const client = createClient();
      const targetDetailKey = queryKeys.assistant.conversation('conv-target');
      const otherDetailKey = queryKeys.assistant.conversation('conv-other');
      const listKey = queryKeys.assistant.conversations(studyId, undefined);
      const canonKey = queryKeys.canon.translations();

      client.setQueryData(targetDetailKey, { id: 'conv-target', studyId });
      client.setQueryData(otherDetailKey, { id: 'conv-other', studyId });
      client.setQueryData(listKey, { items: ['conv-target', 'conv-other'] });
      client.setQueryData(canonKey, [{ id: 'porbr2018' }]);

      mockRequest.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteConversation(), {
        wrapper: createWrapper(client),
      });

      await act(async () => {
        await result.current.mutateAsync('conv-target');
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
      expect(mockRequest).toHaveBeenCalledWith('/conversations/conv-target', {
        method: 'DELETE',
        token: technicalToken,
      });

      expect(client.getQueryData(targetDetailKey)).toBeUndefined();
      expect(client.getQueryData(otherDetailKey)).toEqual({ id: 'conv-other', studyId });
      expect(client.getQueryState(listKey)?.isInvalidated).toBe(true);
      expect(client.getQueryData(canonKey)).toEqual([{ id: 'porbr2018' }]);
      expect(client.getQueryState(canonKey)?.isInvalidated).toBe(false);
    });
  });

  describe('6. usePassage, useStudy, useConversation e useCrossReferences', () => {
    it('loads the default admitted catalogue and suppresses an empty translation', async () => {
      const client = createClient(); mockRequest.mockResolvedValue({ books: [] });
      renderHook(() => useBooks(), { wrapper: createWrapper(client) });
      await waitFor(() => expect(mockRequest).toHaveBeenCalledWith('/translations/porbr2018/books'));
      mockRequest.mockClear(); renderHook(() => useBooks(''), { wrapper: createWrapper(client) });
      expect(mockRequest).not.toHaveBeenCalled();
    });
    it('usePassage does not request if chapter is 0 or bookCode is empty, and requests with correct defaults and range when valid', async () => {
      const client = createClient();

      // Disabled when chapter is 0
      renderHook(() => usePassage('porbr2018', 'GEN', 0), {
        wrapper: createWrapper(client),
      });
      // Disabled when bookCode is empty
      renderHook(() => usePassage('porbr2018', '', 1), {
        wrapper: createWrapper(client),
      });
      expect(mockRequest).not.toHaveBeenCalled();

      // Valid call with undefined translationId defaulting to porbr2018 and verse interval
      mockRequest.mockResolvedValueOnce({
        verses: studyFixture().passage.verses,
        attribution: studyFixture().passage.attribution,
      });

      renderHook(() => usePassage(undefined, 'GEN', 1, 1, 3), {
        wrapper: createWrapper(client),
      });

      await waitFor(() => expect(mockRequest).toHaveBeenCalledTimes(1));
      expect(mockRequest).toHaveBeenCalledWith(
        '/translations/porbr2018/books/GEN/chapters/1/verses',
        { params: { from: 1, to: 3 } }
      );
    });

    it('useStudy does not request if studyId is missing or token is absent, and carries exact params/version/token when valid', async () => {
      const client = createClient();

      // Disabled when studyId is undefined
      renderHook(() => useStudy(undefined), {
        wrapper: createWrapper(client),
      });
      // Disabled when studyId is empty
      renderHook(() => useStudy(''), {
        wrapper: createWrapper(client),
      });
      // Disabled when token is missing
      mockUseSession.mockReturnValueOnce({ token: undefined });
      renderHook(() => useStudy(studyId), {
        wrapper: createWrapper(client),
      });
      expect(mockRequest).not.toHaveBeenCalled();

      // Valid call with version
      mockRequest.mockResolvedValueOnce(studyFixture());
      renderHook(() => useStudy(studyId, 3), {
        wrapper: createWrapper(client),
      });
      await waitFor(() => expect(mockRequest).toHaveBeenCalledTimes(1));
      expect(mockRequest).toHaveBeenCalledWith(`/studies/${studyId}`, {
        token: technicalToken,
        params: { version: 3 },
      });

      // Valid call with undefined version
      mockRequest.mockResolvedValueOnce(studyFixture());
      renderHook(() => useStudy(studyId, undefined), {
        wrapper: createWrapper(client),
      });
      await waitFor(() => expect(mockRequest).toHaveBeenCalledTimes(2));
      expect(mockRequest).toHaveBeenLastCalledWith(`/studies/${studyId}`, {
        token: technicalToken,
        params: { version: undefined },
      });
    });

    it('useConversation does not request if conversationId is missing or token is absent, and passes token/signal when valid', async () => {
      const client = createClient();

      // Disabled when conversationId is undefined
      renderHook(() => useConversation(undefined), {
        wrapper: createWrapper(client),
      });
      // Disabled when conversationId is empty
      renderHook(() => useConversation(''), {
        wrapper: createWrapper(client),
      });
      // Disabled when token is missing
      mockUseSession.mockReturnValueOnce({ token: undefined });
      renderHook(() => useConversation('conv-101'), {
        wrapper: createWrapper(client),
      });
      expect(mockRequest).not.toHaveBeenCalled();

      // Valid call
      mockRequest.mockResolvedValueOnce({
        id: 'conv-101',
        studyId,
        studyVersion: 3,
        turns: [],
      });
      renderHook(() => useConversation('conv-101'), {
        wrapper: createWrapper(client),
      });

      await waitFor(() => expect(mockRequest).toHaveBeenCalledTimes(1));
      expect(mockRequest).toHaveBeenCalledWith('/conversations/conv-101', {
        token: technicalToken,
        signal: expect.any(Object),
      });
    });

    it('useCrossReferences does not request if reference is empty or token is absent, and carries default translationId/token when valid', async () => {
      const client = createClient();

      // Disabled when reference is empty
      renderHook(() => useCrossReferences('porbr2018', ''), {
        wrapper: createWrapper(client),
      });
      // Disabled when token is missing
      mockUseSession.mockReturnValueOnce({ token: undefined });
      renderHook(() => useCrossReferences('porbr2018', 'GEN 1:1'), {
        wrapper: createWrapper(client),
      });
      expect(mockRequest).not.toHaveBeenCalled();

      // Valid call with undefined translationId defaulting to porbr2018
      mockRequest.mockResolvedValueOnce({ items: [], total: 0 });
      renderHook(() => useCrossReferences(undefined, 'GEN 1:1'), {
        wrapper: createWrapper(client),
      });

      await waitFor(() => expect(mockRequest).toHaveBeenCalledTimes(1));
      expect(mockRequest).toHaveBeenCalledWith('/cross-references', {
        token: technicalToken,
        params: { translationId: 'porbr2018', reference: 'GEN 1:1' },
      });
    });
  });
});
