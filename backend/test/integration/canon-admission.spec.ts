import { mkdtemp, readFile, writeFile, unlink, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { readCanonSnapshot, type CanonFiles } from '../../src/modules/biblical-canon/infrastructure/admitted-canon';
import { importTestCanonSnapshot } from '../../src/modules/biblical-canon/infrastructure/import-test-canon';
import { CanonSnapshotError } from '../../src/modules/biblical-canon/application/errors';
import type { Database } from '../../src/infrastructure/database';
import { canonSnapshot, canonVerses, cleanCanon, openCanonTestDatabase } from '../helpers/canon';
import { expectNoApplicationSessions } from '../helpers/database-observation';

export const canonFiles: CanonFiles = { archive: 'data/biblical-canon/porbr2018/source.zip', snapshot: 'data/biblical-canon/porbr2018/snapshot.json', manifest: 'test/fixtures/biblical-canon/porbr2018/manifest.json' };
describe('pinned biblical archive and prepared full snapshot', () => {
  let db: Database;
  beforeAll(async () => { db = await openCanonTestDatabase(); await cleanCanon(db); });
  afterAll(async () => { if (db) { try { await cleanCanon(db); } finally { await db.onModuleDestroy(); } } });
  it('recovers the complete authenticated inventory and exact genuine fixture text', async () => {
    const snapshot = await readCanonSnapshot(canonFiles);
    expect(snapshot.translation).toEqual(canonSnapshot().translation);
    expect(snapshot.books).toHaveLength(66); expect(snapshot.chapters).toHaveLength(1189); expect(snapshot.verses).toHaveLength(31102);
    for (const fixture of canonVerses) expect(snapshot.verses.find(v => v.bookCode === fixture.bookCode && v.chapter === fixture.chapter && v.number === fixture.number)).toEqual(fixture);
  });
  it.each(['archive', 'snapshot', 'manifest'] as const)('rejects altered %s bytes/metadata', async key => {
    const directory = await mkdtemp('reports/canon-admission-'); const changed = join(directory, 'changed');
    try { const bytes = await readFile(canonFiles[key]); await writeFile(changed, Buffer.concat([bytes, Buffer.from(key === 'manifest' ? 'not-json' : 'changed')])); await expect(readCanonSnapshot({ ...canonFiles, [key]: changed })).rejects.toThrow(CanonSnapshotError); }
    finally { await unlink(changed); await rmdir(directory); }
  });
  it.each(['archive', 'snapshot', 'manifest'] as const)('rejects missing %s', async key => {
    await expect(readCanonSnapshot({ ...canonFiles, [key]: 'reports/no-such-canon-file' })).rejects.toThrow(CanonSnapshotError);
  });
  it.each(['snapshot', 'manifest'] as const)('rejects modified but still parseable %s metadata', async key => {
    const directory = await mkdtemp('reports/canon-admission-');
    const changed = join(directory, 'changed.json');
    try {
      const data = JSON.parse(await readFile(canonFiles[key], 'utf8')) as { translation: { attribution: string } };
      data.translation.attribution += ' changed';
      await writeFile(changed, JSON.stringify(data));
      await expect(readCanonSnapshot({ ...canonFiles, [key]: changed })).rejects.toThrow(CanonSnapshotError);
    } finally { await unlink(changed); await rmdir(directory); }
  });
  it.each([{ NODE_ENV: 'development' }, { TEST_DATABASE_URL: 'postgresql://localhost:5432/bible_db?schema=app' }])('refuses unsafe import target %j before any write', async override => {
    await expect(importTestCanonSnapshot({ ...process.env, ...override }, canonFiles)).rejects.toThrow('Unsafe test database');
    expect(await db.client.canonTranslation.count()).toBe(0);
  });
  it('closes its connection on an actual admission failure without writing partial metadata', async () => {
    await expect(importTestCanonSnapshot(process.env, { ...canonFiles, snapshot: 'reports/missing-canon' })).rejects.toThrow(CanonSnapshotError);
    expect(await db.client.canonTranslation.count()).toBe(0);
    await expectNoApplicationSessions(db);
  });
});
