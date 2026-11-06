import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
const dependency = createRequire(import.meta.url);
const admittedExcerpts = dependency('../../backend/test/fixtures/ai-assistant/source-library/josephus-antiquities-pg2848-en-local-ai-v1/excerpts.json') as { id: string; text: string }[];
const { startSessionApi } = dependency('./support/session-api.cjs') as {
  startSessionApi: (options: { workflows: boolean }) => Promise<{ manualToken: (subject?: string) => Promise<string>; close: () => Promise<void> }>;
};
let api: Awaited<ReturnType<typeof startSessionApi>>;
test.use({ trace: 'off', screenshot: 'off', video: 'off' });
test.setTimeout(300000); // Real local CPU inference; no provider, HTTP or PG doubles.
test.beforeAll(async () => { test.setTimeout(300000); api = await startSessionApi({ workflows: true }); });
test.afterAll(async () => { await api?.close(); });

test('persists study versions, note CAS, favorites and real local conversation through the UI', async ({ page }, info) => {
  page.setDefaultTimeout(15000);
  const owner = `workflow-${randomUUID()}`, token = await api.manualToken(owner);
  const headers = { Authorization: `Bearer ${token}` };
  const mobile = info.project.name === 'Mobile Chrome';
  const navigate = async (name: string) => {
    if (mobile) await page.getByRole('button', { name: 'Abrir Menu' }).click();
    await page.getByRole('button', { name, exact: true }).click();
  };
  const openPanel = async () => {
    if (!await page.getByRole('tab', { name: 'Anotações' }).isVisible()) await page.getByRole('button', { name: 'Abrir Painel Contextual de IA' }).click();
  };
  const closePanel = async () => {
    if (mobile) await page.getByRole('dialog').getByRole('button', { name: 'Fechar', exact: true }).click();
  };
  let studyId: string | undefined;
  try {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Gênesis 1', exact: true })).toBeVisible();
    if (mobile) { await page.getByRole('button', { name: 'Abrir Menu' }).click(); await page.getByRole('button', { name: 'Conta e acesso' }).click(); }
    else await page.getByRole('button', { name: 'Entrar na conta' }).click();
    await page.getByText('Usar um token local', { exact: true }).click();
    await page.getByLabel('Token de acesso local').fill(token);
    await page.getByRole('button', { name: 'Confirmar acesso local' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await navigate('Estudo Estruturado');
    await page.getByLabel('Referência do estudo').fill('GEN 1:1');
    const created = page.waitForResponse(response => new URL(response.url()).pathname === '/api/studies' && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Gerar Estudo' }).click();
    const creation = await created; expect(creation.status()).toBe(201); studyId = (await creation.json()).id;
    await expect(page.getByText('Versão 1', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Criar nova versão' }).click();
    await expect(page.getByText('Versão 2', { exact: true })).toBeVisible();
    await openPanel(); await page.getByRole('tab', { name: 'Anotações' }).click();
    await page.getByLabel('Nova anotação').fill('Nota técnica da prova S10-T006; não é evidência histórica.');
    await page.getByRole('button', { name: 'Salvar anotação' }).click();
    await expect(page.getByText('Anotação guardada.', { exact: true })).toBeVisible();
    const notes = await page.request.get(`/api/workspace/studies/${studyId}/notes?studyVersion=2`, { headers });
    expect(notes.status()).toBe(200); const note = (await notes.json()).items[0]; expect(note.studyVersion).toBe(2);
    await closePanel(); await navigate('Histórico & Workspace');
    await page.getByRole('button', { name: 'Marcar favorito' }).click();
    await expect(page.getByRole('button', { name: 'Remover favorito' })).toBeVisible();
    await page.getByRole('button', { name: 'Anotações Pessoais' }).click();
    await page.getByLabel('Selecione o Estudo para Consultar ou Criar Notas:').selectOption(studyId!);
    await page.getByRole('button', { name: 'Editar Nota (CAS)' }).click();
    const remoteRevision = await page.request.patch(`/api/workspace/notes/${note.id}`, { headers, data: { expectedRevision: 1, content: 'Revisão técnica concorrente.' } });
    expect(remoteRevision.status()).toBe(200);
    await page.getByLabel('Rascunho da anotação').fill('Rascunho técnico preservado em conflito.');
    await page.getByRole('button', { name: 'Salvar Revisão' }).click();
    await expect(page.getByRole('button', { name: 'Carregar revisão atual' })).toBeVisible();
    await expect(page.getByLabel('Rascunho da anotação')).toHaveValue('Rascunho técnico preservado em conflito.');
    await page.getByRole('button', { name: 'Carregar revisão atual' }).click();
    await page.getByRole('button', { name: 'Salvar Revisão' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    const revised = await page.request.get(`/api/workspace/studies/${studyId}/notes?studyVersion=2`, { headers });
    expect((await revised.json()).items[0]).toMatchObject({ revision: 3, content: 'Rascunho técnico preservado em conflito.' });
    await page.getByRole('button', { name: /^Favoritos \(/ }).click();
    await page.getByRole('button', { name: 'Abrir', exact: true }).click();
    await expect(page.getByText('Versão 2', { exact: true })).toBeVisible();
    await openPanel(); await page.getByRole('tab', { name: 'Assistente IA' }).click();
    await page.getByRole('button', { name: 'Nova conversa' }).click();
    await expect(page.getByLabel('Pergunta na conversa')).toBeVisible();
    await page.getByLabel('Pergunta na conversa').fill('What does Josephus say about the Sabbath?');
    const turnResponse = page.waitForResponse(response => /\/conversations\/[^/]+\/turns$/.test(new URL(response.url()).pathname), { timeout: 240000 });
    await page.getByRole('button', { name: 'Enviar na conversa' }).click();
    const completed = await turnResponse;
    expect(completed.status()).toBe(201);
    const conversation = await completed.json(); expect(conversation.revision).toBe(1);
    const analysis = conversation.turns[0].analysis;
    expect(analysis.provenance.runtimeVersion).toBeTruthy(); expect(analysis.provenance.totalTokens).toBeGreaterThan(0);
    expect(['supported', 'insufficient-evidence', 'restricted']).toContain(analysis.status);
    for (const citation of analysis.evidence) {
      const source = admittedExcerpts.find(excerpt => excerpt.id === citation.excerptId);
      expect(source).toBeDefined(); expect(Array.from(source!.text).slice(citation.startOffset, citation.endOffset).join('')).toBe(citation.quote);
    }
    const analysisPath = info.outputPath('native-analysis.json');
    writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
    await info.attach('native-analysis.json', { path: analysisPath, contentType: 'application/json' });
    await expect(page.getByText('What does Josephus say about the Sabbath?', { exact: true })).toBeVisible();
    const other = await api.manualToken(`other-${randomUUID()}`);
    expect((await page.request.get(`/api/conversations/${conversation.id}`, { headers: { Authorization: `Bearer ${other}` } })).status()).toBe(404);
    await closePanel(); await navigate('Bíblia'); await navigate('Estudo Estruturado'); await openPanel();
    await page.getByRole('button', { name: /Abrir conversa 1/ }).click();
    await expect(page.getByText('What does Josephus say about the Sabbath?', { exact: true })).toBeVisible();
    await page.screenshot({ path: info.outputPath('conversation-real.png') });
    await page.getByRole('button', { name: 'Eliminar conversa' }).click();
    await page.getByRole('button', { name: 'Confirmar eliminação da conversa' }).click();
    await expect(page.getByText('Conversa eliminada.', { exact: true })).toBeVisible();
    await closePanel(); await navigate('Histórico & Workspace');
    await page.getByRole('button', { name: 'Excluir estudo' }).click();
    await page.getByRole('button', { name: 'Excluir definitivamente' }).click();
    await expect(page.getByText('Estudo e dados associados eliminados.', { exact: true })).toBeVisible();
    const gone = await page.request.get(`/api/studies/${studyId}`, { headers }); expect(gone.status()).toBe(404);
    console.info(JSON.stringify({ component: 'native-workflows', viewport: info.project.name, database: 'biblia_test', studyVersions: 2, noteRevision: 3, conversationTurns: 1, analysisStatus: analysis.status, realRuntime: analysis.provenance.runtimeVersion, isolatedOwner: true, deletedOwnStudy: true }));
    studyId = undefined;
  } finally {
    if (studyId) { const removed = await fetch(`http://127.0.0.1:32123/workspace/studies/${studyId}`, { method: 'DELETE', headers, signal: AbortSignal.timeout(15000) }); expect([204, 404]).toContain(removed.status); }
  }
});
