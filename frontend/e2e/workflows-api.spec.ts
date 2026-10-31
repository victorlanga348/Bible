import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const dependency = createRequire(import.meta.url);
const { startWorkflowApi } = dependency('./support/workflow-api.cjs') as {
  startWorkflowApi: (options?: { index?: boolean }) => Promise<{
    owner: string; token: () => Promise<string>; otherToken: () => Promise<string>;
    query: (sql: string, values: unknown[]) => Promise<unknown[]>; close: () => Promise<void>;
    turns: { completed: boolean; closed: boolean }[]; runtimeLocks: () => boolean;
    nativeChildren: () => Promise<number[]>;
    rpcEvents: Record<string, unknown>[];
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
  test.afterEach(() => {
    if (process.env.S10_NATIVE_TRACE !== '1' || !api) return;
    const info = test.info();
    const observation = { status: info.status, expectedStatus: info.expectedStatus, stages: api.rpcEvents };
    writeFileSync(info.outputPath('native-rpc-stages.json'), JSON.stringify(observation, null, 2) + '\n');
    console.info(JSON.stringify({ component: 'native-browser-rpc-stages', status: info.status,
      stages: api.rpcEvents.map(({ endpoint, status, errorCode, headersAfterMs, failedAfterMs }) => ({ endpoint, status, errorCode, headersAfterMs, failedAfterMs })) }));
  });

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
    await expect(page.getByRole('button', { name: 'MD', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'MD', exact: true })).toHaveCSS('font-weight', '600');
    await page.getByRole('button', { name: 'SM', exact: true }).click();
    await expect(page.getByRole('button', { name: 'SM', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'SM', exact: true })).toHaveCSS('font-weight', '600');
    await expect(page.getByRole('button', { name: 'MD', exact: true })).toHaveCSS('font-weight', '500');
    await page.getByRole('button', { name: 'MD', exact: true }).click();
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
    await page.screenshot({ path: info.outputPath('study.png') });
    console.info(JSON.stringify({ component: 'native-study-layout', project: info.project.name,
      main: await page.getByRole('main').evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth })) }));
    await navigate('Histórico & Workspace');
    await expect(page.getByRole('button', { name: /Estudos Recentes/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /Estudos Recentes/ })).toHaveCSS('font-weight', '600');
    await page.getByTitle('Marcar favorito').click();
    await expect(page.getByTitle('Remover favorito')).toBeVisible();
    await page.getByRole('button', { name: 'Anotações Pessoais' }).click();
    await expect(page.getByRole('button', { name: 'Anotações Pessoais' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Anotações Pessoais' })).toHaveCSS('font-weight', '600');
    await expect(page.getByRole('button', { name: /Estudos Recentes/ })).toHaveAttribute('aria-pressed', 'false');
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
    await page.screenshot({ path: info.outputPath('favorites.png') });
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

  test('reads the admitted source and quotation through the public library UI', async ({ page }, info) => {
    const catalog = await page.request.get('/api/sources'); expect(catalog.status()).toBe(200);
    const source = (await catalog.json()).sources[0];
    const listing = await page.request.get(`/api/sources/${source.id}/excerpts?limit=20`); expect(listing.status()).toBe(200);
    const excerpt = (await listing.json()).excerpts[0];
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    if (info.project.name === 'Mobile Chrome') await page.getByRole('button', { name: 'Abrir Menu' }).click();
    await page.getByRole('button', { name: 'Fontes Históricas', exact: true }).click();
    await expect(page.getByRole('heading', { name: source.title, exact: true })).toBeVisible();
    await expect(page.getByText(source.rightsStatement, { exact: true })).toBeVisible();
    await page.getByText(excerpt.locator, { exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('blockquote')).toHaveText(`"${excerpt.text}"`);
    await expect(dialog.locator('code')).toHaveText(excerpt.textSha256);
    const bounds = await dialog.boundingBox(); expect(bounds).not.toBeNull();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    await page.screenshot({ path: info.outputPath('source-quote.png') });
    await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();
    const search = page.getByPlaceholder('Filtrar trechos...');
    await search.fill('__technical_unmatched_s10_68cc3fed__');
    await expect(page.getByText('Nenhum trecho encontrado para a busca especificada.')).toBeVisible();
    await search.fill(''); await expect(page.getByText(excerpt.locator, { exact: true })).toBeVisible();
  });

  test('isolates the persisted workspace and active study when the browser changes owner', async ({ page }, info) => {
    const mobile = info.project.name === 'Mobile Chrome';
    const firstToken = await api.token(), secondToken = await api.otherToken();
    const firstHeaders = { authorization: `Bearer ${firstToken}` }, secondHeaders = { authorization: `Bearer ${secondToken}` };
    const create = await page.request.post('/api/studies', { headers: firstHeaders, data: { translationId: 'porbr2018', reference: 'GEN 1:1' } });
    expect(create.status()).toBe(201); const study = await create.json();
    const privateNote = `Nota privada de teste ${api.owner}.`;
    const note = await page.request.post(`/api/workspace/studies/${study.id}/notes`, { headers: firstHeaders, data: { studyVersion: 1, content: privateNote } });
    expect(note.status()).toBe(201);
    const account = async () => {
      if (mobile) {
        await page.getByRole('button', { name: 'Abrir Menu' }).click();
        await page.getByRole('button', { name: 'Conta e acesso' }).click();
      } else await page.getByRole('button', { name: /Entrar na conta|Gerir conta/ }).click();
    };
    const login = async (token: string) => {
      await account(); await page.getByText('Usar um token local', { exact: true }).click();
      await page.getByLabel('Token de acesso local').fill(token);
      await page.getByRole('button', { name: 'Confirmar acesso local' }).click(); await expect(page.getByRole('dialog')).not.toBeVisible();
    };
    const workspace = async () => {
      if (mobile) await page.getByRole('button', { name: 'Abrir Menu' }).click();
      await page.getByRole('button', { name: 'Histórico & Workspace', exact: true }).click();
    };
    await page.goto('/', { waitUntil: 'domcontentloaded' }); await login(firstToken); await workspace();
    await page.getByRole('article').filter({ hasText: 'GEN 1:1' }).getByRole('button', { name: 'Abrir', exact: true }).click();
    await expect(page.getByText('Versão 1', { exact: true })).toBeVisible();
    await workspace(); await page.getByRole('button', { name: 'Anotações Pessoais' }).click();
    await expect(page.getByLabel('Selecione o Estudo para Consultar ou Criar Notas:')).toHaveValue(`${study.id}:1`);
    await expect(page.getByText(privateNote, { exact: true })).toBeVisible();
    await account(); await page.getByRole('button', { name: 'Sair da conta' }).click();
    await expect(page.locator('body')).not.toContainText(privateNote);
    await login(secondToken); await workspace();
    await expect(page.getByText('Nenhum estudo persistido ainda no workspace.')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(privateNote);
    await page.getByRole('button', { name: 'Anotações Pessoais' }).click();
    await expect(page.getByLabel('Selecione o Estudo para Consultar ou Criar Notas:')).toHaveValue('');
    await expect(page.getByText('Estudo Não Selecionado', { exact: true })).toHaveCount(1);
    expect((await page.request.get(`/api/studies/${study.id}`, { headers: secondHeaders })).status()).toBe(404);
    expect((await page.request.get(`/api/studies/${study.id}`, { headers: firstHeaders })).status()).toBe(200);
    expect((await page.request.delete(`/api/workspace/studies/${study.id}`, { headers: firstHeaders })).status()).toBe(204);
    expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([]);
  });

  test('preserves a second conversation draft after a real deletion response arrives late', async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium');
    const token = await api.token(), headers = { authorization: `Bearer ${token}` };
    const created = await page.request.post('/api/studies', { headers, data: { translationId: 'porbr2018', reference: 'GEN 1:1' } });
    expect(created.status()).toBe(201); const study = await created.json();
    let releaseResponse!: () => void;
    const delivery = new Promise<void>(resolve => { releaseResponse = resolve; });
    try {
      const conversations = [];
      for (let index = 0; index < 2; index++) {
        const response = await page.request.post(`/api/studies/${study.id}/conversations`, { headers, data: { studyVersion: 1 } });
        expect(response.status()).toBe(201); conversations.push(await response.json());
      }
      const [first, second] = conversations;
      let observedDeletion!: (status: number) => void;
      const deletedAtServer = new Promise<number>(resolve => { observedDeletion = resolve; });
      await page.route(`**/api/conversations/${first.id}`, async route => {
        if (route.request().method() !== 'DELETE') { await route.continue(); return; }
        // Real proxy/Nest/PostgreSQL deletion. Delay only delivery of its actual response.
        const response = await route.fetch(); observedDeletion(response.status());
        await delivery; await route.fulfill({ response });
      });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: 'Entrar na conta' }).click();
      await page.getByText('Usar um token local', { exact: true }).click();
      await page.getByLabel('Token de acesso local').fill(token); await page.getByRole('button', { name: 'Confirmar acesso local' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await page.getByRole('button', { name: 'Histórico & Workspace', exact: true }).click();
      await page.getByRole('button', { name: 'Abrir', exact: true }).click();
      const selector = page.getByRole('combobox', { name: 'Conversa guardada' });
      await selector.selectOption(first.id); await expect(page.getByText('0/20 turnos', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Eliminar conversa', exact: true }).click();
      const completed = page.waitForResponse(response => new URL(response.url()).pathname === `/api/conversations/${first.id}` && response.request().method() === 'DELETE');
      await page.getByRole('button', { name: 'Confirmar eliminação da conversa' }).click();
      expect(await deletedAtServer).toBe(204);
      await page.getByRole('button', { name: 'Fechar', exact: true }).click();
      await selector.selectOption(second.id);
      const draft = page.getByRole('textbox', { name: /Pergunta investigativa/ });
      await draft.fill('Rascunho da segunda conversa, conservado após eliminar a primeira.');
      releaseResponse(); expect((await completed).status()).toBe(204);
      await expect(selector).toHaveValue(second.id);
      await expect(draft).toHaveValue('Rascunho da segunda conversa, conservado após eliminar a primeira.');
      expect((await page.request.get(`/api/conversations/${first.id}`, { headers })).status()).toBe(404);
      const saved = await page.request.get(`/api/conversations/${second.id}`, { headers }); expect(saved.status()).toBe(200); expect((await saved.json()).revision).toBe(0);
      expect(api.turns).toHaveLength(0); // No model call or accidental turn write.
    } finally {
      releaseResponse();
      expect((await page.request.delete(`/api/workspace/studies/${study.id}`, { headers })).status()).toBe(204);
    }
  });

  test('cancels the browser form once without submitting it again', async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium', 'Desktop protocol proof; responsive workflows have their own case');
    // Only the pending turn transport is a declared double. This isolates browser default activation;
    // it is neither model integration nor proof of server-side cancellation.
    let turnCount = 0; let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/api/conversations/*/turns', async route => {
      turnCount++; await pending; await route.abort().catch(() => undefined);
    });
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: 'Entrar na conta' }).click();
      await page.getByText('Usar um token local', { exact: true }).click();
      await page.getByLabel('Token de acesso local').fill(await api.token());
      await page.getByRole('button', { name: 'Confirmar acesso local' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await page.getByRole('button', { name: 'Estudo Estruturado', exact: true }).click();
      await page.getByRole('textbox', { name: 'Passagem do estudo' }).fill('GEN 2:7');
      await page.getByRole('button', { name: 'Gerar Estudo' }).click();
      await expect(page.getByText('Versão 1', { exact: true })).toBeVisible();
      await page.getByRole('textbox', { name: /Pergunta investigativa/ }).fill('Caso técnico de cancelamento.');
      await page.getByRole('button', { name: 'Enviar pergunta' }).click();
      await expect.poll(() => turnCount).toBe(1);
      await page.getByRole('button', { name: 'Cancelar pedido' }).click();
      await expect(page.getByRole('button', { name: 'Enviar pergunta' })).toBeVisible();
      expect(turnCount).toBe(1);
      await expect(page.getByText('Pedido interrompido. Atualiza a conversa para confirmar o que ficou guardado.')).toBeVisible();
    } finally {
      console.info(JSON.stringify({ component: 'browser-cancel-form', turnRequests: turnCount }));
      release();
    }
  });

  test('observes native model API stages without starting a second browser', async ({ request }, info) => {
    test.skip(process.env.S10_NATIVE_AI !== '1' || info.project.name !== 'chromium', 'Explicit diagnostic with the real native runtime');
    test.setTimeout(720000);
    const started = Date.now(), headers = { authorization: `Bearer ${await api.token()}` };
    const create = await request.post('/api/studies', { headers, data: { translationId: 'porbr2018', reference: 'GEN 2:7' } });
    expect(create.status()).toBe(201); const study = await create.json();
    try {
      const conversation = await request.post(`/api/studies/${study.id}/conversations`, { headers, data: { studyVersion: 1 } });
      expect(conversation.status()).toBe(201); const current = await conversation.json();
      const response = await request.post(`/api/conversations/${current.id}/turns`, { headers, timeout: 650000,
        data: { expectedRevision: 0, question: 'Segundo a fonte, por que o primeiro homem é chamado Adam?' } });
      const view = await response.json();
      writeFileSync(info.outputPath('native-api-observation.json'), JSON.stringify({ status: response.status(), elapsedMs: Date.now() - started, rpcEvents: api.rpcEvents, view }, null, 2) + '\n');
      console.info(JSON.stringify({ component: 'native-api-observation', status: response.status(), elapsedMs: Date.now() - started, stages: api.rpcEvents.map(row => ({ endpoint: row.endpoint, status: row.status, errorCode: row.errorCode, headersAfterMs: row.headersAfterMs, failedAfterMs: row.failedAfterMs })) }));
      expect(response.status()).toBe(201); expect(view.turns[0].analysis.status).toBe('supported');
      expect(view.turns[0].analysis.provenance.totalTokens).toBeGreaterThan(0);
    } finally { expect((await request.delete(`/api/workspace/studies/${study.id}`, { headers })).status()).toBe(204); }
  });

  test('cancels an owned native model process and preserves the uncommitted conversation', async ({ page }, info) => {
    test.skip(process.env.S10_NATIVE_AI !== '1' || info.project.name !== 'chromium', 'Explicit native Windows operation');
    test.setTimeout(180000);
    const headers = { authorization: `Bearer ${await api.token()}` };
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Entrar na conta' }).click();
    await page.getByText('Usar um token local', { exact: true }).click();
    await page.getByLabel('Token de acesso local').fill(await api.token());
    await page.getByRole('button', { name: 'Confirmar acesso local' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.getByRole('button', { name: 'Estudo Estruturado', exact: true }).click();
    await page.getByRole('textbox', { name: 'Passagem do estudo' }).fill('GEN 2:7');
    const created = page.waitForResponse(r => new URL(r.url()).pathname === '/api/studies' && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Gerar Estudo' }).click();
    expect((await created).status()).toBe(201); const study = await (await created).json();
    const conversationCreated = page.waitForResponse(r => new URL(r.url()).pathname === `/api/studies/${study.id}/conversations` && r.request().method() === 'POST');
    await page.getByRole('textbox', { name: /Pergunta investigativa/ }).fill('Segundo a fonte, por que o primeiro homem é chamado Adam?');
    await page.getByRole('button', { name: 'Enviar pergunta' }).click();
    expect((await conversationCreated).status()).toBe(201); const conversation = await (await conversationCreated).json();
    await expect.poll(() => api.turns.length, { timeout: 15000 }).toBe(1);
    let childPids: number[] = [];
    await expect.poll(async () => { childPids = await api.nativeChildren(); return childPids.length; }, { timeout: 120000 }).toBeGreaterThan(0);
    expect(api.runtimeLocks()).toBe(true);
    await page.getByRole('button', { name: 'Cancelar pedido' }).click();
    await expect(page.getByRole('button', { name: 'Enviar pergunta' })).toBeVisible();
    await expect.poll(() => api.turns[0].closed, { timeout: 30000 }).toBe(true); expect(api.turns[0].completed).toBe(false);
    await expect.poll(() => api.runtimeLocks(), { timeout: 45000 }).toBe(false);
    expect(await api.nativeChildren()).toEqual([]); expect(api.turns).toHaveLength(1);
    const stored = await page.request.get(`/api/conversations/${conversation.id}`, { headers });
    expect(stored.status()).toBe(200); expect((await stored.json()).revision).toBe(0);
    expect((await page.request.delete(`/api/workspace/studies/${study.id}`, { headers })).status()).toBe(204);
    console.info(JSON.stringify({ component: 'native-browser-cancellation', ownedChildCount: childPids.length, childProcessesClosed: true, httpClosedWithoutCompletion: true, turnRequests: api.turns.length, persistedRevision: 0 }));
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
