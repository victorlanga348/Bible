import type { ExecutionContext } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { LocalAccessTokens, AuthenticationError } from '../../src/infrastructure/access-token';
import { LocalAccessGuard, type OwnerRequest } from '../../src/presentation/local-access.guard';

function context(request: OwnerRequest): ExecutionContext {
  // Transport shape double only; signatures/verification are real. HTTP proof is T006.
  return { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
}
describe('local access transport boundary with real JWTs', () => {
  it.each(['Bearer', 'bearer'])('takes the owner from a verified %s header rather than client data', async scheme => {
    const tokens = new LocalAccessTokens(randomBytes(48).toString('base64url'));
    const request: OwnerRequest & { body: { ownerId: string } } = { headers: { authorization: `${scheme} ${await tokens.issue('owner-a')}` }, ownerId: 'client-value', body: { ownerId: 'owner-b' } };
    expect(await new LocalAccessGuard(tokens).canActivate(context(request))).toBe(true);
    expect(request.ownerId).toBe('owner-a'); expect(request.body.ownerId).toBe('owner-b');
  });
  it.each([undefined, '', 'Basic value', 'Bearer', 'Bearer one two', ['Bearer value']])('rejects absent/malformed authorization %j', async authorization => {
    const request: OwnerRequest = { headers: authorization === undefined ? {} : { authorization } };
    await expect(new LocalAccessGuard(new LocalAccessTokens()).canActivate(context(request))).rejects.toThrow(AuthenticationError);
    expect(request.ownerId).toBeUndefined();
  });
  it('fails closed for an altered token and for a server without a configured key', async () => {
    const tokens = new LocalAccessTokens(randomBytes(48).toString('base64url'));
    const token = await tokens.issue('owner-a');
    await expect(new LocalAccessGuard(new LocalAccessTokens()).canActivate(context({ headers: { authorization: `Bearer ${token}` } }))).rejects.toThrow(AuthenticationError);
    await expect(new LocalAccessGuard(tokens).canActivate(context({ headers: { authorization: 'Bearer a.b.c' } }))).rejects.toThrow(AuthenticationError);
  });
  it('rejects surrounding whitespace around an otherwise authentic compact token', async () => {
    const tokens = new LocalAccessTokens(randomBytes(48).toString('base64url'));
    const header = `Bearer ${await tokens.issue('owner-a')}`;
    for (const authorization of [' ' + header, header + ' ', header + '\n']) {
      await expect(new LocalAccessGuard(tokens).canActivate(context({ headers: { authorization } }))).rejects.toThrow(AuthenticationError);
    }
  });
});
