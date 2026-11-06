import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SourcesView } from '../features/sources/sources-view';
import { source } from './fixtures/josephus-pg2848/manifest.json';
import { source as aiSource } from './fixtures/josephus-pg2848/ai-manifest.json';
import excerpts from './fixtures/josephus-pg2848/excerpts.json';
import { api } from '../shared/api/services';

// Transport doubles, authentic versioned copies of backend Josephus test fixtures.
let failCatalogue = false, failExcerpts = false, empty = false;
beforeEach(() => {
  failCatalogue = false; failExcerpts = false; empty = false;
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const parsed = new URL(url);
    if (parsed.pathname === '/api/sources') return failCatalogue
      ? Response.json({ error: { code: 'UNAVAILABLE', message: 'Catálogo indisponível.' } }, { status: 503 })
      : Response.json({ sources: empty ? [] : [source, aiSource] });
    return failExcerpts ? Response.json({ error: { code: 'UNAVAILABLE', message: 'Leitura indisponível.' } }, { status: 503 })
      : Response.json({ excerpts: parsed.searchParams.get('q') ? [] : excerpts });
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
it('shows authentic provenance and opens the excerpt for keyboard readers', async () => {
  render(<SourcesView />);
  await screen.findByText(source.rightsStatement);
  expect(screen.getByText('Obra Histórica')).toBeInTheDocument();
  expect(screen.getByText(source.author).closest('p')).toHaveTextContent(`Autor: ${source.author}`);
  expect(screen.getByText(`SHA-256: ${source.snapshotSha256.substring(0, 16)}...`)).toBeInTheDocument();
  expect(await screen.findByText(`SHA: ${excerpts[0].textSha256.substring(0, 10)}...`)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Fonte Original' })).toHaveAttribute('href', source.originUrl);
  const button = await screen.findByRole('button', { name: `Ler trecho ${excerpts[0].locator}` });
  fireEvent.click(button); const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText(excerpts[0].textSha256)).toBeInTheDocument();
  expect(within(dialog).getByText(`"${excerpts[0].text}"`)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Fechar' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
it('lets the reader select another admitted source instead of always showing the first', async () => {
  render(<SourcesView />); const selector = await screen.findByRole('combobox', { name: 'Fonte histórica' });
  expect(selector).toHaveValue(source.id);
  const filter = screen.getByPlaceholderText('Filtrar trechos...');
  fireEvent.change(filter, { target: { value: 'Sabbath' } });
  fireEvent.change(selector, { target: { value: aiSource.id } });
  expect(filter).toHaveValue('');
  await waitFor(() => expect(vi.mocked(fetch).mock.calls.some(([url]) => new URL(String(url)).pathname === `/api/sources/${aiSource.id}/excerpts`)).toBe(true));
  expect(screen.getByText(aiSource.rightsStatement)).toBeInTheDocument();
});
it('does not claim an empty catalogue or request an absent source while the catalogue is pending', async () => {
  let finish!: (response: Response) => void;
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation((url, options) => new URL(String(url)).pathname === '/api/sources' ? new Promise<Response>(resolve => { finish = resolve; }) : original(url, options));
  render(<SourcesView />); await waitFor(() => expect(finish).toBeDefined());
  expect(screen.queryByText('Nenhuma fonte histórica cadastrada no banco.')).not.toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls).toHaveLength(1);
  await act(async () => finish(Response.json({ sources: [source] })));
  await screen.findByRole('combobox', { name: 'Fonte histórica' });
});
it.each(['success', 'failure'])('keeps the current filter results after a late obsolete %s', async late => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  let finish!: (response: Response) => void;
  vi.mocked(fetch).mockImplementation((url, options) => {
    const parsed = new URL(String(url));
    if (parsed.pathname.endsWith('/excerpts')) return parsed.searchParams.has('q') ? Promise.resolve(Response.json({ excerpts: [excerpts[0]] })) : new Promise<Response>(resolve => { finish = resolve; });
    return original(url, options);
  });
  render(<SourcesView />); const filter = await screen.findByPlaceholderText('Filtrar trechos...');
  await waitFor(() => expect(finish).toBeDefined());
  expect(screen.queryByText('Nenhum trecho encontrado para a busca especificada.')).not.toBeInTheDocument();
  fireEvent.change(filter, { target: { value: 'Sabbath' } });
  await screen.findByRole('button', { name: `Ler trecho ${excerpts[0].locator}` });
  await act(async () => finish(late === 'success' ? Response.json({ excerpts }) : Response.json({ error: { code: 'UNAVAILABLE', message: 'Pedido antigo indisponível.' } }, { status: 503 })));
  expect(screen.getAllByRole('button', { name: /^Ler trecho / })).toHaveLength(1);
  expect(screen.queryByText('Não foi possível carregar os trechos.')).not.toBeInTheDocument();
  expect(filter).toHaveValue('Sabbath');
});
it('filters using the server query, with an explicit empty result', async () => {
  render(<SourcesView />); const search = await screen.findByPlaceholderText('Filtrar trechos...');
  await screen.findByText(excerpts[0].locator);
  fireEvent.change(search, { target: { value: ' technical empty search ' } });
  await screen.findByText('Nenhum trecho encontrado para a busca especificada.');
  expect(vi.mocked(fetch).mock.calls.some(([url]) => new URL(String(url)).searchParams.get('q') === 'technical empty search')).toBe(true);
});
it('distinguishes a transport failure from an empty search and lets the reader retry', async () => {
  failExcerpts = true; render(<SourcesView />);
  await screen.findByText('Não foi possível carregar os trechos.');
  expect(screen.queryByText('Nenhum trecho encontrado para a busca especificada.')).not.toBeInTheDocument();
  failExcerpts = false; fireEvent.click(screen.getByRole('button', { name: 'Tentar carregar trechos' }));
  await screen.findByRole('button', { name: `Ler trecho ${excerpts[0].locator}` });
});
it('shows catalogue errors and genuinely empty catalogues honestly', async () => {
  failCatalogue = true; const view = render(<SourcesView />); await screen.findByText('Catálogo indisponível.');
  view.unmount(); failCatalogue = false; empty = true; render(<SourcesView />);
  await screen.findByText('Nenhuma fonte histórica cadastrada no banco.');
});
it('uses the catalogue error fallback when the dependency provides no message', async () => {
  vi.spyOn(api, 'sources').mockRejectedValue(new Error(''));
  render(<SourcesView />); await screen.findByText('Erro ao carregar o catálogo de fontes.');
  expect(screen.queryByRole('combobox', { name: 'Fonte histórica' })).not.toBeInTheDocument();
});
it('handles missing translator metadata without changing admitted quotation or rights', async () => {
  // A deliberately absent optional transport field, not an admission of another edition.
  const incomplete = { ...source, translator: undefined };
  vi.spyOn(api, 'sources').mockResolvedValue({ sources: [incomplete] });
  render(<SourcesView />); await screen.findByText('Original');
  expect(screen.getByText(source.rightsStatement)).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: `Ler trecho ${excerpts[0].locator}` })).toBeInTheDocument();
});
