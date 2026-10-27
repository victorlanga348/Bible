import { cleanSourceTestData, openSourceTestDatabase } from '../../helpers/source-library';
import { createStudyTestServices } from '../../helpers/study-runtime';
import { aiExcerptFixtures, aiFixtureFiles, aiSourceFixture, seedAiSource } from '../../helpers/ai-source-data';
import { readAiSourcePolicy } from '../../../src/modules/ai-assistant/infrastructure/source-policy';
import { LibraryAiSourcesAdapter } from '../../../src/modules/ai-assistant/infrastructure/library-source-adapter';
import { NodeAiTextHash } from '../../../src/modules/ai-assistant/infrastructure/text-hash';
import { AiSourceIntegrityError } from '../../../src/modules/ai-assistant/application/errors';
import type { Database } from '../../../src/infrastructure/database';

describe('public SourceLibrary adapter with actual PostgreSQL and authenticated source, no inference', () => {
  let database: Database;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => { await cleanSourceTestData(database); await seedAiSource(database); });
  afterAll(async () => { if (database) { try { await cleanSourceTestData(database); } finally { await database.onModuleDestroy(); } } });
  const adapter = async () => new LibraryAiSourcesAdapter(createStudyTestServices(database).sources, await readAiSourcePolicy(aiFixtureFiles, 'test-ai'), new NodeAiTextHash());
  it('resolves exactly the four admitted unchanged paragraphs and current attributed rights as immutable values', async () => {
    const sources = await adapter();
    for (const row of aiExcerptFixtures) {
      const value = await sources.read(row.id);
      expect(value).toEqual({ sourceId: row.sourceId, excerptId: row.id, textSha256: row.textSha256, locator: row.locator, paragraph: row.order, text: row.text, attribution: aiSourceFixture.attribution, rightsStatement: aiSourceFixture.rightsStatement, rightsUrl: aiSourceFixture.rightsUrl });
      expect(Object.isFrozen(value)).toBe(true); expect(Reflect.set(value!, 'text', 'changed')).toBe(false);
    }
  });
  it('lists only pinned identities/digests without source text or rights overrides', async () => {
    const catalogue = (await adapter()).listAdmitted();
    expect(catalogue).toEqual(aiExcerptFixtures.map(row => ({ sourceId: row.sourceId, excerptId: row.id, textSha256: row.textSha256 })));
    expect(Object.isFrozen(catalogue)).toBe(true); expect(Object.isFrozen(catalogue[0])).toBe(true);
    expect(JSON.stringify(catalogue)).not.toContain(aiExcerptFixtures[0]!.text);
  });
  for (const right of ['store', 'index', 'display', 'quote', 'sendToAi'] as const) it.each(['pending', 'denied'] as const)(`does not resolve source with ${right}=%s`, async state => {
    await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, [right]: state } } });
    expect(await (await adapter()).read(aiExcerptFixtures[0]!.id)).toBeNull();
  });
  it('uses current rights on every read and allows ingestion to be revoked after an already admitted import', async () => {
    const sources = await adapter(); const id = aiExcerptFixtures[0]!.id;
    expect(await sources.read(id)).not.toBeNull();
    await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, sendToAi: 'denied' } } });
    expect(await sources.read(id)).toBeNull();
    await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, ingest: 'denied' } } });
    expect(await sources.read(id)).not.toBeNull();
  });
  it('returns null for a removed admitted excerpt without promoting a fixture or another source', async () => {
    await database.client.sourceLibraryExcerpt.delete({ where: { id: aiExcerptFixtures[0]!.id } });
    expect(await (await adapter()).read(aiExcerptFixtures[0]!.id)).toBeNull();
  });
  it('does not query SourceLibrary for unknown or legacy identities, even while its table is unavailable', async () => {
    const sources = await adapter();
    await database.client.$executeRaw`ALTER TABLE app.source_library_source RENAME TO source_library_source_offline_for_ai_test`;
    try {
      expect(await sources.read('unknown-source')).toBeNull(); expect(await sources.read('josephus-antiquities-pg2848-en-b1-c1-p1')).toBeNull();
    } finally { await database.client.$executeRaw`ALTER TABLE app.source_library_source_offline_for_ai_test RENAME TO source_library_source`; }
  });
  it('propagates an actual SourceLibrary SQL fault instead of converting it into unavailable historical evidence', async () => {
    const sources = await adapter();
    await database.client.$executeRaw`ALTER TABLE app.source_library_source RENAME TO source_library_source_offline_for_ai_test`;
    try { await expect(sources.read(aiExcerptFixtures[0]!.id)).rejects.toMatchObject({ code: 'P2021' }); }
    finally { await database.client.$executeRaw`ALTER TABLE app.source_library_source_offline_for_ai_test RENAME TO source_library_source`; }
  });
  it('rejects actual text/hash incoherence as a technical integrity error, never insufficiency', async () => {
    await database.client.sourceLibraryExcerpt.update({ where: { id: aiExcerptFixtures[0]!.id }, data: { text: aiExcerptFixtures[0]!.text + ' [controlled technical corruption]' } });
    await expect((await adapter()).read(aiExcerptFixtures[0]!.id)).rejects.toThrow(AiSourceIntegrityError);
  });
  it('excludes a coherently changed text/digest from the fixed admission without treating it as an authorized edition', async () => {
    const text = aiExcerptFixtures[0]!.text + ' [controlled technical change]';
    await database.client.sourceLibraryExcerpt.update({ where: { id: aiExcerptFixtures[0]!.id }, data: { text, textSha256: new NodeAiTextHash().sha256(text) } });
    expect(await (await adapter()).read(aiExcerptFixtures[0]!.id)).toBeNull();
  });
  it.each([{ locator: 'technical-changed-locator' }, { order: 5n }])('excludes current locator/order drift %j', async patch => {
    await database.client.sourceLibraryExcerpt.update({ where: { id: aiExcerptFixtures[0]!.id }, data: patch });
    expect(await (await adapter()).read(aiExcerptFixtures[0]!.id)).toBeNull();
  });
  it.each([
    { title: 'Controlled metadata change' }, { author: 'Controlled metadata change' }, { translator: null }, { language: 'es' }, { edition: 'Controlled metadata change' }, { kind: 'modern-study' },
    { originUrl: 'https://example.invalid/technical' }, { snapshotSha256: 'c'.repeat(64) }, { retrievedAt: '2026-10-27T00:00:00.000Z' }, { rightsStatement: 'Controlled test restriction' }, { rightsUrl: 'https://example.invalid/technical-rights' }, { attribution: 'Controlled test attribution change' }, { limitations: 'Controlled test scope change' },
  ])('excludes source metadata drift from the pinned admission %j', async patch => {
    await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: patch });
    expect(await (await adapter()).read(aiExcerptFixtures[0]!.id)).toBeNull();
  });
  it('excludes transfer of the admitted excerpt identity to another unadmitted source', async () => {
    // Controlled same-text test variant; not another real work/admission or witness.
    await database.client.sourceLibrarySource.create({ data: { ...aiSourceFixture, id: 'technical-unadmitted-source', permissions: { ...aiSourceFixture.permissions } } });
    await database.client.sourceLibraryExcerpt.update({ where: { id: aiExcerptFixtures[0]!.id }, data: { sourceId: 'technical-unadmitted-source' } });
    expect(await (await adapter()).read(aiExcerptFixtures[0]!.id)).toBeNull();
  });
});
