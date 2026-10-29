import type { Database } from '../../src/infrastructure/database';
import { Study } from '../../src/modules/study/domain/study';
import { StudyConflictError } from '../../src/modules/study/application/errors';
import { PrismaStudyRepository } from '../../src/modules/study/infrastructure/prisma-study-repository';
import { openSourceTestDatabase } from '../helpers/source-library';
import { cleanStudyTestData, failStudyVersionWrite } from '../helpers/study-database';
import { studyContent, studyProps } from '../helpers/study';

describe('private study snapshots and optimistic versions on real PostgreSQL', () => {
  let database: Database; let repository: PrismaStudyRepository;
  beforeAll(async () => { database = await openSourceTestDatabase(); repository = new PrismaStudyRepository(database); });
  beforeEach(async () => { await cleanStudyTestData(database); });
  afterAll(async () => { if (database) { try { await cleanStudyTestData(database); } finally { await database.onModuleDestroy(); } } });
  it('commits one owned UUID/version/document and reads the exact original content', async () => {
    const input = studyContent(); const saved = await repository.create('Owner.A_1', input);
    expect(saved).toBeInstanceOf(Study); expect(saved).toMatchObject({ ownerId: 'Owner.A_1', version: 1, content: input });
    expect(saved.createdAt).toBe(new Date(saved.createdAt).toISOString());
    expect(await repository.find('Owner.A_1', saved.id)).toEqual(saved);
    expect(await repository.find('Owner.A_1', saved.id, 1)).toEqual(saved);
    expect(await database.client.studyRecord.findUnique({ where: { id: saved.id } })).toEqual({ id: saved.id, ownerId: 'Owner.A_1', currentVersion: 1n, lifecycle: 'active', createdAt: new Date(saved.createdAt) });
    expect((await database.client.studyVersion.findMany()).map(row => row.document)).toEqual([input]);
  });
  it('filters owner in persistence and distinguishes absent versions', async () => {
    const saved = await repository.create('Owner.A_1', studyContent());
    expect(await repository.find('owner-b', saved.id)).toBeNull(); expect(await repository.find('owner.a_1', saved.id)).toBeNull();
    expect(await repository.find('Owner.A_1', saved.id, 2)).toBeNull();
    expect(await repository.find('Owner.A_1', '00000000-0000-0000-0000-000000000000')).toBeNull();
  });
  it('appends a new immutable snapshot while retaining the original version', async () => {
    const first = await repository.create('owner-a', studyContent());
    const content = { ...studyContent(), limitations: [...studyContent().limitations, 'Metadado técnico desta revisão de teste.'] };
    const second = await repository.append('owner-a', first.id, 1, content);
    expect(second).toMatchObject({ id: first.id, ownerId: 'owner-a', version: 2, content });
    expect(await repository.find('owner-a', first.id, 1)).toEqual(first); expect(await repository.find('owner-a', first.id)).toEqual(second);
    expect((await database.client.studyRecord.findUnique({ where: { id: first.id } }))!.currentVersion).toBe(2n);
    expect(await database.client.studyVersion.count()).toBe(2);
  });
  it('refuses stale revision without a third document or lost update', async () => {
    const first = await repository.create('owner-a', studyContent()); await repository.append('owner-a', first.id, 1, studyContent());
    await expect(repository.append('owner-a', first.id, 1, studyContent())).rejects.toThrow(StudyConflictError);
    expect((await repository.find('owner-a', first.id))!.version).toBe(2); expect(await database.client.studyVersion.count()).toBe(2);
  });
  it('revises only one of several independent studies without affecting either owner', async () => {
    const first = await repository.create('owner-a', studyContent()); const other = await repository.create('owner-a', studyContent()); const foreign = await repository.create('owner-b', studyContent());
    expect(first.id).not.toBe(other.id);
    const revised = await repository.append('owner-a', first.id, 1, studyContent());
    expect(revised.version).toBe(2); expect(await repository.find('owner-a', other.id)).toEqual(other);
    expect(await repository.find('owner-b', foreign.id)).toEqual(foreign); expect(await database.client.studyVersion.count()).toBe(4);
  });
  it('cannot append to a record owned by another subject or to an absent identity', async () => {
    const first = await repository.create('owner-a', studyContent());
    await expect(repository.append('owner-b', first.id, 1, studyContent())).rejects.toThrow(StudyConflictError);
    await expect(repository.append('owner-a', '00000000-0000-0000-0000-000000000000', 1, studyContent())).rejects.toThrow(StudyConflictError);
    expect(await repository.find('owner-a', first.id)).toEqual(first); expect(await database.client.studyVersion.count()).toBe(1);
  });
  it('allows exactly one of two concurrent appends with the same expected version', async () => {
    const first = await repository.create('owner-a', studyContent());
    const results = await Promise.allSettled([repository.append('owner-a', first.id, 1, studyContent()), repository.append('owner-a', first.id, 1, studyContent())]);
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.filter(result => result.status === 'rejected'); expect(rejected).toHaveLength(1);
    expect(rejected[0]!.reason).toBeInstanceOf(StudyConflictError);
    expect((await repository.find('owner-a', first.id))!.version).toBe(2); expect(await database.client.studyVersion.count()).toBe(2);
  });
  it('rolls back record creation when the actual version INSERT fails', async () => {
    await failStudyVersionWrite(database, 1);
    await expect(repository.create('owner-a', studyContent())).rejects.toThrow('controlled-study-write-failure');
    expect(await database.client.studyRecord.count()).toBe(0); expect(await database.client.studyVersion.count()).toBe(0);
  });
  it('rolls back the version counter when a real appended INSERT fails', async () => {
    const first = await repository.create('owner-a', studyContent()); await failStudyVersionWrite(database, 2);
    await expect(repository.append('owner-a', first.id, 1, studyContent())).rejects.toThrow('controlled-study-write-failure');
    expect((await database.client.studyRecord.findUnique({ where: { id: first.id } }))!.currentVersion).toBe(1n);
    expect(await repository.find('owner-a', first.id)).toEqual(first); expect(await database.client.studyVersion.count()).toBe(1);
  });
  it('fails as infrastructure corruption when the latest snapshot is missing or malformed', async () => {
    const first = await repository.create('owner-a', studyContent());
    await database.client.studyVersion.updateMany({ data: { document: {} } }); await expect(repository.find('owner-a', first.id)).rejects.toThrow();
    await database.client.studyVersion.deleteMany(); await expect(repository.find('owner-a', first.id)).rejects.toThrow();
    expect(await repository.find('owner-a', first.id, 1)).toBeNull();
  });
  it('keeps the safe version cap atomic without overflowing a JSON number', async () => {
    // Controlled version metadata exercises the cap; it does not pretend that
    // billions of historical documents were created or seed production.
    const input = studyProps(); const document = JSON.stringify(input.content); const limit = BigInt(Number.MAX_SAFE_INTEGER);
    await database.client.$executeRaw`INSERT INTO app.study_record(id,owner_id,current_version,created_at) VALUES (${input.id}::uuid,${input.ownerId},${limit},${new Date(input.createdAt)})`;
    await database.client.$executeRaw`INSERT INTO app.study_version(study_id,number,document,created_at) VALUES (${input.id}::uuid,${limit},${document}::jsonb,${new Date(input.createdAt)})`;
    expect((await repository.find(input.ownerId, input.id))!.version).toBe(Number.MAX_SAFE_INTEGER);
    await expect(repository.append(input.ownerId, input.id, Number.MAX_SAFE_INTEGER, input.content)).rejects.toThrow(StudyConflictError);
    expect((await database.client.studyRecord.findUnique({ where: { id: input.id } }))!.currentVersion).toBe(limit);
    expect(await database.client.studyVersion.count()).toBe(1);
  });
});
