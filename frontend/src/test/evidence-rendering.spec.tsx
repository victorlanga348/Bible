import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import manifest from './fixtures/source-manifest.json';
import excerpts from './fixtures/source-excerpts.json';
import { SourcesView } from '../features/sources/sources-view';
import { StudyView } from '../features/studies/study-view';
import { CrossRefPanel } from '../features/cross-ref/cross-ref-panel';
import { AnalysisResult } from '../features/assistant/analysis-result';
import { ToastProvider } from '../shared/ui/toast';
import { createQueryClient } from '../shared/api/query-client';
import { analysisFixture, reference, studyFixture, studyId, createdAt } from './workflow-fixtures';
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
