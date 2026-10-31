import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import manifest from './fixtures/source-manifest.json';
import excerpts from './fixtures/source-excerpts.json';
import canon from './fixtures/canon.json';
import { SourcesView } from '../features/sources/sources-view';
import { StudyView } from '../features/studies/study-view';
import { CrossRefPanel } from '../features/cross-ref/cross-ref-panel';
import { AnalysisResult } from '../features/assistant/analysis-result';
import { ToastProvider } from '../shared/ui/toast';
import { createQueryClient } from '../shared/api/query-client';
import { analysisFixture, reference, studyFixture, studyId, secondStudyId, createdAt } from './workflow-fixtures';
import type { CrossReferenceRelationDto, StudyEvidenceDto } from '../shared/api/contracts';

// Exact admitted metadata/text. Any relation/rationale is an explicitly technical UI protocol case.
const source = manifest.source;
const excerpt = excerpts[0];
const evidence: StudyEvidenceDto = { sourceId: source.id, excerptId: excerpt.id, locator: excerpt.locator,
  quote: excerpt.text, textSha256: excerpt.textSha256, attribution: source.attribution,
  rightsStatement: source.rightsStatement, rightsUrl: source.rightsUrl, availability: 'available', rightsSnapshot: {
    ingest: 'allowed', store: 'allowed', index: 'allowed', display: 'allowed', quote: 'allowed', sendToAi: 'allowed',
  } };
const clients: ReturnType<typeof createQueryClient>[] = [];
let authenticated = true;
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: authenticated, token: authenticated ? 'technical-token' : null }) }));
let sourceMode = 'ok';
let crossMode = 'ok';
let relations: CrossReferenceRelationDto[];
beforeEach(() => {
  authenticated = true; sourceMode = 'ok'; crossMode = 'ok';
  relations = [{ id: studyId, from: reference, to: { ...reference, normalized: 'GEN 1:2', fromVerse: 2, toVerse: 2 },
    type: 'thematic-parallel', reading: 'technical-case', rationale: 'Caso técnico de apresentação, não é uma relação admitida.',
    assessment: 'disputed', createdAt, limitations: [], evidence: [] }];
  vi.stubGlobal('fetch', vi.fn(async (address: string) => {
    const url = new URL(address);
    const mode = url.pathname === '/api/cross-references' ? crossMode : sourceMode;
    if (mode === 'pending') return new Promise<Response>(() => {});
    if (mode === 'error') return Response.json({ error: { code: 'UNAVAILABLE', message: 'Consulta indisponível' } }, { status: 503 });
    if (mode === 'excerpt-error' && url.pathname.endsWith('/excerpts') && !url.searchParams.get('q')) return Response.json({ error: { code: 'UNAVAILABLE', message: 'Consulta indisponível' } }, { status: 503 });
    if (url.pathname === '/api/cross-references') return Response.json({ items: mode === 'empty' ? [] : relations, nextCursor: null });
    if (url.pathname === '/api/sources') return Response.json({ sources: mode === 'empty' ? [] : [source] });
    return Response.json({ excerpts: url.searchParams.get('q') ? [] : [excerpt] });
  }));
});
afterEach(() => { cleanup(); clients.forEach(c => c.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function mount(view: React.ReactNode) {
  const client = createQueryClient(); clients.push(client); client.setDefaultOptions({ queries: { retry: false } });
  return render(<QueryClientProvider client={client}><ToastProvider>{view}</ToastProvider></QueryClientProvider>);
}
it('loads authentic source metadata/excerpts, opens the full quote and sends trimmed filtering', async () => {
  mount(<SourcesView />); await screen.findByText(source.title);
  expect(screen.getByText(source.rightsStatement)).toBeInTheDocument();
  expect(screen.getByText(source.limitations)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Fonte Original' })).toHaveAttribute('href', source.originUrl);
  fireEvent.click(await screen.findByText(excerpt.locator));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText(`"${excerpt.text}"`)).toBeInTheDocument();
  expect(within(dialog).getByText(excerpt.textSha256)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Fechar' }));
  fireEvent.change(screen.getByPlaceholderText('Filtrar trechos...'), { target: { value: '  query-test  ' } });
  await screen.findByText('Nenhum trecho encontrado para a busca especificada.');
  expect(vi.mocked(fetch).mock.calls.some(([address]) => new URL(String(address)).searchParams.get('q') === 'query-test')).toBe(true);
});
it.each(['empty', 'error', 'pending'])('distinguishes source catalog state %s', async mode => {
  sourceMode = mode; mount(<SourcesView />);
  if (mode === 'empty') await screen.findByText('Nenhuma fonte histórica cadastrada no banco.');
  if (mode === 'error') await screen.findByText('Consulta indisponível');
  if (mode === 'pending') expect(screen.queryByText(source.title)).not.toBeInTheDocument();
});
it('distinguishes a failed excerpt request from an empty search and recovers without losing the source', async () => {
  sourceMode = 'excerpt-error'; mount(<SourcesView />); await screen.findByText(source.title);
  expect(await screen.findByRole('alert')).toHaveTextContent('Consulta indisponível');
  expect(screen.queryByText('Nenhum trecho encontrado para a busca especificada.')).not.toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText('Filtrar trechos...'), { target: { value: 'recover' } });
  await screen.findByText('Nenhum trecho encontrado para a busca especificada.');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument(); expect(screen.getByText(source.title)).toBeInTheDocument();
});
it('explicitly retries the same failed source query without clearing the selected source or changing the search', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let attempts = 0;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    if (new URL(String(address)).pathname.endsWith('/excerpts') && ++attempts === 1)
      return Response.json({ error: { code: 'UNAVAILABLE', message: 'Consulta indisponível' } }, { status: 503 });
    return original(address, options);
  });
  mount(<SourcesView />); await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  await screen.findByText(excerpt.locator); expect(screen.getByText(source.title)).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Filtrar trechos...')).toHaveValue('');
  const reads = vi.mocked(fetch).mock.calls.filter(([address]) => new URL(String(address)).pathname.endsWith('/excerpts'));
  expect(reads).toHaveLength(2); expect(reads[0][0]).toBe(reads[1][0]);
});
it.each(['success', 'failure'] as const)('does not overwrite a newer source search with an obsolete %s', async outcome => {
  const original = vi.mocked(fetch).getMockImplementation()!; let settle!: (response: Response) => void;
  const old = new Promise<Response>(resolve => { settle = resolve; });
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    const url = new URL(String(address));
    if (url.pathname.endsWith('/excerpts')) return url.searchParams.get('q') ? Response.json({ excerpts: [excerpts[1]] }) : old;
    return original(address, options);
  });
  mount(<SourcesView />); await screen.findByText(source.title);
  fireEvent.change(screen.getByPlaceholderText('Filtrar trechos...'), { target: { value: 'newer technical search' } });
  await screen.findByText(excerpts[1].locator);
  await act(async () => { settle(outcome === 'success' ? Response.json({ excerpts: [excerpt] }) : Response.json({ error: { code: 'UNAVAILABLE', message: 'Obsolete source error' } }, { status: 503 })); });
  expect(screen.getByText(excerpts[1].locator)).toBeInTheDocument(); expect(screen.queryByText(excerpt.locator)).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument(); expect(screen.queryByText('Obsolete source error')).not.toBeInTheDocument();
});
it('preserves every structured-study section, real passage text, limitations and explicit empty evidence states', () => {
  const kinds = ['immediate-context', 'book-argument', 'history-culture', 'authorship-audience-purpose', 'comparison', 'interpretations'] as const;
  const labels = ['1. Contexto Imediato', '2. Argumento do Livro', '3. História e Cultura', '4. Autoria, Destinatários e Propósito', '5. Comparação Textual', '6. Interpretações Comparadas'];
  const study = studyFixture({ passage: { ...studyFixture().passage, verses: canon.verses.map(row => ({ number: row.number, text: row.text })) },
    sections: kinds.map((kind, index) => ({ kind, status: index % 2 ? 'insufficient-evidence' : 'available', text: `Technical section ${kind}`, evidenceIds: [] })),
    limitations: [source.limitations] });
  mount(<StudyView study={study} onGenerate={vi.fn()} />);
  labels.forEach((label, index) => {
    const section = screen.getByRole('heading', { name: label }).closest('section')!;
    expect(within(section).getByText(index % 2 ? 'Evidência Insuficiente' : 'Evidência Documentada')).toBeInTheDocument();
    expect(within(section).queryByText('Fontes documentadas:')).not.toBeInTheDocument();
  });
  for (const verse of canon.verses) expect(screen.getByText(verse.text.trim())).toBeInTheDocument();
  expect(screen.getByText('Limitações do Estudo')).toBeInTheDocument(); expect(screen.getByText(source.limitations)).toBeInTheDocument();
  expect(screen.queryByText('Classificação Epistemológica de Interpretações')).not.toBeInTheDocument();
});
it('does not add empty limitations, interpretations or citations to a study and rejects a whitespace draft', () => {
  const generate = vi.fn(); mount(<StudyView study={studyFixture()} onGenerate={generate} />);
  expect(screen.queryByText('Limitações do Estudo')).not.toBeInTheDocument();
  expect(screen.queryByText('Classificação Epistemológica de Interpretações')).not.toBeInTheDocument();
  const input = screen.getByRole('textbox'); expect(input).toHaveValue('GEN 1:1-3');
  fireEvent.change(input, { target: { value: '   ' } }); const button = screen.getByRole('button', { name: 'Gerar Estudo' });
  expect(button).toBeDisabled(); fireEvent.click(button); expect(generate).not.toHaveBeenCalled();
});
it('displays structured study evidence, classifications and limitations without making a request', () => {
  const study = studyFixture({ sections: [
    { kind: 'immediate-context', status: 'available', text: 'Caso técnico disponível.', evidenceIds: [excerpt.id, 'missing-test-evidence'] },
    { kind: 'history-culture', status: 'insufficient-evidence', text: 'Não há prova adicional neste teste.', evidenceIds: [] },
  ], evidence: [evidence], interpretations: [{ classification: 'hypothesis', text: 'Hipótese técnica de teste.', evidenceIds: [] }], limitations: [source.limitations] });
  const generate = vi.fn(); mount(<StudyView study={study} onGenerate={generate} />);
  expect(screen.getByText('1. Contexto Imediato')).toBeInTheDocument();
  expect(screen.getByText('3. História e Cultura')).toBeInTheDocument();
  expect(screen.getByText('Hipótese técnica de teste.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: excerpt.id }));
  expect(within(screen.getByRole('dialog')).getByText(`"${excerpt.text}"`)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Ver Licença' })).toHaveAttribute('href', source.rightsUrl);
  fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
  fireEvent.click(screen.getByRole('button', { name: 'missing-test-evidence' }));
  expect(screen.getByText('Evidência não encontrada no estudo atual.')).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});
it('shows restricted study evidence without exposing a quote and preserves the explicit generation input', () => {
  const study = studyFixture({ sections: [{ kind: 'comparison', status: 'available', text: 'Caso técnico restrito.', evidenceIds: [excerpt.id] }], evidence: [{ ...evidence, quote: null, availability: 'restricted' }] });
  const generate = vi.fn(); mount(<StudyView study={study} onGenerate={generate} />);
  fireEvent.click(screen.getByRole('button', { name: excerpt.id }));
  expect(screen.getByRole('dialog').querySelector('blockquote')).toBeNull();
  expect(screen.getByText('Status: restricted')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '  GEN 2:7  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Gerar Estudo' })); expect(generate).toHaveBeenCalledWith('  GEN 2:7  ');
});
it.each(['supported', 'insufficient-evidence', 'restricted'] as const)('renders analysis status %s with honest evidence visibility', status => {
  const analysis = { ...analysisFixture(), status, evidence: [{ ...evidence, quote: excerpt.text, startOffset: 0, endOffset: excerpt.text.length }] };
  mount(<AnalysisResult analysis={analysis} />);
  expect(screen.getByText(`"${analysis.question}"`)).toBeInTheDocument();
  const labels = { supported: 'Evidência documentada', restricted: 'Acesso limitado', 'insufficient-evidence': 'Evidência insuficiente' };
  expect(screen.getByText(labels[status])).toBeInTheDocument();
  expect(screen.queryByText('Sem evidência documental nas fontes admitidas para esta pergunta.')).toBe(status === 'insufficient-evidence' ? screen.getByText('Sem evidência documental nas fontes admitidas para esta pergunta.') : null);
  expect(screen.queryByText('A política de acesso da fonte limita a apresentação desta resposta.')).toBe(status === 'restricted' ? screen.getByText('A política de acesso da fonte limita a apresentação desta resposta.') : null);
  if (status === 'supported') {
    expect(screen.getByText(excerpt.text)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Direitos da fonte' })).toHaveAttribute('href', source.rightsUrl);
  } else expect(screen.queryByText(excerpt.text)).not.toBeInTheDocument();
  expect(screen.getByText(analysis.limitations[0])).toBeInTheDocument();
  fireEvent.click(screen.getByText('Proveniência da resposta')); expect(screen.getByText(/0 tokens · 0 segmentos consultados/)).toBeInTheDocument();
});
it('does not render an executable rights URL', () => {
  mount(<AnalysisResult analysis={{ ...analysisFixture(), status: 'supported', limitations: [], evidence: [{ ...evidence, quote: excerpt.text, startOffset: 0, endOffset: excerpt.text.length, rightsUrl: 'javascript:alert(1)' }] }} />);
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(within(screen.getByRole('article')).queryByRole('list')).not.toBeInTheDocument();
});
it('retains an admitted HTTP rights URL and its safe external-link attributes', () => {
  mount(<AnalysisResult analysis={{ ...analysisFixture(), status: 'supported', evidence: [{ ...evidence, quote: excerpt.text, startOffset: 0, endOffset: excerpt.text.length, rightsUrl: 'http://example.test/rights' }] }} />);
  const link = screen.getByRole('link', { name: 'Direitos da fonte' });
  expect(link).toHaveAttribute('href', 'http://example.test/rights'); expect(link).toHaveAttribute('target', '_blank'); expect(link).toHaveAttribute('rel', 'noreferrer');
});
it.each([
  ['direct-citation', 'Citação Direta', 'high', 'Conexão Alta'],
  ['allusion', 'Alusão Textual', 'moderate', 'Conexão Moderada'],
  ['prophetic-fulfillment', 'Cumprimento Profético', 'traditional', 'Interpretação Tradicional'],
] as const)('preserves the %s relation classification and caveated assessment', async (type, label, assessment, assessmentLabel) => {
  relations = [{ ...relations[0], type, assessment }, { ...relations[0], id: secondStudyId }];
  mount(<CrossRefPanel reference="GEN 1:1" />);
  expect(await screen.findByText(label)).toBeInTheDocument();
  expect(screen.getByText(`Avaliação: ${assessmentLabel}`)).toBeInTheDocument(); expect(screen.getByText('2 conexões')).toBeInTheDocument();
  const request = vi.mocked(fetch).mock.calls.find(([url]) => new URL(String(url)).pathname === '/api/cross-references');
  expect(new URL(String(request![0])).searchParams.get('translationId')).toBe('porbr2018');
});
it('renders relation targets, caveated assessment and calls navigation only when selected', async () => {
  const navigate = vi.fn(); mount(<CrossRefPanel reference="GEN 1:1" onNavigateToPassage={navigate} />);
  fireEvent.click(await screen.findByRole('button', { name: 'GEN 1:2' })); expect(navigate).toHaveBeenCalledWith('GEN 1:2');
  expect(screen.getByText('Paralelo Temático')).toBeInTheDocument(); expect(screen.getByText('Avaliação: Debatida')).toBeInTheDocument();
  expect(screen.getByText(relations[0].rationale)).toBeInTheDocument(); expect(screen.getByText('0 evidência(s)')).toBeInTheDocument();
  expect(screen.getByText('1 conexão')).toBeInTheDocument();
});
it.each(['empty', 'error', 'pending'])('distinguishes cross-reference state %s', async mode => {
  crossMode = mode; mount(<CrossRefPanel reference="GEN 1:1" />);
  if (mode === 'empty') await screen.findByText('Nenhuma referência cruzada catalogada para esta passagem.');
  if (mode === 'error') await screen.findByText('Consulta indisponível');
  if (mode === 'pending') expect(screen.queryByRole('button', { name: 'GEN 1:2' })).not.toBeInTheDocument();
});
it('requires authentication before a reference query and shows account guidance for a private study', async () => {
  authenticated = false; mount(<><CrossRefPanel reference="GEN 1:1" /><StudyView onGenerate={vi.fn()} /></>);
  await waitFor(() => expect(screen.getByText('Entra no teu espaço de estudo')).toBeInTheDocument());
  expect(fetch).not.toHaveBeenCalled();
});
