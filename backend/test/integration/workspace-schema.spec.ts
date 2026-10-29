import { randomUUID } from 'node:crypto';
import type { Database } from '../../src/infrastructure/database';
import { openSourceTestDatabase } from '../helpers/source-library';
describe('workspace/lifecycle actual PostgreSQL constraints', () => {
  let database: Database;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  afterEach(async () => { await database.client.$executeRaw`DELETE FROM app.workspace_note WHERE owner_id = 'schema-workspace'`; await database.client.$executeRaw`DELETE FROM app.workspace_favorite WHERE owner_id = 'schema-workspace'`; });
  afterAll(async () => { await database?.onModuleDestroy(); });
  const note = async (patch: Partial<{ owner: string; version: bigint; revision: number; content: string; updatedAt: Date }> = {}) => {
    const data = { owner: 'schema-workspace', version: 1n, revision: 1, content: 'Technical personal note', updatedAt: new Date('2026-10-29T00:00:00Z'), ...patch };
    return database.client.$executeRaw`INSERT INTO app.workspace_note(id,owner_id,study_id,study_version,revision,content,created_at,updated_at) VALUES (${randomUUID()}::uuid,${data.owner},${randomUUID()}::uuid,${data.version},${data.revision},${data.content},'2026-10-29T00:00:00Z'::timestamptz,${data.updatedAt})`;
  };
  it('has the lifecycle default/check and the three owner pagination indexes', async () => {
    const columns = await database.client.$queryRaw<{ column_default: string }[]>`SELECT column_default FROM information_schema.columns WHERE table_schema='app' AND table_name='study_record' AND column_name='lifecycle'`;
    expect(columns).toHaveLength(1); expect(columns[0]!.column_default).toContain('active');
    const rows = await database.client.$queryRaw<{ indexname: string }[]>`SELECT indexname FROM pg_indexes WHERE schemaname='app' AND indexname IN ('workspace_note_owner_study_created_id_idx','workspace_favorite_owner_created_id_idx','ai_conversation_owner_study_created_id_idx')`;
    expect(rows).toHaveLength(3);
    await expect(database.client.$executeRaw`INSERT INTO app.study_record(id,owner_id,current_version,lifecycle) VALUES (${randomUUID()}::uuid,'schema-workspace',1,'unknown')`).rejects.toThrow();
  });
  it.each([{ owner: '' }, { owner: 'bad owner' }, { version: 0n }, { version: 9007199254740992n }, { revision: 0 }, { content: '' }, { content: ' untrimmed ' }, { content: 'x'.repeat(8001) }, { updatedAt: new Date('2026-10-28T00:00:00Z') }])('rejects invalid note columns %p', async patch => { await expect(note(patch)).rejects.toThrow(); });
  it('accepts exact content/revision/version boundaries', async () => { expect(await note({ content: 'x'.repeat(8000), revision: 2147483647, version: 9007199254740991n })).toBe(1); });
  it('enforces unique favorites by owner/study/version, without a foreign module FK', async () => {
    const id = randomUUID(); const studyId = randomUUID();
    const insert = (recordId: string, owner: string, version: bigint) => database.client.$executeRaw`INSERT INTO app.workspace_favorite(id,owner_id,study_id,study_version,created_at) VALUES (${recordId}::uuid,${owner},${studyId}::uuid,${version},now())`;
    expect(await insert(id, 'schema-workspace', 1n)).toBe(1);
    await expect(insert(randomUUID(), 'schema-workspace', 1n)).rejects.toThrow();
    expect(await insert(randomUUID(), 'schema-workspace', 2n)).toBe(1);
    await expect(insert(randomUUID(), '', 1n)).rejects.toThrow();
    await expect(insert(randomUUID(), 'schema-workspace', 0n)).rejects.toThrow();
  });
});
