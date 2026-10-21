import { readFileSync } from 'node:fs';
import { assertTestTarget } from '../../src/config/runtime-config';
import { Database } from '../../src/infrastructure/database';

describe('real Prisma, migrations, constraints and transactions', () => {
  let database: Database;
  let fixtureReady = false;
  beforeAll(async () => {
    database = new Database(assertTestTarget(process.env));
    const identity = await database.client.$queryRaw<{ db: string; role: string }[]>`SELECT current_database() AS db, current_user AS role`;
    expect(identity).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
    await database.client.$executeRawUnsafe(readFileSync('test/fixtures/persistence-probe.sql', 'utf8'));
    fixtureReady = true;
  });
  beforeEach(async () => { await database.client.$executeRaw`DELETE FROM app.persistence_probe`; });
  afterAll(async () => {
    if (database) {
      try { if (fixtureReady) await database.client.$executeRaw`DELETE FROM app.persistence_probe`; }
      finally { await database.onModuleDestroy(); }
    }
  });
  it('has applied the versioned migration', async () => {
    const migrations = await database.client.$queryRaw<{ migration_name: string; applied: boolean }[]>`
      SELECT migration_name, finished_at IS NOT NULL AS applied FROM app._prisma_migrations ORDER BY migration_name`;
    expect(migrations).toEqual(expect.arrayContaining([{ migration_name: '202610200001_bootstrap_namespace', applied: true }]));
    expect(migrations.every(migration => migration.applied)).toBe(true);
  });
  it('persists and reads parameterised data without treating SQL as code', async () => {
    const payload = "technical probe'; DROP TABLE app.persistence_probe; --";
    await database.client.$executeRaw`INSERT INTO app.persistence_probe(id, payload) VALUES ('probe', ${payload})`;
    const rows = await database.client.$queryRaw<{ id: string; payload: string }[]>`SELECT id, payload FROM app.persistence_probe`;
    expect(rows).toEqual([{ id: 'probe', payload }]);
  });
  it('enforces a real primary key constraint', async () => {
    await database.client.$executeRaw`INSERT INTO app.persistence_probe VALUES ('probe', 'technical')`;
    await expect(database.client.$executeRaw`INSERT INTO app.persistence_probe VALUES ('probe', 'duplicate')`).rejects.toThrow();
    expect(await database.client.$queryRaw`SELECT count(*)::int AS total FROM app.persistence_probe`).toEqual([{ total: 1 }]);
  });
  it('enforces the database CHECK constraint', async () => {
    await expect(database.client.$executeRaw`INSERT INTO app.persistence_probe VALUES ('probe', '')`).rejects.toThrow();
    expect(await database.client.$queryRaw`SELECT count(*)::int AS total FROM app.persistence_probe`).toEqual([{ total: 0 }]);
  });
  it('commits a real transaction', async () => {
    await database.client.$transaction(async (transaction) => {
      await transaction.$executeRaw`INSERT INTO app.persistence_probe VALUES ('one', 'technical')`;
      await transaction.$executeRaw`INSERT INTO app.persistence_probe VALUES ('two', 'technical')`;
    });
    expect(await database.client.$queryRaw`SELECT count(*)::int AS total FROM app.persistence_probe`).toEqual([{ total: 2 }]);
  });
  it('rolls back all writes when a transaction fails', async () => {
    await expect(database.client.$transaction(async (transaction) => {
      await transaction.$executeRaw`INSERT INTO app.persistence_probe VALUES ('one', 'technical')`;
      await transaction.$executeRaw`INSERT INTO app.persistence_probe VALUES ('two', '')`;
    })).rejects.toThrow();
    expect(await database.client.$queryRaw`SELECT count(*)::int AS total FROM app.persistence_probe`).toEqual([{ total: 0 }]);
  });
  it('closes the physical PostgreSQL session during resource shutdown', async () => {
    const probe = new Database(assertTestTarget(process.env));
    try {
      const identity = await probe.client.$queryRaw<{ pid: number }[]>`SELECT pg_backend_pid() AS pid`;
      expect(identity).toHaveLength(1);
      const pid = identity[0]!.pid;
      await probe.onModuleDestroy();
      const sessions = await database.client.$queryRaw`SELECT pid FROM pg_stat_activity WHERE pid = ${pid}`;
      expect(sessions).toEqual([]);
    } finally { await probe.client.$disconnect(); }
  });
});
