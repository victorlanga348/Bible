import type { INestApplication } from '@nestjs/common';
import type { AddressInfo } from 'node:net';
import { createServer } from 'node:net';
import request from 'supertest';
import { startApplication } from '../../src/main';
import { parseRuntimeConfig } from '../../src/config/runtime-config';

describe('real application startup', () => {
  it('binds HTTP to loopback and closes resources', async () => {
    const listeners = process.listenerCount('SIGTERM');
    const app: INestApplication = await startApplication({ ...parseRuntimeConfig(process.env), port: 0 });
    try {
      expect(process.listenerCount('SIGTERM')).toBeGreaterThan(listeners);
      const address = app.getHttpServer().address() as AddressInfo;
      expect(address.address).toBe('127.0.0.1');
      expect(address.port).toBeGreaterThan(0);
      const result = await request(`http://127.0.0.1:${address.port}`).get('/health/ready').expect(200);
      expect(result.body).toEqual({ status: 'ok', database: 'up' });
    } finally { await app.close(); }
    expect(app.getHttpServer().listening).toBe(false);
    expect(process.listenerCount('SIGTERM')).toBe(listeners);
  });
  it('rejects a busy port and releases the failed application', async () => {
    const occupied = createServer();
    await new Promise<void>((resolve) => occupied.listen(0, '127.0.0.1', resolve));
    const address = occupied.address() as AddressInfo;
    try {
      await expect(startApplication({ ...parseRuntimeConfig(process.env), port: address.port })).rejects.toMatchObject({ code: 'EADDRINUSE' });
    } finally { await new Promise<void>((resolve, reject) => occupied.close((error) => error ? reject(error) : resolve())); }
  });
});
