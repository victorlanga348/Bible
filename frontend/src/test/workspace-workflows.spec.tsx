import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HistoryView } from '../features/workspace/history-view';
import { createQueryClient } from '../shared/api/query-client';
import { ToastProvider } from '../shared/ui/toast';
import { createdAt, noteFixture, reference, secondStudyId, studyFixture, studyId } from './workflow-fixtures';

// Stateful HTTP protocol double, never a substitute for the native PG proof.
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: true, token: 'technical-token' }) }));
const clients: ReturnType<typeof createQueryClient>[] = [];
let notes = [noteFixture()];
beforeEach(() => {
  notes = [noteFixture()];
  vi.stubGlobal('fetch', vi.fn(async (address: string, options?: RequestInit) => {
    const url = new URL(address), path = url.pathname;
    if (path === '/api/workspace/studies') return Response.json({ items: [studyFixture()], nextCursor: null });
    if (path === '/api/workspace/favorites') return Response.json({ items: [], nextCursor: null });
    if (path.endsWith('/notes') && options?.method === 'POST') {
      const body = JSON.parse(String(options.body)); notes.push(noteFixture({ id: '20000000-0000-4000-8000-000000000002', content: body.content })); return Response.json(notes.at(-1));
    }
    if (path.endsWith('/notes')) return Response.json({ items: notes, nextCursor: null });
    return Response.json({ error: { code: 'NOT_FOUND', message: 'technical route not found' } }, { status: 404 });
  }));
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function mount(onOpenStudy?: (id: string, version: number, reference: string) => void) {
  const client = createQueryClient(); clients.push(client);
  return render(<QueryClientProvider client={client}><ToastProvider><HistoryView onOpenStudy={onOpenStudy} /></ToastProvider></QueryClientProvider>);
}
async function openNotes() {
  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: screen.getByRole('option', { name: 'GEN 1:1 (v3)' }).getAttribute('value') } });
  await screen.findByText(notes[0]!.content);
}

it('reads notes for the selected version and refreshes that cache after creating a note', async () => {
  mount(); await openNotes();
  const read = vi.mocked(fetch).mock.calls.find(([url, options]) => String(url).includes('/notes') && !options?.method);
  expect(new URL(String(read?.[0])).searchParams.get('studyVersion')).toBe('3');
  fireEvent.change(screen.getByPlaceholderText(/Escreva uma nova anotação/), { target: { value: 'Segunda nota técnica.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar Nota' }));
  expect(await screen.findByText('Segunda nota técnica.')).toBeInTheDocument();
});
it('retains a conflicting draft, explicitly reloads the current revision, then sends the new CAS precondition', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  let revisions = 0;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    if (options?.method !== 'PATCH') return original(url, options);
    if (++revisions === 1) {
      notes = [noteFixture({ revision: 2, content: 'Outra edição técnica.' })];
      return Response.json({ error: { code: 'WORKSPACE_CONFLICT', message: 'Outra edição foi guardada.' } }, { status: 409 });
    }
    const body = JSON.parse(String(options.body)); notes = [noteFixture({ revision: 3, content: body.content })]; return Response.json(notes[0]);
  });
  mount(); await openNotes(); fireEvent.click(screen.getByRole('button', { name: /Editar Nota/i }));
  const field = screen.getByPlaceholderText('Conteúdo revisado da anotação...');
  fireEvent.change(field, { target: { value: 'Rascunho técnico a preservar.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));
  const reload = await screen.findByRole('button', { name: 'Carregar revisão atual' });
  expect(field).toHaveValue('Rascunho técnico a preservar.'); expect(revisions).toBe(1);
  fireEvent.click(reload);
  await waitFor(() => expect(field).toHaveValue('Outra edição técnica.'));
  fireEvent.change(field, { target: { value: 'Revisão técnica confirmada.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  const last = vi.mocked(fetch).mock.calls.filter(([, options]) => options?.method === 'PATCH').at(-1);
  expect(JSON.parse(String(last?.[1]?.body))).toEqual({ expectedRevision: 2, content: 'Revisão técnica confirmada.' });
  expect(await screen.findByText('Revisão técnica confirmada.')).toBeInTheDocument();
});
it('does not erase line breaks when a saved personal note is opened for editing', async () => {
  notes = [noteFixture({ content: 'Linha técnica um.\nLinha técnica dois.' })];
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: screen.getByRole('option', { name: 'GEN 1:1 (v3)' }).getAttribute('value') } });
  fireEvent.click(await screen.findByRole('button', { name: /Editar Nota/i }));
  expect(screen.getByPlaceholderText('Conteúdo revisado da anotação...')).toHaveValue(notes[0]!.content);
});
it('follows real workspace cursors and permits returning to the preceding page', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    const url = new URL(String(address));
    if (url.pathname !== '/api/workspace/studies') return original(address, options);
    return Response.json(url.searchParams.get('cursor') === 'technical-page-two'
      ? { items: [studyFixture({ id: secondStudyId, version: 2 })], nextCursor: null }
      : { items: [studyFixture()], nextCursor: 'technical-page-two' });
  });
  mount(); const next = await screen.findByRole('button', { name: 'Estudos seguintes' });
  await waitFor(() => expect(next).toBeEnabled()); fireEvent.click(next);
  expect(await screen.findByText('v2')).toBeInTheDocument(); expect(screen.queryByText('v3')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Estudos anteriores' }));
  expect(await screen.findByText('v3')).toBeInTheDocument();
});
it('opens the exact favorite version with its real reference instead of displaying an opaque id', async () => {
  const open = vi.fn(); const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => new URL(String(url)).pathname === '/api/workspace/favorites'
    ? Response.json({ items: [{ id: '30000000-0000-4000-8000-000000000001', studyId, studyVersion: 1, createdAt, reference }], nextCursor: null }) : original(url, options));
  mount(open); fireEvent.click(screen.getByRole('button', { name: /Favoritos/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Abrir favorito GEN 1:1 versão 1' }));
  expect(open).toHaveBeenCalledWith(studyId, 1, 'GEN 1:1');
});
it('requires confirmation before deleting an owned study and removes it from the workspace after success', async () => {
  let deleted = false; const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    const path = new URL(String(url)).pathname;
    if (options?.method === 'DELETE' && path === `/api/workspace/studies/${studyId}`) { deleted = true; return new Response(null, { status: 204 }); }
    if (deleted && path === '/api/workspace/studies') return Response.json({ items: [], nextCursor: null });
    return original(url, options);
  });
  mount(); fireEvent.click(await screen.findByRole('button', { name: 'Eliminar estudo GEN 1:1 versão 3' }));
  expect(deleted).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar estudo' }));
  await waitFor(() => expect(deleted).toBe(true));
  expect(await screen.findByText('Nenhum estudo persistido ainda no workspace.')).toBeInTheDocument();
});
