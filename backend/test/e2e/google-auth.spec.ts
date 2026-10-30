import { randomBytes } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApplication } from '../../src/app';
import { parseRuntimeConfig } from '../../src/config/runtime-config';

// Technical OAuth client identifier; no real Google account/token is used here.
const client = '123456789012-protocoltest.apps.googleusercontent.com';
describe('Google entry routes in the real application', () => {
  let app: INestApplication, disabled: INestApplication;
  beforeAll(async () => {
    const config = { ...parseRuntimeConfig(process.env), jwtSecret: randomBytes(40).toString('base64url') };
    app = await createApplication({ ...config, googleClientId: client }); await app.init();
    disabled = await createApplication(config); await disabled.init();
  });
  afterAll(async () => { await app?.close(); await disabled?.close(); });
  it('serves a no-store Google button bound to a private challenge cookie', async () => {
    const response = await request(app.getHttpServer()).get('/auth/google').expect(200);
    expect(response.headers['content-type']).toContain('text/html'); expect(response.headers['cache-control']).toBe('no-store');
    expect(response.text).toContain('https://accounts.google.com/gsi/client'); expect(response.text).toContain(client); expect(response.text).toContain('data-nonce=');
    expect(String(response.headers['set-cookie'])).toContain('HttpOnly'); expect(String(response.headers['set-cookie'])).toContain('SameSite=Strict');
    expect(response.headers['cross-origin-opener-policy']).toBe('same-origin-allow-popups'); expect(response.headers['content-security-policy']).toContain("frame-ancestors 'none'");
  });
  it('serves the callback without persisting credentials in localStorage or URLs', async () => {
    const response = await request(app.getHttpServer()).get('/auth/google/client.js').expect(200);
    expect(response.text).toContain('/auth/me'); expect(response.text).toContain('csrfToken'); expect(response.text).not.toContain('localStorage'); expect(response.text).not.toContain('innerHTML');
  });
  it('rejects /auth/me without a verified Bearer token', async () => {
    expect((await request(app.getHttpServer()).get('/auth/me').expect(401)).body).toEqual({ error: { code: 'AUTH_REQUIRED', message: 'Autenticação necessária.' } });
  });
  it('keeps disabled Google configuration distinct from a missing route', async () => {
    expect((await request(disabled.getHttpServer()).get('/auth/google').expect(503)).body).toEqual({ error: { code: 'GOOGLE_AUTH_UNAVAILABLE', message: 'Autenticação Google temporariamente indisponível.' } });
  });
  it('publishes the Google exchange and Bearer identity contracts in OpenAPI', async () => {
    const response = await request(app.getHttpServer()).get('/openapi.json').expect(200);
    expect(response.body.paths['/auth/google']).toHaveProperty('post'); expect(response.body.paths['/auth/google'].post.responses['200']).toBeDefined(); expect(response.body.paths['/auth/me'].get.security).toEqual([{ bearer: [] }]);
  });
});
