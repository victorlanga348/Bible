import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ContextPanel } from '../features/assistant/context-panel';
import { createQueryClient } from '../shared/api/query-client';
import { ToastProvider } from '../shared/ui/toast';
import { conversationFixture, conversationId, createdAt, secondStudyId, studyId } from './workflow-fixtures';

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
it('keeps empty questions unsent even when the form is submitted directly', async () => {
  stored = conversationFixture(0); mount(); await screen.findByText('Ainda não há perguntas nesta conversa.');
  const field = screen.getByPlaceholderText(/O que Josefo relata/);
  expect(field).toHaveValue(''); expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeDisabled();
  fireEvent.change(field, { target: { value: '   ' } });
  expect(screen.getByText('0/500B')).toBeInTheDocument();
  expect(fireEvent.submit(field.closest('form')!)).toBe(false);
  expect(turnCalls()).toHaveLength(0); expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeDisabled();
});
it('accepts exactly 500 UTF-8 bytes, trims the submitted question and enforces the twentieth-turn boundary', async () => {
  stored = conversationFixture(19); mount(); await screen.findByText('19/20 turnos');
  const field = screen.getByPlaceholderText(/O que Josefo relata/), question = 'é'.repeat(250);
  expect(screen.queryByText('Esta conversa atingiu 20 turnos. Inicia uma nova conversa para continuar.')).not.toBeInTheDocument();
  fireEvent.change(field, { target: { value: `  ${question}  ` } });
  expect(screen.getByText('500/500B')).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeEnabled();
  fireEvent.submit(field.closest('form')!); await screen.findByText('20/20 turnos');
  expect(JSON.parse(String(turnCalls()[0][1]?.body))).toEqual({ expectedRevision: 19, question });
  expect(field).toHaveValue(''); expect(screen.getByText('Resposta guardada na conversa.')).toBeInTheDocument();
  expect(screen.getByText('Esta conversa atingiu 20 turnos. Inicia uma nova conversa para continuar.')).toBeInTheDocument();
  fireEvent.change(field, { target: { value: 'Queued twenty-first turn' } }); fireEvent.submit(field.closest('form')!);
  expect(turnCalls()).toHaveLength(1); expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeDisabled();
});
it.each(['history', 'detail'] as const)('does not present %s loading as an empty conversation or allow a queued turn', async target => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  const address = target === 'history' ? `/api/workspace/studies/${studyId}/conversations` : `/api/conversations/${conversationId}`;
  let settle!: (response: Response) => void;
  const pending = new Promise<Response>(resolve => { settle = resolve; });
  vi.mocked(fetch).mockImplementation(async (url, options) => new URL(String(url)).pathname === address ? pending : original(url, options));
  mount(); await screen.findByText('A carregar a conversa…');
  const field = screen.getByPlaceholderText(/O que Josefo relata/); fireEvent.change(field, { target: { value: 'Queued while loading' } }); fireEvent.submit(field.closest('form')!);
  expect(turnCalls()).toHaveLength(0); expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeDisabled();
  expect(screen.queryByText('Ainda não há perguntas nesta conversa.')).not.toBeInTheDocument();
  await act(async () => { settle(Response.json(target === 'history' ? { items: [{ ...conversationFixture(), turns: undefined }], nextCursor: null } : stored)); });
  await screen.findByText('"Questão técnica anterior."');
  expect(screen.queryByText('A carregar a conversa…')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeEnabled();
});
it.each(['study', 'version'] as const)('does not render a conversation returned for a different %s', async mismatch => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    const path = new URL(String(address)).pathname;
    if (path.endsWith(`/studies/${studyId}/conversations`)) return Response.json({ items: [
      { id: '40000000-0000-4000-8000-000000000009', studyId, studyVersion: 2, revision: 20, createdAt },
      { id: conversationId, studyId, studyVersion: 3, revision: 1, createdAt },
    ], nextCursor: null });
    if (path === `/api/conversations/${conversationId}`) return Response.json({ ...conversationFixture(1, 'Foreign version answer'), ...(mismatch === 'study' ? { studyId: secondStudyId } : { studyVersion: 2 }) });
    return original(address, options);
  });
  mount(); await screen.findByText('Ainda não há perguntas nesta conversa.');
  expect(screen.queryByText('"Foreign version answer"')).not.toBeInTheDocument(); expect(screen.queryByText('1/20 turnos')).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Conversa guardada' }).querySelector('option[value="40000000-0000-4000-8000-000000000009"]')).toBeNull();
  expect(turnCalls()).toHaveLength(0);
});
it('locks only one in-flight turn, hides empty-state copy while pending and unlocks after success', async () => {
  stored = conversationFixture(0); const original = vi.mocked(fetch).getMockImplementation()!;
  let settle!: (response: Response) => void; const pending = new Promise<Response>(resolve => { settle = resolve; });
  vi.mocked(fetch).mockImplementation(async (url, options) => String(url).endsWith('/turns') ? pending : original(url, options));
  mount(); await screen.findByText('Ainda não há perguntas nesta conversa.');
  const field = screen.getByPlaceholderText(/O que Josefo relata/); fireEvent.change(field, { target: { value: 'One pending question' } });
  fireEvent.submit(field.closest('form')!); await screen.findByRole('button', { name: 'Cancelar pedido' }); fireEvent.submit(field.closest('form')!);
  expect(turnCalls()).toHaveLength(1); expect(field).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Nova conversa' })).toBeDisabled(); expect(screen.getByRole('combobox')).toBeDisabled();
  expect(screen.getByText('A processar o pedido. Podes cancelar.')).toBeInTheDocument();
  expect(screen.queryByText('Ainda não há perguntas nesta conversa.')).not.toBeInTheDocument();
  await act(async () => { stored = conversationFixture(1, 'One pending question'); settle(Response.json(stored)); });
  await screen.findByText('"One pending question"'); expect(field).toBeEnabled(); expect(field).toHaveValue('');
  expect(screen.queryByText('A processar o pedido. Podes cancelar.')).not.toBeInTheDocument();
  expect(screen.queryByText('Ainda não há perguntas nesta conversa.')).not.toBeInTheDocument();
});
it('loads saved conversation history before any write', async () => {
  mount(); expect(await screen.findByText('"Questão técnica anterior."')).toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
});
it('opens another saved conversation by id and clears only the unsent question', async () => {
  const secondId = '40000000-0000-4000-8000-000000000002';
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    const path = new URL(String(address)).pathname;
    if (path.endsWith(`/studies/${studyId}/conversations`)) return Response.json({ items: [
      { id: conversationId, studyId, studyVersion: 3, revision: 1, createdAt },
      { id: secondId, studyId, studyVersion: 3, revision: 1, createdAt },
    ], nextCursor: null });
    if (path === `/api/conversations/${secondId}`) return Response.json({ ...conversationFixture(1, 'Segunda conversa técnica.'), id: secondId });
    return original(address, options);
  });
  mount(); await screen.findByText('"Questão técnica anterior."');
  fireEvent.change(screen.getByPlaceholderText(/O que Josefo relata/), { target: { value: 'Rascunho local.' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Conversa guardada' }), { target: { value: secondId } });
  await screen.findByText('"Segunda conversa técnica."'); expect(screen.getByPlaceholderText(/O que Josefo relata/)).toHaveValue('');
  fireEvent.change(screen.getByRole('combobox', { name: 'Conversa guardada' }), { target: { value: conversationId } });
  await screen.findByText('"Questão técnica anterior."'); expect(turnCalls()).toHaveLength(0);
});
it('keeps a failed new conversation recoverable without retrying its creation', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => options?.method === 'POST'
    ? Response.json({ error: { code: 'AI_UNAVAILABLE', message: 'Conversa não criada. Tenta novamente.' } }, { status: 503 }) : original(address, options));
  mount(); await screen.findByText('"Questão técnica anterior."');
  fireEvent.click(screen.getByRole('button', { name: 'Nova conversa' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Conversa não criada.');
  expect(screen.getByRole('button', { name: 'Nova conversa' })).toBeEnabled();
  expect(vi.mocked(fetch).mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1);
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
