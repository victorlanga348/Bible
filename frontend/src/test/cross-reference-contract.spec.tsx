import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { CrossRefPanel } from '../features/cross-ref/cross-ref-panel';
import { useCreateCrossReference, useHealth, useSources, useSourceExcerpts, useTranslations } from '../shared/api/hooks';
import { evidence, excerptId, quote } from './evidence-fixtures';
import { createdAt, reference } from './workflow-fixtures';
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ token: 'technical-token' }) }));
let client: QueryClient;
afterEach(() => { cleanup(); client?.clear(); vi.unstubAllGlobals(); });
it('uses the backend citation/user-interpretation contract and invalidates the list after an explicit creation', async () => {
  // Technical relation for transport/UI tests, not a claim of a historical or textual connection.
  const body = { from: { translationId: 'porbr2018', reference: 'GEN 1:1' }, to: { translationId: 'porbr2018', reference: 'JHN 3:16' },
    type: 'citation', reading: 'textual', rationale: 'Fixture técnica de contrato; não afirma citação bíblica real.', evidence: [{ excerptId, startOffset: 0, endOffset: quote.length }] };
  let exists = false;
  const relation = { id: '60000000-0000-4000-8000-000000000001', from: reference, to: { ...reference, bookCode: 'JHN', chapter: 3, fromVerse: 16, toVerse: 16, normalized: 'JHN 3:16' }, type: body.type, reading: body.reading, rationale: body.rationale,
    assessment: 'user-interpretation', createdAt, limitations: ['Fixture de teste; não é evidência histórica validada.'], evidence: [{ ...evidence, startOffset: 0, endOffset: quote.length }] };
  vi.stubGlobal('fetch', vi.fn(async (url: string, options?: RequestInit) => {
    const path = new URL(url).pathname;
    if (path === '/api/cross-references') {
      if (options?.method === 'POST') { exists = true; return Response.json(relation); }
      return Response.json({ items: exists ? [relation] : [], nextCursor: null });
    }
    if (path === '/api/health/ready') return Response.json({ status: 'ok', database: 'up' });
    if (path === '/api/translations') return Response.json({ translations: [] });
    if (path === '/api/sources') return Response.json({ sources: [] });
    return Response.json({ excerpts: [], limit: 20, offset: 0, hasMore: false });
  }));
  function Consumer() {
    const health = useHealth(), translations = useTranslations(), sources = useSources(), excerpts = useSourceExcerpts(evidence.sourceId, 'Moses');
    const create = useCreateCrossReference();
    return <><p>{health.data?.status} · {translations.data?.length} · {sources.data?.length} · {excerpts.data?.length}</p><button onClick={() => create.mutate(body)}>Criar relação técnica</button><CrossRefPanel reference="GEN 1:1" onNavigateToPassage={navigate} /></>;
  }
  const navigate = vi.fn(); client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><Consumer /></QueryClientProvider>);
  await screen.findByText('ok · 0 · 0 · 0'); await screen.findByText('Nenhuma referência cruzada catalogada para esta passagem.');
  fireEvent.click(screen.getByRole('button', { name: 'Criar relação técnica' }));
  await screen.findByText('Citação Direta');
  expect(screen.getByText('Avaliação: Interpretação do utilizador')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'JHN 3:16' })); expect(navigate).toHaveBeenCalledWith('JHN 3:16');
  await waitFor(() => expect(vi.mocked(fetch).mock.calls.some(([url, options]) => String(url).includes('/cross-references') && options?.method === 'POST' && options.body === JSON.stringify(body))).toBe(true));
});
