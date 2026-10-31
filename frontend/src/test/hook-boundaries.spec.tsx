import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import * as hooks from '../shared/api/hooks';
import { createQueryClient, queryKeys } from '../shared/api/query-client';
import { conversationFixture, conversationId, noteFixture, reference, secondStudyId, studyFixture, studyId } from './workflow-fixtures';

// Technical transport cases: public hook/cache contracts, never proof of database integration.
let token: string | null = 'technical-token';
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ token }) }));
const clients: ReturnType<typeof createQueryClient>[] = [];
beforeEach(() => {
  token = 'technical-token';
  vi.stubGlobal('fetch', vi.fn(async (address: string, options?: RequestInit) => {
    if (options?.method === 'DELETE') return new Response(null, { status: 204 });
    const url = new URL(address);
    if (url.pathname.endsWith('/books')) return Response.json({ books: [{ code: 'GEN' }] });
    if (url.pathname.endsWith('/verses')) return Response.json(studyFixture().passage);
    if (url.pathname.endsWith('/resolve')) return Response.json(reference);
    if (url.pathname === '/api/cross-references') return Response.json({ items: [], nextCursor: null });
    if (url.pathname.includes('/notes')) return Response.json(noteFixture());
    if (url.pathname.includes('/conversations')) return Response.json(conversationFixture());
    return Response.json(studyFixture());
  }));
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function scope() {
  const client = createQueryClient(); clients.push(client);
  client.setDefaultOptions({ ...client.getDefaultOptions(), queries: { ...client.getDefaultOptions().queries, retry: false } });
  return { client, wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> };
}
it('uses the admitted default translation and preserves passage bounds and canonical resolution', async () => {
  const { wrapper } = scope();
  const { result } = renderHook(() => ({ books: hooks.useBooks(), passage: hooks.usePassage(undefined, 'GEN', 1, 1, 2), relations: hooks.useCrossReferences(undefined, 'GEN 1:1'), resolve: hooks.useResolveReference() }), { wrapper });
  await waitFor(() => expect(result.current.books.isSuccess && result.current.passage.isSuccess && result.current.relations.isSuccess).toBe(true));
  await act(async () => { expect(await result.current.resolve.mutateAsync({ translationId: 'porbr2018', reference: 'GEN 1:1' })).toEqual(reference); });
  const calls = vi.mocked(fetch).mock.calls;
  expect(calls.some(([url]) => new URL(String(url)).pathname === '/api/translations/porbr2018/books')).toBe(true);
  const passage = calls.find(([url]) => String(url).includes('/verses'))!;
  expect(new URL(String(passage[0])).pathname).toBe('/api/translations/porbr2018/books/GEN/chapters/1/verses');
  expect(new URL(String(passage[0])).searchParams.toString()).toBe('from=1&to=2');
  const cross = calls.find(([url]) => String(url).includes('/cross-references'))!;
  expect(new URL(String(cross[0])).searchParams.toString()).toBe('translationId=porbr2018&reference=GEN+1%3A1');
  const resolve = calls.find(([url]) => String(url).includes('/resolve'))!;
  expect(resolve[1]?.method).toBe('POST'); expect(JSON.parse(String(resolve[1]?.body))).toEqual({ translationId: 'porbr2018', reference: 'GEN 1:1' });
});
it.each([['', 'GEN', 1], ['porbr2018', '', 1], ['porbr2018', 'GEN', 0], ['porbr2018', 'GEN', -1]] as const)('does not fetch a passage without valid identity/bounds (%s,%s,%s)', (translation, book, chapter) => {
  const { wrapper } = scope(); renderHook(() => hooks.usePassage(translation, book, chapter), { wrapper });
  expect(fetch).not.toHaveBeenCalled();
});
it.each([true, false])('keeps private queries disabled with missing %s identity', missingToken => {
  if (missingToken) token = null;
  const { wrapper } = scope();
  renderHook(() => ({ study: hooks.useStudy(missingToken ? studyId : undefined), notes: hooks.useWorkspaceNotes(missingToken ? studyId : ''), conversation: hooks.useConversation(missingToken ? conversationId : undefined), conversations: hooks.useWorkspaceConversations(missingToken ? studyId : undefined), relations: hooks.useCrossReferences('porbr2018', missingToken ? 'GEN 1:1' : '') }), { wrapper });
  expect(fetch).not.toHaveBeenCalled();
});
it('disables translation book queries when no translation is selected', () => {
  const { wrapper } = scope(); renderHook(() => hooks.useBooks(''), { wrapper }); expect(fetch).not.toHaveBeenCalled();
});
it.each(['create', 'revise'] as const)('refreshes all study pages after %s while preserving unrelated caches', async action => {
  const { client, wrapper } = scope();
  const pages = [queryKeys.workspace.studies(), queryKeys.workspace.studies('opaque-next')];
  for (const key of pages) client.setQueryData(key, { items: [], nextCursor: null });
  const publicKey = queryKeys.sources.all(); client.setQueryData(publicKey, { sources: [] });
  const { result } = renderHook(() => ({ create: hooks.useCreateStudy(), revise: hooks.useReviseStudy() }), { wrapper });
  const controller = new AbortController();
  await act(async () => { if (action === 'create') await result.current.create.mutateAsync({ translationId: 'porbr2018', reference: 'GEN 1:1', signal: controller.signal }); else await result.current.revise.mutateAsync({ id: studyId, expectedVersion: 3, signal: controller.signal }); });
  for (const key of pages) expect(client.getQueryState(key)?.isInvalidated).toBe(true);
  expect(client.getQueryState(publicKey)?.isInvalidated).toBe(false);
  const [url, options] = vi.mocked(fetch).mock.calls[0];
  expect(new URL(String(url)).pathname).toBe(action === 'create' ? '/api/studies' : `/api/studies/${studyId}/versions`);
  expect(options?.method).toBe('POST'); expect(options?.signal).toBe(controller.signal);
  expect(JSON.parse(String(options?.body))).toEqual(action === 'create' ? { translationId: 'porbr2018', reference: 'GEN 1:1' } : { expectedVersion: 3 });
  expect(new Headers(options?.headers).get('authorization')).toBe('Bearer technical-token');
});
it('removes every version only for the deleted study and refreshes all workspace projections', async () => {
  const { client, wrapper } = scope();
  for (const version of [1, 3]) client.setQueryData(queryKeys.studies.detail(studyId, version), studyFixture({ version }));
  const other = queryKeys.studies.detail(secondStudyId, 3); client.setQueryData(other, studyFixture({ id: secondStudyId }));
  const workspace = [queryKeys.workspace.studies(), queryKeys.workspace.notes(studyId, 3), queryKeys.workspace.favorites()];
  for (const key of workspace) client.setQueryData(key, { items: [] });
  const publicKey = queryKeys.sources.all(); client.setQueryData(publicKey, { sources: [] });
  const { result } = renderHook(() => hooks.useDeleteStudy(), { wrapper });
  await act(async () => { await result.current.mutateAsync(studyId); });
  expect(client.getQueryData(queryKeys.studies.detail(studyId, 1))).toBeUndefined(); expect(client.getQueryData(queryKeys.studies.detail(studyId, 3))).toBeUndefined();
  expect(client.getQueryData(other)).toEqual(studyFixture({ id: secondStudyId }));
  for (const key of workspace) expect(client.getQueryState(key)?.isInvalidated).toBe(true);
  expect(client.getQueryState(publicKey)?.isInvalidated).toBe(false);
});
it('preserves study details and refreshes resumable workspace deletion after a failed attempt', async () => {
  vi.mocked(fetch).mockResolvedValue(Response.json({ error: { code: 'UNAVAILABLE', message: 'Technical deletion unavailable' } }, { status: 503 }));
  const { client, wrapper } = scope(); const detail = queryKeys.studies.detail(studyId, 3), page = queryKeys.workspace.studies();
  client.setQueryData(detail, studyFixture()); client.setQueryData(page, { items: [] });
  const { result } = renderHook(() => hooks.useDeleteStudy(), { wrapper });
  await act(async () => { await expect(result.current.mutateAsync(studyId)).rejects.toThrow('Technical deletion unavailable'); });
  expect(client.getQueryData(detail)).toEqual(studyFixture()); expect(client.getQueryState(page)?.isInvalidated).toBe(true); expect(fetch).toHaveBeenCalledTimes(1);
});
it('invalidates only the selected study note versions after creation', async () => {
  const { client, wrapper } = scope(); const matching = [queryKeys.workspace.notes(studyId, 1), queryKeys.workspace.notes(studyId, 3)];
  const unrelated = [queryKeys.workspace.notes(secondStudyId, 3), queryKeys.workspace.studies(), queryKeys.workspace.favorites()];
  for (const key of [...matching, ...unrelated]) client.setQueryData(key, { items: [] });
  const { result } = renderHook(() => hooks.useCreateNote(), { wrapper });
  await act(async () => { await result.current.mutateAsync({ studyId, studyVersion: 3, content: 'Technical note\nSecond line.' }); });
  for (const key of matching) expect(client.getQueryState(key)?.isInvalidated).toBe(true);
  for (const key of unrelated) expect(client.getQueryState(key)?.isInvalidated).toBe(false);
  const [url, options] = vi.mocked(fetch).mock.calls[0]; expect(new URL(String(url)).pathname).toBe(`/api/workspace/studies/${studyId}/notes`);
  expect(options?.method).toBe('POST'); expect(JSON.parse(String(options?.body))).toEqual({ studyVersion: 3, content: 'Technical note\nSecond line.' });
});
it('keeps caches fresh when note creation fails and never retries the write', async () => {
  vi.mocked(fetch).mockResolvedValue(Response.json({ error: { code: 'UNAVAILABLE', message: 'Technical write unavailable' } }, { status: 503 }));
  const { client, wrapper } = scope(); const key = queryKeys.workspace.notes(studyId, 3); client.setQueryData(key, { items: [] });
  const { result } = renderHook(() => hooks.useCreateNote(), { wrapper });
  await act(async () => { await expect(result.current.mutateAsync({ studyId, studyVersion: 3, content: 'Preserved technical draft' })).rejects.toThrow('Technical write unavailable'); });
  expect(client.getQueryState(key)?.isInvalidated).toBe(false); expect(fetch).toHaveBeenCalledTimes(1);
});
it.each(['revise', 'delete'] as const)('refreshes all note projections after %s without touching unrelated source data', async action => {
  const { client, wrapper } = scope(); const notes = [queryKeys.workspace.notes(studyId, 1), queryKeys.workspace.notes(secondStudyId, 3)];
  const unrelated = [queryKeys.workspace.studies(), queryKeys.sources.all()];
  for (const key of [...notes, ...unrelated]) client.setQueryData(key, { items: [] });
  const { result } = renderHook(() => ({ revise: hooks.useReviseNote(), remove: hooks.useDeleteNote() }), { wrapper });
  const note = noteFixture();
  await act(async () => { if (action === 'revise') await result.current.revise.mutateAsync({ noteId: note.id, expectedRevision: 4, content: 'Technical revision\nPreserved line.' }); else await result.current.remove.mutateAsync(note.id); });
  for (const key of notes) expect(client.getQueryState(key)?.isInvalidated).toBe(true);
  for (const key of unrelated) expect(client.getQueryState(key)?.isInvalidated).toBe(false);
  const [url, options] = vi.mocked(fetch).mock.calls[0]; expect(new URL(String(url)).pathname).toBe(`/api/workspace/notes/${note.id}`);
  expect(options?.method).toBe(action === 'revise' ? 'PATCH' : 'DELETE');
  expect(options?.body && JSON.parse(String(options.body))).toEqual(action === 'revise' ? { expectedRevision: 4, content: 'Technical revision\nPreserved line.' } : undefined);
});
it.each(['create', 'append'] as const)('publishes a successful conversation %s and invalidates only its study history', async action => {
  const { client, wrapper } = scope(); const matching = ['assistant', 'conversations', studyId, { cursor: null }];
  const unrelated = ['assistant', 'conversations', secondStudyId, { cursor: null }];
  client.setQueryData(matching, { items: [] }); client.setQueryData(unrelated, { items: [] });
  const { result } = renderHook(() => ({ create: hooks.useCreateConversation(), append: hooks.useAppendConversationTurn() }), { wrapper });
  const controller = new AbortController();
  await act(async () => { if (action === 'create') await result.current.create.mutateAsync({ studyId, studyVersion: 3, signal: controller.signal }); else await result.current.append.mutateAsync({ conversationId, expectedRevision: 1, question: 'Technical revised question', revisesTurn: 1, signal: controller.signal }); });
  expect(client.getQueryData(queryKeys.assistant.conversation(conversationId))).toEqual(conversationFixture());
  expect(client.getQueryState(matching)?.isInvalidated).toBe(true); expect(client.getQueryState(unrelated)?.isInvalidated).toBe(false);
  const [url, options] = vi.mocked(fetch).mock.calls[0];
  expect(new URL(String(url)).pathname).toBe(action === 'create' ? `/api/studies/${studyId}/conversations` : `/api/conversations/${conversationId}/turns`);
  expect(options?.method).toBe('POST'); expect(options?.signal).toBe(controller.signal);
  expect(JSON.parse(String(options?.body))).toEqual(action === 'create' ? { studyVersion: 3 } : { expectedRevision: 1, question: 'Technical revised question', revisesTurn: 1 });
});
it.each(['create', 'append'] as const)('does not publish a late %s or invalidate history after caller abort', async action => {
  let settle!: (response: Response) => void; const pending = new Promise<Response>(resolve => { settle = resolve; }); vi.mocked(fetch).mockReturnValue(pending);
  const { client, wrapper } = scope(); const detail = queryKeys.assistant.conversation(conversationId), history = ['assistant', 'conversations', studyId, { cursor: null }];
  const previous = conversationFixture(0); client.setQueryData(detail, previous); client.setQueryData(history, { items: [] });
  const { result } = renderHook(() => ({ create: hooks.useCreateConversation(), append: hooks.useAppendConversationTurn() }), { wrapper });
  const controller = new AbortController();
  let completion!: Promise<unknown>;
  act(() => { completion = action === 'create' ? result.current.create.mutateAsync({ studyId, studyVersion: 3, signal: controller.signal }) : result.current.append.mutateAsync({ conversationId, expectedRevision: 0, question: 'Obsolete technical question', signal: controller.signal }); });
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1)); controller.abort();
  await act(async () => { settle(Response.json(conversationFixture(1))); await completion; });
  expect(client.getQueryData(detail)).toEqual(previous); expect(client.getQueryState(history)?.isInvalidated).toBe(false);
});
it('deletes only the chosen conversation cache and refreshes its paginated history', async () => {
  const { client, wrapper } = scope(); const removed = queryKeys.assistant.conversation(conversationId), other = queryKeys.assistant.conversation('40000000-0000-4000-8000-000000000009');
  client.setQueryData(removed, conversationFixture()); client.setQueryData(other, conversationFixture());
  const history = ['assistant', 'conversations', studyId, { cursor: 'opaque-next' }]; client.setQueryData(history, { items: [] });
  const publicKey = queryKeys.sources.all(); client.setQueryData(publicKey, { sources: [] });
  const { result } = renderHook(() => hooks.useDeleteConversation(), { wrapper });
  await act(async () => { await result.current.mutateAsync(conversationId); });
  expect(client.getQueryData(removed)).toBeUndefined(); expect(client.getQueryData(other)).toEqual(conversationFixture());
  expect(client.getQueryState(history)?.isInvalidated).toBe(true); expect(client.getQueryState(publicKey)?.isInvalidated).toBe(false);
});
it('does not load workspace lists without a validated token', () => {
  token = null; const { wrapper } = scope(); renderHook(() => ({ studies: hooks.useWorkspaceStudies(), favorites: hooks.useWorkspaceFavorites() }), { wrapper }); expect(fetch).not.toHaveBeenCalled();
});
