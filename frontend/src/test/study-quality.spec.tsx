import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { StudyView } from '../features/studies/study-view';
import { ToastProvider } from '../shared/ui/toast';
import { studyFixture, studyId } from './workflow-fixtures';
import { evidence, excerptId } from './evidence-fixtures';
let authenticated = true, creationFails = false, revisionFails = false;
const clients: QueryClient[] = [];
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: authenticated, token: authenticated ? 'technical-token' : null }) }));
const enriched = () => studyFixture({ evidence: [evidence], sections: [
  { kind: 'history-culture', status: 'available', text: 'Fixture técnica: texto da fonte para leitura.', evidenceIds: [excerptId] },
  { kind: 'comparison', status: 'insufficient-evidence', text: 'Fixture técnica: secção sem evidência.', evidenceIds: ['technical-missing-excerpt'] },
], interpretations: [{ classification: 'hypothesis', text: 'Hipótese técnica de apresentação, não afirmação histórica.', evidenceIds: [] }], limitations: ['Fixture técnica; não representa consenso histórico.'] });
beforeEach(() => {
  authenticated = true; creationFails = false; revisionFails = false;
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const parsed = new URL(url);
    if (parsed.pathname.endsWith('/versions')) return revisionFails
      ? Response.json({ error: { code: 'STUDY_CONFLICT', message: 'Versão alterada.' } }, { status: 409 }) : Response.json(enriched());
    if (parsed.pathname === '/api/studies' && creationFails) return Response.json({ error: { code: 'UNAVAILABLE', message: 'Criação indisponível.' } }, { status: 503 });
    return Response.json({ ...enriched(), version: parsed.pathname === `/api/studies/${studyId}` && !parsed.searchParams.has('version') ? 4 : 3 });
  }));
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function mount(saved = true) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); clients.push(client);
  const change = vi.fn();
  render(<QueryClientProvider client={client}><ToastProvider><StudyView activeStudyId={saved ? studyId : undefined} activeStudyVersion={saved ? 3 : undefined} onStudyChange={change} /></ToastProvider></QueryClientProvider>);
  return change;
}
it('opens evidence with its rights and digest, preserves epistemic labels, and reports a missing reference', async () => {
  mount(); fireEvent.click(await screen.findByRole('button', { name: excerptId }));
  const dialog = screen.getByRole('dialog'); expect(within(dialog).getByRole('link', { name: 'Ver Licença' })).toHaveAttribute('href', evidence.rightsUrl);
  expect(within(dialog).getByText(evidence.rightsStatement)).toBeInTheDocument();
  expect(within(dialog).getByText(`SHA-256: ${evidence.textSha256.slice(0, 24)}...`)).toBeInTheDocument();
  expect(within(dialog).getByText(`"${evidence.quote}"`)).toBeInTheDocument();
  expect(within(dialog).getByText(evidence.locator)).toBeInTheDocument();
  expect(within(dialog).getByText(`Status: ${evidence.availability}`)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Fechar' }));
  await screen.findByText('Hipótese técnica de apresentação, não afirmação histórica.');
  expect(screen.getByRole('heading', { name: '3. História e Cultura' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '5. Comparação Textual' })).toBeInTheDocument();
  const available = screen.getByRole('heading', { name: '3. História e Cultura' }).closest('section')!;
  const insufficient = screen.getByRole('heading', { name: '5. Comparação Textual' }).closest('section')!;
  expect(within(available).getByText('Evidência Documentada')).toBeInTheDocument();
  expect(within(available).queryByText('Evidência Insuficiente')).not.toBeInTheDocument();
  expect(within(insufficient).getByText('Evidência Insuficiente')).toBeInTheDocument();
  expect(screen.getByText('Limitações do Estudo')).toBeInTheDocument();
  expect(screen.getByText('Fixture técnica; não representa consenso histórico.')).toBeInTheDocument();
  expect(screen.getByText(studyFixture().passage.verses[0].text.trim())).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Carregar versão atual' })).not.toBeInTheDocument();
  expect(screen.queryByText('Sessão do Operador Necessária')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'technical-missing-excerpt' }));
  await screen.findByText('Evidência não encontrada no estudo atual.');
});
it('omits empty evidence, interpretation and limitation sections rather than implying information exists', async () => {
  vi.mocked(fetch).mockResolvedValue(Response.json(studyFixture({ sections: [{ kind: 'immediate-context', status: 'insufficient-evidence', text: 'Fixture técnica sem contexto.', evidenceIds: [] }] })));
  mount(); await screen.findByText('Versão 3');
  expect(screen.getByRole('heading', { name: '1. Contexto Imediato' })).toBeInTheDocument();
  expect(screen.queryByText('Fontes documentadas:')).not.toBeInTheDocument();
  expect(screen.queryByText('Classificação Epistemológica de Interpretações')).not.toBeInTheDocument();
  expect(screen.queryByText('Limitações do Estudo')).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('keeps the study input after a failed creation and permits an explicit successful retry', async () => {
  mount(false); creationFails = true;
  fireEvent.change(screen.getByLabelText('Referência do estudo'), { target: { value: 'GEN 1:1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Gerar Estudo' })); await screen.findByText('Erro ao gerar estudo');
  expect(screen.getByLabelText('Referência do estudo')).toHaveValue('GEN 1:1');
  creationFails = false; fireEvent.click(screen.getByRole('button', { name: 'Gerar Estudo' })); await screen.findByText('Versão 3');
});
it('does not retry a version conflict and offers reading the actual latest version', async () => {
  revisionFails = true; const change = mount(); await screen.findByText('Versão 3');
  fireEvent.click(screen.getByRole('button', { name: 'Criar nova versão' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Carregar versão atual' }));
  await screen.findByText('Versão 4');
  expect(vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes('/versions'))).toHaveLength(1);
  await waitFor(() => expect(change).toHaveBeenCalledWith(expect.objectContaining({ version: 4 })));
});
it('explains access requirements and refuses an unauthenticated write', async () => {
  authenticated = false; mount(false); await screen.findByText('Sessão do Operador Necessária');
  fireEvent.click(screen.getByRole('button', { name: 'Gerar Estudo' })); await screen.findByText('Autenticação necessária');
  expect(fetch).not.toHaveBeenCalled();
});
