import type { Request, Response } from 'express';
import { PasswordAuthController } from '../../src/presentation/password-auth.controller';
import { PasswordAuthService } from '../../src/infrastructure/password-auth';
import { LocalAccessTokens } from '../../src/infrastructure/access-token';
import type { Database } from '../../src/infrastructure/database';

// Explicit transport/persistence failure doubles for fail-closed boundary cases
// that cannot occur with Supertest's complete Express request/socket.
const body = { email: 'boundary@example.test', password: 'Uma palavra-passe segura!' };
const unavailable = new Error('controlled-storage-failure');
const response = { setHeader: jest.fn() } as unknown as Response;
function controller() {
  const database = { client: { passwordAccount: { findUnique: async () => { throw unavailable; } } } } as unknown as Database;
  return new PasswordAuthController(new PasswordAuthService(database, new LocalAccessTokens('test-account-transport-key-at-least-32-bytes'), true), 3000);
}
function incoming(origin?: string, contentType?: string): Request {
  return { get: (name: string) => name === 'origin' ? origin : contentType } as unknown as Request;
}
it.each([
  [undefined, 'application/json'], ['https://evil.example', 'application/json'],
  ['http://localhost:5173', undefined], ['http://localhost:5173', 'text/plain'],
])('rejects an incomplete or untrusted transport before authentication: %s / %s', async (origin, type) => {
  await expect(Promise.resolve().then(() => controller().login(body, incoming(origin, type), response)))
    .rejects.toMatchObject({ status: 403, code: 'AUTH_ORIGIN_REJECTED' });
});
it('accepts JSON type parameters and whitespace while retaining fail-closed storage errors', async () => {
  await expect(controller().login(body, incoming('http://localhost:5173', ' APPLICATION/JSON ; charset=utf-8'), response)).rejects.toBe(unavailable);
});
it('shares the attempt limit when a transport does not supply an IP instead of bypassing it', async () => {
  const access = controller();
  for (let index = 0; index < 10; index++) await expect(access.login(body, incoming('http://localhost:5173', 'application/json'), response)).rejects.toBe(unavailable);
  await expect(access.login(body, incoming('http://localhost:5173', 'application/json'), response)).rejects.toMatchObject({ status: 429 });
});
