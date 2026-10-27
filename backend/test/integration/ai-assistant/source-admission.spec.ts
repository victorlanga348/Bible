import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import * as admission from '../../../src/modules/source-library/infrastructure/admitted-snapshot';
import type { Database } from '../../../src/infrastructure/database';
import type { CanonSnapshot } from '../../../src/modules/biblical-canon/application/ports';
import { admitAiSources } from '../../../src/operations/admit-ai-sources';
import { SourceSnapshotError } from '../../../src/modules/source-library/application/errors';
import { cleanCanon, seedCanon } from '../../helpers/canon';
import { cleanStudyTestData } from '../../helpers/study-database';
import { cleanSourceTestData, openSourceTestDatabase } from '../../helpers/source-library';
import { createStudyTestServices } from '../../helpers/study-runtime';
import { aiCurations, aiFixtureFiles, aiSourceFixture } from '../../helpers/ai-source-data';

const snapshot = JSON.parse(readFileSync('test/fixtures/ai-assistant/biblical-canon/porbr2018/snapshot.json', 'utf8')) as CanonSnapshot;
const files = { ...aiFixtureFiles, source: 'data/source-library/josephus-antiquities-pg2848-en/source.html', notice: join(aiFixtureFiles.manifest, '..', 'NOTICE.source.txt') };
describe('AI source operational admission composition; authenticated artefacts and actual public libraries/SQL, no models', () => {
  let database: Database;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => { await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); await seedCanon(database, snapshot); });
  afterAll(async () => { if (database) { try { await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); } finally { await database.onModuleDestroy(); } } });
  it('imports the admitted source and all four real canonical associations, with idempotent retry', async () => {
    const services = createStudyTestServices(database);
    expect(await admitAiSources(services.sources, services.links, files, 'test-ai')).toEqual({ source: 'imported', curations: ['imported', 'imported', 'imported', 'imported'] });
    expect(await database.client.sourceLibrarySource.count()).toBe(1); expect(await database.client.sourceLibraryExcerpt.count()).toBe(4); expect(await database.client.sourceLibraryPassageLink.count()).toBe(4);
    expect((await services.sources.getExcerpt(aiCurations[3]!.excerptId)).source.id).toBe(aiSourceFixture.id);
    expect(await admitAiSources(services.sources, services.links, files, 'test-ai')).toEqual({ source: 'unchanged', curations: ['unchanged', 'unchanged', 'unchanged', 'unchanged'] });
    for (const row of aiCurations) expect(await services.links.find(row)).toEqual([row]);
  });
  it('refuses a test fixture as a development admission before any write', async () => {
    const services = createStudyTestServices(database);
    await expect(admitAiSources(services.sources, services.links, files, 'local-ai')).rejects.toThrow(SourceSnapshotError);
    expect(await database.client.sourceLibrarySource.count()).toBe(0); expect(await database.client.sourceLibraryPassageLink.count()).toBe(0);
  });
  it('also authenticates the operational distribution against its own purpose in the isolated test database', async () => {
    const services = createStudyTestServices(database); const directory = 'admissions/josephus-antiquities-pg2848-en-local-ai-v1';
    expect(await admitAiSources(services.sources, services.links, { ...files, manifest: join(directory, 'manifest.json'), excerpts: join(directory, 'excerpts.json'), notice: join(directory, 'NOTICE.source.txt') }, 'local-ai')).toEqual({ source: 'imported', curations: ['imported', 'imported', 'imported', 'imported'] });
    expect(await database.client.sourceLibraryPassageLink.count()).toBe(4);
  });
  it('refuses a manifest replaced between snapshot verification and curation parsing before importing any source', async () => {
    const directory = await mkdtemp(join(resolve('reports'), 'ai-admission-race-')); const manifest = join(directory, 'manifest.json');
    const bytes = await readFile(files.manifest); await writeFile(manifest, bytes); const actual = admission.readAdmittedSnapshot;
    const observer = jest.spyOn(admission, 'readAdmittedSnapshot').mockImplementation(async (...args) => { const snapshot = await actual(...args); const changed = JSON.parse(bytes.toString('utf8')); changed.curatedPassageLinks[0].rationale = 'Controlled technical replacement of admitted metadata.'; await writeFile(manifest, JSON.stringify(changed)); return snapshot; });
    try { const services = createStudyTestServices(database); await expect(admitAiSources(services.sources, services.links, { ...files, manifest }, 'test-ai')).rejects.toThrow(SourceSnapshotError); expect(await database.client.sourceLibrarySource.count()).toBe(0); }
    finally { observer.mockRestore(); await removeTemporary(directory); }
  });
  it('resumes explicitly after a real SQL failure in curation without duplicating imported source or earlier links', async () => {
    const services = createStudyTestServices(database);
    await database.client.$executeRawUnsafe("CREATE FUNCTION app.ai_test_curation_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.chapter = 2 THEN RAISE EXCEPTION 'controlled-ai-curation-failure'; END IF; RETURN NEW; END $$");
    await database.client.$executeRawUnsafe('CREATE TRIGGER ai_test_curation_failure BEFORE INSERT ON app.source_library_passage_link FOR EACH ROW EXECUTE FUNCTION app.ai_test_curation_failure()');
    try { await expect(admitAiSources(services.sources, services.links, files, 'test-ai')).rejects.toThrow(); expect(await database.client.sourceLibrarySource.count()).toBe(1); expect(await database.client.sourceLibraryPassageLink.count()).toBe(1); }
    finally { await database.client.$executeRawUnsafe('DROP TRIGGER ai_test_curation_failure ON app.source_library_passage_link'); await database.client.$executeRawUnsafe('DROP FUNCTION app.ai_test_curation_failure()'); }
    expect(await admitAiSources(services.sources, services.links, files, 'test-ai')).toEqual({ source: 'unchanged', curations: ['unchanged', 'imported', 'imported', 'imported'] }); expect(await database.client.sourceLibraryPassageLink.count()).toBe(4);
  });
});
async function removeTemporary(directory: string): Promise<void> { if (!directory.startsWith(resolve('reports') + sep + 'ai-admission-race-')) throw new Error('Unsafe test cleanup'); await rm(directory, { recursive: true, force: true }); }
