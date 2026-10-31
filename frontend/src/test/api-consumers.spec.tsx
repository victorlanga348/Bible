import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { api } from '../shared/api/services';
import { useCreateCrossReference, useDeleteNote, useHealth, useSourceExcerpts, useSources, useToggleFavorite, useTranslations } from '../shared/api/hooks';
import { createQueryClient, queryKeys } from '../shared/api/query-client';
import { reference, studyFixture, studyId } from './workflow-fixtures';

vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ token: 'technical-token' }) }));
const clients: ReturnType<typeof createQueryClient>[] = [];
beforeEach(() => vi.stubGlobal('fetch', vi.fn(async (address: string, options?: RequestInit) => {
  if (options?.method === 'DELETE') return new Response(null, { status: 204 });
  const url = new URL(address);
  if (url.pathname === '/api/health/ready') return Response.json({ status: 'ready', database: 'up' });
  if (url.pathname === '/api/translations') return Response.json({ translations: [{ id: 'porbr2018' }] });
  if (url.pathname === '/api/sources') return Response.json({ sources: [{ id: 'technical-source' }] });
  if (url.pathname.endsWith('/excerpts')) return Response.json({ excerpts: [{ id: 'technical-excerpt' }] });
  if (url.pathname.endsWith('/books')) return Response.json({ books: [{ code: 'GEN' }] });
  if (url.pathname.endsWith('/verses')) return Response.json(studyFixture().passage);
  if (url.pathname.endsWith('/resolve')) return Response.json(reference);
  if (url.pathname === '/api/workspace/studies') return Response.json({ items: [studyFixture()], nextCursor: null });
  return Response.json(studyFixture());
})));
afterEach(() => { cleanup(); clients.forEach(c => c.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function scope() {
  const client = createQueryClient(); clients.push(client);
  return { client, wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> };
}
it('loads public query consumers and keeps the selected source/filter in the URL', async () => {
  const { wrapper } = scope();
  const { result } = renderHook(() => ({ health: useHealth(), translations: useTranslations(), sources: useSources(), excerpts: useSourceExcerpts('technical-source', 'creation') }), { wrapper });
  await waitFor(() => expect(Object.values(result.current).every(query => query.isSuccess)).toBe(true));
  expect(result.current.health.data).toEqual({ status: 'ready', database: 'up' });
  expect(result.current.translations.data).toEqual([{ id: 'porbr2018' }]);
  expect(result.current.sources.data).toEqual([{ id: 'technical-source' }]);
  expect(result.current.excerpts.data).toEqual([{ id: 'technical-excerpt' }]);
  expect(vi.mocked(fetch).mock.calls.some(([url]) => new URL(String(url)).pathname === '/api/sources/technical-source/excerpts' && new URL(String(url)).searchParams.get('q') === 'creation')).toBe(true);
});
it('does not fetch excerpts before a source is selected', () => {
  const { wrapper } = scope(); renderHook(() => useSourceExcerpts(''), { wrapper }); expect(fetch).not.toHaveBeenCalled();
});
it('toggles only the chosen favorite version with an idempotent PUT/DELETE and refreshes favorites', async () => {
  const { client, wrapper } = scope(); const key = queryKeys.workspace.favorites();
  client.setQueryData(key, { items: [] });
  const { result } = renderHook(() => useToggleFavorite(), { wrapper });
  await act(async () => { await result.current.mutateAsync({ studyId, studyVersion: 3, isFavorite: false }); });
  await act(async () => { expect(await result.current.mutateAsync({ studyId, studyVersion: 3, isFavorite: true })).toBeUndefined(); });
  const calls = vi.mocked(fetch).mock.calls;
  expect(calls.map(([address, options]) => [new URL(String(address)).pathname, options?.method])).toEqual([
    [`/api/workspace/studies/${studyId}/favorites/3`, 'PUT'], [`/api/workspace/studies/${studyId}/favorites/3`, 'DELETE'],
  ]);
  for (const [, options] of calls) { expect(options?.body).toBeUndefined(); expect(new Headers(options?.headers).get('authorization')).toBe('Bearer technical-token'); }
  expect(client.getQueryState(key)?.isInvalidated).toBe(true);
});
it('invalidates note versions and relation lists only after successful writes', async () => {
  const { client, wrapper } = scope();
  const noteKey = queryKeys.workspace.notes(studyId, 3), relationKey = queryKeys.crossReferences.relations('porbr2018', 'GEN 1:1');
  client.setQueryData(noteKey, { items: ['technical-note'] }); client.setQueryData(relationKey, { items: [] });
  const { result } = renderHook(() => ({ remove: useDeleteNote(), relation: useCreateCrossReference() }), { wrapper });
  await act(async () => { await result.current.remove.mutateAsync('technical-note'); });
  expect(client.getQueryState(noteKey)?.isInvalidated).toBe(true);
  const body = { from: reference, to: reference, type: 'thematic-parallel', rationale: 'Technical transport only' };
  await act(async () => { await result.current.relation.mutateAsync(body); });
  expect(client.getQueryState(relationKey)?.isInvalidated).toBe(true);
  const call = vi.mocked(fetch).mock.calls.find(([address]) => String(address).endsWith('/cross-references'))!;
  expect(call[1]?.method).toBe('POST'); expect(JSON.parse(String(call[1]?.body))).toEqual(body);
  expect(new Headers(call[1]?.headers).get('authorization')).toBe('Bearer technical-token');
});
it('keeps the existing service facade compatible with public and private HTTP contracts', async () => {
  expect(await api.health()).toEqual({ status: 'ready', database: 'up' });
  expect(await api.translations()).toEqual({ translations: [{ id: 'porbr2018' }] });
  expect(await api.books('porbr2018')).toEqual({ books: [{ code: 'GEN' }] });
  expect(await api.passage('porbr2018', 'GEN', 1, 1, 1)).toEqual(studyFixture().passage);
  expect(await api.resolveReference('porbr2018', 'GEN 1:1')).toEqual(reference);
  expect(await api.sources()).toEqual({ sources: [{ id: 'technical-source' }] });
  expect((await api.workspaceStudies('technical-token', 'technical-cursor')).items[0].id).toBe(studyId);
  expect((await api.study(studyId, 'technical-token', 3)).version).toBe(3);
  expect((await api.createStudy('porbr2018', 'GEN 1:1', 'technical-token')).id).toBe(studyId);
  const calls = vi.mocked(fetch).mock.calls;
  expect(calls.map(([address]) => new URL(String(address)).pathname)).toEqual([
    '/api/health/ready', '/api/translations', '/api/translations/porbr2018/books',
    '/api/translations/porbr2018/books/GEN/chapters/1/verses', '/api/references/resolve', '/api/sources',
    '/api/workspace/studies', `/api/studies/${studyId}`, '/api/studies',
  ]);
  expect(new URL(String(calls[3][0])).searchParams.toString()).toBe('from=1&to=1');
  expect(new URL(String(calls[6][0])).searchParams.get('cursor')).toBe('technical-cursor');
  expect(new URL(String(calls[7][0])).searchParams.get('version')).toBe('3');
  expect(JSON.parse(String(calls[8][1]?.body))).toEqual({ translationId: 'porbr2018', reference: 'GEN 1:1' });
  for (const call of calls.slice(6)) expect(new Headers(call[1]?.headers).get('authorization')).toBe('Bearer technical-token');
});
