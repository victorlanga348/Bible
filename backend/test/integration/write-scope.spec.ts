import type { WriteScope } from '../../src/application/write-scope';
import type { Database } from '../../src/infrastructure/database';
import { usingWriteScope, writeTransaction } from '../../src/infrastructure/write-scope';
import { openSourceTestDatabase } from '../helpers/source-library';
import { cleanStudyTestData } from '../helpers/study-database';
import { PrismaStudyRepository } from '../../src/modules/study/infrastructure/prisma-study-repository';
import { studyContent } from '../helpers/study';
describe('opaque short write scope with actual PostgreSQL', () => {
  let database: Database; let other: Database;
  beforeAll(async () => { database = await openSourceTestDatabase(); other = await openSourceTestDatabase(); });
  beforeEach(async () => { await cleanStudyTestData(database); });
  afterAll(async () => { try { await cleanStudyTestData(database); } finally { await other?.onModuleDestroy(); await database?.onModuleDestroy(); } });
  it('uses exactly the parent connection and freezes the capability', async () => {
    await database.client.$transaction(async parent => {
      const first = await parent.$queryRaw<{ pid: number }[]>`SELECT pg_backend_pid() AS pid`;
      await usingWriteScope(database, parent, async scope => {
        expect(Object.isFrozen(scope)).toBe(true);
        const second = await writeTransaction(database, scope, tx => tx.$queryRaw<{ pid: number }[]>`SELECT pg_backend_pid() AS pid`);
        expect(second).toEqual(first);
      });
    });
  });
  it('rolls back a dependent write when the parent callback fails', async () => {
    const row = await new PrismaStudyRepository(database).create('scope-owner', studyContent());
    await expect(database.client.$transaction(parent => usingWriteScope(database, parent, async scope => {
      await writeTransaction(database, scope, tx => tx.studyRecord.update({ where: { id: row.id }, data: { currentVersion: 2n } }));
      throw new Error('controlled-parent-abort');
    }))).rejects.toThrow('controlled-parent-abort');
    expect((await database.client.studyRecord.findUniqueOrThrow({ where: { id: row.id } })).currentVersion).toBe(1n);
  });
  it('commits an independent transaction only when no capability was supplied', async () => {
    const result = await writeTransaction(database, undefined, tx => tx.$queryRaw<{ value: number }[]>`SELECT 7::integer AS value`);
    expect(result).toEqual([{ value: 7 }]);
  });
  it('rejects forged capabilities before invoking any write', async () => {
    let invoked = false;
    await expect(writeTransaction(database, {} as WriteScope, async () => { invoked = true; })).rejects.toThrow('Invalid or expired write scope');
    expect(invoked).toBe(false);
  });
  it('revokes a leaked capability after success or failure', async () => {
    for (const fail of [false, true]) {
      let captured: WriteScope | undefined;
      const operation = database.client.$transaction(tx => usingWriteScope(database, tx, async scope => { captured = scope; if (fail) throw new Error('controlled-scope-abort'); }));
      if (fail) await expect(operation).rejects.toThrow('controlled-scope-abort'); else await operation;
      expect(captured).toBeDefined();
      await expect(writeTransaction(database, captured, async () => undefined)).rejects.toThrow('Invalid or expired write scope');
    }
  });
  it('rejects a capability bound to another Database even for the same URL', async () => {
    await database.client.$transaction(tx => usingWriteScope(database, tx, async scope => {
      await expect(writeTransaction(other, scope, async () => undefined)).rejects.toThrow('Invalid or expired write scope');
      expect(await writeTransaction(database, scope, client => client.$queryRaw`SELECT 1`)).toHaveLength(1);
    }));
  });
  it('finishes five parent callbacks without requiring a sixth pool connection', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => database.client.$transaction(tx => usingWriteScope(database, tx, scope => writeTransaction(database, scope, client => client.$queryRaw`SELECT 1`)))));
    expect(results).toHaveLength(5); for (const result of results) expect(result).toHaveLength(1);
  });
});
