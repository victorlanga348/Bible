import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  expect(screen.getByRole('status', { name: 'Estado do assistente' })).toHaveTextContent('Última análise: Evidência documentada.');
  expect(screen.queryByText(/Executando busca vetorial e inferência CPU local\.\.\./)).not.toBeInTheDocument();
  expect(screen.queryByText(/Nenhuma pergunta realizada/)).not.toBeInTheDocument();
  expect(screen.getByText(new Date(response.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))).toBeInTheDocument();
});
it('distinguishes a restricted source from insufficient evidence without showing a quotation', async () => {
  response = analysisFixture({ status: 'restricted', evidence: [] }); mount(); send();
  await screen.findByText('Análise de IA concluída.');
  expect(screen.getByText('Fonte restrita')).toBeInTheDocument();
  expect(screen.queryByText(`"${quote}"`)).not.toBeInTheDocument();
  expect(screen.getByText('O acesso à fonte está restrito; o conteúdo não é apresentado.')).toBeInTheDocument();
  expect(screen.getByRole('status', { name: 'Estado do assistente' })).toHaveTextContent('Última análise: Fonte restrita.');
});
it('retains the question on technical failure and allows a successful retry', async () => {
  failing = true; mount(); send(); await screen.findByText('Erro no assistente de IA');
  expect(screen.getByLabelText('Pergunta investigativa')).toHaveValue('Technical question');
  failing = false; send(); await screen.findByText('Análise de IA concluída.');
  expect(screen.getByLabelText('Pergunta investigativa')).toHaveValue('');
});
it('rejects over-limit UTF8 input locally and guides unauthenticated users', async () => {
  mount(); send('á'.repeat(251)); await screen.findByText('Pergunta muito longa');
  expect(screen.getByText('O limite máximo é de 500 bytes UTF-8. A pergunta atual possui 502 bytes.')).toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).endsWith('/ai-analyses'))).toBe(false);
  cleanup(); authenticated = false; mount(); send(); await screen.findByText('Autenticação necessária');
  expect(screen.getByText('Configure seu token de operador na barra lateral.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Anotações' }));
  expect(screen.getByText(/Entre na conta e abra um estudo/)).toBeInTheDocument();
});
it('requires a study and supports tab keyboard navigation', async () => {
  mount(''); send(); await screen.findByText('Nenhum estudo ativo');
  expect(screen.getByText('Selecione ou gere um estudo primeiro para vincular a pergunta da IA.')).toBeInTheDocument();
  const assistant = screen.getByRole('tab', { name: 'Assistente IA' }); assistant.focus();
  fireEvent.keyDown(assistant, { key: 'ArrowRight' }); expect(screen.getByRole('tab', { name: 'Anotações' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tab', { name: 'Anotações' })).toHaveFocus();
  fireEvent.keyDown(document.activeElement!, { key: 'End' }); expect(screen.getByRole('tab', { name: 'Referências' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tab', { name: 'Referências' })).toHaveFocus();
  fireEvent.keyDown(document.activeElement!, { key: 'Home' }); expect(assistant).toHaveFocus();
  fireEvent.keyDown(assistant, { key: 'ArrowLeft' }); expect(screen.getByRole('tab', { name: 'Referências' })).toHaveFocus();
  const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true, bubbles: true });
  fireEvent(document.activeElement!, tabEvent); expect(tabEvent.defaultPrevented).toBe(false);
  expect(screen.getByRole('tab', { name: 'Referências' })).toHaveFocus();
  fireEvent.click(assistant);
  expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'panel-assistant');
  for (const tab of screen.getAllByRole('tab')) expect(tab).toHaveAttribute('tabindex', tab === assistant ? '0' : '-1');
  fireEvent.click(screen.getByRole('tab', { name: 'Anotações' }));
  for (const tab of screen.getAllByRole('tab')) expect(tab).toHaveAttribute('tabindex', tab.textContent === 'Anotações' ? '0' : '-1');
  fireEvent.click(screen.getByRole('tab', { name: 'Referências' }));
  for (const tab of screen.getAllByRole('tab')) expect(tab).toHaveAttribute('tabindex', tab.textContent === 'Referências' ? '0' : '-1');
});
it('reports insufficient evidence honestly even if an unavailable quote accompanies the response', async () => {
  response = analysisFixture({ status: 'insufficient-evidence' }); mount(); send();
  await screen.findByText('Análise de IA concluída.');
  expect(screen.getByRole('status', { name: 'Estado do assistente' })).toHaveTextContent('Última análise: Evidência insuficiente.');
  expect(screen.getByText('Evidência Insuficiente')).toBeInTheDocument();
  expect(screen.getByText(/Não foi encontrada evidência documental/)).toBeInTheDocument();
  expect(screen.queryByText(`"${quote}"`)).not.toBeInTheDocument();
  expect(screen.queryByText('Fonte restrita')).not.toBeInTheDocument();
});
it('accepts exactly 500 trimmed UTF8 bytes and exposes pending state without duplicate writes', async () => {
  let finish!: (response: Response) => void;
  vi.mocked(fetch).mockImplementation(async (url: RequestInfo | URL) => String(url).endsWith('/ai-analyses') ? new Promise<Response>(resolve => { finish = resolve; }) : Response.json({ items: [], nextCursor: null }));
  mount(); const input = screen.getByLabelText('Pergunta investigativa');
  expect(screen.getByRole('status', { name: 'Estado do assistente' })).toHaveTextContent('');
  expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeDisabled();
  send('   '); expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeDisabled();
  send(` ${'á'.repeat(250)} `);
  await waitFor(() => expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).endsWith('/ai-analyses'))).toBe(true));
  expect(input).toBeDisabled();
  expect(screen.getByRole('status', { name: 'Estado do assistente' })).toHaveTextContent('Executando busca vetorial e inferência CPU local.');
  expect(screen.getByText('Executando busca vetorial e inferência CPU local...')).toBeInTheDocument();
  fireEvent.submit(input.closest('form')!);
  expect(vi.mocked(fetch).mock.calls.filter(([url]) => String(url).endsWith('/ai-analyses'))).toHaveLength(1);
  const request = vi.mocked(fetch).mock.calls.find(([url]) => String(url).endsWith('/ai-analyses'));
  expect(JSON.parse(String(request?.[1]?.body))).toEqual({ studyVersion: 3, question: 'á'.repeat(250) });
  await act(async () => finish(Response.json(response)));
  await screen.findByText('Análise de IA concluída.');
  expect(input).toHaveValue(''); expect(input).toBeEnabled();
  expect(screen.queryByRole('button', { name: 'Cancelar inferência' })).not.toBeInTheDocument();
});
