import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApplication } from '../../src/app';
import { parseRuntimeConfig } from '../../src/config/runtime-config';

describe('real NestJS HTTP foundation', () => {
  let app: INestApplication;
  beforeAll(async () => { app = await createApplication(parseRuntimeConfig(process.env)); await app.init(); });
  afterAll(async () => { await app?.close(); });
  it('reports liveness with its exact public schema', async () => {
    const response = await request(app.getHttpServer()).get('/health/live').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
  it('reports readiness after a real Prisma query', async () => {
    const response = await request(app.getHttpServer()).get('/health/ready').expect(200);
    expect(response.body).toEqual({ status: 'ok', database: 'up' });
  });
  it('publishes OpenAPI for both health operations', async () => {
    const response = await request(app.getHttpServer()).get('/openapi.json').expect(200);
    expect(response.body.paths['/health/live'].get.responses['200']).toBeDefined();
    expect(response.body.paths['/health/ready'].get.responses['503']).toBeDefined();
    expect(response.body.openapi).toMatch(/^3\./);
    expect(response.body.info.title).toBe('Bíblia App — Backend');
    expect(response.body.info.version).toBe('0.1.0');
  });
  it('serves the local Swagger UI', async () => {
    const response = await request(app.getHttpServer()).get('/docs/').expect(200);
    expect(response.text).toContain('swagger-ui');
  });
  it('returns a sanitised error contract for unknown routes', async () => {
    const response = await request(app.getHttpServer()).get('/missing').expect(404);
    expect(response.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' } });
  });
  it('reports an actual unavailable DB without exposing connection details', async () => {
    const config = parseRuntimeConfig(process.env);
    const unavailable = await createApplication({ ...config, databaseUrl: 'postgresql://localhost:9/biblia_test' });
    try {
      await unavailable.init();
      const response = await request(unavailable.getHttpServer()).get('/health/live').expect(200);
      expect(response.body).toEqual({ status: 'ok' });
      const readiness = await request(unavailable.getHttpServer()).get('/health/ready').expect(503);
      expect(readiness.body).toEqual({ status: 'unavailable', database: 'down' });
    } finally { await unavailable.close(); }
  });
});
