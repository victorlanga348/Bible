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
  fireEvent.click(screen.getByText('Leave'));
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
