import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { flushSync } from 'react-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ContextPanel } from '../features/assistant/context-panel';
import { createQueryClient } from '../shared/api/query-client';
import { ToastProvider } from '../shared/ui/toast';
import { analysisFixture, conversationFixture, conversationId, secondStudyId, studyId } from './workflow-fixtures';

// Controlled transport ignores abort deliberately to verify late-response safety.
let authenticated = true;
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: authenticated, token: authenticated ? 'technical-token' : null }) }));
const clients: ReturnType<typeof createQueryClient>[] = [];
let complete!: (response: Response) => void;
let signal: AbortSignal | null | undefined;
let path: string;
beforeEach(() => {
  signal = undefined; path = ''; authenticated = true;
  const pending = new Promise<Response>(resolve => { complete = resolve; });
  vi.stubGlobal('fetch', vi.fn(async (address: string, options?: RequestInit) => {
    const target = new URL(address).pathname;
    if (target.endsWith('/ai-analyses') || target.endsWith('/turns')) { signal = options?.signal; path = target; return pending; }
    if (target.endsWith('/conversations') && options?.method === 'POST') return Response.json(conversationFixture(0));
    if (target === `/api/conversations/${conversationId}`) return Response.json(conversationFixture(0));
    return Response.json({ items: [], nextCursor: null });
  }));
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function mount() {
  const client = createQueryClient(); clients.push(client);
  const wrap = (id?: string, version = 3) => <QueryClientProvider client={client}><ToastProvider><ContextPanel activeStudyId={id} activeStudyVersion={version} activeReference="GEN 1:1" /></ToastProvider></QueryClientProvider>;
  const view = render(wrap(studyId)); return { ...view, redraw: () => view.rerender(wrap(studyId)), changeStudy: () => view.rerender(wrap(secondStudyId, 4)) };
}
async function start() {
  const input = screen.getByPlaceholderText(/O que Josefo relata/);
  fireEvent.change(input, { target: { value: 'Pergunta técnica de teste?' } });
  const form = input.closest('form')!;
  await waitFor(() => expect(within(form).getByRole('button')).toBeEnabled()); fireEvent.submit(form);
  await waitFor(() => expect(signal).toBeDefined()); return form;
}
it('never publishes a successful response that arrives after the user cancelled it', async () => {
  mount(); const form = await start();
  fireEvent.click(within(form).getByRole('button'));
  expect(signal?.aborted).toBe(true);
  await act(async () => { complete(Response.json(path.endsWith('/turns') ? conversationFixture(1, 'Pergunta técnica de teste?') : analysisFixture())); });
  expect(screen.queryByText('Análise de IA concluída.')).not.toBeInTheDocument();
  expect(screen.queryByText(/"Pergunta técnica de teste\?"/)).not.toBeInTheDocument();
});
it('returns to a usable send control immediately even if a transport ignores the abort', async () => {
  mount(); const form = await start(); fireEvent.click(within(form).getByRole('button'));
  expect(await screen.findByRole('button', { name: 'Enviar pergunta' })).toBeEnabled();
});
it('does not submit again when the browser applies pending React updates before the button default action', async () => {
  mount(); const form = await start();
  // Browsers can flush discrete event updates before the activation default. RTL's outer act
  // normally flushes afterwards, hiding a cancel button becoming a submit button in-place.
  const flushBeforeDefault = () => { flushSync(() => {}); };
  document.addEventListener('click', flushBeforeDefault, { once: true });
  fireEvent.click(within(form).getByRole('button', { name: 'Cancelar pedido' }));
  await waitFor(() => expect(within(form).getByRole('button', { name: 'Enviar pergunta' })).toBeEnabled());
  expect(vi.mocked(fetch).mock.calls.filter(([address]) => /\/(turns|ai-analyses)$/.test(String(address)))).toHaveLength(1);
});
it('aborts a pending operation when the study or version changes', async () => {
  const view = mount(); await start(); view.changeStudy(); expect(signal?.aborted).toBe(true);
});
it('aborts a pending operation when the panel unmounts', async () => {
  const view = mount(); await start(); view.unmount(); expect(signal?.aborted).toBe(true);
});
it.each(['send', 'new'] as const)('ignores a late conversation creation after cancelling %s', async action => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  let settle!: (response: Response) => void; let creationSignal: AbortSignal | null | undefined;
  const created = new Promise<Response>(resolve => { settle = resolve; });
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    if (String(address).endsWith('/conversations') && options?.method === 'POST') { creationSignal = options.signal; return created; }
    return original(address, options);
  });
  mount(); const client = clients.at(-1)!;
  const input = screen.getByPlaceholderText(/O que Josefo relata/);
  fireEvent.change(input, { target: { value: action === 'send' ? 'Rascunho técnico.' : '' } });
  await waitFor(() => expect(screen.queryByText('A carregar a conversa…')).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: action === 'send' ? 'Enviar pergunta' : 'Nova conversa' }));
  await waitFor(() => expect(creationSignal).toBeDefined());
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' })); expect(creationSignal?.aborted).toBe(true);
  await act(async () => { settle(Response.json(conversationFixture(0))); });
  expect(client.getQueryData(['assistant', 'conversation', conversationId])).toBeUndefined();
  expect(vi.mocked(fetch).mock.calls.filter(([address]) => String(address).endsWith('/turns'))).toHaveLength(0);
  expect(screen.queryByText('0/20 turnos')).not.toBeInTheDocument();
});
it('returns from contextual notes and references to the assistant without creating a conversation', async () => {
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Anotações' }));
  expect(screen.getByText(/não são evidência histórica validada/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Referências' }));
  await screen.findByText('Nenhuma referência cruzada catalogada para esta passagem.');
  expect(vi.mocked(fetch).mock.calls.some(([address]) => new URL(String(address)).searchParams.get('reference') === 'GEN 1:1')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Assistente IA' }));
  expect(screen.getByRole('textbox', { name: /Pergunta investigativa/ })).toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
});
it('rejects a queued form submission when authentication changes after drafting', async () => {
  const view = mount(); const input = screen.getByPlaceholderText(/O que Josefo relata/);
  fireEvent.change(input, { target: { value: 'Rascunho antes de expirar a sessão.' } });
  await waitFor(() => expect(screen.queryByText('A carregar a conversa…')).not.toBeInTheDocument());
  authenticated = false; view.redraw(); fireEvent.submit(input.closest('form')!);
  expect(await screen.findByText('Seleciona um estudo na tua conta antes de perguntar.')).toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
});
it('does not present a made-up cross-reference when no study is selected', () => {
  const client = createQueryClient(); clients.push(client);
  render(<QueryClientProvider client={client}><ToastProvider><ContextPanel /></ToastProvider></QueryClientProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Referências' }));
  expect(screen.queryByText('Jo 1:1-3')).not.toBeInTheDocument();
});
