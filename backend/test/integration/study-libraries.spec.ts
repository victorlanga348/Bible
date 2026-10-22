import { readFileSync } from 'node:fs';
import { Database } from '../../src/infrastructure/database';
import { assertTestTarget } from '../../src/config/runtime-config';
import { CanonLibrary } from '../../src/modules/biblical-canon/application/canon-library';
import { PrismaCanonRepository } from '../../src/modules/biblical-canon/infrastructure/prisma-canon-repository';
import { SourceLibrary } from '../../src/modules/source-library/application/source-library';
import { PrismaSourceRepository } from '../../src/modules/source-library/infrastructure/prisma-source-repository';
import { StudyInputError, StudyNotFoundError } from '../../src/modules/study/application/errors';
import { LibraryCanonAdapter } from '../../src/modules/study/infrastructure/library-canon-adapter';
import { LibrarySourceAdapter } from '../../src/modules/study/infrastructure/library-source-adapter';
import { cleanCanon, seedCanon, canonVerses } from '../helpers/canon';
import { cleanSourceTestData, openSourceTestDatabase, seedCuratedSource, sourceFixture } from '../helpers/source-library';
import { seedPassageLink, passageLinkProps } from '../helpers/passage-links';
import { realEvidence, studyContent } from '../helpers/study';
import { createStudyTestServices } from '../helpers/study-runtime';

describe('study adapters consume actual public libraries without cross-module SQL', () => {
  let database: Database; let services: ReturnType<typeof createStudyTestServices>;
  const reference = studyContent().reference;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => {
    await cleanSourceTestData(database); await cleanCanon(database); await seedCanon(database); await seedCuratedSource(database); await seedPassageLink(database);
    services = createStudyTestServices(database);
  });
  afterAll(async () => { if (database) { try { await cleanSourceTestData(database); await cleanCanon(database); } finally { await database.onModuleDestroy(); } } });
  it('loads the exact selected verses and distinct available chapter with edition credits', async () => {
    const result = await services.canonPort.load('porbr2018', ' jhn 3:16-17 ');
    expect(result.reference).toEqual({ translationId: 'porbr2018', bookCode: 'JHN', chapter: 3, fromVerse: 16, toVerse: 17, normalized: 'JHN 3:16-17' });
    expect(result.passage).toEqual({ ...studyContent().passage, verses: canonVerses.slice(1, 3).map(({ number, text }) => ({ number, text })) });
    expect(result.chapter.verses).toEqual(canonVerses.slice(1).map(({ number, text }) => ({ number, text })));
    expect(result.chapter.attribution).toBe(result.passage.attribution); expect(result.chapter.licenseUrl).toBe(result.passage.licenseUrl);
  });
  it.each([['missing-edition', 'GEN 1:1'], ['porbr2018', 'GEN 99:1'], ['porbr2018', 'JHN 3:19']])('maps actual missing scripture %s/%s', async (translation, selection) => {
    await expect(services.canonPort.load(translation, selection)).rejects.toThrow(StudyNotFoundError);
  });
  it('maps malformed reference grammar to study input error', async () => {
    await expect(services.canonPort.load('porbr2018', 'João 3:16')).rejects.toThrow(StudyInputError);
  });
  it('collects only the admitted exact quote, locator, rights and curated rationale', async () => {
    const result = await services.sourcePort.collect(reference);
    expect(result.evidence).toEqual([realEvidence()]); expect(result.comparison).toBe(passageLinkProps().rationale);
    expect(result.limitations).toContain(sourceFixture.limitations);
  });
  it('deduplicates evidence linked under two controlled identities without losing the genuine rationale', async () => {
    await seedPassageLink(database, passageLinkProps({ id: 'second-curation' }));
    const result = await services.sourcePort.collect(reference);
    expect(result.evidence).toEqual([realEvidence()]); expect(result.comparison).toBe(passageLinkProps().rationale);
  });
  it('does not manufacture an association for an unlinked real passage', async () => {
    const selection = { translationId: 'porbr2018', bookCode: 'JHN', chapter: 3, fromVerse: 16, toVerse: 18, normalized: 'JHN 3:16-18' };
    const result = await services.sourcePort.collect(selection);
    expect(result.evidence).toEqual([]); expect(result.comparison).toBe(''); expect(result.limitations.length).toBeGreaterThan(0);
  });
  it('revalidates an unchanged genuine excerpt independently of collection', async () => {
    expect(await services.sourcePort.availability([realEvidence()])).toEqual({ [realEvidence().excerptId]: 'available' });
  });
  it.each(['store', 'display', 'quote'] as const)('redacts rather than collecting while %s is denied or pending', async key => {
    for (const permission of ['denied', 'pending']) {
      await database.client.sourceLibrarySource.update({ where: { id: sourceFixture.id }, data: { permissions: { ...sourceFixture.permissions, [key]: permission } } });
      const result = await services.sourcePort.collect(reference);
      expect(result.evidence).toEqual([]); expect(result.comparison).toBe(''); expect(result.limitations.length).toBeGreaterThan(0);
      expect(await services.sourcePort.availability([realEvidence()])).toEqual({ [realEvidence().excerptId]: 'restricted' });
    }
  });
  it('preserves operation-specific denial without granting AI use or requiring a search index for direct lookup', async () => {
    await database.client.sourceLibrarySource.update({ where: { id: sourceFixture.id }, data: { permissions: { ...sourceFixture.permissions, index: 'denied', sendToAi: 'denied' } } });
    const result = await services.sourcePort.collect(reference);
    expect(result.evidence[0]).toMatchObject({ quote: realEvidence().quote, rightsSnapshot: { index: 'denied', sendToAi: 'denied' } });
    expect(await services.sourcePort.availability([result.evidence[0]!])).toEqual({ [realEvidence().excerptId]: 'available' });
  });
  it('marks a physically removed original excerpt missing without treating it as a technical outage', async () => {
    await database.client.sourceLibraryPassageLink.deleteMany(); await database.client.sourceLibraryExcerpt.delete({ where: { id: realEvidence().excerptId } });
    expect(await services.sourcePort.availability([realEvidence()])).toEqual({ [realEvidence().excerptId]: 'missing' });
  });
  it('compares hex digests without case sensitivity while preserving the text', async () => {
    await database.client.sourceLibraryExcerpt.update({ where: { id: realEvidence().excerptId }, data: { textSha256: realEvidence().textSha256.toUpperCase() } });
    expect(await services.sourcePort.availability([realEvidence()])).toEqual({ [realEvidence().excerptId]: 'available' });
    expect((await services.sourcePort.collect(reference)).evidence[0]!.quote).toBe(realEvidence().quote);
  });
  it('does not deliver an old quote when an internally intact but different genuine paragraph replaces it', async () => {
    // Deliberate test-only replacement models a changed identity/digest, not a new admission.
    const rows = JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json', 'utf8')) as { text: string; textSha256: string }[];
    await database.client.sourceLibraryExcerpt.update({ where: { id: realEvidence().excerptId }, data: { text: rows[1]!.text, textSha256: rows[1]!.textSha256 } });
    expect(await services.sourcePort.availability([realEvidence()])).toEqual({ [realEvidence().excerptId]: 'missing' });
  });
  it('does not silently attach historic evidence to a changed source identity', async () => {
    await database.client.sourceLibrarySource.create({ data: { ...sourceFixture, id: 'technical-source-variant', permissions: { ...sourceFixture.permissions } } });
    await database.client.sourceLibraryExcerpt.update({ where: { id: realEvidence().excerptId }, data: { sourceId: 'technical-source-variant' } });
    expect(await services.sourcePort.availability([realEvidence()])).toEqual({ [realEvidence().excerptId]: 'missing' });
  });
  it('propagates actual text/digest corruption instead of reporting absence', async () => {
    const rows = JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json', 'utf8')) as { text: string }[];
    await database.client.sourceLibraryExcerpt.update({ where: { id: realEvidence().excerptId }, data: { text: rows[1]!.text } });
    await expect(services.sourcePort.collect(reference)).rejects.toThrow(); await expect(services.sourcePort.availability([realEvidence()])).rejects.toThrow();
  });
  it('propagates real unavailable canon/source connections without turning them into missing evidence', async () => {
    const target = new URL(assertTestTarget(process.env)); target.port = '9'; const unavailable = new Database(target.href);
    try {
      const canonical = new PrismaCanonRepository(unavailable); const sources = new PrismaSourceRepository(unavailable);
      const canonPort = new LibraryCanonAdapter(new CanonLibrary(canonical, canonical)); const sourcePort = new LibrarySourceAdapter(new SourceLibrary(sources, sources, sources), services.links);
      const failure: unknown = await canonPort.load('porbr2018', 'GEN 1:1').catch((error: unknown) => error);
      expect(failure).toBeInstanceOf(Error); expect(failure).not.toBeInstanceOf(StudyNotFoundError); expect(failure).not.toBeInstanceOf(StudyInputError);
      await expect(sourcePort.collect(reference)).rejects.toThrow(); await expect(sourcePort.availability([realEvidence()])).rejects.toThrow();
    } finally { await unavailable.onModuleDestroy(); }
  });
});
