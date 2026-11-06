import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { request } from '../shared/api/http-client';
import { StudyNotes } from '../features/workspace/study-notes';
import { StudyView } from '../features/studies/study-view';
import { ContextPanel } from '../features/assistant/context-panel';
import { HistoryView } from '../features/workspace/history-view';
import { ReferenceSearch } from '../features/canon/reference-search';
import { CrossRefPanel } from '../features/cross-ref/cross-ref-panel';
import { ReaderView } from '../features/canon/reader-view';
import { ToastProvider } from '../shared/ui/toast';
import { noteFixture, studyFixture, studyId } from './workflow-fixtures';

// Deliberate non-Error dependency failures test defensive UI boundaries. These
// transport/session doubles do not claim native HTTP, model or DB integration.
vi.mock('../shared/api/http-client', async importOriginal => ({ ...await importOriginal<object>(), request: vi.fn() }));
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: true, token: 'technical-token' }) }));
const clients: QueryClient[] = [];
let rejectReads = false, rejectWrites = true, notes = [noteFixture()];
beforeEach(() => {
  rejectReads = false; rejectWrites = true; notes = [noteFixture()];
  vi.mocked(request).mockImplementation(async (path, options) => {
    if (options?.method && options.method !== 'GET' && rejectWrites) throw 'technical dependency failure';
    if (rejectReads) throw 'technical dependency failure';
    if (path === '/workspace/studies') return { items: [studyFixture()], nextCursor: null };
    if (path.endsWith('/notes')) return options?.method === 'POST' ? noteFixture() : { items: notes, nextCursor: null };
    if (path === '/workspace/favorites' || path.endsWith('/conversations')) return { items: [], nextCursor: null };
    return studyFixture();
  });
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.clearAllMocks(); });
function mount(child: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }); clients.push(client);
  return render(<QueryClientProvider client={client}><ToastProvider>{child}</ToastProvider></QueryClientProvider>);
}
async function workspaceNotes() {
  mount(<HistoryView />); fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });
  await screen.findByText(noteFixture().content);
}
it('shows a useful note error, keeps the draft and recovers after a non-Error failure', async () => {
  mount(<StudyNotes studyId={studyId} studyVersion={3} />);
  await screen.findByText(noteFixture().content);
  expect(screen.queryByText('Ainda não há anotações nesta versão.')).not.toBeInTheDocument();
  const input = screen.getByLabelText('Nova anotação'); expect(input).toHaveValue('');
  fireEvent.change(input, { target: { value: ' Nota pessoal técnica. ' } });
  const form = input.closest('form')!;
  const event = new Event('submit', { bubbles: true, cancelable: true }); fireEvent(form, event); expect(event.defaultPrevented).toBe(true);
  await screen.findByText('Não foi possível guardar a anotação.'); await screen.findByText('Tente novamente.');
  expect(input).toHaveValue(' Nota pessoal técnica. ');
  rejectWrites = false; fireEvent.submit(form); await screen.findByText('Anotação guardada.');
  expect(input).toHaveValue('');
  expect(request).toHaveBeenCalledWith(`/workspace/studies/${studyId}/notes`, expect.objectContaining({ body: { studyVersion: 3, content: 'Nota pessoal técnica.' } }));
});
it('distinguishes failed note reads from empty notes and allows an explicit retry', async () => {
  rejectReads = true; mount(<StudyNotes studyId={studyId} studyVersion={3} />);
  const retry = await screen.findByRole('button', { name: 'Tentar novamente' });
  expect(screen.queryByText('Ainda não há anotações nesta versão.')).not.toBeInTheDocument();
  rejectReads = false; notes = []; fireEvent.click(retry);
  await screen.findByText('Ainda não há anotações nesta versão.');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByText('A carregar anotações…')).not.toBeInTheDocument();
});
it('validates whitespace, UTF8 bounds and duplicate pending note submissions', async () => {
  rejectWrites = false; mount(<StudyNotes studyId={studyId} studyVersion={3} />);
  await screen.findByText(noteFixture().content);
  const input = screen.getByLabelText('Nova anotação'), form = input.closest('form')!;
  const saves = () => vi.mocked(request).mock.calls.filter(([, options]) => options?.method === 'POST');
  fireEvent.change(input, { target: { value: '  ' } }); fireEvent.submit(form); expect(saves()).toHaveLength(0);
  fireEvent.change(input, { target: { value: 'á'.repeat(4001) } });
  expect(screen.getByRole('button', { name: 'Salvar anotação' })).toBeDisabled(); fireEvent.submit(form); expect(saves()).toHaveLength(0);
  let complete!: (value: unknown) => void;
  const original = vi.mocked(request).getMockImplementation()!;
  vi.mocked(request).mockImplementation((path, options) => options?.method === 'POST' ? new Promise(resolve => { complete = resolve; }) : original(path, options));
  fireEvent.change(input, { target: { value: ` ${'á'.repeat(4000)} ` } });
  expect(screen.getByRole('button', { name: 'Salvar anotação' })).toBeEnabled();
  fireEvent.submit(form); await waitFor(() => expect(saves()).toHaveLength(1));
  expect(screen.getByRole('button', { name: 'Salvar anotação' })).toBeDisabled();
  fireEvent.submit(form); expect(saves()).toHaveLength(1);
  await act(async () => complete(noteFixture()));
  await screen.findByText('Anotação guardada.'); expect(input).toHaveValue('');
});
it('uses study creation and revision fallbacks without announcing a CAS conflict for unrelated errors', async () => {
  const view = mount(<StudyView />);
  fireEvent.change(screen.getByLabelText('Referência do estudo'), { target: { value: '  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Gerar Estudo' })); expect(request).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Referência do estudo'), { target: { value: ' GEN 1:1 ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Gerar Estudo' })); await screen.findByText('Falha ao processar o estudo.');
  view.unmount(); mount(<StudyView activeStudyId={studyId} activeStudyVersion={3} />); await screen.findByText('Versão 3');
  fireEvent.click(screen.getByRole('button', { name: 'Criar nova versão' })); await screen.findByText('Falha ao criar nova versão.');
  expect(screen.queryByRole('button', { name: 'Carregar versão atual' })).not.toBeInTheDocument();
});
it('keeps the question when standalone and conversation creation fail with non-Error values', async () => {
  mount(<ContextPanel activeStudyId={studyId} activeStudyVersion={3} />);
  fireEvent.change(screen.getByLabelText('Pergunta investigativa'), { target: { value: 'Technical question' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar pergunta' })); await screen.findByText('Falha na inferência da IA.');
  expect(screen.getByLabelText('Pergunta investigativa')).toHaveValue('Technical question');
  fireEvent.click(screen.getByRole('button', { name: 'Nova conversa' }));
  await screen.findByText('Não foi possível concluir a operação. Tente novamente.');
});
it('reports unknown reference-resolution and cross-reference errors without fabricating results', async () => {
  const view = mount(<ReferenceSearch onPassageResolved={vi.fn()} />);
  const search = screen.getByPlaceholderText(/Ir para passagem/);
  fireEvent.change(search, { target: { value: 'GEN 1:1' } }); fireEvent.submit(search.closest('form')!);
  await screen.findByText('Referência bíblica não reconhecida. Exemplo: GEN 1:1-3, Jo 3:16 ou Sl 23');
  view.unmount(); rejectReads = true; mount(<CrossRefPanel reference="GEN 1:1" />);
  await screen.findByText('Erro ao buscar referências cruzadas.');
  expect(screen.queryByText('Nenhuma referência cruzada catalogada para esta passagem.')).not.toBeInTheDocument();
});
it('preserves workspace note drafts on unknown create and revision errors', async () => {
  await workspaceNotes();
  const draft = screen.getByPlaceholderText(/Escreva uma nova anotação/);
  fireEvent.change(draft, { target: { value: 'Nota técnica.' } }); fireEvent.click(screen.getByRole('button', { name: 'Adicionar Nota' }));
  await screen.findByText('Falha na persistência da nota.'); expect(draft).toHaveValue('Nota técnica.');
  fireEvent.click(screen.getByTitle('Editar Nota (CAS)')); fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));
  await screen.findByText('Não foi possível salvar esta revisão da nota.');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Carregar revisão atual' })).not.toBeInTheDocument();
});
it('keeps deletion confirmation after unknown note failures', async () => {
  await workspaceNotes(); fireEvent.click(screen.getByTitle('Eliminar Nota'));
  fireEvent.click(screen.getByRole('button', { name: 'Excluir Definitivamente' }));
  await screen.findByText('Falha ao remover a nota.'); expect(screen.getByRole('dialog')).toBeInTheDocument();
});
it('keeps study deletion and favorite failures actionable with safe fallback messages', async () => {
  mount(<HistoryView />); await screen.findByText('GEN 1:1');
  fireEvent.click(screen.getByTitle('Marcar favorito')); await screen.findByText('Falha no servidor.');
  fireEvent.click(screen.getByRole('button', { name: 'Excluir estudo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Excluir definitivamente' }));
  await screen.findByText('Falha de comunicação.'); expect(screen.getByRole('dialog')).toBeInTheDocument();
});
it('distinguishes an unknown failed workspace read from an empty study list', async () => {
  rejectReads = true; mount(<HistoryView />); await screen.findByText('Falha ao carregar estudos.');
  expect(screen.queryByRole('button', { name: 'Excluir estudo' })).not.toBeInTheDocument();
});
it('uses a safe scripture-read fallback when a dependency rejects with a non-Error value', async () => {
  vi.mocked(request).mockImplementation(async path => {
    if (path.endsWith('/books')) return { books: [{ code: 'GEN', name: 'Gênesis', chapterCount: 50, order: 1 }] };
    throw 'technical dependency failure';
  });
  mount(<ReaderView />); await screen.findByText('Erro ao Carregar o Texto Bíblico');
  expect(screen.getByText('Verifique se o backend NestJS está em execução na porta 3000.')).toBeInTheDocument();
});
