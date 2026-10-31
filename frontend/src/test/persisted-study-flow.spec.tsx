import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: true, token: 'technical-token', ownerId: 'technical-owner', status: 'authenticated', version: 1, clearSession: vi.fn(), setSession: vi.fn() }) }));
vi.mock('../features/canon/reader-view', () => ({ ReaderView: ({ onSelectPassageForStudy }: { onSelectPassageForStudy: (reference: string) => void }) => <button onClick={() => onSelectPassageForStudy('GEN 1:1')}>Start selected passage</button> }));
vi.mock('../features/assistant/context-panel', () => ({ ContextPanel: ({ activeStudyId, activeStudyVersion }: { activeStudyId?: string; activeStudyVersion?: number }) => <p data-testid="active-context">{activeStudyId ? `${activeStudyId}:${activeStudyVersion}` : 'none'}</p> }));
const clients: ReturnType<typeof createQueryClient>[] = [];
const calls = () => vi.mocked(fetch).mock.calls.map(([url, options]) => ({ path: new URL(String(url)).pathname, options }));
beforeEach(() => {
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
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function mount(view: React.ReactNode = <AppContent />) {
  const client = createQueryClient(); clients.push(client);
  return render(<QueryClientProvider client={client}><ThemeProvider><ToastProvider><AccountAccessProvider>{view}</AccountAccessProvider></ToastProvider></ThemeProvider></QueryClientProvider>);
}

it('does not create a private study merely by navigating to the study screen', async () => {
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Estudo Estruturado' }));
  await screen.findByRole('button', { name: /Gerar Estudo/i });
  await new Promise(resolve => setTimeout(resolve, 25));
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
it('writes a note against the selected version instead of silently using version one', async () => {
  mount(<HistoryView />); fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });
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

it('clears active study when a new passage is started from the reader and updates input', async () => {
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Abrir' }));
  await waitFor(() => expect(screen.getByTestId('active-context')).toHaveTextContent(`${studyId}:3`));
  fireEvent.click(screen.getByRole('button', { name: 'Bíblia' }));
  fireEvent.click(screen.getByText('Start selected passage'));
  await waitFor(() => expect(screen.getByTestId('active-context')).toHaveTextContent('none'));
  expect(await screen.findByDisplayValue('GEN 1:1')).toBeInTheDocument();
});
