import type { Database } from '../../src/infrastructure/database';
import { StudyLibrary } from '../../src/modules/study/application/study-library';
import { StudyConflictError, StudyNotFoundError } from '../../src/modules/study/application/errors';
import { cleanCanon, seedCanon } from '../helpers/canon';
import { cleanSourceTestData, openSourceTestDatabase, seedCuratedSource, sourceFixture } from '../helpers/source-library';
import { cleanStudyTestData } from '../helpers/study-database';
import { seedPassageLink } from '../helpers/passage-links';
import { createStudyTestServices } from '../helpers/study-runtime';
import { realEvidence, studyContent } from '../helpers/study';

describe('private study application with real canon, sources and persistence', () => {
  let database: Database; let services: ReturnType<typeof createStudyTestServices>; let library: StudyLibrary;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => {
    await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database);
    await seedCanon(database); await seedCuratedSource(database); await seedPassageLink(database);
    services = createStudyTestServices(database); library = new StudyLibrary(services.builder, services.store, services.sourcePort);
  });
  afterAll(async () => { if (database) { try { await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); } finally { await database.onModuleDestroy(); } } });
  it('creates a private version and reads its retained snapshot without regeneration', async () => {
    const created = await library.create('owner-a', 'porbr2018', 'GEN 1:1');
    expect(created).toMatchObject({ version: 1, reference: { normalized: 'GEN 1:1' }, evidence: [{ ...realEvidence(), availability: 'available' }] });
    expect(created).not.toHaveProperty('ownerId');
    await database.client.canonVerse.deleteMany();
    expect(await library.read('owner-a', created.id)).toEqual(created);
    expect(await library.read('owner-a', created.id, 1)).toEqual(created);
    expect(await database.client.studyVersion.count()).toBe(1);
  });
  it('hides absent studies, other owners and absent explicit versions', async () => {
    const saved = await services.store.create('owner-a', studyContent());
    await expect(library.read('owner-b', saved.id)).rejects.toThrow(StudyNotFoundError);
    await expect(library.read('owner-a', '00000000-0000-0000-0000-000000000000')).rejects.toThrow(StudyNotFoundError);
    await expect(library.read('owner-a', saved.id, 2)).rejects.toThrow(StudyNotFoundError);
    await expect(library.revise('owner-b', saved.id, 1)).rejects.toThrow(StudyNotFoundError);
  });
  it('revises the original reference and retains independently readable immutable versions', async () => {
    const initial = await library.create('owner-a', 'porbr2018', 'GEN 1:1');
    const next = await library.revise('owner-a', initial.id, 1);
    expect(next).toMatchObject({ id: initial.id, version: 2, reference: initial.reference, passage: initial.passage });
    expect(await library.read('owner-a', initial.id, 1)).toEqual(initial);
    expect(await library.read('owner-a', initial.id)).toEqual(next);
  });
  it('rejects stale revisions before regeneration and safe-integer exhaustion', async () => {
    const saved = await services.store.create('owner-a', studyContent());
    await database.client.canonVerse.deleteMany();
    await expect(library.revise('owner-a', saved.id, 2)).rejects.toThrow(StudyConflictError);
    await database.client.studyRecord.update({ where: { id: saved.id }, data: { currentVersion: BigInt(Number.MAX_SAFE_INTEGER) } });
    await database.client.studyVersion.update({ where: { studyId_number: { studyId: saved.id, number: 1n } }, data: { number: BigInt(Number.MAX_SAFE_INTEGER) } });
    await expect(library.revise('owner-a', saved.id, Number.MAX_SAFE_INTEGER)).rejects.toThrow(StudyConflictError);
    expect(await database.client.studyVersion.count()).toBe(1);
  });
  it('allows one of two genuinely concurrent revisions and reports the loser as conflict', async () => {
    const saved = await services.store.create('owner-a', studyContent());
    const results = await Promise.allSettled([library.revise('owner-a', saved.id, 1), library.revise('owner-a', saved.id, 1)]);
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find(result => result.status === 'rejected');
    expect(rejected?.status === 'rejected' && rejected.reason instanceof StudyConflictError).toBe(true);
    expect(await database.client.studyVersion.count()).toBe(2);
  });
  it('redacts current rights on every read while retaining the original stored evidence', async () => {
    const saved = await services.store.create('owner-a', studyContent());
    await database.client.sourceLibrarySource.update({ where: { id: sourceFixture.id }, data: { permissions: { ...sourceFixture.permissions, quote: 'denied' } } });
    const view = await library.read('owner-a', saved.id);
    expect(view.evidence[0]).toMatchObject({ quote: null, availability: 'restricted' });
    expect(view.sections[4]!.status).toBe('insufficient-evidence'); expect(view.interpretations).toEqual([]);
    expect((await services.store.find('owner-a', saved.id))!.content.evidence[0]!.quote).toBe(realEvidence().quote);
  });
  it.each(['create', 'revise'] as const)('rechecks rights after the actual %s transaction commits', async operation => {
    const saved = await services.store.create('owner-a', studyContent());
    const revoke = async () => { await database.client.sourceLibrarySource.update({ where: { id: sourceFixture.id }, data: { permissions: { ...sourceFixture.permissions, display: 'denied' } } }); };
    // Identified fault boundary: both writes use the actual repository; only the
    // timing of a real source revocation is controlled, after its transaction.
    const store = { find: services.store.find.bind(services.store),
      create: async (...args: Parameters<typeof services.store.create>) => { const result = await services.store.create(...args); await revoke(); return result; },
      append: async (...args: Parameters<typeof services.store.append>) => { const result = await services.store.append(...args); await revoke(); return result; } };
    const checked = new StudyLibrary(services.builder, store, services.sourcePort);
    const view = operation === 'create' ? await checked.create('owner-a', 'porbr2018', 'GEN 1:1') : await checked.revise('owner-a', saved.id, 1);
    expect(view.evidence[0]).toMatchObject({ quote: null, availability: 'restricted' });
    expect(view.sections[4]!.status).toBe('insufficient-evidence');
    expect((await services.store.find('owner-a', view.id))!.content.evidence[0]!.quote).toBe(realEvidence().quote);
  });
  it('propagates corrupted current evidence on read instead of delivering it or inventing absence', async () => {
    const saved = await services.store.create('owner-a', studyContent());
    await database.client.sourceLibraryExcerpt.update({ where: { id: realEvidence().excerptId }, data: { textSha256: 'a'.repeat(64) } });
    await expect(library.read('owner-a', saved.id)).rejects.toThrow('Source text integrity failure');
  });
});
