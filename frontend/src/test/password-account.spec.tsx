import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SessionProvider } from '../shared/hooks/use-session';
import { AccountAccessProvider, AppShell } from '../shared/ui/shell';
import { ThemeProvider } from '../shared/hooks/use-theme';
import { PasswordSignIn } from '../shared/auth/password-sign-in';
import { useSession } from '../shared/hooks/use-session';

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  vi.stubGlobal('google', { accounts: { id: { initialize: vi.fn(), renderButton: vi.fn() } } });
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url.endsWith('/bootstrap')) return Response.json({ clientId: '123456789012-technical.apps.googleusercontent.com', nonce: 'n'.repeat(43) });
    if (url.endsWith('/auth/register') || url.endsWith('/auth/login')) return Response.json({ accessToken: 'account-token', tokenType: 'Bearer', expiresIn: 3600 });
    return Response.json({ ownerId: 'account-owner' });
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });
function open() {
  render(<ThemeProvider><SessionProvider><AccountAccessProvider><AppShell activeTab="reader" onTabChange={vi.fn()}>Reader</AppShell></AccountAccessProvider></SessionProvider></ThemeProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Entrar na conta' }));
}
it('offers account registration, confirms the password and establishes a verified session', async () => {
  open();
  fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'reader@example.test' } });
  fireEvent.change(screen.getByLabelText('Palavra-passe'), { target: { value: 'Uma palavra-passe segura 123!' } });
  fireEvent.change(screen.getByLabelText('Confirmar palavra-passe'), { target: { value: 'Uma palavra-passe segura 123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Criar conta e entrar' }));
  await screen.findByText('Sessão Ativa');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const call = vi.mocked(fetch).mock.calls.find(([url]) => String(url).endsWith('/auth/register'))!;
  expect(JSON.parse(String(call[1]?.body))).toEqual({ email: 'reader@example.test', password: 'Uma palavra-passe segura 123!' });
  await waitFor(() => expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).endsWith('/auth/me'))).toBe(true));
});

const password = 'Uma palavra-passe segura 123!';
function fill() {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'reader@example.test' } });
  fireEvent.change(screen.getByLabelText('Palavra-passe'), { target: { value: password } });
}
function Probe() {
  const { status, clearSession } = useSession();
  return <><span data-testid="session-status">{status}</span><button onClick={clearSession}>Cancel session</button></>;
}
function direct() {
  const onAccess = vi.fn();
  const view = render(<SessionProvider><PasswordSignIn onAccess={onAccess} /><Probe /></SessionProvider>);
  return { ...view, onAccess };
}
function deferred() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>(done => { resolve = done; });
  return { promise, resolve };
}
it('signs in with email and confirms the session before announcing access', async () => {
  const { onAccess } = direct(); fill();
  expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'username');
  expect(screen.getByLabelText('Palavra-passe')).toHaveAttribute('autocomplete', 'current-password');
  expect(screen.queryByLabelText('Confirmar palavra-passe')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Entrar com email' }));
  await waitFor(() => expect(onAccess).toHaveBeenCalledOnce());
  const call = vi.mocked(fetch).mock.calls.find(([url]) => String(url).endsWith('/auth/login'))!;
  expect(JSON.parse(String(call[1]?.body))).toEqual({ email: 'reader@example.test', password });
  expect(call[1]).toMatchObject({ method: 'POST', cache: 'no-store', redirect: 'error' });
  expect(screen.getByTestId('session-status')).toHaveTextContent('authenticated');
  expect(screen.getByLabelText('Palavra-passe')).toHaveValue('');
});
it('checks password confirmation locally and clears secrets when returning to sign in', async () => {
  direct(); fireEvent.click(screen.getByRole('button', { name: 'Criar conta' })); fill();
  fireEvent.change(screen.getByLabelText('Confirmar palavra-passe'), { target: { value: 'Uma frase diferente e segura' } });
  expect(screen.getByLabelText('Palavra-passe')).toHaveAttribute('autocomplete', 'new-password');
  fireEvent.click(screen.getByRole('button', { name: 'Criar conta e entrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('não coincidem');
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(screen.getByLabelText('Palavra-passe')).toHaveValue('');
  expect(screen.getByLabelText('Email')).toHaveValue('reader@example.test');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
it.each([
  [409, 'Já existe uma conta'], [401, 'Email ou palavra-passe incorretos'],
  [429, 'Demasiadas tentativas'], [400, 'Verifica o email'], [503, 'temporariamente indisponível'], [500, 'Não foi possível'],
])('presents a recoverable and sanitized error for HTTP %s', async (status, message) => {
  vi.mocked(fetch).mockResolvedValueOnce(Response.json({ error: { code: 'TECHNICAL', message: 'private-server-detail' } }, { status: status as number }));
  const { onAccess } = direct(); fill();
  fireEvent.click(screen.getByRole('button', { name: 'Entrar com email' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(String(message));
  expect(screen.getByRole('alert')).not.toHaveTextContent('private-server-detail');
  expect(onAccess).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Entrar com email' }));
  await waitFor(() => expect(onAccess).toHaveBeenCalledOnce());
});
it('keeps identity confirmation failures recoverable without authenticating the account', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => String(url).endsWith('/auth/me') ? new Response('{}', { status: 401 }) : original(url, options));
  const { onAccess } = direct(); fill();
  fireEvent.click(screen.getByRole('button', { name: 'Entrar com email' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível');
  expect(onAccess).not.toHaveBeenCalled();
  expect(screen.getByTestId('session-status')).toHaveTextContent('anonymous');
});
it.each([
  {}, { accessToken: 123, tokenType: 'Bearer', expiresIn: 3600 },
  { accessToken: ' ', tokenType: 'Bearer', expiresIn: 3600 },
  { accessToken: 'token', tokenType: 'Other', expiresIn: 3600 },
  { accessToken: 'token', tokenType: 'Bearer', expiresIn: 0 },
])('refuses malformed authentication responses: %j', async body => {
  vi.mocked(fetch).mockResolvedValueOnce(Response.json(body));
  const { onAccess } = direct(); fill();
  fireEvent.click(screen.getByRole('button', { name: 'Entrar com email' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível');
  expect(onAccess).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('prevents double submission and mode changes while a login is pending', async () => {
  const response = deferred(); vi.mocked(fetch).mockReturnValueOnce(response.promise);
  direct(); fill();
  const form = screen.getByRole('form', { name: 'Entrar com email' });
  fireEvent.submit(form); fireEvent.submit(form);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Criar conta' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Entrar com email' })).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent('A entrar');
  await act(async () => { response.resolve(Response.json({ accessToken: 'token', tokenType: 'Bearer', expiresIn: 3600 })); });
});
it('aborts a closed dialog and ignores a late registration response', async () => {
  const response = deferred(), original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => String(url).endsWith('/auth/register') ? response.promise : original(url, options));
  open(); fireEvent.click(screen.getByRole('button', { name: 'Criar conta' })); fill();
  fireEvent.change(screen.getByLabelText('Confirmar palavra-passe'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Criar conta e entrar' }));
  const call = vi.mocked(fetch).mock.calls.find(([url]) => String(url).endsWith('/auth/register'))!;
  fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
  expect(call[1]?.signal?.aborted).toBe(true);
  await act(async () => { response.resolve(Response.json({ accessToken: 'late-token', tokenType: 'Bearer', expiresIn: 3600 })); });
  expect(screen.getByText('Sem sessão')).toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).endsWith('/auth/me'))).toBe(false);
});
it('cancels identity confirmation when the dialog closes and prevents a late session', async () => {
  const response = deferred(), original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => String(url).endsWith('/auth/me') ? response.promise : original(url, options));
  open(); fill(); fireEvent.click(screen.getByRole('button', { name: 'Entrar com email' }));
  await waitFor(() => expect(screen.getByText('A confirmar acesso…')).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
  await act(async () => { response.resolve(Response.json({ ownerId: 'late-owner' })); });
  expect(screen.getByText('Sem sessão')).toBeInTheDocument();
});
it('ignores an exchange started before a newer session generation', async () => {
  const response = deferred(); vi.mocked(fetch).mockReturnValueOnce(response.promise);
  const { onAccess } = direct(); fill(); fireEvent.click(screen.getByRole('button', { name: 'Entrar com email' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel session' }));
  await act(async () => { response.resolve(Response.json({ accessToken: 'old-token', tokenType: 'Bearer', expiresIn: 3600 })); });
  expect(onAccess).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledTimes(1);
});
