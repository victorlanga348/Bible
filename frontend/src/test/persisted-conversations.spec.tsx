import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createQueryClient } from '../shared/api/query-client';
import { ContextPanel } from '../features/assistant/context-panel';
import { ToastProvider } from '../shared/ui/toast';
import { createdAt, studyId } from './workflow-fixtures';
import type { ConversationDto } from '../shared/api/contracts';
import { analysisFixture, evidence, quote } from './evidence-fixtures';

// Session/HTTP doubles exercise client behavior only; no claim of real model/PG.
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: true, token: 'technical-token' }) }));
const conversationId = '40000000-0000-4000-8000-000000000001';
const otherId = '40000000-0000-4000-8000-000000000002';
const base = { id: conversationId, studyId, studyVersion: 3, revision: 0, createdAt, turns: [] };
const unavailableTurn = { number: 1, question: 'Pergunta técnica guardada', analysisId: 'technical-analysis', createdAt, contextTurnNumbers: [], contextVersion: 'questions-v3' as const, omittedTurns: 0, revisesTurn: null, analysis: null, responseStatus: 'unavailable' as const };
let detail: ConversationDto = { ...base, turns: [unavailableTurn], revision: 1 };
let appendStatus = 200;
let listStatus = 200, readStatus = 200, createStatus = 201, deleteStatus = 204;
let appendDeferred: ((value: Response) => void) | undefined;
let deferAppend = false;
const clients: ReturnType<typeof createQueryClient>[] = [];
const calls = () => vi.mocked(fetch).mock.calls.map(([url, options]) => ({ path: new URL(String(url)).pathname, params: new URL(String(url)).searchParams, options }));
beforeEach(() => {
  detail = { ...base, turns: [unavailableTurn], revision: 1 }; appendStatus = 200; deferAppend = false; appendDeferred = undefined;
  listStatus = 200; readStatus = 200; createStatus = 201; deleteStatus = 204;
  vi.stubGlobal('fetch', vi.fn(async (url: string, options?: RequestInit) => {
    const { pathname: path, searchParams } = new URL(url);
    if (path === `/api/workspace/studies/${studyId}/conversations`) return listStatus === 200 ? Response.json({ items: [{ ...base, id: searchParams.get('cursor') ? otherId : conversationId, revision: detail.revision }], nextCursor: searchParams.get('cursor') ? null : 'page-2' }) : Response.json({ error: { code: 'UNAVAILABLE', message: 'Lista indisponível.' } }, { status: listStatus });
    if (path === `/api/studies/${studyId}/conversations`) return createStatus === 201 ? Response.json(base) : Response.json({ error: { code: 'UNAVAILABLE', message: 'Criação indisponível.' } }, { status: createStatus });
    if (path.endsWith('/turns')) {
      if (deferAppend) return new Promise<Response>(resolve => { appendDeferred = resolve; });
      if (appendStatus === 503) return Response.json({ error: { code: 'UNAVAILABLE', message: 'Modelo indisponível.' } }, { status: 503 });
      return appendStatus === 409 ? Response.json({ error: { code: 'CONVERSATION_CONFLICT', message: 'Revisão alterada.' } }, { status: 409 }) : Response.json({ ...detail, revision: 2 });
    }
    if (path === `/api/conversations/${conversationId}` && options?.method === 'DELETE') return deleteStatus === 204 ? new Response(null, { status: 204 }) : Response.json({ error: { code: 'UNAVAILABLE', message: 'Eliminação indisponível.' } }, { status: deleteStatus });
    if (path === `/api/conversations/${conversationId}`) return readStatus === 200 ? Response.json(detail) : Response.json({ error: { code: 'UNAVAILABLE', message: 'Conversa indisponível.' } }, { status: readStatus });
    return Response.json({ items: [], nextCursor: null });
  }));
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function mount() {
  const client = createQueryClient(); clients.push(client);
  client.setDefaultOptions({ ...client.getDefaultOptions(), queries: { ...client.getDefaultOptions().queries, retry: false } });
  return render(<QueryClientProvider client={client}><ToastProvider><ContextPanel activeStudyId={studyId} activeStudyVersion={3} /></ToastProvider></QueryClientProvider>);
}
async function openConversation() {
  mount(); const open = await screen.findByRole('button', { name: /Abrir conversa 1/i });
  expect(open).toHaveAttribute('aria-pressed', 'false'); fireEvent.click(open);
  await screen.findByText('Pergunta técnica guardada');
  expect(open).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByText('A carregar conversas…')).not.toBeInTheDocument();
  expect(screen.queryByText('A carregar a conversa…')).not.toBeInTheDocument();
  expect(screen.queryByText('Ainda não há conversas guardadas.')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Nova conversa' })).toBeEnabled();
  if (detail.revision < 20) expect(screen.getByLabelText('Pergunta na conversa')).toBeEnabled();
}
async function send() {
  fireEvent.change(screen.getByLabelText('Pergunta na conversa'), { target: { value: 'Próxima pergunta técnica' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar na conversa' }));
  await waitFor(() => expect(calls().some(call => call.path.endsWith('/turns'))).toBe(true));
}
it('lists and reopens persisted turns, showing unavailable responses explicitly', async () => {
  await openConversation();
  expect(screen.getByText(/Resposta indisponível/i)).toBeInTheDocument();
  expect(calls().some(call => call.path === `/api/conversations/${conversationId}`)).toBe(true);
});
it('creates on explicit action with the selected study version and appends using actual revision and AbortSignal', async () => {
  mount(); fireEvent.click(await screen.findByRole('button', { name: 'Nova conversa' }));
  await screen.findByLabelText('Pergunta na conversa'); await send();
  const create = calls().find(call => call.path === `/api/studies/${studyId}/conversations`);
  expect(JSON.parse(String(create?.options?.body))).toEqual({ studyVersion: 3 });
  const append = calls().find(call => call.path.endsWith('/turns'));
  expect(JSON.parse(String(append?.options?.body))).toEqual({ expectedRevision: 0, question: 'Próxima pergunta técnica' });
  expect(append?.options?.signal).toBeInstanceOf(AbortSignal);
  await screen.findByText('Turno guardado.');
  expect(screen.getByText('Conversa criada.')).toBeInTheDocument();
});
it('pages conversation summaries using the server cursor and allows returning', async () => {
  mount(); await screen.findByRole('button', { name: /Abrir conversa 1/i });
  fireEvent.click(screen.getByRole('button', { name: 'Página seguinte' }));
  await waitFor(() => expect(calls().some(call => call.params.get('cursor') === 'page-2')).toBe(true));
  fireEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled());
});
it('preserves the question on 409 and requires refreshing the conversation before retrying', async () => {
  appendStatus = 409; await openConversation(); await send();
  const reload = await screen.findByRole('button', { name: 'Carregar conversa atual' });
  expect(screen.getByLabelText('Pergunta na conversa')).toHaveValue('Próxima pergunta técnica');
  expect(screen.getByRole('button', { name: 'Enviar na conversa' })).toBeDisabled();
  detail = { ...detail, revision: 2 }; fireEvent.click(reload);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Enviar na conversa' })).toBeEnabled());
});
it('cancels transport and ignores late success without erasing the draft', async () => {
  deferAppend = true; await openConversation(); await send();
  const signal = calls().find(call => call.path.endsWith('/turns'))?.options?.signal;
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar resposta da conversa' }));
  expect(signal?.aborted).toBe(true);
  await act(async () => { appendDeferred?.(Response.json({ ...detail, revision: 2 })); });
  expect(screen.getByLabelText('Pergunta na conversa')).toHaveValue('Próxima pergunta técnica');
  expect(screen.queryByText('Turno guardado.')).not.toBeInTheDocument();
});
it('aborts a pending turn when the study panel unmounts', async () => {
  deferAppend = true; const view = mount(); fireEvent.click(await screen.findByRole('button', { name: /Abrir conversa 1/i }));
  await screen.findByText('Pergunta técnica guardada'); await send();
  const signal = calls().find(call => call.path.endsWith('/turns'))?.options?.signal;
  view.unmount(); expect(signal?.aborted).toBe(true);
  await act(async () => { appendDeferred?.(Response.json(detail)); });
});
it('does not append beyond twenty turns and deletes only after confirmation', async () => {
  detail = { ...detail, revision: 20 }; await openConversation();
  expect(screen.getByText(/Limite de 20 turnos/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar conversa' }));
  expect(calls().filter(call => call.options?.method === 'DELETE')).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar eliminação da conversa' }));
  await waitFor(() => expect(calls().some(call => call.options?.method === 'DELETE' && call.path === `/api/conversations/${conversationId}`)).toBe(true));
  await screen.findByText('Conversa eliminada.');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByText(/Limite de 20 turnos/)).not.toBeInTheDocument();
});

it.each(['supported', 'insufficient-evidence', 'restricted'] as const)('reopens persisted %s responses with their actual limitations', async status => {
  detail = { ...detail, turns: [{ ...unavailableTurn, responseStatus: 'available', analysis: analysisFixture({ status, evidence: status === 'supported' ? analysisFixture().evidence : [] }) }] };
  await openConversation(); expect(screen.getByText('Apenas corpus admitido de teste.')).toBeInTheDocument();
  if (status === 'supported') {
    expect(screen.getByText('Evidência documentada')).toBeInTheDocument();
    expect(screen.getByText(quote)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: evidence.rightsStatement })).toHaveAttribute('href', evidence.rightsUrl);
  } else expect(screen.getByText(status === 'restricted' ? 'Fonte restrita' : 'Evidência insuficiente')).toBeInTheDocument();
});
it('cancels and dismisses conversation deletion without writing, including Escape', async () => {
  await openConversation();
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar conversa' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar conversa' }));
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(calls().filter(call => call.options?.method === 'DELETE')).toHaveLength(0);
});
it('blocks duplicate pending turns and submits exactly the trimmed UTF8 boundary', async () => {
  deferAppend = true; await openConversation();
  const input = screen.getByLabelText('Pergunta na conversa'), form = input.closest('form')!;
  fireEvent.change(input, { target: { value: '   ' } }); fireEvent.submit(form);
  fireEvent.change(input, { target: { value: 'á'.repeat(251) } }); fireEvent.submit(form);
  expect(calls().filter(call => call.path.endsWith('/turns'))).toHaveLength(0);
  fireEvent.change(input, { target: { value: ` ${'á'.repeat(250)} ` } });
  const event = new Event('submit', { cancelable: true, bubbles: true }); fireEvent(form, event); expect(event.defaultPrevented).toBe(true);
  await waitFor(() => expect(appendDeferred).toBeDefined());
  expect(input).toBeDisabled(); expect(screen.getByRole('button', { name: 'Nova conversa' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Eliminar conversa' })).toBeDisabled();
  fireEvent.submit(form); expect(calls().filter(call => call.path.endsWith('/turns'))).toHaveLength(1);
  expect(JSON.parse(String(calls().find(call => call.path.endsWith('/turns'))?.options?.body))).toEqual({ expectedRevision: 1, question: 'á'.repeat(250) });
  await act(async () => appendDeferred?.(Response.json({ ...detail, revision: 2 })));
  await screen.findByText('Turno guardado.'); expect(input).toHaveValue(''); expect(input).toBeEnabled();
});
it('shows an empty conversation list explicitly without displaying an idle loading message', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => String(url).includes('/workspace/') ? Response.json({ items: [], nextCursor: null }) : original(url, options));
  mount(); await screen.findByText('Ainda não há conversas guardadas.');
  expect(screen.queryByText('A carregar conversas…')).not.toBeInTheDocument();
  expect(screen.queryByText('A carregar a conversa…')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Pergunta na conversa')).not.toBeInTheDocument();
});
it('keeps deletion confirmation open while the server is still deleting', async () => {
  await openConversation(); const original = vi.mocked(fetch).getMockImplementation()!;
  let complete!: (response: Response) => void;
  vi.mocked(fetch).mockImplementation((url, options) => options?.method === 'DELETE' ? new Promise<Response>(resolve => { complete = resolve; }) : original(url, options));
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar conversa' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar eliminação da conversa' }));
  await waitFor(() => expect(complete).toBeDefined());
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  await act(async () => complete(new Response(null, { status: 204 })));
  await screen.findByText('Conversa eliminada.'); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('recovers from list and detail failures through explicit reload controls', async () => {
  listStatus = 503; mount(); const reload = await screen.findByRole('button', { name: 'Recarregar conversas' });
  listStatus = 200; fireEvent.click(reload); readStatus = 503;
  fireEvent.click(await screen.findByRole('button', { name: /Abrir conversa 1/i }));
  const read = await screen.findByRole('button', { name: 'Carregar conversa atual' }); readStatus = 200; fireEvent.click(read);
  await screen.findByText('Pergunta técnica guardada');
});
it('keeps creation and deletion failures recoverable without claiming success', async () => {
  createStatus = 503; mount(); fireEvent.click(await screen.findByRole('button', { name: 'Nova conversa' }));
  await screen.findByText('Criação indisponível.'); createStatus = 201;
  fireEvent.click(screen.getByRole('button', { name: 'Nova conversa' })); await screen.findByLabelText('Pergunta na conversa');
  deleteStatus = 503; fireEvent.click(screen.getByRole('button', { name: 'Eliminar conversa' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar eliminação da conversa' }));
  await screen.findByText('Não foi possível eliminar a conversa. Tente novamente.');
  expect(screen.getByRole('dialog')).toBeInTheDocument(); deleteStatus = 204;
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar eliminação da conversa' })); await screen.findByText('Conversa eliminada.');
});
it('enforces the UTF8 boundary and preserves a question on a recoverable model failure', async () => {
  await openConversation(); const question = screen.getByLabelText('Pergunta na conversa');
  fireEvent.change(question, { target: { value: 'á'.repeat(250) } }); expect(screen.getByRole('button', { name: 'Enviar na conversa' })).toBeEnabled();
  fireEvent.change(question, { target: { value: 'á'.repeat(251) } }); expect(screen.getByRole('button', { name: 'Enviar na conversa' })).toBeDisabled();
  appendStatus = 503; await send(); await screen.findByText('Modelo indisponível.');
  expect(question).toHaveValue('Próxima pergunta técnica');
  appendStatus = 200; fireEvent.click(screen.getByRole('button', { name: 'Enviar na conversa' })); await screen.findByText('Turno guardado.');
});
