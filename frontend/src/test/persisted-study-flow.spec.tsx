import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AppContent } from '../App';
import { createQueryClient } from '../shared/api/query-client';
import { ThemeProvider } from '../shared/hooks/use-theme';
import { ToastProvider } from '../shared/ui/toast';
import { AccountAccessProvider } from '../shared/ui/shell';
import { HistoryView } from '../features/workspace/history-view';
import { createdAt, noteFixture, reference, secondStudyId, studyFixture, studyId } from './workflow-fixtures';

// Transport/session doubles isolate UI orchestration. Native PG/browser proof is separate.
let authenticated = true, repeatSelection = false, selectedReference = 'GEN 1:1';
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: authenticated, token: authenticated ? 'technical-token' : null, ownerId: 'technical-owner', status: authenticated ? 'authenticated' : 'anonymous', version: 1, clearSession: vi.fn(), setSession: vi.fn() }) }));
vi.mock('../features/canon/reader-view', () => ({ ReaderView: ({ onSelectPassageForStudy }: { onSelectPassageForStudy: (reference: string) => void }) => <button onClick={() => { onSelectPassageForStudy(selectedReference); if (repeatSelection) onSelectPassageForStudy(selectedReference); }}>Start selected passage</button> }));
vi.mock('../features/assistant/context-panel', () => ({ ContextPanel: ({ activeStudyId, activeStudyVersion, onOpenNotes }: { activeStudyId?: string; activeStudyVersion?: number; onOpenNotes?: () => void }) => <div><p data-testid="active-context">{activeStudyId ? `${activeStudyId}:${activeStudyVersion}` : 'none'}</p><button onClick={onOpenNotes}>Open current notes</button></div> }));
const clients: ReturnType<typeof createQueryClient>[] = [];
const calls = () => vi.mocked(fetch).mock.calls.map(([url, options]) => ({ path: new URL(String(url)).pathname, options }));
beforeEach(() => {
  authenticated = true; repeatSelection = false; selectedReference = 'GEN 1:1';
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  vi.stubGlobal('fetch', vi.fn(async (url: string, options?: RequestInit) => {
    const path = new URL(url).pathname;
    if (path === '/api/workspace/studies') return Response.json({ items: [studyFixture()], nextCursor: null });
    if (path === '/api/workspace/favorites') return Response.json({ items: [], nextCursor: null });
    if (path.endsWith('/notes')) return Response.json(options?.method === 'POST' ? noteFixture() : { items: [], nextCursor: null });
    if (path === '/api/studies' && options?.method === 'POST') return Response.json(studyFixture({ id: secondStudyId, version: 1 }));
    if (path.endsWith('/versions')) return Response.json(studyFixture({ version: 4 }));
    if (path === `/api/studies/${studyId}`) return Response.json(studyFixture());
    return Response.json({ error: { code: 'NOT_FOUND', message: 'technical route not found' } }, { status: 404 });
  }));
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); vi.restoreAllMocks(); });
function mount(view: React.ReactNode = <AppContent />) {
  const client = createQueryClient(); clients.push(client);
  return render(<QueryClientProvider client={client}><ThemeProvider><ToastProvider><AccountAccessProvider>{view}</AccountAccessProvider></ToastProvider></ThemeProvider></QueryClientProvider>);
}
it('creates only one study when a caller synchronously repeats the same selection and trims the reference', async () => {
  repeatSelection = true; selectedReference = '  GEN 1:1  ';
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Start selected passage' }));
  await waitFor(() => expect(screen.getByTestId('active-context')).toHaveTextContent(`${secondStudyId}:1`));
  const writes = calls().filter(call => call.path === '/api/studies' && call.options?.method === 'POST');
  expect(writes).toHaveLength(1); expect(JSON.parse(String(writes[0].options?.body))).toEqual({ translationId: 'porbr2018', reference: 'GEN 1:1' });
  expect(screen.getByText('Estudo criado para GEN 1:1')).toBeInTheDocument();
});
it('rejects an empty or anonymous study selection without writing', async () => {
  selectedReference = '   '; const view = mount(); fireEvent.click(screen.getByRole('button', { name: 'Start selected passage' }));
  expect(calls().some(call => call.options?.method === 'POST')).toBe(false);
  view.unmount(); authenticated = false; selectedReference = 'GEN 1:1'; mount();
  fireEvent.click(screen.getByRole('button', { name: 'Start selected passage' }));
  expect(await screen.findByText('Entra na tua conta para criar um estudo.')).toBeInTheDocument();
  expect(calls().some(call => call.options?.method === 'POST')).toBe(false);
});
it.each(['success', 'failure'] as const)('aborts an obsolete study creation and ignores its late %s after opening a saved version', async outcome => {
  const original = vi.mocked(fetch).getMockImplementation()!; let settle!: (response: Response) => void; let signal: AbortSignal | null | undefined;
  const pending = new Promise<Response>(resolve => { settle = resolve; });
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    if (new URL(String(address)).pathname === '/api/studies' && options?.method === 'POST') { signal = options.signal; return pending; }
    return original(address, options);
  });
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Start selected passage' }));
  await waitFor(() => expect(signal).toBeDefined()); expect(screen.getByTestId('active-context')).toHaveTextContent('none');
  fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' })); fireEvent.click(await screen.findByRole('button', { name: 'Abrir' }));
  await waitFor(() => expect(screen.getByTestId('active-context')).toHaveTextContent(`${studyId}:3`)); expect(signal?.aborted).toBe(true);
  await act(async () => { settle(outcome === 'success' ? Response.json(studyFixture({ id: secondStudyId, version: 1 })) : Response.json({ error: { code: 'UNAVAILABLE', message: 'Obsolete creation failure' } }, { status: 503 })); });
  expect(screen.getByTestId('active-context')).toHaveTextContent(`${studyId}:3`); expect(screen.getByText('Versão 3')).toBeInTheDocument();
  expect(screen.queryByText('Obsolete creation failure')).not.toBeInTheDocument(); expect(screen.queryByText('Estudo criado para GEN 1:1')).not.toBeInTheDocument();
});
it('aborts the active study write when the application generation unmounts', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let signal: AbortSignal | null | undefined;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    if (new URL(String(address)).pathname === '/api/studies' && options?.method === 'POST') { signal = options.signal; return new Promise<Response>(() => {}); }
    return original(address, options);
  });
  const view = mount(); fireEvent.click(screen.getByRole('button', { name: 'Start selected passage' }));
  await waitFor(() => expect(signal).toBeDefined()); expect(signal?.aborted).toBe(false); view.unmount(); expect(signal?.aborted).toBe(true);
});
it('propagates the bounded study-write deadline without replacing the caller cancellation signal', async () => {
  const deadline = new AbortController(); const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(deadline.signal);
  const original = vi.mocked(fetch).getMockImplementation()!; let signal: AbortSignal | null | undefined;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    if (new URL(String(address)).pathname === '/api/studies' && options?.method === 'POST') {
      signal = options.signal;
      return new Promise<Response>((_, reject) => signal?.addEventListener('abort', () => reject(Object.assign(new Error('Technical study deadline'), { name: 'AbortError' })), { once: true }));
    }
    return original(address, options);
  });
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Start selected passage' }));
  await waitFor(() => expect(signal).toBeDefined()); expect(timeout).toHaveBeenCalledWith(15000); expect(signal?.aborted).toBe(false);
  await act(async () => { deadline.abort(); });
  expect(signal?.aborted).toBe(true); await screen.findByText('A requisição excedeu o tempo limite de resposta.'); expect(calls().filter(call => call.options?.method === 'POST')).toHaveLength(1);
});

it('does not create a private study merely by navigating to the study screen', async () => {
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Estudo Estruturado' }));
  await screen.findByRole('button', { name: /Gerar Estudo/i });
  await new Promise(resolve => setTimeout(resolve, 25));
  expect(calls().filter(call => call.options?.method === 'POST')).toHaveLength(0);
});
it.each(['saved', 'created'] as const)('starts a distinct study from the reader after a %s study without revising the previous id', async previous => {
  const original = vi.mocked(fetch).getMockImplementation()!; let postpone = false, requested = false, finish!: (response: Response) => void;
  const pending = new Promise<Response>(resolve => { finish = resolve; });
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    if (postpone && new URL(String(address)).pathname === '/api/studies' && options?.method === 'POST') { requested = true; return pending; }
    return original(address, options);
  });
  mount();
  if (previous === 'saved') { fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' })); fireEvent.click(await screen.findByRole('button', { name: 'Abrir' })); }
  else fireEvent.click(screen.getByRole('button', { name: 'Start selected passage' }));
  await waitFor(() => expect(screen.getByTestId('active-context')).toHaveTextContent(previous === 'saved' ? `${studyId}:3` : `${secondStudyId}:1`));
  fireEvent.click(screen.getByRole('button', { name: 'Bíblia' })); postpone = true;
  fireEvent.click(screen.getByRole('button', { name: 'Start selected passage' })); await waitFor(() => expect(requested).toBe(true));
  expect(screen.getByTestId('active-context')).toHaveTextContent('none');
  const thirdId = '10000000-0000-4000-8000-000000000003';
  await act(async () => { finish(Response.json(studyFixture({ id: thirdId, version: 1 }))); });
  await waitFor(() => expect(screen.getByTestId('active-context')).toHaveTextContent(`${thirdId}:1`));
  expect(calls().some(call => call.path.endsWith('/versions'))).toBe(false);
});
it.each(['saved', 'created'] as const)('preserves the active %s study when a different workspace study is deleted', async previous => {
  let items = [studyFixture(), studyFixture({ id: secondStudyId, version: 1 })]; const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    const path = new URL(String(address)).pathname;
    if (path === '/api/workspace/studies') return Response.json({ items, nextCursor: null });
    if (options?.method === 'DELETE') { items = items.filter(item => !path.endsWith(item.id)); return new Response(null, { status: 204 }); }
    return original(address, options);
  });
  mount();
  if (previous === 'saved') { fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' })); fireEvent.click((await screen.findAllByRole('button', { name: 'Abrir' }))[0]); }
  else fireEvent.click(screen.getByRole('button', { name: 'Start selected passage' }));
  const active = previous === 'saved' ? `${studyId}:3` : `${secondStudyId}:1`;
  await waitFor(() => expect(screen.getByTestId('active-context')).toHaveTextContent(active));
  fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  fireEvent.click(await screen.findByRole('button', { name: `Eliminar estudo GEN 1:1 versão ${previous === 'saved' ? 1 : 3}` }));
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar estudo' })); await screen.findByText('Estudo e dados associados eliminados.');
  expect(screen.getByTestId('active-context')).toHaveTextContent(active);
});
it('recovers a failed saved-study read with GET rather than creating a replacement study', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let attempts = 0;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    if (new URL(String(url)).pathname === `/api/studies/${studyId}` && ++attempts === 1)
      return Response.json({ error: { code: 'UNAVAILABLE', message: 'Leitura temporariamente indisponível.' } }, { status: 503 });
    return original(url, options);
  });
  mount(); const client = clients.at(-1)!;
  client.setDefaultOptions({ ...client.getDefaultOptions(), queries: { ...client.getDefaultOptions().queries, retry: false } });
  fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Abrir' }));
  await screen.findByText('Leitura temporariamente indisponível.');
  fireEvent.click(screen.getByRole('button', { name: 'Consultar versão atual' }));
  await screen.findByText('Versão 3'); expect(attempts).toBe(2);
  expect(calls().filter(call => call.options?.method === 'POST')).toHaveLength(0);
});
it('reopens the saved id/version without POST and keeps it active across navigation', async () => {
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Abrir' }));
  await waitFor(() => expect(screen.getByTestId('active-context')).toHaveTextContent(`${studyId}:3`));
  expect(calls().some(call => call.path === `/api/studies/${studyId}`)).toBe(true);
  expect(calls().filter(call => call.options?.method === 'POST')).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: 'Bíblia' }));
  fireEvent.click(screen.getByRole('button', { name: 'Estudo Estruturado' }));
  expect(await screen.findByText('Versão 3')).toBeInTheDocument();
  expect(calls().filter(call => call.options?.method === 'POST')).toHaveLength(0);
});
it('creates a new version with the saved version as CAS precondition and updates the assistant', async () => {
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Abrir' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Criar nova versão' }));
  await waitFor(() => expect(screen.getByTestId('active-context')).toHaveTextContent(`${studyId}:4`));
  const request = calls().find(call => call.path.endsWith('/versions'));
  expect(request?.options?.method).toBe('POST'); expect(JSON.parse(String(request?.options?.body))).toEqual({ expectedVersion: 3 });
});
it('reloads the server version on every explicit recovery, including a fresh cached latest-version query', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let latest = 3;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    const target = new URL(String(url));
    if (target.pathname.endsWith('/versions')) return Response.json({ error: { code: 'STUDY_CONFLICT', message: 'Outra versão foi guardada.' } }, { status: 409 });
    if (target.pathname === `/api/studies/${studyId}`) return Response.json(studyFixture({ version: target.searchParams.has('version') ? 3 : latest }));
    return original(url, options);
  });
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Abrir' })); await screen.findByText('Versão 3');
  for (const version of [4, 5]) {
    latest = version;
    fireEvent.click(screen.getByRole('button', { name: 'Criar nova versão' }));
    await screen.findByText('Outra versão foi guardada.');
    fireEvent.click(screen.getByRole('button', { name: 'Consultar versão atual' }));
    await screen.findByText(`Versão ${version}`);
  }
  expect(calls().filter(call => call.path.endsWith('/versions'))).toHaveLength(2);
});
it('writes a note against the selected version instead of silently using version one', async () => {
  mount(<HistoryView />); fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: screen.getByRole('option', { name: 'GEN 1:1 (v3)' }).getAttribute('value') } });
  fireEvent.change(await screen.findByPlaceholderText(/Escreva uma nova anotação/), { target: { value: 'Nota técnica de teste.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar Nota' }));
  await waitFor(() => expect(calls().some(call => call.path.endsWith('/notes') && call.options?.method === 'POST')).toBe(true));
  const request = calls().find(call => call.path.endsWith('/notes') && call.options?.method === 'POST');
  expect(JSON.parse(String(request?.options?.body))).toEqual({ studyVersion: 3, content: 'Nota técnica de teste.' });
});
it('does not treat a favorite of an older version as a favorite of the latest one', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => new URL(String(url)).pathname === '/api/workspace/favorites'
    ? Response.json({ items: [{ id: '30000000-0000-4000-8000-000000000001', studyId, studyVersion: 1, createdAt, reference }], nextCursor: null }) : original(url, options));
  mount(<HistoryView />);
  expect(await screen.findByRole('button', { name: 'Marcar favorito' })).toBeInTheDocument();
});
it('opens notes directly for the active study and version from the contextual panel', async () => {
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Abrir' }));
  await waitFor(() => expect(screen.getByTestId('active-context')).toHaveTextContent(`${studyId}:3`));
  fireEvent.click(screen.getByRole('button', { name: 'Open current notes' }));
  expect(await screen.findByPlaceholderText(/Escreva uma nova anotação/)).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toHaveDisplayValue('GEN 1:1 (v3)');
  fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  expect(screen.getByRole('button', { name: /Estudos Recentes/ })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'Anotações Pessoais' })).toHaveAttribute('aria-pressed', 'false');
});
it('disconnects the assistant when its newly created study is deleted', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let created = false, deleted = false;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    const path = new URL(String(url)).pathname;
    if (path === '/api/studies' && options?.method === 'POST') { created = true; return Response.json(studyFixture({ id: secondStudyId, version: 1 })); }
    if (path === `/api/workspace/studies/${secondStudyId}` && options?.method === 'DELETE') { deleted = true; return new Response(null, { status: 204 }); }
    if (path === '/api/workspace/studies') return Response.json({ items: created && !deleted ? [studyFixture({ id: secondStudyId, version: 1 })] : [], nextCursor: null });
    return original(url, options);
  });
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Start selected passage' }));
  await waitFor(() => expect(screen.getByTestId('active-context')).toHaveTextContent(`${secondStudyId}:1`));
  fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Eliminar estudo GEN 1:1 versão 1' }));
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar estudo' }));
  await waitFor(() => expect(deleted).toBe(true));
  await waitFor(() => expect(screen.getByTestId('active-context')).toHaveTextContent('none'));
});
