import type { Database } from '../../src/infrastructure/database';
import { StudyLibrary } from '../../src/modules/study/application/study-library';
import { StudyInputError, StudyNotFoundError } from '../../src/modules/study/application/errors';
import { openSourceTestDatabase } from '../helpers/source-library';
import { cleanStudyTestData } from '../helpers/study-database';
import { createStudyTestServices } from '../helpers/study-runtime';
import { studyContent } from '../helpers/study';
describe('public study lifecycle and metadata library using actual repositories', () => {
  let database: Database; let services: ReturnType<typeof createStudyTestServices>; let library: StudyLibrary;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => { await cleanStudyTestData(database); services = createStudyTestServices(database); library = new StudyLibrary(services.builder, services.store, services.sourcePort); });
  afterAll(async () => { try { await cleanStudyTestData(database); } finally { await database?.onModuleDestroy(); } });
  it('paginates private metadata without source or model availability', async () => {
    const a = await services.store.create('public-owner', studyContent()); const b = await services.store.create('public-owner', studyContent());
    const page = await library.list('public-owner', { limit: 1 }); expect(page.items).toHaveLength(1); expect(page.nextCursor).toEqual({ id: page.items[0]!.id, createdAt: page.items[0]!.createdAt });
    expect(new Set([a.id,b.id]).has(page.items[0]!.id)).toBe(true);
    const next = await library.list('public-owner', { limit: 1, cursor: page.nextCursor! }); expect(next.items).toHaveLength(1); expect(next.items[0]!.id).not.toBe(page.items[0]!.id); expect(next.nextCursor).toBeNull();
    expect(await library.list('foreign-owner', { limit: 20 })).toEqual({ items: [], nextCursor: null });
    expect(await library.metadata('public-owner', a.id, 1)).toEqual({ id: a.id, version: 1, createdAt: a.createdAt, reference: a.content.reference });
    await expect(library.metadata('foreign-owner', a.id)).rejects.toThrow(StudyNotFoundError);
  });
  it('delegates the active guard and durable deletion to study ownership', async () => {
    const study = await services.store.create('public-owner', studyContent());
    expect(await library.guardActive('public-owner', study.id, async () => 8)).toBe(8);
    await library.beginDelete('public-owner', study.id); await expect(library.metadata('public-owner', study.id)).rejects.toThrow(StudyNotFoundError);
    await expect(library.guardActive('public-owner', study.id, async () => 8)).rejects.toThrow(StudyNotFoundError);
    await library.finishDelete('public-owner', study.id); expect(await database.client.studyRecord.count()).toBe(0);
  });
  it.each([0, 51, 1.5, NaN])('rejects invalid list limits before SQL %p', async limit => { await expect(library.list('public-owner', { limit })).rejects.toThrow(StudyInputError); });
  it('rejects malformed cursor or owner before SQL', async () => {
    await expect(library.list('', { limit: 1 })).rejects.toThrow(StudyInputError);
    await expect(library.list('public-owner', { limit: 1, cursor: { id: 'invalid', createdAt: 'invalid' } })).rejects.toThrow(StudyInputError);
  });
});
