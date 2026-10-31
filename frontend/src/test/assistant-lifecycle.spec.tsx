import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ContextPanel } from '../features/assistant/context-panel';
import { createQueryClient } from '../shared/api/query-client';
import { ToastProvider } from '../shared/ui/toast';
import { analysisFixture, conversationFixture, conversationId, secondStudyId, studyId } from './workflow-fixtures';

// Controlled transport ignores abort deliberately to verify late-response safety.
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: true, token: 'technical-token' }) }));
const clients: ReturnType<typeof createQueryClient>[] = [];
let complete!: (response: Response) => void;
let signal: AbortSignal | null | undefined;
let path: string;
beforeEach(() => {
  signal = undefined; path = '';
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
  const wrap = (id?: string, version = 3) => <QueryClientProvider client={client}><ToastProvider><ContextPanel activeStudyId={id} activeStudyVersion={version} /></ToastProvider></QueryClientProvider>;
  const view = render(wrap(studyId)); return { ...view, changeStudy: () => view.rerender(wrap(secondStudyId, 4)) };
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
it('aborts a pending operation when the study or version changes', async () => {
  const view = mount(); await start(); view.changeStudy(); expect(signal?.aborted).toBe(true);
});
it('aborts a pending operation when the panel unmounts', async () => {
  const view = mount(); await start(); view.unmount(); expect(signal?.aborted).toBe(true);
});
it('does not present a made-up cross-reference when no study is selected', () => {
  const client = createQueryClient(); clients.push(client);
  render(<QueryClientProvider client={client}><ToastProvider><ContextPanel /></ToastProvider></QueryClientProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Referências' }));
  expect(screen.queryByText('Jo 1:1-3')).not.toBeInTheDocument();
});
