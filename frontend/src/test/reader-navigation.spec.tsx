import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ReaderView } from '../features/canon/reader-view';
import { ToastProvider } from '../shared/ui/toast';
import { request } from '../shared/api/http-client';
import { studyFixture } from './workflow-fixtures';

// UI transport double; biblical text comes from the admitted porbr2018 fixture.
vi.mock('../shared/api/http-client', () => ({ request: vi.fn() }));
const clients: QueryClient[] = [];
beforeEach(() => {
  vi.mocked(request).mockReset().mockImplementation(async url => {
    if (url.endsWith('/books')) return { books: [{ code: 'GEN', name: 'Gênesis', order: 1, chapterCount: 50 }, { code: 'JHN', name: 'João', order: 43, chapterCount: 21 }] };
    if (url === '/references/resolve') return { ...studyFixture().reference, bookCode: 'JHN', chapter: 3, fromVerse: 16, toVerse: 16, normalized: 'JHN 3:16' };
    if (url.includes('/JHN/')) return { ...studyFixture().passage, bookCode: 'JHN', chapter: 3, verses: [{ number: 16, text: 'Porque Deus amou ao mundo de tal maneira, que deu o seu Filho unigênito; para que todo aquele que nele crê não pereça, mas tenha a vida eterna. ' }] };
    return { ...studyFixture().passage, bookCode: 'GEN', chapter: 1 };
  });
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; });
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); clients.push(client);
  const study = vi.fn();
  const view = (reference?: string) => <QueryClientProvider client={client}><ToastProvider><ReaderView {...{ targetReference: reference }} onSelectPassageForStudy={study} /></ToastProvider></QueryClientProvider>;
  const rendered = render(view()); return { ...rendered, study, navigate: () => rendered.rerender(view('JHN 3:16')) };
}
it('names canonical selectors and makes verse selection operable from the keyboard', async () => {
  const view = mount(); await screen.findByRole('heading', { name: 'Gênesis 1' });
  expect(screen.getByRole('combobox', { name: 'Livro' })).toHaveValue('GEN');
  expect(screen.getByRole('combobox', { name: 'Capítulo' })).toHaveValue('1');
  const verse = screen.getByRole('button', { name: /Versículo 1/ });
  expect(verse).toHaveAttribute('tabindex', '0'); fireEvent.keyDown(verse, { key: 'Enter' });
  expect(verse).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Estudar Passagem' })); expect(view.study).toHaveBeenCalledWith('GEN 1:1');
});
it('resolves an external cross reference and displays its actual chapter and selection', async () => {
  const view = mount(); await screen.findByRole('heading', { name: 'Gênesis 1' }); view.navigate();
  await screen.findByRole('heading', { name: 'João 3' });
  expect(screen.getByRole('button', { name: /Versículo 16/ })).toHaveAttribute('aria-pressed', 'true');
  await waitFor(() => expect(request).toHaveBeenCalledWith('/references/resolve', expect.objectContaining({ body: { translationId: 'porbr2018', reference: 'JHN 3:16' } })));
});
