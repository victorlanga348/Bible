import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from '../App';
import { useSession } from '../shared/hooks/use-session';

// Technical probe replaces the reader, not the session/cache implementation under test.
vi.mock('../features/canon/reader-view', () => ({ ReaderView: () => <PrivateProbe /> }));
vi.mock('../features/assistant/context-panel', () => ({ ContextPanel: () => null }));
const clients: QueryClient[] = [];
function PrivateProbe() {
  const client = useQueryClient();
  const { ownerId, setSession, clearSession } = useSession();
  const [local, setLocal] = useState('empty');
  if (!clients.includes(client)) clients.push(client);
  return <div>
    <span data-testid="owner">{ownerId ?? 'anonymous'}</span>
    <span data-testid="private-local">{local}</span>
    <span data-testid="private-cache">{String(client.getQueryData(['technical-private']) ?? 'empty')}</span>
    <button onClick={() => { void setSession('technical-a'); }}>Access A</button>
    <button onClick={() => { void setSession('technical-b'); }}>Access B</button>
    <button onClick={clearSession}>Leave</button>
    <button onClick={() => { client.setQueryData(['technical-private'], 'private-a'); setLocal('private-a'); }}>Store private</button>
  </div>;
}
afterEach(() => { cleanup(); for (const client of clients) client.clear(); clients.length = 0; vi.unstubAllGlobals(); });
it('isolates previous owner cache, local state and late callbacks across real application sessions', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
    const ownerId = new Headers(options?.headers).get('Authorization') === 'Bearer technical-b' ? 'owner-b' : 'owner-a';
    return new Response(JSON.stringify({ ownerId }));
  }));
  render(<App />);
  fireEvent.click(screen.getByText('Access A'));
  await waitFor(() => expect(screen.getByTestId('owner')).toHaveTextContent('owner-a'));
  fireEvent.click(screen.getByText('Store private'));
  expect(screen.getByTestId('private-cache')).toHaveTextContent('private-a');
  const oldClient = clients.at(-1)!;
  const cancelled = vi.spyOn(oldClient, 'cancelQueries');
  const cleared = vi.spyOn(oldClient, 'clear');
  fireEvent.click(screen.getByText('Leave'));
  expect(cancelled).toHaveBeenCalled();
  expect(cleared).toHaveBeenCalled();
  expect(oldClient.getQueryCache().getAll()).toHaveLength(0);
  expect(screen.getByTestId('private-local')).toHaveTextContent('empty');
  expect(screen.getByTestId('private-cache')).toHaveTextContent('empty');
  fireEvent.click(screen.getByText('Access B'));
  await waitFor(() => expect(screen.getByTestId('owner')).toHaveTextContent('owner-b'));
  const newClient = clients.at(-1)!;
  expect(newClient).not.toBe(oldClient);
  act(() => { oldClient.setQueryData(['technical-private'], 'late-private-a'); });
  expect(newClient.getQueryData(['technical-private'])).toBeUndefined();
  expect(screen.getByTestId('private-local')).toHaveTextContent('empty');
});

it.each(['manual', 'google'])('keeps %s identity validation and its recoverable failure visible across the application boundary', async method => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  let callback!: (response: { credential: string }) => void;
  vi.stubGlobal('google', { accounts: { id: {
    initialize: (options: { callback: typeof callback }) => { callback = options.callback; },
    renderButton: (element: HTMLElement) => {
      const button = document.createElement('button'); button.textContent = 'Technical Google access';
      button.onclick = () => callback({ credential: 'technical-google-credential' }); element.replaceChildren(button);
    },
  } } });
  let finish!: (response: Response) => void;
  const identity = new Promise<Response>(resolve => { finish = resolve; });
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url.endsWith('/bootstrap')) return Response.json({ clientId: '123456789012-protocoltest.apps.googleusercontent.com', nonce: 'n'.repeat(43) });
    if (url.endsWith('/auth/google')) return Response.json({ accessToken: 'technical-local-token', tokenType: 'Bearer', expiresIn: 3600 });
    return identity;
  }));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Entrar na conta' }));
  if (method === 'manual') {
    fireEvent.click(screen.getByText('Usar um token local'));
    fireEvent.change(screen.getByLabelText('Token de acesso local'), { target: { value: 'technical-rejected-token' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar acesso local' }));
  } else fireEvent.click(await screen.findByRole('button', { name: 'Technical Google access' }));
  await waitFor(() => expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).endsWith('/auth/me'))).toBe(true));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('A confirmar acesso…')).toBeInTheDocument();
  if (method === 'manual') expect(screen.getByRole('button', { name: 'Confirmar acesso local' })).toBeDisabled();
  expect(screen.queryByText('Sessão Ativa')).not.toBeInTheDocument();
  await act(async () => { finish(new Response('{}', { status: 401 })); });
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.queryByText('Sessão Ativa')).not.toBeInTheDocument();
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => String(url).endsWith('/auth/me')
    ? Response.json({ ownerId: 'recovered-owner' }) : original(url, options));
  if (method === 'manual') fireEvent.click(screen.getByRole('button', { name: 'Confirmar acesso local' }));
  else {
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Technical Google access' }));
  }
  await waitFor(() => expect(screen.getByTestId('owner')).toHaveTextContent('recovered-owner'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
