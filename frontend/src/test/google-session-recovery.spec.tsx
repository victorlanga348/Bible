import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { GoogleSignIn } from '../shared/auth/google-sign-in';

const { initialize, verifySession, transport } = vi.hoisted(() => ({ initialize: vi.fn(), verifySession: vi.fn(), transport: vi.fn() }));
// Explicit SDK, transport and session-confirmation doubles; no personal Google login.
vi.mock('../shared/auth/google-identity', () => ({ loadGoogleIdentity: async () => ({ initialize, renderButton: vi.fn() }) }));
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ setSession: verifySession }) }));
vi.mock('../shared/api/http-client', () => ({ request: (...args: unknown[]) => transport(...args) }));
beforeEach(() => {
  initialize.mockReset(); verifySession.mockReset(); transport.mockReset();
  transport.mockImplementation(async (url: string) => url.endsWith('/bootstrap')
    ? { clientId: '123456789012-technical.apps.googleusercontent.com', nonce: 'n'.repeat(43) }
    : { accessToken: 'technical-access-token-double', tokenType: 'Bearer', expiresIn: 3600 });
});
afterEach(cleanup);
function credential(attempt: number) {
  const options = initialize.mock.calls[attempt]?.[0] as { callback: (response: { credential: string }) => void };
  options.callback({ credential: 'technical-sdk-credential-double' });
}
it('offers an explicit retry after session confirmation rejects and succeeds only after confirmation', async () => {
  verifySession.mockRejectedValueOnce(new Error('Technical identity confirmation failure')).mockResolvedValueOnce(true);
  const onAccess = vi.fn(); render(<GoogleSignIn onAccess={onAccess} />);
  await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));
  await act(async () => credential(0));
  expect(onAccess).not.toHaveBeenCalled();
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  await waitFor(() => expect(initialize).toHaveBeenCalledTimes(2));
  await act(async () => credential(1));
  await waitFor(() => expect(onAccess).toHaveBeenCalledTimes(1));
});
it('does not publish access after the confirmation finishes following unmount', async () => {
  let confirm!: (accepted: boolean) => void;
  verifySession.mockImplementation(() => new Promise<boolean>(resolve => { confirm = resolve; }));
  const onAccess = vi.fn(), view = render(<GoogleSignIn onAccess={onAccess} />);
  await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));
  await act(async () => credential(0));
  await waitFor(() => expect(confirm).toBeDefined());
  view.unmount(); await act(async () => confirm(true));
  expect(onAccess).not.toHaveBeenCalled();
});
