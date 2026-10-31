import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import snapshot from './fixtures/canon.json';
import { ReaderView } from '../features/canon/reader-view';
import { createQueryClient } from '../shared/api/query-client';
import { ToastProvider } from '../shared/ui/toast';
import { studyFixture } from './workflow-fixtures';

// Authentic versioned verses; selected rows are test-only, never an operational corpus.
const clients: ReturnType<typeof createQueryClient>[] = [];
const verses = snapshot.verses.filter((v: { chapter: number }) => v.chapter === 1);
const passage = { ...studyFixture().passage, translationId: 'porbr2018', bookCode: 'GEN', chapter: 1, verses,
  previousChapter: null, nextChapter: { bookCode: 'GEN', chapter: 2 } };
let mode = 'ok';
beforeEach(() => {
  mode = 'ok';
  vi.stubGlobal('fetch', vi.fn(async (address: string, options?: RequestInit) => {
    const url = new URL(address);
    if (mode === 'pending') return new Promise<Response>(() => {});
    if (mode === 'error') return Response.json({ error: { code: 'UNAVAILABLE', message: 'Leitura temporariamente indisponível' } }, { status: 503 });
    if (url.pathname.endsWith('/books')) return Response.json({ books: [
      { code: 'GEN', name: 'Gênesis', order: 1, chapterCount: 50 }, { code: 'MAT', name: 'Mateus', order: 40, chapterCount: 28 },
    ] });
    if (url.pathname.endsWith('/resolve')) {
      const reference = JSON.parse(String(options?.body)).reference;
      if (reference === 'inválida') return Response.json({ error: { code: 'INVALID_REFERENCE', message: 'Referência não reconhecida' } }, { status: 422 });
      return Response.json({ translationId: 'porbr2018', bookCode: 'GEN', chapter: 1, normalized: reference,
        ...(reference.includes(':') ? { fromVerse: 1, ...(reference.includes('-') ? { toVerse: 2 } : {}) } : {}) });
    }
    const chapter = Number(url.pathname.split('/chapters/')[1]?.split('/')[0] ?? 1);
    return Response.json({ ...passage, chapter, previousChapter: chapter > 1 ? { bookCode: 'GEN', chapter: chapter - 1 } : null,
      nextChapter: chapter < 50 ? { bookCode: 'GEN', chapter: chapter + 1 } : null });
  }));
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(async () => {}) }, configurable: true });
});
afterEach(() => { cleanup(); clients.forEach(c => c.clear()); clients.length = 0; vi.unstubAllGlobals(); vi.useRealTimers(); });
function mount() {
  const client = createQueryClient(); clients.push(client);
  client.setDefaultOptions({ queries: { retry: false } });
  const study = vi.fn(), focus = vi.fn();
  render(<QueryClientProvider client={client}><ToastProvider><ReaderView onSelectPassageForStudy={study} onToggleFocusMode={focus} /></ToastProvider></QueryClientProvider>);
  return { study, focus };
}
it('renders supplied text, attribution, canon groups and chapter bounds', async () => {
  mount(); await screen.findByRole('heading', { name: 'Gênesis 1' });
  expect(screen.getByRole('option', { name: 'Mateus (MAT)' }).closest('optgroup')).toHaveAttribute('label', 'Novo Testamento');
  expect(screen.getByRole('option', { name: 'Gênesis (GEN)' }).closest('optgroup')).toHaveAttribute('label', 'Antigo Testamento');
  expect(screen.getByText(verses[0].text.trim())).toBeInTheDocument();
  expect(screen.getByText(passage.attribution)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Licença CC BY 4.0' })).toHaveAttribute('href', passage.licenseUrl);
  expect(screen.getByTitle('Capítulo Anterior')).toBeDisabled();
  fireEvent.click(screen.getByTitle('Próximo Capítulo'));
  await screen.findByRole('heading', { name: 'Gênesis 2' });
  fireEvent.click(screen.getByTitle('Capítulo Anterior'));
  await screen.findByRole('heading', { name: 'Gênesis 1' });
  const selectors = screen.getAllByRole('combobox');
  fireEvent.change(selectors[1], { target: { value: '50' } });
  await screen.findByRole('heading', { name: 'Gênesis 50' });
  expect(screen.getByTitle('Próximo Capítulo')).toBeDisabled();
  fireEvent.change(selectors[0], { target: { value: 'MAT' } });
  await screen.findByRole('heading', { name: 'Mateus 1' });
});
it('selects, deselects, copies verbatim with attribution and explicitly requests a study', async () => {
  const { study } = mount(); await screen.findByRole('heading', { name: 'Gênesis 1' });
  fireEvent.click(screen.getByText(verses[1].text.trim()));
  fireEvent.click(screen.getByText(verses[0].text.trim()));
  expect(screen.getByText('2 versículos selecionados')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Estudar Passagem' })); expect(study).toHaveBeenCalledWith('GEN 1:1-2');
  fireEvent.click(screen.getByRole('button', { name: 'Copiar' }));
  await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`Gênesis 1:1,2\n1. ${verses[0].text}\n2. ${verses[1].text}\n(Bíblia Livre — porbr2018)`));
  expect(await screen.findByText('Versículos copiados com atribuição canônica.')).toBeInTheDocument();
  fireEvent.click(screen.getByText(verses[1].text.trim()));
  expect(screen.getByText('1 versículo selecionado')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Estudar Passagem' })); expect(study).toHaveBeenLastCalledWith('GEN 1:1');
  fireEvent.click(screen.getByText(verses[0].text.trim())); expect(screen.queryByRole('button', { name: 'Copiar' })).not.toBeInTheDocument();
});
it('restores the copy action after its temporary confirmation without copying again', async () => {
  mount(); await screen.findByRole('heading', { name: 'Gênesis 1' }); fireEvent.click(screen.getByText(verses[0].text.trim()));
  const button = screen.getByRole('button', { name: 'Copiar' }), ordinaryAction = button.innerHTML;
  vi.useFakeTimers();
  fireEvent.click(button); await act(async () => { await Promise.resolve(); });
  expect(button.innerHTML).not.toBe(ordinaryAction); expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  await act(async () => { vi.advanceTimersByTime(1999); }); expect(button.innerHTML).not.toBe(ordinaryAction);
  await act(async () => { vi.advanceTimersByTime(1); }); expect(button.innerHTML).toBe(ordinaryAction);
  expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
});
it('exposes the restore action while the reader is already in focus mode', async () => {
  const client = createQueryClient(); clients.push(client); const restore = vi.fn();
  render(<QueryClientProvider client={client}><ToastProvider><ReaderView isFocusMode onToggleFocusMode={restore} /></ToastProvider></QueryClientProvider>);
  await screen.findByRole('heading', { name: 'Gênesis 1' });
  fireEvent.click(screen.getByRole('button', { name: 'Restaurar' })); expect(restore).toHaveBeenCalledOnce();
  expect(screen.getByTitle('Sair do Modo Foco (Esc)')).toBeInTheDocument();
});
it.each(['GEN 1:1-2', 'GEN 1:1', 'GEN 1'])('resolves %s through the real hook/HTTP contract', async reference => {
  mount(); await screen.findByRole('heading', { name: 'Gênesis 1' });
  const input = screen.getByPlaceholderText(/Ir para passagem/);
  fireEvent.change(input, { target: { value: `  ${reference}  ` } }); fireEvent.submit(input.closest('form')!);
  await waitFor(() => expect(input).toHaveValue(''));
  if (reference.includes('-')) expect(screen.getByText('2 versículos selecionados')).toBeInTheDocument();
  else if (reference.includes(':')) expect(screen.getByText('1 versículo selecionado')).toBeInTheDocument();
  else expect(screen.queryByRole('button', { name: 'Estudar Passagem' })).not.toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls.some(([, options]) => options?.body === JSON.stringify({ translationId: 'porbr2018', reference }))).toBe(true);
});
it('rejects invalid references without losing current reading and leaves empty queries unsent', async () => {
  mount(); await screen.findByRole('heading', { name: 'Gênesis 1' });
  const input = screen.getByPlaceholderText(/Ir para passagem/), calls = vi.mocked(fetch).mock.calls.length;
  fireEvent.submit(input.closest('form')!); expect(fetch).toHaveBeenCalledTimes(calls);
  fireEvent.change(input, { target: { value: 'inválida' } }); fireEvent.submit(input.closest('form')!);
  await screen.findByText('Referência inválida'); expect(input).toHaveValue('inválida');
  expect(screen.getByRole('heading', { name: 'Gênesis 1' })).toBeInTheDocument();
});
it('changes reading font/width and focus using actual controls', async () => {
  const { focus } = mount(); await screen.findByRole('heading', { name: 'Gênesis 1' });
  for (const size of ['SM', 'MD', 'LG', 'XL']) fireEvent.click(screen.getByRole('button', { name: size }));
  expect(screen.getByText(verses[0].text.trim()).parentElement?.parentElement).toHaveClass('text-[clamp(1.35rem,1.25rem+0.6vw,1.75rem)]');
  fireEvent.click(screen.getByRole('button', { name: 'Estreito' }));
  expect(screen.getByRole('heading', { name: 'Gênesis 1' }).closest('article')?.parentElement?.parentElement).toHaveClass('max-w-[min(100%,64ch)]');
  fireEvent.click(screen.getByRole('button', { name: 'Amplo' })); fireEvent.click(screen.getByRole('button', { name: 'Padrão' }));
  fireEvent.click(screen.getByRole('button', { name: 'Modo Foco' })); expect(focus).toHaveBeenCalledOnce();
});
it('exposes the chosen reading size and width without relying on visual color alone', async () => {
  mount(); await screen.findByRole('heading', { name: 'Gênesis 1' });
  for (const choices of [['SM', 'MD', 'LG', 'XL'], ['Estreito', 'Padrão', 'Amplo']]) {
    for (const selected of choices) {
      fireEvent.click(screen.getByRole('button', { name: selected }));
      for (const choice of choices) expect(screen.getByRole('button', { name: choice })).toHaveAttribute('aria-pressed', String(choice === selected));
    }
  }
});
it('shows loading and actual API failure states', async () => {
  mode = 'pending'; const view = mount(); expect(screen.getByRole('option', { name: 'Carregando livros...' })).toBeInTheDocument();
  cleanup(); clients.forEach(c => c.clear()); mode = 'error'; mount();
  await act(async () => {});
  expect(await screen.findByText('Erro ao Carregar o Texto Bíblico')).toBeInTheDocument();
  expect(screen.getByText('Leitura temporariamente indisponível')).toBeInTheDocument();
  expect(view.study).not.toHaveBeenCalled();
});
