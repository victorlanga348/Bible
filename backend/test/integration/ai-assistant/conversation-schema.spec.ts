import { assertTestTarget } from '../../../src/config/runtime-config';
import { Database } from '../../../src/infrastructure/database';

describe('conversation additive schema and constraints, actual guarded PostgreSQL; configuration verification', () => {
  let database: Database; let ready = false;
  const id = '11111111-1111-4111-8111-111111111111'; const studyId = '22222222-2222-4222-8222-222222222222';
  const owner = 'technical-conversation-owner'; const createdAt = '2026-10-28T10:00:00.000Z';
  const document = { schemaVersion: 1, id, ownerId: owner, studyId, studyVersion: 1, createdAt, turns: [] };
  beforeAll(async () => {
    database = new Database(assertTestTarget(process.env));
    expect(await database.client.$queryRaw`SELECT current_database() AS db,current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
    const [row] = await database.client.$queryRaw<{ exists: boolean }[]>`SELECT to_regclass('app.ai_conversation') IS NOT NULL AS exists`;
    expect(row!.exists).toBe(true); ready = true;
  });
  beforeEach(async () => { await database.client.$executeRaw`DELETE FROM app.ai_conversation`; });
  afterAll(async () => { if (database) { try { if (ready) await database.client.$executeRaw`DELETE FROM app.ai_conversation`; } finally { await database.onModuleDestroy(); } } });
  const insert = (value: { owner?: string; version?: bigint; revision?: number; document?: unknown } = {}) => database.client.$executeRaw`
    INSERT INTO app.ai_conversation(id,owner_id,study_id,study_version,revision,document,created_at)
    VALUES (${id}::uuid,${value.owner ?? owner},${studyId}::uuid,${value.version ?? 1n},${value.revision ?? 0},${JSON.stringify(value.document === undefined ? document : value.document)}::jsonb,${createdAt}::timestamptz)`;
  it('stores a canonical empty document and exposes no cross-module foreign keys', async () => {
    expect(await insert()).toBe(1);
    expect(await database.client.$queryRaw`SELECT study_version,revision,document FROM app.ai_conversation`).toEqual([{ study_version: 1n, revision: 0, document }]);
    expect(await database.client.$queryRaw`SELECT conname FROM pg_constraint WHERE conrelid='app.ai_conversation'::regclass AND contype='f'`).toEqual([]);
  });
  it.each([
    { owner: 'bad owner' }, { owner: 'a'.repeat(65) }, { version: 0n }, { version: 9007199254740992n },
    { revision: -1 }, { revision: 21 }, { revision: 1 }, { document: null }, { document: [] },
    { document: { schemaVersion: 2, turns: [] } }, { document: { schemaVersion: 1 } },
    { document: { schemaVersion: 1, turns: null } }, { document: { schemaVersion: 1, turns: {} } },
  ])('rejects invalid durable metadata %p without leaving a row', async invalid => {
    await expect(insert(invalid)).rejects.toMatchObject({ code: 'P2010' });
    expect(await database.client.$queryRaw`SELECT count(*)::int AS count FROM app.ai_conversation`).toEqual([{ count: 0 }]);
  });
});
