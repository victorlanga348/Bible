import { mkdtemp, rm } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { assertAiTestTarget } from '../../../src/config/ai-target';
import type { Database } from '../../../src/infrastructure/database';
import { AiIndexDatabase } from '../../../src/modules/ai-assistant/infrastructure/index-database';
import { SourceIndexingLibrary } from '../../../src/modules/ai-assistant/application/source-indexing-library';
import { AiResultRejectedError, AiSourceIntegrityError, AiTimeoutError, AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import { cleanSourceTestData, openSourceTestDatabase } from '../../helpers/source-library';
import { aiExcerptFixtures, aiSourceFixture, seedAiSource } from '../../helpers/ai-source-data';
import { createAiTestRuntime } from '../../helpers/ai-runtime';

describe('indexing Application with actual libraries/pgvector/lease, embeddings double explicitly not inference', () => {
  let database: Database; let vectorDatabase: AiIndexDatabase; let home = ''; let contexts: Awaited<ReturnType<typeof createAiTestRuntime>>[] = []; let vectorReady = false;
  beforeAll(async () => {
    database = await openSourceTestDatabase(); vectorDatabase = new AiIndexDatabase(assertAiTestTarget(process.env));
    expect(await vectorDatabase.client.$queryRaw`SELECT current_database() AS db,current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
    vectorReady = true;
  });
  beforeEach(async () => { contexts = []; home = ''; await cleanSourceTestData(database); await seedAiSource(database); await vectorDatabase.client.embeddingProfile.deleteMany(); home = await mkdtemp(join(resolve('reports'), 'ai-indexing-app-')); });
  afterEach(async () => { for (const context of contexts) await context.operation.onModuleDestroy(); if (home) { if (!home.startsWith(resolve('reports') + sep + 'ai-indexing-app-')) throw new Error('Unsafe technical cleanup'); await rm(home, { recursive: true, force: true }); } });
  afterAll(async () => { if (database) { try { await cleanSourceTestData(database); if (vectorReady) await vectorDatabase.client.embeddingProfile.deleteMany(); } finally { await database.onModuleDestroy(); if (vectorDatabase?.client) await vectorDatabase.client.$disconnect(); } } });
  const setup = async () => {
    const context = await createAiTestRuntime(database, vectorDatabase, home); contexts.push(context);
    const library = new SourceIndexingLibrary(context.settings, context.sources, context.embeddings, context.index, context.operation, context.identity, context.hash);
    return { ...context, library };
  };
  it('embeds only11 exact public source chunks, saves the complete index, and reports actual double usage distinctly', async () => {
    const context = await setup(); const before = Date.now(); const report = await context.library.rebuild();
    expect(report).toMatchObject({ status: 'indexed', profileId: context.settings.profileId, chunkCount: 11, usage: { promptTokens: 110, completionTokens: 0, totalTokens: 110 }, provenance: { runtimeVersion: 'controlled-technical-runtime' } });
    expect(Date.parse(report.completedAt!)).toBeGreaterThanOrEqual(before); expect(await context.index.readiness(context.settings.indexProfile)).toBe(true);
    expect(context.embeddings.embed).toHaveBeenCalledTimes(1); const [request, signal] = context.embeddings.embed.mock.calls[0]!;
    expect(request.purpose).toBe('source'); expect(request.texts).toHaveLength(11); expect(signal).toBeInstanceOf(AbortSignal);
    expect(request.texts).toEqual(context.settings.indexProfile.expectedSegments.map(row => { const excerpt = aiExcerptFixtures.find(value => value.id === row.excerptId)!; return Array.from(excerpt.text).slice(row.startOffset, row.endOffset).join(''); }));
    expect(await vectorDatabase.client.sourceChunk.count()).toBe(11); expect(JSON.stringify(report)).not.toContain(aiExcerptFixtures[0]!.text);
    expect(Object.isFrozen(report)).toBe(true);
  });
  it('repeats a compatible current import without invoking the embedding double or inventing model usage/time', async () => {
    const context = await setup(); await context.library.rebuild(); context.embeddings.embed.mockClear();
    const result = await context.library.rebuild();
    expect(result).toEqual({ status: 'unchanged', profileId: context.settings.profileId, chunkCount: 11, completedAt: null, usage: null, provenance: null }); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(await vectorDatabase.client.sourceChunk.count()).toBe(11);
  });
  it('requires current source rights even when an earlier compatible index exists', async () => {
    const context = await setup(); await context.library.rebuild(); context.embeddings.embed.mockClear();
    await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, sendToAi: 'denied' } } });
    await expect(context.library.rebuild()).rejects.toThrow(AiUnavailableError); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(await vectorDatabase.client.sourceChunk.count()).toBe(11);
  });
  it('refuses an incomplete source catalogue before inference or index writes', async () => {
    const context = await setup(); await database.client.sourceLibraryExcerpt.delete({ where: { id: aiExcerptFixtures[2]!.id } });
    await expect(context.library.rebuild()).rejects.toThrow(AiUnavailableError); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(await vectorDatabase.client.embeddingProfile.count()).toBe(0);
  });
  it('propagates actual source integrity failure before embedding rather than indexing changed content', async () => {
    const context = await setup(); await database.client.sourceLibraryExcerpt.update({ where: { id: aiExcerptFixtures[0]!.id }, data: { text: aiExcerptFixtures[0]!.text + ' [controlled technical corruption]' } });
    await expect(context.library.rebuild()).rejects.toThrow(AiSourceIntegrityError); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(await vectorDatabase.client.embeddingProfile.count()).toBe(0);
  });
  it('revalidates actual rights after source resolution and before the embedding boundary', async () => {
    const context = await setup(); const list = context.sources.read.bind(context.sources); let count = 0;
    // Real reader remains in use; this test observer revokes the actual DB right
    // after the last preparation read, without replacing its result.
    jest.spyOn(context.sources, 'read').mockImplementation(async id => { const result = await list(id); if (++count === 4) await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, sendToAi: 'denied' } } }); return result; });
    await expect(context.library.rebuild()).rejects.toThrow(AiResultRejectedError); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(await vectorDatabase.client.embeddingProfile.count()).toBe(0);
  });
  it('revalidates source rights after embeddings and rejects without persisting a now unauthorized result', async () => {
    const context = await setup(); const normal = context.embeddings.embed.getMockImplementation()!;
    context.embeddings.embed.mockImplementation(async (request, signal) => { const result = await normal(request, signal); await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, quote: 'denied' } } }); return result; });
    await expect(context.library.rebuild()).rejects.toThrow(AiResultRejectedError); expect(await vectorDatabase.client.embeddingProfile.count()).toBe(0);
  });
  it.each(['modelId', 'modelSha256', 'profileId', 'runtimeVersion', 'promptVersion', 'dimensions', 'contextLimit', 'outputLimit'] as const)('refuses invalid embedding provenance %s before writing', async field => {
    const context = await setup(); const normal = context.embeddings.embed.getMockImplementation()!;
    context.embeddings.embed.mockImplementation(async (request, signal) => { const result = await normal(request, signal); const invalid = field === 'dimensions' ? 512 : field === 'contextLimit' ? 1 : field === 'outputLimit' ? 1 : field === 'promptVersion' ? 'wrong' : ''; return { ...result, provenance: { ...result.provenance, [field]: invalid } }; });
    await expect(context.library.rebuild()).rejects.toThrow(AiUnavailableError); expect(await vectorDatabase.client.embeddingProfile.count()).toBe(0);
  });
  it.each(['missing-vector', 'wrong-dimension', 'invalid-norm', 'nonfinite', 'usage-sum', 'usage-negative', 'usage-completion', 'usage-limit'] as const)('refuses the controlled embedding double defect %s without a partial index', async defect => {
    const context = await setup(); const normal = context.embeddings.embed.getMockImplementation()!;
    context.embeddings.embed.mockImplementation(async (request, signal) => {
      const result = await normal(request, signal);
      if (defect === 'missing-vector') return { ...result, vectors: result.vectors.slice(1) };
      if (defect === 'wrong-dimension') return { ...result, vectors: result.vectors.map(row => row.slice(1)) };
      if (defect === 'invalid-norm') return { ...result, vectors: result.vectors.map(row => row.map(value => value * 2)) };
      if (defect === 'nonfinite') return { ...result, vectors: result.vectors.map(row => [NaN, ...row.slice(1)]) };
      return { ...result, usage: defect === 'usage-sum' ? { ...result.usage, totalTokens: 1 } : defect === 'usage-negative' ? { promptTokens: -1, totalTokens: -1, completionTokens: 0 } : defect === 'usage-completion' ? { ...result.usage, completionTokens: 1 } : { promptTokens: 11265, totalTokens: 11265, completionTokens: 0 } };
    });
    await expect(context.library.rebuild()).rejects.toThrow(AiUnavailableError); expect(await vectorDatabase.client.embeddingProfile.count()).toBe(0);
  });
  it('preserves the last complete profile if a new embedding attempt fails', async () => {
    const context = await setup(); await context.library.rebuild();
    await vectorDatabase.client.embeddingProfile.update({ where: { id: context.settings.profileId }, data: { configuration: { stale: true } } });
    context.embeddings.embed.mockRejectedValue(new AiTimeoutError());
    await expect(context.library.rebuild()).rejects.toThrow(AiTimeoutError); expect(await vectorDatabase.client.sourceChunk.count()).toBe(11); expect((await vectorDatabase.client.embeddingProfile.findUniqueOrThrow({ where: { id: context.settings.profileId } })).configuration).toEqual({ stale: true });
  });
  it('honors caller cancellation before any model or write and forwards the actual operation signal', async () => {
    const context = await setup(); const abort = new AbortController(); abort.abort();
    await expect(context.library.rebuild(abort.signal)).rejects.toThrow(AiUnavailableError); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(await vectorDatabase.client.embeddingProfile.count()).toBe(0);
  });
  it('refuses a duplicate/missing source set with the same total11 chunk count before calling embeddings', async () => {
    const context = await setup(); const catalogue = context.sources.listAdmitted();
    // Controlled catalogue defect only; public source reads/hashes/DB stay real.
    jest.spyOn(context.sources, 'listAdmitted').mockReturnValue([catalogue[0]!, catalogue[0]!, catalogue[3]!]);
    await expect(context.library.rebuild()).rejects.toThrow(AiResultRejectedError); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(await vectorDatabase.client.embeddingProfile.count()).toBe(0);
  });
  it.each(['profileId', 'embeddingModelSha256'] as const)('refuses cross-wired %s before any inference', async field => {
    const context = await setup();
    const settings = { ...context.settings, [field]: field === 'profileId' ? 'wrong-profile' : 'c'.repeat(64) };
    const library = new SourceIndexingLibrary(settings, context.sources, context.embeddings, context.index, context.operation, context.identity, context.hash);
    await expect(library.rebuild()).rejects.toThrow(AiUnavailableError); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(await vectorDatabase.client.embeddingProfile.count()).toBe(0);
  });
});
