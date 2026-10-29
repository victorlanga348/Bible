import type { Database } from '../../../src/infrastructure/database';
import { StudyLibrary } from '../../../src/modules/study/application/study-library';
import { AiNotFoundError, AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import { LibraryStudyContextAdapter } from '../../../src/modules/ai-assistant/infrastructure/library-study-adapter';
import { createStudyTestServices } from '../../helpers/study-runtime';
import { cleanStudyTestData } from '../../helpers/study-database';
import { cleanCanon, seedCanon } from '../../helpers/canon';
import { cleanSourceTestData, openSourceTestDatabase } from '../../helpers/source-library';
import { aiCurations, aiExcerptFixtures, aiSourceFixture, seedAiSource } from '../../helpers/ai-source-data';

describe('owner/version context through actual public StudyLibrary, no Bible text sent to AI', () => {
  let database: Database;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => { await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); await seedCanon(database); await seedAiSource(database); });
  afterAll(async () => { if (database) { try { await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); } finally { await database.onModuleDestroy(); } } });
  const services = () => {
    const real = createStudyTestServices(database); const library = new StudyLibrary(real.builder, real.store, real.sourcePort);
    return { ...real, library, adapter: new LibraryStudyContextAdapter(library) };
  };
  it('projects only id/version/reference and evidence metadata, never passage/sections/quote/owner', async () => {
    const { library, adapter, links } = services(); await links.curate(aiCurations[0]!);
    const study = await library.create('technical-owner', 'porbr2018', 'GEN 1:1'); const context = await adapter.read('technical-owner', study.id, 1);
    expect(context).toEqual({ id: study.id, version: 1, reference: study.reference, evidenceRefs: study.evidence.map(row => ({ sourceId: row.sourceId, excerptId: row.excerptId, textSha256: row.textSha256, locator: row.locator })) });
    for (const key of ['ownerId', 'passage', 'sections', 'evidence', 'quote', 'interpretations']) expect(context).not.toHaveProperty(key);
    expect(JSON.stringify(context)).not.toContain(study.passage.verses[0]!.text); expect(JSON.stringify(context)).not.toContain(aiExcerptFixtures[0]!.text);
    for (const value of [context, context.reference, context.evidenceRefs, context.evidenceRefs[0]]) expect(Object.isFrozen(value)).toBe(true);
  });
  it('preserves exact historical version rather than silently reading the latest evidence set', async () => {
    const { library, adapter, links } = services(); const study = await library.create('technical-owner', 'porbr2018', 'GEN 1:1');
    await links.curate(aiCurations[0]!); await library.revise('technical-owner', study.id, 1);
    expect((await adapter.read('technical-owner', study.id, 1)).evidenceRefs).toEqual([]);
    const current = await adapter.read('technical-owner', study.id, 2); expect(current.version).toBe(2); expect(current.evidenceRefs.map(row => row.excerptId)).toEqual([aiExcerptFixtures[0]!.id]);
  });
  it('maps another owner, missing study or missing version to the own not-found error', async () => {
    const { library, adapter } = services(); const study = await library.create('technical-owner', 'porbr2018', 'GEN 1:1');
    await expect(adapter.read('another-owner', study.id, 1)).rejects.toThrow(AiNotFoundError);
    await expect(adapter.read('technical-owner', '00000000-0000-0000-0000-000000000000', 1)).rejects.toThrow(AiNotFoundError);
    await expect(adapter.read('technical-owner', study.id, 2)).rejects.toThrow(AiNotFoundError);
  });
  it('keeps immutable evidence references after current rights revocation without projecting any quote', async () => {
    const { library, adapter, links } = services(); await links.curate(aiCurations[0]!); const study = await library.create('technical-owner', 'porbr2018', 'GEN 1:1');
    await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, quote: 'denied' } } });
    const context = await adapter.read('technical-owner', study.id, 1);
    expect(context.evidenceRefs).toEqual(study.evidence.map(row => ({ sourceId: row.sourceId, excerptId: row.excerptId, textSha256: row.textSha256, locator: row.locator })));
    expect(JSON.stringify(context)).not.toContain(aiExcerptFixtures[0]!.text);
  });
  it('propagates actual SQL failure instead of masking it as a missing study', async () => {
    const { library, adapter } = services(); const study = await library.create('technical-owner', 'porbr2018', 'GEN 1:1');
    await database.client.$executeRaw`ALTER TABLE app.study_version RENAME TO study_version_offline_for_ai_test`;
    try { await expect(adapter.read('technical-owner', study.id, 1)).rejects.toMatchObject({ code: 'P2021' }); }
    finally { await database.client.$executeRaw`ALTER TABLE app.study_version_offline_for_ai_test RENAME TO study_version`; }
  });
  it('maps a real guarded Study SQL failure to unavailable while preserving the cause',async()=>{
    const {adapter}=services();await database.client.$executeRaw`ALTER TABLE app.study_record RENAME TO ai_guard_test_study_offline`;
    try{const failing=adapter.guardActive('technical-owner','00000000-0000-0000-0000-000000000000',async()=>7);await expect(failing).rejects.toThrow(AiUnavailableError);await expect(failing).rejects.toMatchObject({cause:expect.any(Error),message:expect.stringMatching(/\S/)});}
    finally{await database.client.$executeRaw`ALTER TABLE app.ai_guard_test_study_offline RENAME TO study_record`;}
  });

});
