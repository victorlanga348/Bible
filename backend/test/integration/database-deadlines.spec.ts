import { createServer, connect, type Socket } from 'node:net';
import { assertTestTarget } from '../../src/config/runtime-config';
import { Database } from '../../src/infrastructure/database';

async function delayedPostgres(connectionDelay: number, responseDelay: () => number) {
  const target = new URL(assertTestTarget(process.env));
  const upstreamAddress = { host: target.hostname, port: Number(target.port || 5432) };
  const sockets = new Set<Socket>();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const server = createServer(downstream => {
    sockets.add(downstream);
    let upstream: Socket | undefined;
    const pending = setTimeout(() => {
      timers.delete(pending);
      if (downstream.destroyed) return;
      upstream = connect(upstreamAddress);
      sockets.add(upstream);
      upstream.on('error', () => downstream.destroy());
      upstream.on('close', () => { if (upstream) sockets.delete(upstream); });
      downstream.pipe(upstream);
      upstream.on('data', bytes => {
        const delay = responseDelay();
        // A negative value simulates a transport that drops server responses.
        if (delay < 0) return;
        if (!delay) { if (!downstream.destroyed) downstream.write(bytes); return; }
        const timer = setTimeout(() => { timers.delete(timer); if (!downstream.destroyed) downstream.write(bytes); }, delay);
        timers.add(timer);
      });
      upstream.on('end', () => downstream.end());
      downstream.on('end', () => upstream?.end());
    }, connectionDelay);
    timers.add(pending);
    downstream.on('error', () => upstream?.destroy());
    downstream.on('close', () => { clearTimeout(pending); timers.delete(pending); upstream?.destroy(); sockets.delete(downstream); });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Proxy did not bind loopback');
  target.hostname = '127.0.0.1'; target.port = String(address.port);
  return { url: target.href, close: async () => {
    for (const timer of timers) clearTimeout(timer);
    for (const socket of sockets) socket.destroy();
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  } };
}

describe('bounded PostgreSQL deadlines over a controlled local TCP proxy', () => {
  it('allows a2500ms cold connection and still confirms the real isolated server identity', async () => {
    const proxy = await delayedPostgres(2500, () => 0);
    const database = new Database(proxy.url);
    try {
      expect(await database.client.$queryRaw`SELECT current_database() AS db, current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
    } finally { try { await database.onModuleDestroy(); } finally { await proxy.close(); } }
  });
  it('receives the2s server cancellation through delayed transport and can query again', async () => {
    let responseDelay = 0;
    const proxy = await delayedPostgres(0, () => responseDelay);
    const database = new Database(proxy.url);
    try {
      expect(await database.client.$queryRaw`SELECT current_database() AS db, current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
      responseDelay = 500;
      await expect(database.client.$queryRaw`SELECT pg_sleep(3)`).rejects.toThrow(/statement timeout/);
      responseDelay = 0;
      expect(await database.client.$queryRaw`SELECT 1::int AS value`).toEqual([{ value: 1 }]);
    } finally { try { await database.onModuleDestroy(); } finally { await proxy.close(); } }
  });
  it('keeps a finite client read deadline when the transport loses all replies', async () => {
    let responseDelay = 0;
    const proxy = await delayedPostgres(0, () => responseDelay);
    const database = new Database(proxy.url);
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    try {
      expect(await database.client.$queryRaw`SELECT current_database() AS db, current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
      responseDelay = -1;
      const missingDeadline = new Promise<never>((_resolve, reject) => { watchdog = setTimeout(() => reject(new Error('Missing client read deadline')), 9000); });
      await expect(Promise.race([database.client.$queryRaw`SELECT 1::int AS value`, missingDeadline])).rejects.toThrow(/Query read timeout/);
    } finally {
      clearTimeout(watchdog);
      try { await proxy.close(); } finally { await database.onModuleDestroy(); }
    }
  }, 15000);
});
