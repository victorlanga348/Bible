import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createQueryClient } from '../shared/api/query-client';
import { request } from '../shared/api/http-client';
import { api } from '../shared/api/services';
import { AppContent } from '../App';
import { ThemeProvider } from '../shared/hooks/use-theme';
import { ToastProvider } from '../shared/ui/toast';
import { AccountAccessProvider } from '../shared/ui/shell';
import { SourcesView } from '../features/sources/sources-view';
import { ReaderView } from '../features/canon/reader-view';
import { CrossRefPanel } from '../features/cross-ref/cross-ref-panel';
import { HistoryView } from '../features/workspace/history-view';
import { ContextPanel } from '../features/assistant/context-panel';
import { ReferenceSearch } from '../features/canon/reference-search';
import manifest from './fixtures/source-manifest.json';
import { conversationFixture, conversationId, noteFixture, studyFixture, studyId } from './workflow-fixtures';

// Deliberately adversarial *unit* transport double: rejects with a non-Error value.
// This verifies defensive UI copy, not HTTP normalization, real persistence or inference.
vi.mock('../shared/api/http-client', async importOriginal => ({ ...await importOriginal<typeof import('../shared/api/http-client')>(), request: vi.fn() }));
vi.mock('../shared/api/services', async importOriginal => {
  const actual = await importOriginal<typeof import('../shared/api/services')>();
  return { ...actual, api: { ...actual.api, sources: vi.fn() } };
});
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: true, token: 'technical-token', status: 'authenticated', ownerId: 'technical-owner', version: 1, clearSession: vi.fn() }) }));
let failedPath = '', failedMethod = '', failure: unknown = 'technical non-Error rejection';
const clients: ReturnType<typeof createQueryClient>[] = [];
beforeEach(() => {
  failedPath = ''; failedMethod = ''; failure = 'technical non-Error rejection';
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  vi.mocked(api.sources).mockImplementation(async () => {
    if (failedPath === '/sources') throw failure;
    return { sources: [{ ...manifest.source, translator: '' }] };
  });
  vi.mocked(request).mockImplementation(async (address, options) => {
    if (address === failedPath && (!failedMethod || options?.method === failedMethod)) throw failure;
    if (address.endsWith('/books')) return { books: [{ code: 'GEN', name: 'Gênesis', order: 1, chapterCount: 50 }] } as never;
    if (address.endsWith('/verses')) return studyFixture().passage as never;
    if (address === '/sources') return { sources: [{ ...manifest.source, translator: '' }] } as never;
    if (address.endsWith('/excerpts')) return { excerpts: [] } as never;
    if (address === '/workspace/studies') return { items: [studyFixture()], nextCursor: null } as never;
    if (address === '/workspace/favorites') return { items: [], nextCursor: null } as never;
    if (address.endsWith('/notes')) return { items: [noteFixture()], nextCursor: null } as never;
    if (address.endsWith('/conversations') && address.startsWith('/workspace')) return { items: [{ ...conversationFixture(), turns: undefined }], nextCursor: null } as never;
    if (address === `/conversations/${conversationId}`) return conversationFixture() as never;
    return studyFixture() as never;
  });
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function mount(children: React.ReactNode) {
  const client = createQueryClient(); clients.push(client); client.setDefaultOptions({ ...client.getDefaultOptions(), queries: { ...client.getDefaultOptions().queries, retry: false } });
  return render(<QueryClientProvider client={client}><ThemeProvider><ToastProvider><AccountAccessProvider>{children}</AccountAccessProvider></ToastProvider></ThemeProvider></QueryClientProvider>);
}
it('shows recoverable study creation guidance when a dependency rejects without an Error', async () => {
  failedPath = '/studies'; failedMethod = 'POST'; mount(<AppContent />);
  fireEvent.click(screen.getByRole('button', { name: 'Estudo Estruturado' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Passagem do estudo' }), { target: { value: 'GEN 1:1' } });
  fireEvent.click(await screen.findByRole('button', { name: 'Gerar Estudo' }));
  await screen.findByText('Não foi possível guardar o estudo. Tenta novamente.');
  expect(screen.getByRole('button', { name: 'Gerar Estudo' })).toBeEnabled();
});
it.each(['catalog', 'excerpts'])('does not turn a non-Error %s failure into an empty source result', async target => {
  failedPath = target === 'catalog' ? '/sources' : `/sources/${manifest.source.id}/excerpts`;
  mount(<SourcesView />);
  await screen.findByText(target === 'catalog' ? 'Erro ao carregar o catálogo de fontes.' : 'Não foi possível consultar os trechos. Tenta outra vez.');
  expect(screen.queryByText('Nenhum trecho encontrado para a busca especificada.')).not.toBeInTheDocument();
});
it('shows Original only for a source without a translator', async () => {
  mount(<SourcesView />); await screen.findByText(manifest.source.title);
  expect(screen.getByText('Original')).toBeInTheDocument();
});
it('renders reference guidance without treating an unknown rejection as a resolved passage', async () => {
  failedPath = '/references/resolve'; const navigate = vi.fn(); mount(<ReferenceSearch onPassageResolved={navigate} />);
  const input = screen.getByRole('textbox'); fireEvent.change(input, { target: { value: 'invalid technical reference' } }); fireEvent.submit(input.closest('form')!);
  await screen.findByText('Referência bíblica não reconhecida. Exemplo: GEN 1:1-3, Jo 3:16 ou Sl 23');
  expect(navigate).not.toHaveBeenCalled(); expect(input).toHaveValue('invalid technical reference');
});
it('shows a genuine books failure even before a passage has failed', async () => {
  failedPath = '/translations/porbr2018/books'; mount(<ReaderView />);
  await screen.findByText('Erro ao Carregar o Texto Bíblico');
  expect(screen.getByText('Verifique se o backend NestJS está em execução na porta 3000.')).toBeInTheDocument();
});
it('shows cross-reference failure guidance for an unknown dependency rejection', async () => {
  failedPath = '/cross-references'; mount(<CrossRefPanel reference="GEN 1:1" />);
  await screen.findByText('Erro ao buscar referências cruzadas.');
  expect(screen.queryByText('Nenhuma referência cruzada catalogada para esta passagem.')).not.toBeInTheDocument();
});
it('keeps workspace study errors distinct from an empty saved list', async () => {
  failedPath = '/workspace/studies'; mount(<HistoryView />);
  await screen.findByText('Falha ao carregar estudos.');
  expect(screen.queryByText('Nenhum estudo persistido ainda no workspace.')).not.toBeInTheDocument();
});
it.each(['create', 'revise', 'delete'] as const)('preserves recoverable note %s controls after an unknown rejection', async action => {
  const note = noteFixture(); failedPath = action === 'create' ? `/workspace/studies/${studyId}/notes` : `/workspace/notes/${note.id}`;
  failedMethod = action === 'create' ? 'POST' : action === 'revise' ? 'PATCH' : 'DELETE';
  mount(<HistoryView initialStudy={studyFixture()} initialTab="notes" />); await screen.findByText(note.content);
  if (action === 'create') {
    fireEvent.change(screen.getByPlaceholderText(/Escreva uma nova anotação/), { target: { value: 'Preserved technical draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Nota' })); await screen.findByText('Falha na persistência da nota.');
    expect(screen.getByPlaceholderText(/Escreva uma nova anotação/)).toHaveValue('Preserved technical draft');
  } else if (action === 'revise') {
    fireEvent.click(screen.getByTitle('Editar nota')); fireEvent.change(screen.getByRole('textbox', { name: 'Conteúdo da anotação' }), { target: { value: 'Preserved revision' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));
    await screen.findByText('Não foi possível guardar esta revisão. Tenta novamente.'); expect(screen.getByRole('textbox')).toHaveValue('Preserved revision');
  } else {
    fireEvent.click(screen.getByTitle('Eliminar Nota')); fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir Definitivamente' }));
    await screen.findByText('Falha ao remover a nota.'); expect(screen.getByRole('dialog')).toBeInTheDocument();
  }
});
it('keeps the study deletion confirmation recoverable after an unknown rejection', async () => {
  failedPath = `/workspace/studies/${studyId}`; failedMethod = 'DELETE'; mount(<HistoryView />);
  fireEvent.click(await screen.findByRole('button', { name: 'Eliminar estudo GEN 1:1 versão 3' }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar estudo' }));
  await screen.findByText('Não foi possível concluir a eliminação. Volta a tentar.'); expect(screen.getByRole('dialog')).toBeInTheDocument();
});
it('keeps an unknown favorite failure visible without changing the saved list', async () => {
  failedPath = `/workspace/studies/${studyId}/favorites/3`; failedMethod = 'PUT'; mount(<HistoryView />);
  fireEvent.click(await screen.findByTitle('Marcar favorito')); await screen.findByText('Falha no servidor.');
  expect(screen.getByTitle('Marcar favorito')).toBeInTheDocument();
});
it.each(['send', 'new', 'delete', 'abort'] as const)('renders the defensive conversation %s state without losing the draft', async action => {
  failedPath = action === 'new' ? `/studies/${studyId}/conversations` : action === 'delete' ? `/conversations/${conversationId}` : `/conversations/${conversationId}/turns`;
  failedMethod = action === 'delete' ? 'DELETE' : 'POST';
  if (action === 'abort') failure = Object.assign(new Error('Technical transport abort'), { name: 'AbortError' });
  mount(<ContextPanel activeStudyId={studyId} activeStudyVersion={3} />); await screen.findByText('"Questão técnica anterior."');
  const input = screen.getByPlaceholderText(/O que Josefo relata/); fireEvent.change(input, { target: { value: 'Technical question preserved' } });
  if (action === 'new') fireEvent.click(screen.getByRole('button', { name: 'Nova conversa' }));
  else if (action === 'delete') { fireEvent.click(screen.getByRole('button', { name: 'Eliminar conversa' })); fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar eliminação da conversa' })); }
  else fireEvent.submit(input.closest('form')!);
  const messages = { send: 'Não foi possível obter a resposta. Tenta novamente.', new: 'Não foi possível criar a conversa.', delete: 'Não foi possível eliminar a conversa.', abort: 'Pedido interrompido. Atualiza a conversa para confirmar o que ficou guardado.' };
  if (action === 'delete') await within(screen.getByRole('dialog')).findByText(messages[action]);
  else await screen.findByText(messages[action]);
  expect(input).toHaveValue('Technical question preserved');
  if (action === 'abort') expect(screen.queryByText('Erro no assistente de IA')).not.toBeInTheDocument();
  const failedCalls = vi.mocked(request).mock.calls.filter(([url, options]) => url === failedPath && options?.method === failedMethod); expect(failedCalls).toHaveLength(1);
});
