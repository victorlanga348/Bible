import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const dependency = createRequire(import.meta.url);
const { startWorkflowApi } = dependency('./support/workflow-api.cjs') as {
  startWorkflowApi: (options?: { index?: boolean }) => Promise<{
    owner: string; token: () => Promise<string>; otherToken: () => Promise<string>;
    query: (sql: string, values: unknown[]) => Promise<unknown[]>; close: () => Promise<void>;
    turns: { completed: boolean; closed: boolean }[]; runtimeLocks: () => boolean;
  }>;
};
let api: Awaited<ReturnType<typeof startWorkflowApi>>;

test('opens and closes the contextual assistant on a narrow screen', async ({ page }, info) => {
  test.skip(info.project.name !== 'Mobile Chrome');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Abrir Painel Contextual de IA' }).click();
  await expect(page.getByRole('complementary', { name: 'Painel de Investigação e IA' })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar Painel Contextual de IA' }).click();
  await expect(page.getByRole('complementary')).not.toBeVisible();
});

test.describe('native browser → API → PostgreSQL workflows', () => {
  test.beforeAll(async () => {
    if (process.env.S10_NATIVE_AI === '1') test.setTimeout(720000);
    api = await startWorkflowApi({ index: process.env.S10_NATIVE_AI === '1' });
  });
  test.afterAll(async () => { await api?.close(); });

  test('persists versions, notes and favorites and deletes only the selected owner’s study', async ({ page }, info) => {
    const mobile = info.project.name === 'Mobile Chrome';
    const navigate = async (name: string) => {
      if (mobile) await page.getByRole('button', { name: 'Abrir Menu' }).click();
      await page.getByRole('button', { name, exact: true }).click();
    };
    const headers = { authorization: `Bearer ${await api.token()}` };
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    if (mobile) {
      await page.getByRole('button', { name: 'Abrir Menu' }).click();
      await page.getByRole('button', { name: 'Conta e acesso' }).click();
    } else await page.getByRole('button', { name: 'Entrar na conta' }).click();
    await page.getByText('Usar um token local', { exact: true }).click();
    await page.getByLabel('Token de acesso local').fill(await api.token());
    await page.getByRole('button', { name: 'Confirmar acesso local' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gênesis 1' })).toBeVisible();
    const created = page.waitForResponse(r => new URL(r.url()).pathname === '/api/studies' && r.request().method() === 'POST');
    await page.getByText('No princípio criou Deus os céus e a terra.', { exact: true }).click();
    await page.getByRole('button', { name: 'Estudar Passagem', exact: true }).click();
    expect((await created).status()).toBe(201);
    const study = await (await created).json();
    await expect(page.getByText('Versão 1', { exact: true })).toBeVisible();
    const revised = page.waitForResponse(r => new URL(r.url()).pathname === `/api/studies/${study.id}/versions` && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Criar nova versão' }).click();
    expect((await revised).status()).toBe(201);
    await expect(page.getByText('Versão 2', { exact: true })).toBeVisible();
    await navigate('Histórico & Workspace');
    await page.getByTitle('Marcar favorito').click();
    await expect(page.getByTitle('Remover favorito')).toBeVisible();
    await page.getByRole('button', { name: 'Anotações Pessoais' }).click();
    await expect(page.getByLabel('Selecione o Estudo para Consultar ou Criar Notas:')).toHaveValue(`${study.id}:2`);
    const content = `Nota pessoal de teste ${api.owner}\nSegunda linha`;
    await page.getByRole('textbox', { name: 'Nova anotação' }).fill(content);
    const noteSaved = page.waitForResponse(r => new URL(r.url()).pathname === `/api/workspace/studies/${study.id}/notes` && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Adicionar Nota' }).click();
    expect((await noteSaved).status()).toBe(201);
    const note = await (await noteSaved).json();
    await expect(page.getByText('Revisão r1 · estudo v2')).toBeVisible();
    expect((await (await page.request.get(`/api/workspace/studies/${study.id}/notes?studyVersion=2`, { headers })).json()).items[0].content).toBe(content);
    expect(note.studyVersion).toBe(2);
    await page.getByTitle('Editar nota').click();
    const draft = page.getByRole('textbox', { name: 'Conteúdo da anotação' });
    await draft.fill('Rascunho pessoal a conservar após conflito.');
    const concurrent = await page.request.patch(`/api/workspace/notes/${note.id}`, {
      headers, data: { expectedRevision: 1, content: 'Outra revisão pessoal guardada.' },
    });
    expect(concurrent.status()).toBe(200);
    const conflict = page.waitForResponse(r => new URL(r.url()).pathname === `/api/workspace/notes/${note.id}` && r.request().method() === 'PATCH');
    await page.getByRole('button', { name: 'Salvar Revisão' }).click();
    expect((await conflict).status()).toBe(409);
    await expect(draft).toHaveValue('Rascunho pessoal a conservar após conflito.');
    await page.getByRole('button', { name: 'Carregar revisão atual' }).click();
    await expect(draft).toHaveValue('Outra revisão pessoal guardada.');
    await draft.fill('Revisão pessoal confirmada após consulta.');
    const reconciled = page.waitForResponse(r => new URL(r.url()).pathname === `/api/workspace/notes/${note.id}` && r.request().method() === 'PATCH');
    await page.getByRole('button', { name: 'Salvar Revisão' }).click();
    expect((await reconciled).status()).toBe(200);
    await expect(page.getByRole('dialog')).not.toBeVisible();
    expect((await (await page.request.get(`/api/workspace/studies/${study.id}/notes?studyVersion=2`, { headers })).json()).items[0].revision).toBe(3);
    await page.getByRole('button', { name: /^Favoritos/ }).click();
    const read = page.waitForResponse(r => new URL(r.url()).pathname === `/api/studies/${study.id}` && new URL(r.url()).searchParams.get('version') === '2');
    await page.getByRole('button', { name: 'Abrir favorito GEN 1:1 versão 2' }).click();
    expect((await read).status()).toBe(200);
    await expect(page.getByText('Versão 2', { exact: true })).toBeVisible();
    if (mobile) await page.getByRole('button', { name: 'Abrir Painel Contextual de IA' }).click();
    const conversationCreated = page.waitForResponse(r => new URL(r.url()).pathname === `/api/studies/${study.id}/conversations` && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Nova conversa' }).click();
    expect((await conversationCreated).status()).toBe(201);
    const conversation = await (await conversationCreated).json();
    await page.getByRole('button', { name: 'Atualizar conversa' }).click();
    await expect(page.getByText('0/20 turnos', { exact: true })).toBeVisible();
    expect((await page.request.get(`/api/conversations/${conversation.id}`, { headers })).status()).toBe(200);
    await page.getByRole('button', { name: 'Eliminar conversa', exact: true }).click();
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    expect((await page.request.get(`/api/conversations/${conversation.id}`, { headers })).status()).toBe(200);
    await page.getByRole('button', { name: 'Eliminar conversa', exact: true }).click();
    const conversationDeleted = page.waitForResponse(r => new URL(r.url()).pathname === `/api/conversations/${conversation.id}` && r.request().method() === 'DELETE');
    await page.getByRole('button', { name: 'Confirmar eliminação da conversa' }).click();
    expect((await conversationDeleted).status()).toBe(204);
    expect(await api.query('SELECT id FROM app.ai_conversation WHERE id = $1::uuid', [conversation.id])).toEqual([]);
    if (mobile) await page.getByRole('button', { name: 'Fechar Painel Contextual de IA' }).click();
    const other = { authorization: `Bearer ${await api.otherToken()}` };
    expect((await page.request.get(`/api/studies/${study.id}`, { headers: other })).status()).toBe(404);
    expect((await page.request.delete(`/api/workspace/studies/${study.id}`, { headers: other })).status()).toBe(404);
    expect((await page.request.get(`/api/studies/${study.id}`, { headers })).status()).toBe(200);
    expect(await api.query('SELECT number::int AS number FROM app.study_version WHERE study_id = $1::uuid ORDER BY number', [study.id])).toEqual([{ number: 1 }, { number: 2 }]);
    await navigate('Histórico & Workspace');
    await page.getByRole('button', { name: 'Eliminar estudo GEN 1:1 versão 2' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const deleted = page.waitForResponse(r => new URL(r.url()).pathname === `/api/workspace/studies/${study.id}` && r.request().method() === 'DELETE');
    await page.getByRole('button', { name: 'Eliminar estudo', exact: true }).click();
    expect((await deleted).status()).toBe(204);
    expect(await api.query('SELECT id FROM app.study_record WHERE id = $1::uuid', [study.id])).toEqual([]);
    expect(await api.query('SELECT id FROM app.workspace_note WHERE study_id = $1::uuid', [study.id])).toEqual([]);
    expect(await api.query('SELECT id FROM app.workspace_favorite WHERE study_id = $1::uuid', [study.id])).toEqual([]);
  });

  test('executes one native model turn and cancels the next operation through the browser', async ({ page }, info) => {
    test.skip(process.env.S10_NATIVE_AI !== '1' || info.project.name !== 'chromium', 'Explicit native-model run; never replace with static output');
    test.setTimeout(720000);
    const token = await api.token(); const headers = { authorization: `Bearer ${token}` };
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Entrar na conta' }).click();
    await page.getByText('Usar um token local', { exact: true }).click();
    await page.getByLabel('Token de acesso local').fill(token);
    await page.getByRole('button', { name: 'Confirmar acesso local' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.getByRole('button', { name: 'Estudo Estruturado', exact: true }).click();
    await page.getByRole('textbox', { name: 'Passagem do estudo' }).fill('GEN 2:7');
    const created = page.waitForResponse(r => new URL(r.url()).pathname === '/api/studies' && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Gerar Estudo' }).click();
    expect((await created).status()).toBe(201); const study = await (await created).json();
    const question = 'Segundo a fonte, por que o primeiro homem é chamado Adam?'; // Existing native case C01-T01.
    const field = page.getByRole('textbox', { name: /Pergunta investigativa/ });
    await field.fill(question);
    const response = page.waitForResponse(r => /\/api\/conversations\/[a-f0-9-]+\/turns$/.test(new URL(r.url()).pathname) && r.request().method() === 'POST', { timeout: 650000 });
    await page.getByRole('button', { name: 'Enviar pergunta' }).click();
    const result = await response; expect(result.status()).toBe(201);
    const conversation = await result.json(), analysis = conversation.turns[0].analysis;
    writeFileSync(info.outputPath('native-analysis.json'), JSON.stringify(analysis, null, 2) + '\n');
    expect(analysis.status).toBe('supported'); expect(analysis.provenance.totalTokens).toBeGreaterThan(0);
    expect(analysis.provenance.embeddingPromptTokens).toBeGreaterThan(0); expect(analysis.provenance.modelSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(analysis.provenance.consultedSegments.length).toBeGreaterThan(0);
    expect(analysis.evidence).toHaveLength(1);
    for (const evidence of analysis.evidence) {
      const original = await page.request.get(`/api/source-excerpts/${evidence.excerptId}`, { headers });
      expect(original.status()).toBe(200); const source = await original.json();
      expect(evidence.quote.length).toBeGreaterThan(0);
      expect(Array.from(source.excerpt.text).slice(evidence.startOffset, evidence.endOffset).join('')).toBe(evidence.quote);
      expect(evidence.attribution).toBe(source.source.attribution);
      expect(evidence.rightsStatement).toBe(source.source.rightsStatement);
      await expect(page.getByText(evidence.quote, { exact: true })).toBeVisible();
    }
    expect((await (await page.request.get(`/api/conversations/${conversation.id}`, { headers })).json()).revision).toBe(1);
    await expect.poll(() => api.runtimeLocks(), { timeout: 30000 }).toBe(false);
    await field.fill('Na mesma fonte, e o nome Eve?');
    await page.getByRole('button', { name: 'Enviar pergunta' }).click();
    await expect.poll(() => api.turns.length, { timeout: 15000 }).toBe(2);
    await expect.poll(() => api.runtimeLocks(), { timeout: 30000 }).toBe(true);
    await page.getByRole('button', { name: 'Cancelar pedido' }).click();
    await expect(page.getByText('Pedido interrompido. Atualiza a conversa para confirmar o que ficou guardado.')).toBeVisible();
    await expect.poll(() => api.turns[1].closed, { timeout: 30000 }).toBe(true);
    expect(api.turns[1].completed).toBe(false);
    await expect.poll(() => api.runtimeLocks(), { timeout: 30000 }).toBe(false);
    await page.getByRole('button', { name: 'Atualizar conversa' }).click();
    await expect(page.getByText('1/20 turnos', { exact: true })).toBeVisible();
    expect((await (await page.request.get(`/api/conversations/${conversation.id}`, { headers })).json()).revision).toBe(1);
    expect((await page.request.delete(`/api/workspace/studies/${study.id}`, { headers })).status()).toBe(204);
  });
});
