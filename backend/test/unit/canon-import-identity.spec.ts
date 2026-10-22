import { PrismaClient } from '../../src/generated/prisma/client';
import { Database } from '../../src/infrastructure/database';
import { importTestCanonSnapshot } from '../../src/modules/biblical-canon/infrastructure/import-test-canon';

describe('canonical server identity defence (local query double, not integration evidence)', () => {
  it.each([
    [{ db: 'biblia_dev', role: 'biblia_test' }],
    [{ db: 'biblia_test', role: 'another-role' }],
    [], [{ role: 'biblia_test' }], [{ db: 'biblia_test' }],
  ])('refuses unexpected identity %j and disconnects before reading admitted files', async (...rows) => {
    const query = jest.spyOn(PrismaClient.prototype, '$queryRaw').mockResolvedValue(rows);
    const closed = jest.spyOn(Database.prototype, 'onModuleDestroy');
    try {
      await expect(importTestCanonSnapshot(process.env, { archive: 'not-read', snapshot: 'not-read', manifest: 'not-read' })).rejects.toThrow('Unsafe test identity');
      expect(query).toHaveBeenCalledTimes(1);
      expect(closed).toHaveBeenCalledTimes(1);
    } finally { query.mockRestore(); closed.mockRestore(); }
  });
});
