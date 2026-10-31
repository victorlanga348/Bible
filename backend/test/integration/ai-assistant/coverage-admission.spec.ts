import { readFileSync } from 'node:fs';
import { mkdtemp, readFile, writeFile, unlink, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Database } from '../../../src/infrastructure/database';
import type { CanonSnapshot } from '../../../src/modules/biblical-canon/application/ports';
import type { CuratedPassageLinkProps } from '../../../src/modules/source-library/domain/curated-passage-link';
import { admitAiSources } from '../../../src/operations/admit-ai-sources';
import { admitAiCoverage } from '../../../src/operations/admit-ai-coverage';
import { SourceSnapshotError } from '../../../src/modules/source-library/application/errors';
import { cleanCanon, seedCanon } from '../../helpers/canon';
import { cleanStudyTestData } from '../../helpers/study-database';
import { cleanSourceTestData, openSourceTestDatabase } from '../../helpers/source-library';
import { createStudyTestServices } from '../../helpers/study-runtime';
import { aiFixtureFiles } from '../../helpers/ai-source-data';

const fixtureDirectory = 'test/fixtures/ai-assistant/coverage-v1';
const snapshot = JSON.parse(readFileSync(join(fixtureDirectory, 'canon.json'), 'utf8')) as CanonSnapshot;
const manifest = JSON.parse(readFileSync(join(fixtureDirectory, 'manifest.json'), 'utf8')) as { curatedPassageLinks: CuratedPassageLinkProps[] };
const files = { ...aiFixtureFiles, source: 'data/source-library/josephus-antiquities-pg2848-en/source.html', notice: join(aiFixtureFiles.manifest, '..', 'NOTICE.source.txt') };

describe('additional genuine narrative coverage, actual canonical/source libraries and PostgreSQL', () => {
  let database: Database;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => {
    await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database);
    await seedCanon(database, snapshot);
  });
  afterAll(async () => {
    if (database) { try { await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); }
      finally { await database.onModuleDestroy(); } }
  });
  async function prepare() {
    const services = createStudyTestServices(database);
    await admitAiSources(services.sources, services.links, files, 'test-ai');
    return services;
  }
  it('makes all four new canonical intervals available to real study construction without changing the source text', async () => {
    const services = await prepare();
    await admitAiCoverage(services.links, join(fixtureDirectory, 'manifest.json'), 'test-ai');
    for (const link of manifest.curatedPassageLinks) {
      expect(await services.links.find(link)).toEqual([link]);
      const result = await services.builder.execute(link.translationId, `${link.bookCode} ${link.chapter}:${link.fromVerse}-${link.toVerse}`);
      expect(result.evidence.some(evidence => evidence.excerptId === link.excerptId)).toBe(true);
    }
    expect(await database.client.sourceLibrarySource.count()).toBe(1);
    expect(await database.client.sourceLibraryExcerpt.count()).toBe(4);
    expect(await database.client.sourceLibraryPassageLink.count()).toBe(8);
  });
  it.each([
    ['test-ai', 'admissions/ai-coverage-v1.json'],
    ['local-ai', join(fixtureDirectory, 'manifest.json')],
    ['unadmitted', join(fixtureDirectory, 'manifest.json')],
  ])('refuses purpose %s against %s before any additional curation write', async (purpose, file) => {
    const services = await prepare();
    await expect(admitAiCoverage(services.links, file!, purpose as 'test-ai')).rejects.toThrow(SourceSnapshotError);
    expect(await database.client.sourceLibraryPassageLink.count()).toBe(4);
  });
  it('rejects a missing manifest with the admission error and preserves existing links', async () => {
    const services = await prepare();
    await expect(admitAiCoverage(services.links, join(fixtureDirectory, 'missing.json'), 'test-ai')).rejects.toThrow(SourceSnapshotError);
    expect(await database.client.sourceLibraryPassageLink.count()).toBe(4);
  });
  it('rejects altered but valid JSON bytes before adding any association', async () => {
    const services = await prepare(); const directory = await mkdtemp('reports/ai-coverage-'); const changed = join(directory, 'manifest.json');
    try {
      await writeFile(changed, Buffer.concat([await readFile(join(fixtureDirectory, 'manifest.json')), Buffer.from('\n')]));
      await expect(admitAiCoverage(services.links, changed, 'test-ai')).rejects.toThrow(SourceSnapshotError);
      expect(await database.client.sourceLibraryPassageLink.count()).toBe(4);
    } finally { await unlink(changed); await rmdir(directory); }
  });
  it.each([
    ['local-ai', 'admissions/ai-coverage-v1.json'],
    ['test-ai', join(fixtureDirectory, 'manifest.json')],
  ] as const)('authenticates the %s distribution and retries without duplicates', async (purpose, file) => {
    const services = await prepare();
    const result = await admitAiCoverage(services.links, file, purpose);
    expect(result).toEqual(['imported', 'imported', 'imported', 'imported']);
    expect(Object.isFrozen(result)).toBe(true);
    expect(await admitAiCoverage(services.links, file, purpose)).toEqual(['unchanged', 'unchanged', 'unchanged', 'unchanged']);
    expect(await database.client.sourceLibraryPassageLink.count()).toBe(8);
  });
  it('propagates a real SQL failure and explicitly resumes the completed prefix', async () => {
    const services = await prepare();
    await database.client.$executeRawUnsafe("CREATE FUNCTION app.coverage_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.chapter = 2 THEN RAISE EXCEPTION 'controlled-coverage-curation-failure'; END IF; RETURN NEW; END $$");
    await database.client.$executeRawUnsafe('CREATE TRIGGER coverage_test_failure BEFORE INSERT ON app.source_library_passage_link FOR EACH ROW EXECUTE FUNCTION app.coverage_test_failure()');
    try {
      await expect(admitAiCoverage(services.links, join(fixtureDirectory, 'manifest.json'), 'test-ai')).rejects.toThrow('controlled-coverage-curation-failure');
      expect(await database.client.sourceLibraryPassageLink.count()).toBe(5);
    } finally {
      await database.client.$executeRawUnsafe('DROP TRIGGER coverage_test_failure ON app.source_library_passage_link');
      await database.client.$executeRawUnsafe('DROP FUNCTION app.coverage_test_failure()');
    }
    expect(await admitAiCoverage(services.links, join(fixtureDirectory, 'manifest.json'), 'test-ai')).toEqual(['unchanged', 'imported', 'imported', 'imported']);
    expect(await database.client.sourceLibraryPassageLink.count()).toBe(8);
  });
});
