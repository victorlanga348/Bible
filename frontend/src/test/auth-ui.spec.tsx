import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../shared/hooks/use-theme';
import { SessionProvider } from '../shared/hooks/use-session';
import { AppShell } from '../shared/ui/shell';

// Explicit Google SDK/fetch doubles verify UI wiring, never Google account integration.
let credentialCallback: (response: { credential: string }) => void;
const initialize = vi.fn((options: { callback: typeof credentialCallback }) => { credentialCallback = options.callback; });
const renderButton = vi.fn((element: HTMLElement) => {
  const button = document.createElement('button'); button.textContent = 'Continuar com Google';
  button.onclick = () => credentialCallback({ credential: 'technical.google.token' }); element.replaceChildren(button);
});
beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  vi.stubGlobal('google', { accounts: { id: { initialize, renderButton } } });
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url.endsWith('/bootstrap')) return Response.json({ clientId: '123456789012-protocoltest.apps.googleusercontent.com', nonce: 'n'.repeat(43) });
    if (url.endsWith('/auth/google')) return Response.json({ accessToken: 'technical.local.token', tokenType: 'Bearer', expiresIn: 3600 });
    return Response.json({ ownerId: 'google-technical-owner' });
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
function shell() {
  render(<ThemeProvider><SessionProvider><AppShell activeTab="reader" onTabChange={() => {}}>Public reader</AppShell></SessionProvider></ThemeProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Entrar na conta' }));
}

describe('application sign-in interface', () => {
  it('uses the official Google callback and verifies local identity before announcing access', async () => {
    shell();
    fireEvent.click(await screen.findByRole('button', { name: 'Continuar com Google' }));
    await screen.findByText('Sessão Ativa');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: '123456789012-protocoltest.apps.googleusercontent.com', nonce: 'n'.repeat(43), auto_select: false }));
    const exchange = vi.mocked(fetch).mock.calls.find(([url]) => String(url).endsWith('/auth/google'));
    expect(JSON.parse(String(exchange?.[1]?.body))).toEqual({ credential: 'technical.google.token', csrfToken: 'n'.repeat(43) });
    expect(exchange?.[1]?.credentials).toBe('same-origin');
    expect(screen.queryByText(/HS256|Como gerar o token/)).not.toBeInTheDocument();
  });
  it('keeps a rejected manual token anonymous and displays a recoverable error', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => String(url).endsWith('/bootstrap')
      ? Response.json({ clientId: '123456789012-protocoltest.apps.googleusercontent.com', nonce: 'n'.repeat(43) })
      : new Response('{}', { status: 401 })));
    shell();
    fireEvent.click(screen.getByText('Usar um token local'));
    const field = screen.getByLabelText('Token de acesso local');
    expect(field).toHaveAttribute('type', 'password');
    fireEvent.change(field, { target: { value: 'rejected-technical-token' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Confirmar acesso local' })); });
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível confirmar a sessão');
    expect(screen.queryByText('Sessão Ativa')).not.toBeInTheDocument();
  });
  it('offers a retry when Google bootstrap is temporarily unavailable', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 503 }));
    shell();
    expect(await screen.findByRole('alert')).toHaveTextContent('Google');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('button', { name: 'Continuar com Google' })).toBeEnabled();
  });
  it('clears a verified session through the account controls', async () => {
    shell(); fireEvent.click(await screen.findByRole('button', { name: 'Continuar com Google' }));
    await screen.findByText('Sessão Ativa');
    fireEvent.click(screen.getByRole('button', { name: 'Gerir conta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sair da conta' }));
    expect(screen.getByText('Sem sessão')).toBeInTheDocument();
  });
  it.each([
    { clientId: 'invalid-client', nonce: 'n'.repeat(43) },
    { clientId: '123456789012-protocoltest.apps.googleusercontent.com', nonce: 'invalid-nonce' },
  ])('refuses malformed bootstrap configuration before calling Google', async bootstrap => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(bootstrap));
    shell(); expect(await screen.findByRole('alert')).toHaveTextContent('Google');
    expect(initialize).not.toHaveBeenCalled();
  });
  it.each(['exchange', 'confirmation', 'invalid-access'])('shows a recoverable error when %s cannot establish access', async stage => {
    const original = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation(async (url, options) => {
      if (String(url).endsWith(stage === 'confirmation' ? '/auth/me' : '/auth/google')) {
        return stage === 'invalid-access' ? Response.json({ tokenType: 'Unknown', expiresIn: 0 }) : new Response('{}', { status: 401 });
      }
      return original(url, options);
    });
    shell(); fireEvent.click(await screen.findByRole('button', { name: 'Continuar com Google' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Google');
    expect(screen.queryByText('Sessão Ativa')).not.toBeInTheDocument();
  });
  it('does not initialize Google after the access dialog has been closed', async () => {
    let finish!: (response: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(() => new Promise<Response>(resolve => { finish = resolve; }));
    shell(); fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    await act(async () => { finish(Response.json({ clientId: '123456789012-protocoltest.apps.googleusercontent.com', nonce: 'n'.repeat(43) })); });
    expect(initialize).not.toHaveBeenCalled();
  });
  it('handles an SDK initialization failure without leaving a blank sign-in dialog', async () => {
    initialize.mockImplementationOnce(() => { throw new Error('technical SDK failure'); });
    shell(); expect(await screen.findByRole('alert')).toHaveTextContent('Google');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled();
  });
});
