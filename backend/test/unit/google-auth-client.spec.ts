import { runInNewContext } from 'node:vm';
import { googleAuthClient, googleAuthPage } from '../../src/presentation/google-auth-page';

// DOM/fetch doubles isolate the static browser controller. They are not browser/Google proof.
function browser() {
  const actions = new Map<string, () => Promise<void> | void>();
  const make = (id: string) => ({ textContent: '', value: '', hidden: true, dataset: { nonce: 'n'.repeat(43) }, focus: jest.fn(), select: jest.fn(), addEventListener: (_event: string, callback: () => Promise<void> | void) => actions.set(id, callback) });
  const nodes = Object.fromEntries(['status', 'session', 'access-token', 'g_id_onload', 'copy-token', 'clear-session'].map(id => [id, make(id)]));
  const fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ accessToken: 'technical.local.token' }) }).mockResolvedValue({ ok: true });
  const clipboard = { writeText: jest.fn().mockResolvedValue(undefined) };
  const window = {} as { onGoogleCredential: (response: { credential: string }) => Promise<void> };
  runInNewContext(googleAuthClient, { window, document: { getElementById: (id: string) => nodes[id] }, fetch, navigator: { clipboard }, AbortSignal: { timeout: () => undefined } });
  return { window, nodes, fetch, clipboard, actions };
}
describe('Google browser callback transport and private local token handling', () => {
  it('escapes all attribute delimiters even for an out-of-contract renderer argument', () => {
    const page = googleAuthPage('"<>&', '"<>&'); expect(page).toContain('data-client_id="&quot;&lt;&gt;&amp;"'); expect(page).toContain('data-nonce="&quot;&lt;&gt;&amp;"');
  });
  it('sends the Google credential and nonce as JSON, then verifies Bearer access before revealing the token', async () => {
    const b = browser(); await b.window.onGoogleCredential({ credential: 'technical.google.token' });
    expect(b.fetch.mock.calls[0]![0]).toBe('/auth/google'); const sent = b.fetch.mock.calls[0]![1];
    expect(sent).toMatchObject({ method: 'POST', credentials: 'same-origin', cache: 'no-store', redirect: 'error', headers: { 'Content-Type': 'application/json' } }); expect(JSON.parse(sent.body)).toEqual({ credential: 'technical.google.token', csrfToken: 'n'.repeat(43) });
    expect(b.fetch.mock.calls[1]).toEqual(['/auth/me', expect.objectContaining({ headers: { Authorization: 'Bearer technical.local.token' }, cache: 'no-store', redirect: 'error' })]);
    expect(b.nodes['session']!.hidden).toBe(false); expect(b.nodes['access-token']!.value).toBe('technical.local.token'); expect(b.nodes['status']!.textContent).toContain('Entraste com Google');
  });
  it.each(['exchange', 'confirmation', 'transport'])('hides any token when %s fails', async stage => {
    const b = browser(); b.fetch.mockReset(); if (stage === 'transport') b.fetch.mockRejectedValue(new Error('technical-offline')); else if (stage === 'exchange') b.fetch.mockResolvedValue({ ok: false }); else b.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ accessToken: 'technical.local.token' }) }).mockResolvedValue({ ok: false });
    await b.window.onGoogleCredential({ credential: 'technical.google.token' }); expect(b.nodes['access-token']!.value).toBe(''); expect(b.nodes['session']!.hidden).toBe(true); expect(b.nodes['status']!.textContent).toContain('Não foi possível entrar');
  });
  it('copies only on deliberate click and forgets the token when clearing the page session', async () => {
    const b = browser(); await b.window.onGoogleCredential({ credential: 'technical.google.token' }); expect(b.clipboard.writeText).not.toHaveBeenCalled(); await b.actions.get('copy-token')!(); expect(b.clipboard.writeText).toHaveBeenCalledWith('technical.local.token');
    await b.actions.get('clear-session')!(); expect(b.nodes['access-token']!.value).toBe(''); expect(b.nodes['session']!.hidden).toBe(true);
  });
  it('offers manual selection if the browser denies clipboard access', async () => {
    const b = browser(); await b.window.onGoogleCredential({ credential: 'technical.google.token' }); b.clipboard.writeText.mockRejectedValue(new Error('technical-permission')); await b.actions.get('copy-token')!(); expect(b.nodes['access-token']!.select).toHaveBeenCalled(); expect(b.nodes['status']!.textContent).toContain('manualmente');
  });
});
