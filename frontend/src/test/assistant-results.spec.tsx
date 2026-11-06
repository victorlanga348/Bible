import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ContextPanel } from '../features/assistant/context-panel';
import { ToastProvider } from '../shared/ui/toast';
import { studyId } from './workflow-fixtures';
import { analysisFixture, evidence, quote } from './evidence-fixtures';

// Technical HTTP/session doubles; genuine quoted text, no model-inference claim.
let authenticated = true, response = analysisFixture(), failing = false;
const clients: QueryClient[] = [];
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: authenticated, token: authenticated ? 'technical-token' : null }) }));
beforeEach(() => {
  authenticated = true; response = analysisFixture(); failing = false;
  vi.stubGlobal('fetch', vi.fn(async (url: string) => String(url).endsWith('/ai-analyses')
    ? failing ? Response.json({ error: { code: 'AI_UNAVAILABLE', message: 'Serviço temporariamente indisponível.' } }, { status: 503 }) : Response.json(response)
    : Response.json({ items: [], nextCursor: null })));
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function mount(id: string | undefined = studyId) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); clients.push(client);
  render(<QueryClientProvider client={client}><ToastProvider><ContextPanel activeStudyId={id} activeStudyVersion={3} /></ToastProvider></QueryClientProvider>);
}
function send(question = 'Technical question') {
  fireEvent.change(screen.getByLabelText('Pergunta investigativa'), { target: { value: question } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar pergunta' }));
}
it('shows the authentic quotation, rights, limits and provenance for a supported analysis', async () => {
  mount(); send(); await screen.findByText('Análise de IA concluída.');
  expect(screen.getByText(`"${quote}"`)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: evidence.rightsStatement })).toHaveAttribute('href', evidence.rightsUrl);
  expect(screen.getByText('Apenas corpus admitido de teste.')).toBeInTheDocument();
  expect(screen.getByText('5 tokens')).toBeInTheDocument();
});
it('distinguishes a restricted source from insufficient evidence without showing a quotation', async () => {
  response = analysisFixture({ status: 'restricted', evidence: [] }); mount(); send();
  await screen.findByText('Análise de IA concluída.');
  expect(screen.getByText('Fonte restrita')).toBeInTheDocument();
  expect(screen.queryByText(`"${quote}"`)).not.toBeInTheDocument();
});
it('retains the question on technical failure and allows a successful retry', async () => {
  failing = true; mount(); send(); await screen.findByText('Erro no assistente de IA');
  expect(screen.getByLabelText('Pergunta investigativa')).toHaveValue('Technical question');
  failing = false; send(); await screen.findByText('Análise de IA concluída.');
  expect(screen.getByLabelText('Pergunta investigativa')).toHaveValue('');
});
it('rejects over-limit UTF8 input locally and guides unauthenticated users', async () => {
  mount(); send('á'.repeat(251)); await screen.findByText('Pergunta muito longa');
  expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).endsWith('/ai-analyses'))).toBe(false);
  cleanup(); authenticated = false; mount(); send(); await screen.findByText('Autenticação necessária');
  fireEvent.click(screen.getByRole('tab', { name: 'Anotações' }));
  expect(screen.getByText(/Entre na conta e abra um estudo/)).toBeInTheDocument();
});
it('requires a study and supports tab keyboard navigation', async () => {
  mount(''); send(); await screen.findByText('Nenhum estudo ativo');
  const assistant = screen.getByRole('tab', { name: 'Assistente IA' }); assistant.focus();
  fireEvent.keyDown(assistant, { key: 'ArrowRight' }); expect(screen.getByRole('tab', { name: 'Anotações' })).toHaveAttribute('aria-selected', 'true');
  fireEvent.keyDown(document.activeElement!, { key: 'End' }); expect(screen.getByRole('tab', { name: 'Referências' })).toHaveAttribute('aria-selected', 'true');
  fireEvent.keyDown(document.activeElement!, { key: 'Home' }); expect(assistant).toHaveFocus();
  fireEvent.keyDown(assistant, { key: 'ArrowLeft' }); expect(screen.getByRole('tab', { name: 'Referências' })).toHaveFocus();
});
