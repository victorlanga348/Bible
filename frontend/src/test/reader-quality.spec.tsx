import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ReaderView } from '../features/canon/reader-view';
import { ToastProvider } from '../shared/ui/toast';
import { reference, studyFixture } from './workflow-fixtures';

// HTTP double with authentic verse excerpts copied from admitted porbr2018 test fixtures.
const john = [
  { number: 16, text: 'Porque Deus amou ao mundo de tal maneira, que deu o seu Filho unigênito; para que todo aquele que nele crê não pereça, mas tenha a vida eterna. ' },
  { number: 17, text: 'Porque Deus não mandou seu Filho ao mundo para que condenasse ao mundo; mas sim para que o mundo por ele fosse salvo; ' },
];
let failPassage = false, failSearch = false;
const clients: QueryClient[] = [];
beforeEach(() => {
  failPassage = false; failSearch = false;
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const path = new URL(url).pathname;
    if (path.endsWith('/books')) return Response.json({ books: [{ code: 'GEN', name: 'Gênesis', chapterCount: 50, order: 1 }, { code: 'JHN', name: 'João', chapterCount: 21, order: 43 }] });
    if (path.endsWith('/resolve')) return failSearch ? Response.json({ error: { code: 'INVALID_REFERENCE', message: 'Referência não reconhecida.' } }, { status: 400 }) : Response.json({ ...reference, bookCode: 'JHN', chapter: 3, fromVerse: 16, toVerse: 17, normalized: 'JHN 3:16-17' });
    if (failPassage) return Response.json({ error: { code: 'NOT_FOUND', message: 'Leitura indisponível.' } }, { status: 404 });
    const chapter = Number(path.match(/chapters\/(\d+)/)?.[1] ?? 1);
    const bookCode = path.includes('/JHN/') ? 'JHN' : 'GEN';
    return Response.json({ ...studyFixture().passage, chapter, bookCode,
      verses: bookCode === 'JHN' && chapter === 3 ? john : bookCode === 'GEN' && chapter === 1 ? studyFixture().passage.verses : [],
      previousChapter: chapter > 1 ? { bookCode, chapter: chapter - 1 } : null, nextChapter: { bookCode, chapter: chapter + 1 } });
  }));
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); clients.push(client);
  const study = vi.fn(), focus = vi.fn();
  render(<QueryClientProvider client={client}><ToastProvider><ReaderView onSelectPassageForStudy={study} onToggleFocusMode={focus} /></ToastProvider></QueryClientProvider>);
  return { study, focus };
}
it('changes books, chapters, next and previous using actual navigation metadata', async () => {
  mount(); await screen.findByRole('heading', { name: 'Gênesis 1' });
  expect(screen.getByTitle('Capítulo Anterior')).toBeDisabled();
  fireEvent.click(screen.getByTitle('Próximo Capítulo')); await screen.findByRole('heading', { name: 'Gênesis 2' });
  fireEvent.click(screen.getByTitle('Capítulo Anterior')); await screen.findByRole('heading', { name: 'Gênesis 1' });
  fireEvent.change(screen.getByLabelText('Livro'), { target: { value: 'JHN' } });
  await screen.findByRole('heading', { name: 'João 1' });
  fireEvent.change(screen.getByLabelText('Capítulo'), { target: { value: '3' } });
  await screen.findByRole('heading', { name: 'João 3' });
  expect(screen.getByText(john[0].text.trim())).toBeInTheDocument();
});
it('resolves a range, copies its authentic text with attribution, and studies the chosen verses', async () => {
  const { study } = mount(); await screen.findByRole('heading', { name: 'Gênesis 1' });
  const search = screen.getByPlaceholderText(/Ir para passagem/);
  fireEvent.change(search, { target: { value: ' Jo 3:16-17 ' } }); fireEvent.submit(search.closest('form')!);
  await screen.findByRole('heading', { name: 'João 3' });
  expect(screen.getByText('2 versículos selecionados')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Copiar' }));
  await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining(john[0].text)));
  expect(vi.mocked(navigator.clipboard.writeText).mock.calls[0][0]).toContain('Bíblia Livre');
  fireEvent.click(screen.getByRole('button', { name: 'Estudar Passagem' })); expect(study).toHaveBeenCalledWith('JHN 3:16-17');
  fireEvent.keyDown(screen.getByRole('button', { name: /Versículo 16/ }), { key: ' ' });
  fireEvent.click(screen.getByRole('button', { name: 'Estudar Passagem' })); expect(study).toHaveBeenLastCalledWith('JHN 3:17');
  expect(search).toHaveValue('');
});
it('ignores blank search and recovers from invalid references without changing passage', async () => {
  mount(); await screen.findByRole('heading', { name: 'Gênesis 1' });
  const search = screen.getByPlaceholderText(/Ir para passagem/);
  fireEvent.submit(search.closest('form')!);
  expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes('/references/resolve'))).toBe(false);
  failSearch = true; fireEvent.change(search, { target: { value: 'invalid technical input' } }); fireEvent.submit(search.closest('form')!);
  await screen.findByText('Referência inválida'); expect(search).toHaveValue('invalid technical input');
  expect(screen.getByRole('heading', { name: 'Gênesis 1' })).toBeInTheDocument();
  failSearch = false; fireEvent.submit(search.closest('form')!); await screen.findByRole('heading', { name: 'João 3' });
});
it('changes reading size and width without losing selection and exposes focus action', async () => {
  const { focus } = mount(); await screen.findByRole('heading', { name: 'Gênesis 1' });
  const verse = screen.getByRole('button', { name: /Versículo 1/ }); fireEvent.click(verse);
  for (const size of ['SM', 'LG', 'XL', 'MD']) fireEvent.click(screen.getByRole('button', { name: size }));
  for (const width of ['Estreito', 'Amplo', 'Padrão']) fireEvent.click(screen.getByRole('button', { name: width }));
  expect(verse).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByTitle('Ativar Modo Foco (Leitura Imersiva)')); expect(focus).toHaveBeenCalledOnce();
});
it('reports API read errors instead of rendering invented scripture', async () => {
  failPassage = true; mount(); await screen.findByText('Erro ao Carregar o Texto Bíblico');
  expect(screen.getByText('Leitura indisponível.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Versículo 1/ })).not.toBeInTheDocument();
});
