import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ContextPanel } from '../features/assistant/context-panel';
import { ToastProvider } from '../shared/ui/toast';
import { request } from '../shared/api/http-client';
import type { AiAnalysisDto } from '../shared/api/contracts';

// Technical transport/session doubles exercise request ownership, not native inference.
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ token: 'technical-token', isAuthenticated: true }) }));
vi.mock('../shared/api/http-client', () => ({ request: vi.fn() }));
let complete: (result: AiAnalysisDto) => void;
let signal: AbortSignal | undefined;
const result = { id: 'technical-analysis', status: 'insufficient-evidence', question: 'Technical question', evidence: [], limitations: [], provenance: { profileId: 'local-extractive-v1', totalTokens: 1 } } as unknown as AiAnalysisDto;
const clients: QueryClient[] = [];
beforeEach(() => {
  vi.mocked(request).mockReset().mockImplementation((url, options) => {
    if (!url.endsWith('/ai-analyses')) return Promise.resolve({ items: [], nextCursor: null });
    return new Promise<AiAnalysisDto>(resolve => { complete = resolve; signal = options?.signal ?? undefined; });
  });
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; });
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }); clients.push(client);
  const view = (id: string) => <QueryClientProvider client={client}><ToastProvider><ContextPanel activeStudyId={id} activeStudyVersion={3} /></ToastProvider></QueryClientProvider>;
  const rendered = render(view('study-a'));
  return { ...rendered, changeStudy: () => rendered.rerender(view('study-b')) };
}
async function send() {
  fireEvent.change(screen.getByPlaceholderText(/O que Josefo relata/), { target: { value: 'Technical question' } });
  fireEvent.submit(screen.getByPlaceholderText(/O que Josefo relata/).closest('form')!);
  await waitFor(() => expect(signal).toBeDefined());
}
it('aborts on unmount so closing the panel does not leave inference running', async () => {
  const view = mount(); await send(); view.unmount(); expect(signal?.aborted).toBe(true);
});
it('aborts on study change and discards a late result even if transport ignores abort', async () => {
  const view = mount(); await send(); view.changeStudy(); expect(signal?.aborted).toBe(true);
  await act(async () => { complete(result); });
  expect(screen.queryByText('Análise de IA concluída.')).not.toBeInTheDocument();
  expect(screen.getByText('Nenhuma pergunta realizada para este estudo.')).toBeInTheDocument();
});
it('gives submit and cancellation controls accessible names and discards cancelled success', async () => {
  mount(); expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeDisabled(); await send();
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar inferência' }));
  expect(signal?.aborted).toBe(true);
  expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeInTheDocument();
  await act(async () => { complete(result); });
  expect(screen.queryByText('Análise de IA concluída.')).not.toBeInTheDocument();
});
