import { mkdtemp, readFile, writeFile, unlink, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { readAdmittedSnapshot, type SnapshotFiles } from '../../../src/modules/source-library/infrastructure/admitted-snapshot';
import { importTestSnapshot } from '../../../src/modules/source-library/infrastructure/import-test-snapshot';
import { SourceSnapshotError } from '../../../src/modules/source-library/application/errors';
import { cleanSourceTestData, openSourceTestDatabase, sourceSnapshot } from '../../helpers/source-library';
import type { Database } from '../../../src/infrastructure/database';
import { expectNoApplicationSessions } from '../../helpers/database-observation';

export const admittedFiles: SnapshotFiles = {
  source: 'data/source-library/josephus-antiquities-pg2848-en/source.html',
  manifest: 'test/fixtures/source-library/josephus-antiquities-pg2848-en/manifest.json',
  excerpts: 'test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json',
  notice: 'test/fixtures/source-library/josephus-antiquities-pg2848-en/NOTICE.source.txt',
};

describe('admitted local artefacts and guarded test import', () => {
  let database: Database;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => { await cleanSourceTestData(database); });
  afterAll(async () => { if (database) { try { await cleanSourceTestData(database); } finally { await database.onModuleDestroy(); } } });
  it('reconstructs only the exact admitted four-paragraph snapshot including its original notice', async () => {
    expect(await readAdmittedSnapshot(admittedFiles)).toEqual(sourceSnapshot());
  });
  it.each(['source', 'manifest', 'excerpts', 'notice'] as const)('rejects a changed %s before any persistence', async key => {
    const directory = await mkdtemp('reports/admission-');
    const changed = join(directory, 'changed');
    try {
      await writeFile(changed, Buffer.concat([await readFile(admittedFiles[key]), Buffer.from('\nchanged')]));
      await expect(readAdmittedSnapshot({ ...admittedFiles, [key]: changed })).rejects.toThrow(SourceSnapshotError);
      expect(await database.client.sourceLibrarySource.count()).toBe(0);
    } finally { await unlink(changed); await rmdir(directory); }
  });
  it.each(['source', 'manifest', 'excerpts', 'notice'] as const)('rejects a missing %s as an invalid snapshot', async key => {
    await expect(readAdmittedSnapshot({ ...admittedFiles, [key]: 'reports/no-such-admitted-file' })).rejects.toThrow(SourceSnapshotError);
  });
  it('imports through the guarded entry point and closes its real connection on success', async () => {
    expect(await importTestSnapshot(process.env, admittedFiles)).toBe('imported');
    expect(await importTestSnapshot(process.env, admittedFiles)).toBe('unchanged');
    expect(await database.client.sourceLibraryExcerpt.count()).toBe(4);
    await expectNoApplicationSessions(database);
  });
  it.each([{ NODE_ENV: 'development' }, { TEST_DATABASE_URL: 'postgresql://localhost:55432/biblia_dev?schema=app' }])('refuses unsafe test targets before import', async override => {
    await expect(importTestSnapshot({ ...process.env, ...override }, admittedFiles)).rejects.toThrow('Unsafe test database');
    expect(await database.client.sourceLibrarySource.count()).toBe(0);
  });
  it('does not leave a connection or rows after an invalid artefact', async () => {
    await expect(importTestSnapshot(process.env, { ...admittedFiles, notice: 'reports/missing-notice' })).rejects.toThrow(SourceSnapshotError);
    expect(await database.client.sourceLibrarySource.count()).toBe(0);
    await expectNoApplicationSessions(database);
  });
});
