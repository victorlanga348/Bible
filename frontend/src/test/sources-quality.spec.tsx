import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SourcesView } from '../features/sources/sources-view';
import { source } from './fixtures/josephus-pg2848/manifest.json';
import { source as aiSource } from './fixtures/josephus-pg2848/ai-manifest.json';
import excerpts from './fixtures/josephus-pg2848/excerpts.json';

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
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('shows authentic provenance and opens the excerpt for keyboard readers', async () => {
  render(<SourcesView />);
  await screen.findByText(source.rightsStatement);
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
  fireEvent.change(selector, { target: { value: aiSource.id } });
  await waitFor(() => expect(vi.mocked(fetch).mock.calls.some(([url]) => new URL(String(url)).pathname === `/api/sources/${aiSource.id}/excerpts`)).toBe(true));
  expect(screen.getByText(aiSource.rightsStatement)).toBeInTheDocument();
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
