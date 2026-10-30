import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
const dependency = createRequire(import.meta.url);
const { startSessionApi } = dependency('./support/session-api.cjs') as {
  startSessionApi: () => Promise<{ sign: (nonce: string) => Promise<string>; manualToken: () => Promise<string>; close: () => Promise<void> }>;
};
let api: Awaited<ReturnType<typeof startSessionApi>>;
test.use({ trace: 'off', screenshot: 'off', video: 'off' });
test.setTimeout(60000); // Three access attempts plus real Nest/PG setup on the local PC.
test.beforeAll(async () => { api = await startSessionApi(); });
test.afterAll(async () => { await api?.close(); });

test('verifies native browser/proxy/cookie/RSA/local JWT/PostgreSQL session transitions', async ({ page }, info) => {
  // The Google SDK alone is a technical double. API, signature checks, cookie and PG are real.
  // No personal account, provider override in runtime config, API route mock or database write.
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
  await page.getByText('Usar um token local', { exact: true }).click();
  await page.getByLabel('Token de acesso local').fill(`${await api.manualToken()}x`);
  const rejected = page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/me');
  await page.getByRole('button', { name: 'Confirmar acesso local' }).click();
  expect((await rejected).status()).toBe(401);
  await expect(page.getByRole('alert')).toContainText('Não foi possível confirmar a sessão');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await openAccount();
  await expect(page.getByLabel('Token de acesso local')).toHaveValue('');
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
  await page.getByText('Usar um token local', { exact: true }).click();
  await page.getByLabel('Token de acesso local').fill(await api.manualToken());
  const manual = page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/me');
  await page.getByRole('button', { name: 'Confirmar acesso local' }).click();
  expect((await manual).status()).toBe(200);
  expect((await (await manual).json()).ownerId).toBe('browser-protocol-owner-b');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  const stored = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  expect(stored).toEqual({ local: ['biblia-app-theme'], session: [] });
});
