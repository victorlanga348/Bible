import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
const dependency = createRequire(import.meta.url);
const { startSessionApi } = dependency('./support/session-api.cjs') as {
  startSessionApi: (options: { accounts: boolean; originPort: number }) => Promise<{ close: () => Promise<void> }>;
};
let api: Awaited<ReturnType<typeof startSessionApi>>;
test.use({ trace: 'off', screenshot: 'off', video: 'off' });
test.setTimeout(90000);
test.beforeAll(async () => { api = await startSessionApi({ accounts: true, originPort: 5174 }); });
test.afterAll(async () => { await api?.close(); });

test('registers an app account, saves a structured study and returns to it after email login', async ({ page }, info) => {
  const email = `browser-${randomUUID()}@example.test`, password = 'Uma palavra-passe de teste segura!';
  const mobile = info.project.name === 'Mobile Chrome';
  // No Google provider is needed for this flow. Avoid loading its external script.
  await page.route('https://accounts.google.com/**', route => route.abort());
  const openAccount = async () => {
    if (mobile) {
      await page.getByRole('button', { name: 'Abrir Menu' }).click();
      await page.getByRole('button', { name: 'Conta e acesso' }).click();
    } else await page.getByRole('button', { name: /Entrar na conta|Gerir conta/ }).click();
  };
  const navigate = async (name: string) => {
    if (mobile) await page.getByRole('button', { name: 'Abrir Menu' }).click();
    await page.getByRole('button', { name, exact: true }).click();
  };
  await page.goto('/'); await openAccount();
  await expect(page.getByText('Usar um token local', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByLabel('Palavra-passe', { exact: true })).toHaveAttribute('autocomplete', 'new-password');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('account-registration.png') });
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Palavra-passe', { exact: true }).fill(password);
  await page.getByLabel('Confirmar palavra-passe').fill(password);
  await page.getByRole('button', { name: 'Criar conta e entrar' }).click();
  await expect(dialog).not.toBeVisible();
  await navigate('Estudo Estruturado');
  await page.getByLabel('Referência do estudo').fill('GEN 1:1');
  const created = page.waitForResponse(response => response.url().endsWith('/api/studies') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Gerar Estudo' }).click();
  const saved = await created; expect(saved.status()).toBe(201);
  const study = await saved.json(); expect(study.version).toBe(1);
  await openAccount(); await page.getByRole('button', { name: 'Sair da conta' }).click();
  await openAccount(); await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Palavra-passe', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar com email' }).click();
  await expect(dialog).not.toBeVisible();
  await navigate('Histórico & Workspace');
  await page.getByRole('button', { name: 'Abrir', exact: true }).click();
  await expect(page.getByText('GEN 1:1', { exact: true }).first()).toBeVisible();
  const stored = await page.evaluate(() => ({ ...localStorage, ...sessionStorage }));
  expect(JSON.stringify(stored)).not.toContain(password);
  expect(JSON.stringify(stored)).not.toContain('accessToken');
  await page.screenshot({ path: info.outputPath('account-study.png') });
});
