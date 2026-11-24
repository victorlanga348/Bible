import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
const dependency = createRequire(import.meta.url);
const { startSessionApi } = dependency('./support/session-api.cjs') as {
  startSessionApi: (options: { accounts: boolean; originPort: number }) => Promise<{ sign: (nonce: string) => Promise<string>; close: () => Promise<void> }>;
};
let api: Awaited<ReturnType<typeof startSessionApi>>;
test.use({ trace: 'off', screenshot: 'off', video: 'off' });
test.setTimeout(60000); // Three access attempts plus real Nest/PG setup on the local PC.
test.beforeAll(async () => { api = await startSessionApi({ accounts: true, originPort: 5174 }); });
test.afterAll(async () => { await api?.close(); });

test('verifies native browser/proxy/cookie/RSA/local JWT/PostgreSQL session transitions', async ({ page }, info) => {
  // The Google SDK alone is a technical double. API, signature checks, cookie and PG are real.
  // No personal Google account, provider override in runtime config or API route mock.
  await page.exposeFunction('protocolCredential', (nonce: string) => api.sign(nonce));
  await page.addInitScript(() => {
    type Options = { nonce: string; callback: (response: { credential: string }) => void };
    const bridge = window as unknown as { protocolCredential: (nonce: string) => Promise<string>; google: unknown };
    let configuration: Options;
    bridge.google = { accounts: { id: {
      initialize: (options: Options) => { configuration = options; },
      renderButton: (element: HTMLElement) => {
        const button = document.createElement('button'); button.textContent = 'Continuar com Google (teste técnico)';
        button.onclick = () => { void bridge.protocolCredential(configuration.nonce).then(credential => configuration.callback({ credential })); };
        element.replaceChildren(button);
      },
    } } };
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const mobile = info.project.name === 'Mobile Chrome';
  const openAccount = async () => {
    if (mobile) { await page.getByRole('button', { name: 'Abrir Menu' }).click(); await page.getByRole('button', { name: 'Conta e acesso' }).click(); }
    else await page.getByRole('button', { name: /Entrar na conta|Gerir conta/ }).click();
  };
  await openAccount();
  await expect(page.getByText('Usar um token local', { exact: true })).toHaveCount(0);
  const email = `protocol-${randomUUID()}@example.test`, password = 'A secure browser test password';
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Palavra-passe', { exact: true }).fill(password);
  const rejected = page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/login');
  await page.getByRole('button', { name: 'Entrar com email' }).click();
  expect((await rejected).status()).toBe(401);
  await expect(page.getByRole('alert')).toContainText('Email ou palavra-passe incorretos');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await openAccount();
  await expect(page.getByLabel('Palavra-passe', { exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Continuar com Google (teste técnico)' })).toBeVisible();
  const challenge = (await page.context().cookies()).find(cookie => cookie.name === 'biblia_google_login');
  expect(challenge?.httpOnly).toBe(true); expect(challenge?.sameSite).toBe('Strict'); expect(challenge?.path).toBe('/api/auth/google');
  await page.screenshot({ path: info.outputPath('sign-in.png') });
  const verified = page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/me');
  await page.getByRole('button', { name: 'Continuar com Google (teste técnico)' }).click();
  expect((await verified).status()).toBe(200);
  expect((await (await verified).json()).ownerId).toMatch(/^google-[A-Za-z0-9_-]{43}$/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect((await page.context().cookies()).some(cookie => cookie.name === 'biblia_google_login')).toBe(false);
  if (mobile) await page.getByRole('button', { name: 'Abrir Menu' }).click();
  const workspace = page.waitForResponse(response => new URL(response.url()).pathname === '/api/workspace/studies');
  await page.getByRole('button', { name: 'Histórico & Workspace' }).click();
  expect((await workspace).status()).toBe(200);
  expect(Array.isArray((await (await workspace).json()).items)).toBe(true);
  await openAccount();
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await openAccount();
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Palavra-passe', { exact: true }).fill(password);
  await page.getByLabel('Confirmar palavra-passe').fill(password);
  const account = page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/me');
  await page.getByRole('button', { name: 'Criar conta e entrar' }).click();
  expect((await account).status()).toBe(200);
  expect((await (await account).json()).ownerId).toMatch(/^account-[a-f0-9-]{36}$/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  const stored = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  expect(stored).toEqual({ local: ['biblia-app-theme'], session: [] });
});
