import { PrismaClient } from '../../../src/generated/prisma/client';
import { Database } from '../../../src/infrastructure/database';
import { importTestSnapshot } from '../../../src/modules/source-library/infrastructure/import-test-snapshot';

describe('defensive server identity guard (local client-query double, not integration proof)', () => {
  it.each([
    [{ db: 'biblia_dev', role: 'biblia_test' }],
    [{ db: 'biblia_test', role: 'another-role' }],
    [], [{ role: 'biblia_test' }], [{ db: 'biblia_test' }],
  ])('refuses an unexpected identity response %j and closes before reading/importing', async (...rows) => {
    const query = jest.spyOn(PrismaClient.prototype, '$queryRaw').mockResolvedValue(rows);
    const closed = jest.spyOn(Database.prototype, 'onModuleDestroy');
    try {
      await expect(importTestSnapshot(process.env, { source: 'not-read', manifest: 'not-read', excerpts: 'not-read', notice: 'not-read' })).rejects.toThrow('Unsafe test identity');
      expect(query).toHaveBeenCalledTimes(1);
      expect(closed).toHaveBeenCalledTimes(1);
    } finally { query.mockRestore(); closed.mockRestore(); }
  });
});
