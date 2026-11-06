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
  fireEvent.click(within(dialog).getByRole('button', { name: 'Fechar' }));
  await screen.findByText('Hipótese técnica de apresentação, não afirmação histórica.');
  fireEvent.click(screen.getByRole('button', { name: 'technical-missing-excerpt' }));
  await screen.findByText('Evidência não encontrada no estudo atual.');
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
