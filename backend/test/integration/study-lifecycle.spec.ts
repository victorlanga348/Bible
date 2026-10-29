import type { WriteScope } from '../../src/application/write-scope';
import { randomUUID } from 'node:crypto';
import type { Database } from '../../src/infrastructure/database';
import { writeTransaction } from '../../src/infrastructure/write-scope';
import { StudyNotFoundError } from '../../src/modules/study/application/errors';
import { PrismaStudyRepository } from '../../src/modules/study/infrastructure/prisma-study-repository';
import { openSourceTestDatabase } from '../helpers/source-library';
import { cleanStudyTestData } from '../helpers/study-database';
import { studyContent } from '../helpers/study';
const barrier = () => { let resolve!: () => void; const promise = new Promise<void>(done => { resolve = done; }); return { promise, resolve }; };
describe('study lifecycle, metadata and guarded writes with real PostgreSQL', () => {
  let database: Database; let repository: PrismaStudyRepository;
  beforeAll(async () => { database = await openSourceTestDatabase(); repository = new PrismaStudyRepository(database); });
  beforeEach(async () => { await cleanStudyTestData(database); });
  afterAll(async () => { try { await cleanStudyTestData(database); } finally { await database?.onModuleDestroy(); } });
  const seed = () => repository.create('lifecycle-owner', studyContent());
  it('returns only owned metadata for the exact saved version, without source/model queries', async () => {
    const saved = await seed(); const second = await repository.append(saved.ownerId, saved.id, 1, studyContent());
    expect(await repository.metadata(saved.ownerId, saved.id)).toEqual({ id: saved.id, version: 2, createdAt: second.createdAt, reference: studyContent().reference });
    expect(await repository.metadata(saved.ownerId, saved.id, 1)).toEqual({ id: saved.id, version: 1, createdAt: saved.createdAt, reference: studyContent().reference });
    expect(await repository.metadata('foreign-owner', saved.id)).toBeNull(); expect(await repository.metadata(saved.ownerId, saved.id, 3)).toBeNull();
  });
  it('hides a durable deleting study from normal reads, metadata and version append', async () => {
    const saved = await seed(); await repository.beginDelete(saved.ownerId, saved.id);
    expect((await database.client.studyRecord.findUniqueOrThrow({ where: { id: saved.id } })).lifecycle).toBe('deleting');
    expect(await repository.find(saved.ownerId, saved.id)).toBeNull(); expect(await repository.find(saved.ownerId, saved.id, 1)).toBeNull(); expect(await repository.metadata(saved.ownerId, saved.id)).toBeNull();
    expect(await repository.list(saved.ownerId, { limit: 20 })).toEqual([]);
    await expect(repository.append(saved.ownerId, saved.id, 1, studyContent())).rejects.toThrow(StudyNotFoundError);
    expect(await database.client.studyVersion.count()).toBe(1);
  });
  it('makes begin idempotent only for the owner, finish requires the marker and cascades its versions', async () => {
    const saved = await seed(); await expect(repository.finishDelete(saved.ownerId, saved.id)).rejects.toThrow(StudyNotFoundError);
    await expect(repository.beginDelete('foreign-owner', saved.id)).rejects.toThrow(StudyNotFoundError);
    await repository.beginDelete(saved.ownerId, saved.id); await repository.beginDelete(saved.ownerId, saved.id);
    await expect(repository.finishDelete('foreign-owner', saved.id)).rejects.toThrow(StudyNotFoundError);
    await repository.finishDelete(saved.ownerId, saved.id); expect(await database.client.studyVersion.count()).toBe(0);
    await expect(repository.beginDelete(saved.ownerId, saved.id)).rejects.toThrow(StudyNotFoundError);
  });
  it('never enters a guarded callback for missing, foreign or deleting studies', async () => {
    const saved = await seed(); let entered = 0; const write = async () => { entered++; };
    await expect(repository.guardActive('foreign-owner', saved.id, write)).rejects.toThrow(StudyNotFoundError);
    await expect(repository.guardActive(saved.ownerId, randomUUID(), write)).rejects.toThrow(StudyNotFoundError);
    await repository.beginDelete(saved.ownerId, saved.id);
    await expect(repository.guardActive(saved.ownerId, saved.id, write)).rejects.toThrow(StudyNotFoundError); expect(entered).toBe(0);
  });
  it('commits and rolls back guarded writes on the parent connection', async () => {
    const saved = await seed();
    const run = (fail: boolean) => repository.guardActive(saved.ownerId, saved.id, async scope => {
      await writeTransaction(database, scope, tx => tx.studyRecord.update({ where: { id: saved.id }, data: { currentVersion: 2n } }));
      if (fail) throw new Error('controlled-guard-abort'); return 7;
    });
    await expect(run(true)).rejects.toThrow('controlled-guard-abort'); expect((await database.client.studyRecord.findUniqueOrThrow({ where: { id: saved.id } })).currentVersion).toBe(1n);
    expect(await run(false)).toBe(7); expect((await database.client.studyRecord.findUniqueOrThrow({ where: { id: saved.id } })).currentVersion).toBe(2n);
  });
  it('orders pages by stable record date/id and excludes owners and new earlier-page insertions', async () => {
    const a = await seed(); const b = await seed(); const time = new Date('2026-10-29T00:00:00Z');
    await database.client.studyRecord.updateMany({ data: { createdAt: time } });
    const ordered = [a.id, b.id].sort().reverse(); const first = await repository.list(a.ownerId, { limit: 1 });
    expect(first.map(row => row.id)).toEqual(ordered); expect(first[0]).toMatchObject({ createdAt: time.toISOString(), version: 1 });
    await seed(); const second = await repository.list(a.ownerId, { limit: 1, cursor: { id: ordered[0]!, createdAt: time.toISOString() } });
    expect(second.map(row => row.id)).toEqual([ordered[1]]); expect(await repository.list('foreign-owner', { limit: 20 })).toEqual([]);
  });
  it('serializes deletion after an already guarded write using an observed server lock', async () => {
    const saved = await seed(); const entered = barrier(); const release = barrier();
    const writing = repository.guardActive(saved.ownerId, saved.id, async scope => { entered.resolve(); await release.promise; return writeTransaction(database, scope, tx => tx.$queryRaw`SELECT 1`); });
    await Promise.race([entered.promise, writing]); const deleting = repository.beginDelete(saved.ownerId, saved.id);
    let blocked = false;
    try {
      const deadline = Date.now() + 1200;
      while (Date.now() < deadline) {
        const rows = await database.client.$queryRaw<{ count: number }[]>`SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE '%study_record%'`;
        if (rows[0]!.count > 0) { blocked = true; break; }
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    } finally { release.resolve(); await writing; await deleting; }
    expect(blocked).toBe(true); await expect(repository.guardActive(saved.ownerId, saved.id, async () => undefined)).rejects.toThrow(StudyNotFoundError);
  });
  it('rolls back a timed-out guarded child transaction before deletion and revokes its capability',async()=>{
    const saved=await seed();let captured:WriteScope|undefined;
    const operation=repository.guardActive(saved.ownerId,saved.id,async scope=>{captured=scope;await writeTransaction(database,scope,tx=>tx.studyRecord.update({where:{id:saved.id},data:{currentVersion:2n}}));await writeTransaction(database,scope,tx=>tx.$executeRaw`SELECT pg_sleep(3)`);});
    await expect(operation).rejects.toThrow(/statement timeout/);expect((await database.client.studyRecord.findUniqueOrThrow({where:{id:saved.id}})).currentVersion).toBe(1n);
    await repository.beginDelete(saved.ownerId,saved.id);await expect(writeTransaction(database,captured,tx=>tx.studyRecord.update({where:{id:saved.id},data:{currentVersion:2n}}))).rejects.toThrow('Invalid or expired write scope');
    expect((await database.client.studyRecord.findUniqueOrThrow({where:{id:saved.id}})).lifecycle).toBe('deleting');
  });

  it.each(['missing','counter'] as const)('fails closed when the current metadata snapshot is %s',async defect=>{
    const saved=await seed();
    if(defect==='missing')await database.client.studyVersion.deleteMany({where:{studyId:saved.id}});
    else await database.client.studyRecord.update({where:{id:saved.id},data:{currentVersion:2n}});
    await expect(repository.list(saved.ownerId,{limit:20})).rejects.toThrow('Current study snapshot is missing');
  });

});
