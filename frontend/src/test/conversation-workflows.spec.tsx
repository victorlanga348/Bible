import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ContextPanel } from '../features/assistant/context-panel';
import { createQueryClient } from '../shared/api/query-client';
import { ToastProvider } from '../shared/ui/toast';
import { conversationFixture, conversationId, createdAt, studyId } from './workflow-fixtures';

// Stateful protocol fixture: persistence and actual model execution have native tests.
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: true, token: 'technical-token' }) }));
const clients: ReturnType<typeof createQueryClient>[] = [];
let stored = conversationFixture();
let exists = true;
beforeEach(() => {
  stored = conversationFixture(); exists = true;
  vi.stubGlobal('fetch', vi.fn(async (address: string, options?: RequestInit) => {
    const path = new URL(address).pathname;
    if (path === `/api/workspace/studies/${studyId}/conversations`) return Response.json({ items: exists ? [{ id: conversationId, studyId, studyVersion: 3, revision: stored.revision, createdAt }] : [], nextCursor: null });
    if (path === `/api/conversations/${conversationId}` && options?.method === 'DELETE') { exists = false; return new Response(null, { status: 204 }); }
    if (path === `/api/conversations/${conversationId}`) return Response.json(stored);
    if (path.endsWith('/conversations') && options?.method === 'POST') { stored = conversationFixture(0); exists = true; return Response.json(stored); }
    if (path.endsWith('/turns')) { const body = JSON.parse(String(options?.body)); stored = conversationFixture(stored.revision + 1, body.question); return Response.json(stored); }
    return Response.json({ error: { code: 'NOT_FOUND', message: 'technical route not found' } }, { status: 404 });
  }));
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function mount() {
  const client = createQueryClient(); clients.push(client);
  return render(<QueryClientProvider client={client}><ToastProvider><ContextPanel activeStudyId={studyId} activeStudyVersion={3} /></ToastProvider></QueryClientProvider>);
}
const turnCalls = () => vi.mocked(fetch).mock.calls.filter(([url]) => String(url).endsWith('/turns'));
it('loads saved conversation history before any write', async () => {
  mount(); expect(await screen.findByText('"Questão técnica anterior."')).toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
});
it('appends against the actual conversation revision and restores its result after a fresh mount', async () => {
  const view = mount(); await screen.findByText('"Questão técnica anterior."');
  fireEvent.change(screen.getByPlaceholderText(/O que Josefo relata/), { target: { value: 'Nova pergunta técnica.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar pergunta' }));
  await waitFor(() => expect(stored.revision).toBe(2));
  expect(JSON.parse(String(turnCalls()[0]?.[1]?.body))).toEqual({ expectedRevision: 1, question: 'Nova pergunta técnica.' });
  view.unmount(); mount();
  expect((await screen.findAllByText('"Nova pergunta técnica."')).length).toBeGreaterThan(0);
  expect(turnCalls()).toHaveLength(1);
});
it('preserves a conflicting question and reloads the revision before a deliberate retry', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let conflict = true;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    if (String(url).endsWith('/turns') && conflict) {
      conflict = false; stored = conversationFixture(2);
      return Response.json({ error: { code: 'CONVERSATION_CONFLICT', message: 'A conversa foi alterada ou atingiu o limite de turnos.' } }, { status: 409 });
    }
    return original(url, options);
  });
  mount(); await screen.findByText('"Questão técnica anterior."');
  const field = screen.getByPlaceholderText(/O que Josefo relata/);
  fireEvent.change(field, { target: { value: 'Rascunho técnico de pergunta.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar pergunta' }));
  await screen.findByText('A conversa foi alterada ou atingiu o limite de turnos.');
  expect(field).toHaveValue('Rascunho técnico de pergunta.'); expect(turnCalls()).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Atualizar conversa' }));
  await screen.findByText('2/20 turnos');
  fireEvent.click(screen.getByRole('button', { name: 'Enviar pergunta' }));
  await waitFor(() => expect(turnCalls()).toHaveLength(2));
  expect(JSON.parse(String(turnCalls()[1]?.[1]?.body))).toEqual({ expectedRevision: 2, question: 'Rascunho técnico de pergunta.' });
});
it('requires confirmation to delete the selected conversation', async () => {
  mount(); await screen.findByText('"Questão técnica anterior."');
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar conversa' })); expect(exists).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar eliminação da conversa' }));
  await waitFor(() => expect(exists).toBe(false));
  expect(screen.queryByText('"Questão técnica anterior."')).not.toBeInTheDocument();
});
it('disables another turn at the contractual limit and allows a new conversation explicitly', async () => {
  stored = conversationFixture(20); mount(); await screen.findByText('20/20 turnos');
  expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Nova conversa' }));
  await waitFor(() => expect(stored.revision).toBe(0));
  expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeDisabled(); // Empty question, not a fabricated turn.
});
it('rejects oversized UTF-8 questions before a write and keeps the draft editable', async () => {
  mount(); await screen.findByText('"Questão técnica anterior."');
  const field = screen.getByLabelText('Pergunta investigativa', { exact: false });
  fireEvent.change(field, { target: { value: 'á'.repeat(251) } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar pergunta' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('A pergunta pode ter até 500 bytes UTF-8.');
  expect(turnCalls()).toHaveLength(0); expect(field).toHaveValue('á'.repeat(251));
});
it('presents a genuine server failure without claiming cancellation or losing the question', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => String(address).endsWith('/turns')
    ? Response.json({ error: { code: 'AI_UNAVAILABLE', message: 'O runtime está indisponível. Tenta novamente.' } }, { status: 503 }) : original(address, options));
  mount(); await screen.findByText('"Questão técnica anterior."');
  fireEvent.change(screen.getByPlaceholderText(/O que Josefo relata/), { target: { value: 'Rascunho retido.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar pergunta' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('O runtime está indisponível.');
  expect(screen.getByPlaceholderText(/O que Josefo relata/)).toHaveValue('Rascunho retido.');
  expect(screen.queryByText(/Pedido interrompido/)).not.toBeInTheDocument(); expect(turnCalls()).toHaveLength(1);
});
it('preserves a conversation when deletion fails and supports cancelling its confirmation', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => options?.method === 'DELETE'
    ? Response.json({ error: { code: 'UNAVAILABLE', message: 'Não foi possível eliminar agora.' } }, { status: 503 }) : original(address, options));
  mount(); await screen.findByText('"Questão técnica anterior."');
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar conversa' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' })); expect(exists).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar conversa' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar eliminação da conversa' }));
  await screen.findAllByText('Não foi possível eliminar agora.');
  expect(screen.getByRole('dialog')).toBeInTheDocument(); expect(exists).toBe(true);
});
it('retains unavailable historical turns without inventing their deleted analysis', async () => {
  stored.turns[0] = { ...stored.turns[0], analysis: null, responseStatus: 'unavailable' };
  mount(); expect(await screen.findByText('Esta resposta já não está disponível.')).toBeInTheDocument();
  expect(screen.queryByText('Proveniência da resposta')).not.toBeInTheDocument();
});
it('paginates conversation history using its opaque cursor and returns to the preceding page', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    const url = new URL(String(address));
    if (url.pathname.endsWith(`/studies/${studyId}/conversations`)) return Response.json({ items: url.searchParams.has('cursor') ? [] : [{ id: conversationId, studyId, studyVersion: 3, revision: 1, createdAt }], nextCursor: url.searchParams.has('cursor') ? null : 'technical-conversation-cursor' });
    return original(address, options);
  });
  mount(); await screen.findByText('"Questão técnica anterior."');
  fireEvent.click(screen.getByRole('button', { name: 'Conversas seguintes' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Conversas seguintes' })).toBeDisabled());
  expect(screen.queryByText('"Questão técnica anterior."')).not.toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls.some(([address]) => new URL(String(address)).searchParams.get('cursor') === 'technical-conversation-cursor')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Conversas anteriores' }));
  await screen.findByText('"Questão técnica anterior."');
});
