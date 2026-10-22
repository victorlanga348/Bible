import { mkdtemp, readFile, writeFile, unlink, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { readAdmittedSnapshot, type SnapshotFiles } from '../../../src/modules/source-library/infrastructure/admitted-snapshot';
import { SourceSnapshotError } from '../../../src/modules/source-library/application/errors';
import { cleanSourceTestData, openSourceTestDatabase } from '../../helpers/source-library';
import { cleanCanon, seedCanon } from '../../helpers/canon';
import { createStudyTestServices } from '../../helpers/study-runtime';
import { passageLinkProps } from '../../helpers/passage-links';
import type { Database } from '../../../src/infrastructure/database';

const files: SnapshotFiles = {
  source: 'data/source-library/josephus-antiquities-pg2848-en/source.html',
  manifest: 'admissions/josephus-antiquities-pg2848-en.local.json',
  excerpts: 'data/source-library/josephus-antiquities-pg2848-en/operational/excerpts.json',
  notice: 'data/source-library/josephus-antiquities-pg2848-en/operational/NOTICE.source.txt',
};
describe('separate raw-derived operational source admission', () => {
  let database: Database;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => { await cleanSourceTestData(database); await cleanCanon(database); await seedCanon(database); });
  afterAll(async () => { if (database) { try { await cleanSourceTestData(database); await cleanCanon(database); } finally { await database.onModuleDestroy(); } } });
  it('admits operational metadata and raw-derived bytes through actual import and public curation', async () => {
    const snapshot = await readAdmittedSnapshot(files, 'local-development');
    const admission = JSON.parse(await readFile(files.manifest, 'utf8')) as { source: unknown; purpose: string };
    expect(JSON.parse(JSON.stringify(snapshot.source))).toEqual(admission.source); expect(admission.purpose).toContain('Local development');
    expect(snapshot.excerpts).toHaveLength(4); expect(snapshot.source.permissions.sendToAi).toBe('pending');
    const services = createStudyTestServices(database);
    expect(await services.sources.importSnapshot(snapshot)).toBe('imported'); expect(await services.sources.importSnapshot(snapshot)).toBe('unchanged');
    expect(await services.links.curate(passageLinkProps())).toBe('imported');
    expect((await services.builder.execute('porbr2018', 'GEN 1:1')).evidence[0]!.quote).toBe(snapshot.excerpts[0]!.text);
  });
  it('keeps test and local-development admissions separate', async () => {
    await expect(readAdmittedSnapshot(files)).rejects.toThrow(SourceSnapshotError);
    await expect(readAdmittedSnapshot({ ...files, manifest: 'test/fixtures/source-library/josephus-antiquities-pg2848-en/manifest.json' }, 'local-development')).rejects.toThrow(SourceSnapshotError);
  });
  it.each(['source', 'manifest', 'excerpts', 'notice'] as const)('rejects altered operational %s before storage', async key => {
    const directory = await mkdtemp('reports/operational-admission-'); const changed = join(directory, 'changed');
    try {
      await writeFile(changed, Buffer.concat([await readFile(files[key]), Buffer.from('\nchanged')]));
      await expect(readAdmittedSnapshot({ ...files, [key]: changed }, 'local-development')).rejects.toThrow(SourceSnapshotError);
      expect(await database.client.sourceLibraryExcerpt.count()).toBe(0);
    } finally { await unlink(changed); await rmdir(directory); }
  });
});
