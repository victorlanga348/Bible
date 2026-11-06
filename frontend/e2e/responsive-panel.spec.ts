import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
const { startSessionApi } = createRequire(import.meta.url)('./support/session-api.cjs') as {
  startSessionApi: () => Promise<{ close: () => Promise<void> }>;
};
let api: Awaited<ReturnType<typeof startSessionApi>>;
test.beforeAll(async () => { api = await startSessionApi(); });
test.afterAll(async () => { await api?.close(); });
test('keeps contextual inputs, actions and tabs within the available viewport', async ({ page }, info) => {
  await page.goto('/');
  const mobile = info.project.name === 'Mobile Chrome';
  if (mobile) await page.getByRole('button', { name: 'Abrir Painel Contextual de IA' }).click();
  const panel = mobile ? page.getByRole('dialog') : page.getByRole('complementary'); await expect(panel).toBeVisible();
  const size = await panel.evaluate(element => ({ width: element.clientWidth, content: element.scrollWidth }));
  expect(size.content).toBeLessThanOrEqual(size.width + 1);
  for (const name of ['Assistente IA', 'Anotações', 'Referências']) {
    const bounds = await panel.getByRole('tab', { name, exact: true }).boundingBox();
    expect(bounds).toBeTruthy(); expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  const send = await panel.getByRole('button', { name: 'Enviar pergunta' }).boundingBox();
  expect(send).toBeTruthy(); expect(send!.x + send!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.screenshot({ path: info.outputPath('context-mobile.png') });
});
test('selects the actual admitted source and reads its provenance through the native API', async ({ page }, info) => {
  await page.goto('/');
  if (info.project.name === 'Mobile Chrome') await page.getByRole('button', { name: 'Abrir Menu' }).click();
  await page.getByRole('button', { name: 'Fontes Históricas', exact: true }).click();
  const response = await page.request.get('/api/sources'); expect(response.status()).toBe(200);
  const { sources } = await response.json() as { sources: { id: string; title: string; rightsStatement: string }[] };
  expect(sources.length).toBeGreaterThan(0);
  const select = page.getByRole('combobox', { name: 'Fonte histórica' });
  await expect(select).toHaveValue(sources[0].id);
  for (const source of sources) {
    await select.selectOption(source.id);
    await expect(page.getByRole('heading', { name: source.title, exact: true })).toBeVisible();
    await expect(page.getByText(source.rightsStatement, { exact: true })).toBeVisible();
    const excerpts = await page.request.get(`/api/sources/${encodeURIComponent(source.id)}/excerpts`); expect(excerpts.status()).toBe(200);
    const { excerpts: items } = await excerpts.json() as { excerpts: { locator: string; textSha256: string }[] };
    if (items.length) {
      await page.getByRole('button', { name: `Ler trecho ${items[0].locator}`, exact: true }).click();
      await expect(page.getByRole('dialog').getByText(items[0].textSha256, { exact: true })).toBeVisible();
      const bounds = await page.getByRole('dialog').boundingBox();
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      await page.getByRole('dialog').getByRole('button', { name: 'Fechar', exact: true }).click();
    }
  }
});
test('keeps the contextual drawer reachable at an intermediate tablet width', async ({ page }, info) => {
  await page.setViewportSize({ width: 900, height: 900 }); await page.goto('/');
  await page.getByRole('button', { name: 'Abrir Painel Contextual de IA' }).click();
  const dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('tab', { name: 'Anotações' })).toBeVisible();
  const bounds = await dialog.boundingBox(); expect(bounds!.x).toBeGreaterThanOrEqual(0); expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(900);
  await page.screenshot({ path: info.outputPath('context-tablet.png') });
  await dialog.getByRole('button', { name: 'Fechar', exact: true }).click(); await expect(dialog).not.toBeVisible();
});
