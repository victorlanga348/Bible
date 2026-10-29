import type { WriteScope } from '../../../src/application/write-scope';
import { mkdtemp, rm } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { assertAiTestTarget } from '../../../src/config/ai-target';
import type { Database } from '../../../src/infrastructure/database';
import { AiIndexDatabase } from '../../../src/modules/ai-assistant/infrastructure/index-database';
import { AiAnalysisLibrary } from '../../../src/modules/ai-assistant/application/ai-analysis-library';
import { SourceIndexingLibrary } from '../../../src/modules/ai-assistant/application/source-indexing-library';
import { AiNotFoundError, AiResultRejectedError, AiSourceIntegrityError, AiTimeoutError, AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import { AnalysisDocument } from '../../../src/modules/ai-assistant/domain/analysis-document';
import { AnalysisDomainError } from '../../../src/modules/ai-assistant/domain/analysis-values';
import { AiModelInputError, SourceSelection } from '../../../src/modules/ai-assistant/domain/model-input';
import type { GeneratedSelection } from '../../../src/modules/ai-assistant/application/ports';
import { cleanCanon, seedCanon } from '../../helpers/canon';
import { cleanStudyTestData } from '../../helpers/study-database';
import { cleanSourceTestData, openSourceTestDatabase } from '../../helpers/source-library';
import { aiCurations, aiExcerptFixtures, aiSourceFixture, seedAiSource } from '../../helpers/ai-source-data';
import { createAiTestRuntime } from '../../helpers/ai-runtime';

const owner = 'technical-ai-owner'; const question = 'Which day does this source call Sabbath?';
const original = aiExcerptFixtures[0]!; const quoteStart = original.text.indexOf('And that the seventh day');
const quote = original.text.slice(quoteStart); const startOffset = Array.from(original.text.slice(0, quoteStart)).length; const endOffset = Array.from(original.text).length;
type Context = Awaited<ReturnType<typeof createAiTestRuntime>>;
describe('private analysis Application; real study/source/Prisma/pgvector/lease with declared LLM and embedding doubles, NOT inference', () => {
  let database: Database; let vectorDatabase: AiIndexDatabase; let home = ''; let contexts: Context[] = []; let vectorReady = false;
  beforeAll(async () => {
    expect(quoteStart).toBeGreaterThan(0); database = await openSourceTestDatabase(); vectorDatabase = new AiIndexDatabase(assertAiTestTarget(process.env));
    expect(await vectorDatabase.client.$queryRaw`SELECT current_database() AS db,current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
    vectorReady = true;
  });
  beforeEach(async () => {
    contexts = []; home = '';
    await database.client.aiAnalysis.deleteMany(); await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); await seedCanon(database); await seedAiSource(database); await vectorDatabase.client.embeddingProfile.deleteMany();
    home = await mkdtemp(join(resolve('reports'), 'ai-analysis-app-')); contexts = [];
  });
  afterEach(async () => { for (const context of contexts ?? []) await context.operation.onModuleDestroy(); if (home) { if (!home.startsWith(resolve('reports') + sep + 'ai-analysis-app-')) throw new Error('Unsafe technical cleanup'); await rm(home, { recursive: true, force: true }); } });
  afterAll(async () => { if (database) { try { await database.client.aiAnalysis.deleteMany(); await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); if (vectorReady) await vectorDatabase.client.embeddingProfile.deleteMany(); } finally { await database.onModuleDestroy(); if (vectorDatabase?.client) await vectorDatabase.client.$disconnect(); } } });
  const setup = async (options: { associate?: boolean; index?: boolean } = {}) => {
    const context = await createAiTestRuntime(database, vectorDatabase, home); contexts.push(context);
    if (options.associate !== false) await context.links.curate(aiCurations[0]!);
    const study = await context.studyLibrary.create(owner, 'porbr2018', 'GEN 1:1');
    if (options.index !== false) await new SourceIndexingLibrary(context.settings, context.sources, context.embeddings, context.index, context.operation, context.identity, context.hash).rebuild();
    context.embeddings.embed.mockClear();
    const library = new AiAnalysisLibrary(context.settings, context.studies, context.sources, context.embeddings, context.llm, context.index, context.store, context.operation, context.identity, context.hash);
    return { ...context, library, study };
  };
  const seed = async (context: Awaited<ReturnType<typeof setup>>) => {
    const segments = context.settings.indexProfile.expectedSegments.filter(row => row.excerptId === original.id);
    const document = new AnalysisDocument({ schemaVersion: 1, id: context.identity.newId(), ownerId: owner, studyId: context.study.id, studyVersion: 1, createdAt: context.identity.now(), reference: context.study.reference, question, status: 'supported',
      evidenceRefs: [{ sourceId: original.sourceId, excerptId: original.id, locator: original.locator, textSha256: original.textSha256, startOffset, endOffset }], limitations: ['Controlled technical metadata, not actual inference.'],
      provenance: { profileId: context.settings.profileId, promptVersion: context.settings.promptVersion, modelId: context.settings.modelId, modelSha256: context.settings.modelSha256, embeddingModelSha256: context.settings.embeddingModelSha256, runtimeVersion: 'controlled-technical-runtime', dimensions: 1024, contextLimit: 2048, outputLimit: 128, promptTokens: 100, completionTokens: 5, totalTokens: 105, embeddingPromptTokens: 10, consultedSegments: [segments[2]!, segments[0]!, segments[1]!] } });
    await context.store.create(document); return document;
  };
  it('creates one exact attributed sentence associated with the requested private study version and records only refs', async () => {
    const context = await setup(); const before = Date.now(); const view = await context.library.create(owner, context.study.id, 1, `  ${question}\n`);
    expect(view).toMatchObject({ studyId: context.study.id, studyVersion: 1, question, status: 'supported', reference: context.study.reference }); expect(Date.parse(view.createdAt)).toBeGreaterThanOrEqual(before);
    expect(view.evidence).toEqual([{ sourceId: original.sourceId, excerptId: original.id, locator: original.locator, textSha256: original.textSha256, startOffset, endOffset, quote, attribution: aiSourceFixture.attribution, rightsStatement: aiSourceFixture.rightsStatement, rightsUrl: aiSourceFixture.rightsUrl }]);
    expect(view.provenance).toMatchObject({ modelId: context.settings.modelId, modelSha256: context.settings.modelSha256, embeddingModelSha256: context.settings.embeddingModelSha256, runtimeVersion: 'controlled-technical-runtime', dimensions: 1024, contextLimit: 2048, outputLimit: 128, promptTokens: 100, completionTokens: 5, totalTokens: 105, embeddingPromptTokens: 10 }); expect(view.provenance.consultedSegments).toHaveLength(3);
    expect(view.limitations.join(' ')).toMatch(/quatro parágrafos/); expect(view.limitations.join(' ')).toMatch(/uma obra/); expect(view.limitations.join(' ')).toMatch(/inglês/); expect(view.limitations.join(' ')).toMatch(/uma frase/); expect(view.limitations.join(' ')).toMatch(/independente/);
    const row = await database.client.aiAnalysis.findUniqueOrThrow({ where: { id: view.id } }); expect(row.ownerId).toBe(owner); expect(JSON.stringify(row.document)).not.toContain(quote); expect(row.document).not.toHaveProperty('evidence'); expect(view).not.toHaveProperty('ownerId');
    expect(context.embeddings.embed.mock.calls[0]![0]).toEqual({ purpose: 'question', texts: [question] }); expect(context.llm.select).toHaveBeenCalledTimes(1);
    const [sentQuestion, contextSentences, signal] = context.llm.select.mock.calls[0]!; expect(sentQuestion.text).toBe(question); expect(signal).toBeInstanceOf(AbortSignal);
    expect(JSON.stringify(contextSentences)).not.toContain(context.study.passage.verses[0]!.text); expect(JSON.stringify(contextSentences)).not.toContain(owner);
    expect(new TextEncoder().encode(contextSentences.map(value => value.text).join('')).byteLength).toBeLessThanOrEqual(2400);
    expect(await vectorDatabase.client.sourceChunk.count()).toBe(11); expect(Object.isFrozen(view)).toBe(true);
  });
  it('separates the internal history-augmented retrieval query from the current generation question', async () => {
    const context = await setup(); const query = `Previous technical question\nCurrent question: ${question}`;
    const view = await context.library.create(owner, context.study.id, 1, question, undefined, query);
    expect(context.embeddings.embed.mock.calls[0]![0]).toEqual({ purpose: 'question', texts: [query] });
    expect(context.llm.select.mock.calls[0]![0].text).toBe(question); expect(view.question).toBe(question);
  });
  it('validates study owner/version before reserving an execution or invoking any model', async () => {
    const context = await setup({ index: false }); const execution = jest.spyOn(context.operation, 'run');
    await expect(context.library.create('another-owner', context.study.id, 1, question)).rejects.toThrow(AiNotFoundError); await expect(context.library.create(owner, context.study.id, 2, question)).rejects.toThrow(AiNotFoundError);
    expect(execution).not.toHaveBeenCalled(); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(context.llm.select).not.toHaveBeenCalled(); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it.each([true, false])('passes the actual operation signal to private persistence with association=%s', async associated => {
    const context = await setup({ associate: associated, index: associated }); const creating = jest.spyOn(context.store, 'create'); const controller = new AbortController();
    await context.library.create(owner, context.study.id, 1, question, controller.signal);
    const signal = creating.mock.calls[0]![1]; expect(signal).toBeInstanceOf(AbortSignal); expect(signal!.aborted).toBe(false);
    if (associated) expect(signal).toBe(context.llm.select.mock.calls[0]![2]);
  });
  it('returns explicit no-inference insufficiency when no authorized source is associated, without requiring an index', async () => {
    const context = await setup({ associate: false, index: false }); const readiness = jest.spyOn(context.index, 'readiness');
    const view = await context.library.create(owner, context.study.id, 1, question);
    expect(view.status).toBe('insufficient-evidence'); expect(view.evidence).toEqual([]); expect(view.provenance).toEqual({ profileId: context.settings.profileId, promptVersion: context.settings.promptVersion, modelId: null, modelSha256: null, embeddingModelSha256: null, runtimeVersion: null, dimensions: null, contextLimit: 2048, outputLimit: 128, promptTokens: 0, completionTokens: 0, totalTokens: 0, embeddingPromptTokens: 0, consultedSegments: [] });
    expect(view.limitations.join(' ')).toContain('nenhum modelo foi executado'); expect(readiness).not.toHaveBeenCalled(); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(context.llm.select).not.toHaveBeenCalled(); expect(await database.client.aiAnalysis.count()).toBe(1);
  });
  it('does not infer from an associated source whose current sendToAi right is denied', async () => {
    const context = await setup({ index: false }); await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, sendToAi: 'denied' } } });
    const view = await context.library.create(owner, context.study.id, 1, question); expect(view.status).toBe('insufficient-evidence'); expect(view.provenance.modelId).toBeNull(); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(context.llm.select).not.toHaveBeenCalled();
  });
  it('requires a complete ready index before embedding a private question', async () => {
    const context = await setup({ index: false }); await expect(context.library.create(owner, context.study.id, 1, question)).rejects.toThrow(AiUnavailableError);
    expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(context.llm.select).not.toHaveBeenCalled(); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it('keeps exact historical study versions instead of silently using the latest association set', async () => {
    const context = await setup({ associate: false }); await context.links.curate(aiCurations[0]!); await context.studyLibrary.revise(owner, context.study.id, 1);
    const historical = await context.library.create(owner, context.study.id, 1, question); expect(historical.studyVersion).toBe(1); expect(historical.status).toBe('insufficient-evidence'); expect(context.embeddings.embed).not.toHaveBeenCalled();
    const current = await context.library.create(owner, context.study.id, 2, question); expect(current.studyVersion).toBe(2); expect(current.status).toBe('supported'); expect(await database.client.aiAnalysis.count()).toBe(2);
  });
  it('persists a model null decision as insufficiency with actual declared double usage and consulted spans', async () => {
    const context = await setup(); const normal = context.llm.select.getMockImplementation()!;
    context.llm.select.mockImplementation(async (input, sentences, signal) => ({ ...await normal(input, sentences, signal), selection: new SourceSelection(null, sentences) }));
    const result = await context.library.create(owner, context.study.id, 1, question); expect(result.status).toBe('insufficient-evidence'); expect(result.evidence).toEqual([]); expect(result.provenance.modelId).toBe(context.settings.modelId); expect(result.provenance.promptTokens).toBe(100); expect(result.provenance.consultedSegments).toHaveLength(3);
  });
  it('revalidates source rights between actual vector retrieval and sending source context to the LLM', async () => {
    const context = await setup(); const real = context.index.search.bind(context.index);
    jest.spyOn(context.index, 'search').mockImplementation(async (...args) => { const rows = await real(...args); await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, sendToAi: 'denied' } } }); return rows; });
    await expect(context.library.create(owner, context.study.id, 1, question)).rejects.toThrow(AiResultRejectedError); expect(context.llm.select).not.toHaveBeenCalled(); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it('rejects rights revoked during selection before persisting an analysis', async () => {
    const context = await setup(); const normal = context.llm.select.getMockImplementation()!;
    context.llm.select.mockImplementation(async (...args) => { const result = await normal(...args); await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, quote: 'denied' } } }); return result; });
    await expect(context.library.create(owner, context.study.id, 1, question)).rejects.toThrow(AiResultRejectedError); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it('projects post-commit revocation as restricted while keeping the immutable original decision stored', async () => {
    const context = await setup(); const guarded = context.studies.guardActive.bind(context.studies);
    // Revocation follows the actual parent transaction commit, not an inner callback.
    jest.spyOn(context.studies, 'guardActive').mockImplementation(async <T>(subject: string, studyId: string, write: (scope: WriteScope) => Promise<T>): Promise<T> => {
      const result = await guarded(subject, studyId, write);
      await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, sendToAi: 'denied' } } });
      return result;
    });
    const result = await context.library.create(owner, context.study.id, 1, question); expect(result.status).toBe('restricted'); expect(result.evidence).toEqual([]); expect(result.provenance.consultedSegments).toEqual([]);
    const saved = await context.store.find(owner, result.id); expect(saved!.status).toBe('supported'); expect(saved!.evidenceRefs).toHaveLength(1); expect(saved!.provenance.consultedSegments).toHaveLength(3);
  });
  it.each(['modelId', 'modelSha256', 'profileId', 'runtimeVersion', 'promptVersion', 'dimensions', 'contextLimit', 'outputLimit'] as const)('rejects incoherent generated provenance %s with no record', async field => {
    const context = await setup(); const normal = context.llm.select.getMockImplementation()!;
    context.llm.select.mockImplementation(async (...args) => { const result = await normal(...args); const invalid = field === 'dimensions' ? 1024 : field === 'contextLimit' ? 2049 : field === 'outputLimit' ? 127 : 'wrong'; return { ...result, provenance: { ...result.provenance, [field]: invalid } }; });
    await expect(context.library.create(owner, context.study.id, 1, question)).rejects.toThrow(AiResultRejectedError); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it.each(['unknown-id', 'wrong-status', 'missing-sentence', 'altered-quote', 'altered-id', 'altered-paragraph', 'altered-start', 'altered-end', 'usage-sum', 'no-input', 'fractional-input', 'fractional-output', 'no-output', 'too-much-output', 'prompt-budget'] as const)('refuses controlled generated selection defect %s instead of correcting it', async defect => {
    const context = await setup(); const normal = context.llm.select.getMockImplementation()!;
    context.llm.select.mockImplementation(async (...args): Promise<GeneratedSelection> => {
      const result = await normal(...args);
      if (defect === 'unknown-id') return { ...result, selection: { ...result.selection, citationId: 'p1-s9999' } };
      if (defect === 'wrong-status') return { ...result, selection: { ...result.selection, status: 'insufficient-evidence' } };
      if (defect === 'missing-sentence') return { ...result, selection: { ...result.selection, sentence: null } };
      if (defect === 'altered-quote') return { ...result, selection: { ...result.selection, sentence: { ...result.selection.sentence!, text: 'Controlled technical alteration, not a historical quote.' } } };
      if (defect === 'altered-id') return { ...result, selection: { ...result.selection, sentence: { ...result.selection.sentence!, id: 'p1-s9999' } } };
      if (defect === 'altered-paragraph') return { ...result, selection: { ...result.selection, sentence: { ...result.selection.sentence!, paragraph: 2 } } };
      if (defect === 'altered-start') return { ...result, selection: { ...result.selection, sentence: { ...result.selection.sentence!, start: result.selection.sentence!.start + 1 } } };
      if (defect === 'altered-end') return { ...result, selection: { ...result.selection, sentence: { ...result.selection.sentence!, end: result.selection.sentence!.end - 1 } } };
      if (defect === 'no-input') return { ...result, usage: { promptTokens: 0, completionTokens: 5, totalTokens: 5 } };
      if (defect === 'fractional-input') return { ...result, usage: { promptTokens: 100.5, completionTokens: 5, totalTokens: 105.5 } };
      if (defect === 'fractional-output') return { ...result, usage: { promptTokens: 100, completionTokens: 5.5, totalTokens: 105.5 } };
      return { ...result, usage: defect === 'usage-sum' ? { ...result.usage, totalTokens: 106 } : defect === 'no-output' ? { promptTokens: 100, completionTokens: 0, totalTokens: 100 } : defect === 'too-much-output' ? { promptTokens: 100, completionTokens: 129, totalTokens: 229 } : { promptTokens: 1921, completionTokens: 5, totalTokens: 1926 } };
    });
    await expect(context.library.create(owner, context.study.id, 1, question)).rejects.toThrow(AiResultRejectedError); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it('accepts exact declared generation budget boundaries with technical usage, retaining real persistence', async () => {
    const context = await setup(); const normal = context.llm.select.getMockImplementation()!;
    context.llm.select.mockImplementation(async (...args): Promise<GeneratedSelection> => ({ ...await normal(...args), usage: { promptTokens: context.settings.contextLimit - context.settings.outputLimit, completionTokens: context.settings.outputLimit, totalTokens: context.settings.contextLimit } }));
    const result = await context.library.create(owner, context.study.id, 1, question);
    expect(result.status).toBe('supported'); expect(result.provenance.totalTokens).toBe(context.settings.contextLimit);
    expect(await database.client.aiAnalysis.count()).toBe(1);
  });
  it.each(['textDigest', 'sourceDigest', 'sourceId', 'excerptId', 'startOffset', 'endOffset'] as const)('rejects a corrupted retrieved %s before generation, retaining actual SQL integration', async field => {
    const context = await setup(); const real = context.index.search.bind(context.index);
    jest.spyOn(context.index, 'search').mockImplementation(async (...args) => { const rows = await real(...args); return rows.map((row, ordinal) => ordinal === 0 ? { ...row, [field]: field === 'startOffset' ? row.startOffset + 1 : field === 'endOffset' ? row.endOffset - 1 : field.includes('Digest') ? 'c'.repeat(64) : 'unknown' } : row); });
    await expect(context.library.create(owner, context.study.id, 1, question)).rejects.toThrow(AiResultRejectedError); expect(context.llm.select).not.toHaveBeenCalled(); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it.each(['embedding', 'generation'] as const)('propagates %s timeout distinctly without persisting a fake insufficiency', async stage => {
    const context = await setup(); if (stage === 'embedding') context.embeddings.embed.mockRejectedValue(new AiTimeoutError()); else context.llm.select.mockRejectedValue(new AiTimeoutError());
    await expect(context.library.create(owner, context.study.id, 1, question)).rejects.toThrow(AiTimeoutError); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it.each(['', ' \n', 'x'.repeat(1001), '\ud800'])('rejects invalid question before inference %p', async input => {
    const context = await setup({ index: false }); await expect(context.library.create(owner, context.study.id, 1, input)).rejects.toThrow(AiModelInputError); expect(context.embeddings.embed).not.toHaveBeenCalled();
  });
  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects invalid study version %p before inference', async version => {
    const context = await setup({ index: false }); await expect(context.library.create(owner, context.study.id, version, question)).rejects.toThrow(AiModelInputError); expect(context.embeddings.embed).not.toHaveBeenCalled();
  });
  it('reads owned analysis and exact original study version without index or any model service', async () => {
    const context = await setup({ index: false }); const document = await seed(context); await context.studyLibrary.revise(owner, context.study.id, 1);
    await vectorDatabase.client.$executeRaw`ALTER TABLE ai.embedding_profile RENAME TO embedding_profile_offline_for_analysis_test`;
    try {
      const studyRead = jest.spyOn(context.studies, 'read'); const result = await context.library.read(owner, document.id);
      expect(result.status).toBe('supported'); expect(result.evidence[0]!.quote).toBe(quote); expect(studyRead).toHaveBeenCalledWith(owner, context.study.id, 1); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(context.llm.select).not.toHaveBeenCalled();
    } finally { await vectorDatabase.client.$executeRaw`ALTER TABLE ai.embedding_profile_offline_for_analysis_test RENAME TO embedding_profile`; }
  });
  it('never reveals a foreign or missing analysis and never consults studies for that record', async () => {
    const context = await setup({ index: false }); const document = await seed(context); const studyRead = jest.spyOn(context.studies, 'read');
    await expect(context.library.read('another-owner', document.id)).rejects.toThrow(AiNotFoundError); await expect(context.library.read(owner, '00000000-0000-4000-8000-000000000000')).rejects.toThrow(AiNotFoundError); expect(studyRead).not.toHaveBeenCalled();
  });
  it.each(['sendToAi', 'quote', 'store', 'index', 'display'] as const)('redacts an existing analysis after current %s revocation without changing the stored snapshot', async right => {
    const context = await setup({ index: false }); const document = await seed(context); const before = JSON.stringify(await context.store.find(owner, document.id));
    await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, [right]: 'denied' } } });
    const result = await context.library.read(owner, document.id); expect(result.status).toBe('restricted'); expect(result.evidence).toEqual([]); expect(result.provenance.consultedSegments).toEqual([]); expect(JSON.stringify(await context.store.find(owner, document.id))).toBe(before); expect(context.llm.select).not.toHaveBeenCalled();
  });
  it('distinguishes coherent source replacement from actual hash corruption on delivery', async () => {
    const context = await setup({ index: false }); const document = await seed(context); const text = original.text + ' [controlled technical replacement]';
    await database.client.sourceLibraryExcerpt.update({ where: { id: original.id }, data: { text, textSha256: context.hash.sha256(text) } }); expect((await context.library.read(owner, document.id)).status).toBe('restricted');
    // StudyLibrary already checks source integrity during its own delivery and
    // propagates this existing technical error before AI's reader is called.
    await database.client.sourceLibraryExcerpt.update({ where: { id: original.id }, data: { textSha256: original.textSha256 } }); await expect(context.library.read(owner, document.id)).rejects.toThrow(/^Source text integrity failure$/);
  });
  it('deletes only an owned analysis, leaves source/study/index intact and rejects foreign/missing deletes', async () => {
    const context = await setup({ index: false }); const document = await seed(context);
    await expect(context.library.delete('another-owner', document.id)).rejects.toThrow(AiNotFoundError); await context.library.delete(owner, document.id); expect(await database.client.aiAnalysis.count()).toBe(0);
    await expect(context.library.delete(owner, document.id)).rejects.toThrow(AiNotFoundError); expect(await database.client.studyRecord.count()).toBe(1); expect(await database.client.sourceLibraryExcerpt.count()).toBe(4);
  });
  it('checks current study existence for delivery while still allowing the owner to delete an orphan analysis', async () => {
    const context = await setup({ index: false }); const document = await seed(context); await database.client.studyRecord.delete({ where: { id: context.study.id } });
    await expect(context.library.read(owner, document.id)).rejects.toThrow(AiNotFoundError); expect(await database.client.aiAnalysis.count()).toBe(1); await context.library.delete(owner, document.id); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it.each(['translation', 'passage'] as const)('does not deliver a stored reference whose %s disagrees with the actual immutable study version', async field => {
    const context = await setup({ index: false }); const document = await seed(context);
    const reference = field === 'translation' ? { ...document.reference, translationId: 'technical-corrupted-edition' } : { ...document.reference, chapter: 2, normalized: 'GEN 2:1' };
    await database.client.aiAnalysis.update({ where: { id: document.id }, data: { document: { ...JSON.parse(JSON.stringify(document)), reference } } });
    await expect(context.library.read(owner, document.id)).rejects.toThrow(AnalysisDomainError);
  });
  it.each(['chunk-digest', 'partial-sentence'])('detects controlled stored metadata corruption %s without inventing a quote', async defect => {
    const context = await setup({ index: false }); const document = await seed(context);
    const value = JSON.parse(JSON.stringify(document));
    if (defect === 'chunk-digest') value.provenance.consultedSegments[0].textDigest = 'c'.repeat(64); else value.evidenceRefs[0].startOffset++;
    await database.client.aiAnalysis.update({ where: { id: document.id }, data: { document: value } });
    await expect(context.library.read(owner, document.id)).rejects.toThrow(AiSourceIntegrityError);
  });
  it('lifecycle: refuses confirmation after deletion during model execution without holding a study lock', async () => {
    const context = await setup(); const originalSelect = context.llm.select.getMockImplementation()!;
    context.llm.select.mockImplementationOnce(async (...args) => { await context.studyLibrary.beginDelete(owner, context.study.id); return originalSelect(...args); });
    await expect(context.library.create(owner, context.study.id, 1, question)).rejects.toThrow(AiNotFoundError);
    expect(await database.client.aiAnalysis.count()).toBe(0);
    expect((await database.client.studyRecord.findUniqueOrThrow({ where: { id: context.study.id } })).lifecycle).toBe('deleting');
  });
  it('lifecycle: guards insufficient-evidence persistence even when no model is invoked', async () => {
    const context = await setup({ associate: false, index: false }); const actualRead = context.studies.read.bind(context.studies);
    // Only the timing boundary is controlled; both Study and AI persistence remain real.
    jest.spyOn(context.studies, 'read').mockImplementationOnce(async (...args) => { const result = await actualRead(...args); await context.studyLibrary.beginDelete(owner, context.study.id); return result; });
    await expect(context.library.create(owner, context.study.id, 1, question)).rejects.toThrow(AiNotFoundError);
    expect(await database.client.aiAnalysis.count()).toBe(0); expect(context.llm.select).not.toHaveBeenCalled();
  });

  it.each([0,4])('release: rejects invalid index-port result cardinality %p before generation or persistence',async count=>{
    const context=await setup();const search=context.index.search.bind(context.index);
    jest.spyOn(context.index,'search').mockImplementationOnce(async(...args)=>{const actual=await search(...args);expect(actual.length).toBeGreaterThan(0);return count===0?[]:Array.from({length:4},()=>actual[0]!);});
    await expect(context.library.create(owner,context.study.id,1,question)).rejects.toThrow(AiResultRejectedError);expect(context.llm.select).not.toHaveBeenCalled();expect(await database.client.aiAnalysis.count()).toBe(0);
  });

});
