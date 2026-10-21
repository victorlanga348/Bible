import { Body, Controller, Get, HttpException, Module, Post } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { z } from 'zod';
import { configureTransport } from '../../src/app';

const input = z.strictObject({ label: z.string().min(1) });
@Controller('_test')
class FixtureController {
  @Post('validated')
  validated(@Body({ schema: input }) body: z.infer<typeof input>) { return body; }

  @Get('failure')
  failure(): never { throw new Error('secret-driver-detail'); }

  @Get('unsupported-error')
  unsupportedError(): never { throw new HttpException('secret-driver-detail', 403); }
}
@Module({ controllers: [FixtureController] })
class FixtureModule {}

describe('transport foundation with real Nest requests (test-only controller)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await NestFactory.create(FixtureModule, { logger: false });
    configureTransport(app);
    await app.init();
  });
  afterAll(async () => { await app.close(); });
  it('accepts schema-valid input', async () => {
    const result = await request(app.getHttpServer()).post('/_test/validated').send({ label: 'probe' }).expect(201);
    expect(result.body).toEqual({ label: 'probe' });
  });
  it.each([{ label: '' }, { label: 3 }, { label: 'probe', extra: true }, {}])('rejects invalid input', async (body) => {
    const result = await request(app.getHttpServer()).post('/_test/validated').send(body).expect(400);
    expect(result.body).toEqual({ error: { code: 'VALIDATION_ERROR', message: 'Entrada inválida.' } });
  });
  it('sanitises malformed JSON', async () => {
    const result = await request(app.getHttpServer()).post('/_test/validated').set('Content-Type', 'application/json').send('{').expect(400);
    expect(result.body).toEqual({ error: { code: 'VALIDATION_ERROR', message: 'Entrada inválida.' } });
  });
  it('does not expose unexpected exception details', async () => {
    const result = await request(app.getHttpServer()).get('/_test/failure').expect(500);
    expect(result.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno.' } });
  });
  it('maps HTTP statuses outside the technical error contract to a sanitised internal error', async () => {
    const result = await request(app.getHttpServer()).get('/_test/unsupported-error').expect(500);
    expect(result.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno.' } });
  });
  it('writes only a structured, sanitised diagnostic', async () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    try {
      await request(app.getHttpServer()).get('/_test/failure').expect(500);
      expect(log).toHaveBeenCalledWith(JSON.stringify({ component: 'http', code: 'INTERNAL_ERROR', status: 500 }));
      expect(JSON.stringify(log.mock.calls)).not.toContain('secret-driver-detail');
    } finally { log.mockRestore(); }
  });
});
