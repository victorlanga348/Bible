import { mkdtemp, rm } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import type { Database } from '../../../src/infrastructure/database';
import { assertAiTestTarget } from '../../../src/config/ai-target';
import { AiIndexDatabase } from '../../../src/modules/ai-assistant/infrastructure/index-database';
import { PrismaConversationStore } from '../../../src/modules/ai-assistant/infrastructure/prisma-conversation-store';
import { AiAnalysisLibrary } from '../../../src/modules/ai-assistant/application/ai-analysis-library';
import { ConversationLibrary } from '../../../src/modules/ai-assistant/application/conversation-library';
import { SourceIndexingLibrary } from '../../../src/modules/ai-assistant/application/source-indexing-library';
import { AiNotFoundError, AiTimeoutError, AiUnavailableError, AiResultRejectedError } from '../../../src/modules/ai-assistant/application/errors';
import { AiModelInputError } from '../../../src/modules/ai-assistant/domain/model-input';
import { ConversationDocument, ConversationConflictError } from '../../../src/modules/ai-assistant/domain/conversation';
import type { Prisma } from '../../../src/generated/prisma/client';
import { cleanCanon, seedCanon } from '../../helpers/canon';
import { cleanStudyTestData } from '../../helpers/study-database';
import { cleanSourceTestData, openSourceTestDatabase } from '../../helpers/source-library';
import { aiCurations, aiSourceFixture, seedAiSource } from '../../helpers/ai-source-data';
import { createAiTestRuntime } from '../../helpers/ai-runtime';

const owner = 'technical-ai-owner'; const question = 'Which day does this source call Sabbath?';
describe('conversation Application with real study/source/SQL/vector; explicit protocol doubles, NOT inference', () => {
  let database: Database; let vector: AiIndexDatabase; let ready = false; let home: string;
  let contexts: Awaited<ReturnType<typeof createAiTestRuntime>>[] = [];
  const clean = async () => { await database.client.aiConversation.deleteMany(); await database.client.aiAnalysis.deleteMany(); await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); };
  beforeAll(async () => {
    database = await openSourceTestDatabase(); vector = new AiIndexDatabase(assertAiTestTarget(process.env));
    expect(await vector.client.$queryRaw`SELECT current_database() AS db,current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]); ready = true;
  });
  beforeEach(async () => {
    contexts = []; home = await mkdtemp(join(resolve('reports'), 'conversation-app-'));
    await clean(); await seedCanon(database); await seedAiSource(database); await vector.client.embeddingProfile.deleteMany();
  });
  afterEach(async () => { jest.restoreAllMocks(); for (const context of contexts) await context.operation.onModuleDestroy(); if (home) { if (!home.startsWith(resolve('reports') + sep + 'conversation-app-')) throw new Error('Unsafe technical cleanup'); await rm(home, { recursive: true, force: true }); } });
  afterAll(async () => { try { if (ready) { await clean(); await vector.client.embeddingProfile.deleteMany(); } } finally { await database?.onModuleDestroy(); await vector?.onModuleDestroy(); } });
  const setup = async (associate = true) => {
    const context = await createAiTestRuntime(database, vector, home); contexts.push(context);
    if (associate) await context.links.curate(aiCurations[0]!);
    const study = await context.studyLibrary.create(owner, 'porbr2018', 'GEN 1:1');
    await new SourceIndexingLibrary(context.settings, context.sources, context.embeddings, context.index, context.operation, context.identity, context.hash).rebuild(); context.embeddings.embed.mockClear();
    const analyses = new AiAnalysisLibrary(context.settings, context.studies, context.sources, context.embeddings, context.llm, context.index, context.store, context.operation, context.identity, context.hash);
    const store = new PrismaConversationStore(database); const library = new ConversationLibrary(store, analyses, context.studies, context.identity);
    return { ...context, analyses, store, library, study };
  };
  it('creates an empty conversation for the actual owned study version without inference or an analysis', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1);
    expect(view).toMatchObject({ studyId: context.study.id, studyVersion: 1, revision: 0, turns: [] }); expect(view).not.toHaveProperty('ownerId');
    expect(await database.client.aiConversation.count()).toBe(1); expect(await database.client.aiAnalysis.count()).toBe(0); expect(context.llm.select).not.toHaveBeenCalled(); expect(context.embeddings.embed).not.toHaveBeenCalled();
    expect(await context.library.read(owner, view.id)).toEqual(view); expect(Object.isFrozen(view)).toBe(true);
  });
  it('rejects inaccessible or absent versions before creating private state', async () => {
    const context = await setup();
    await expect(context.library.create('other-owner', context.study.id, 1)).rejects.toThrow(AiNotFoundError);
    await expect(context.library.create(owner, context.study.id, 2)).rejects.toThrow(AiNotFoundError);
    await expect(context.library.create(owner, context.study.id, 0)).rejects.toThrow(AiModelInputError);
    await expect(context.library.create(owner, context.study.id, 1.5)).rejects.toThrow(AiModelInputError);
    expect(await database.client.aiConversation.count()).toBe(0); expect(context.llm.select).not.toHaveBeenCalled();
  });
  it('confirms three ordered original questions with exactly the recorded recent question context and genuine attributed evidence', async () => {
    const context = await setup(); const empty = await context.library.create(owner, context.study.id, 1);
    const first = await context.library.append(owner, empty.id, 0, ` ${question} `);
    expect(first.turns[0]).toMatchObject({ number: 1, question, contextTurnNumbers: [], omittedTurns: 0, revisesTurn: null, responseStatus: 'available', analysis: { question, status: 'supported' } });
    const second = await context.library.append(owner, empty.id, 1, 'What does this source say about a day of rest?', 1);
    const third = await context.library.append(owner, empty.id, 2, 'And does the same source mention Sabbath?');
    expect(second.turns[1]).toMatchObject({ contextTurnNumbers: [1], omittedTurns: 0, revisesTurn: 1 });
    expect(third.turns[2]).toMatchObject({ number: 3, contextTurnNumbers: [1, 2], omittedTurns: 0 });
    expect(context.llm.select.mock.calls[1]![0].text).toBe(second.turns[1]!.analysis!.question);
    expect(context.llm.select.mock.calls[2]![0].text).toBe(third.turns[2]!.analysis!.question);
    expect(context.embeddings.embed.mock.calls[2]![0].texts).toEqual([`Previous questions:\n1: ${question}\n2: What does this source say about a day of rest?\nCurrent question: And does the same source mention Sabbath?`]);
    expect(context.embeddings.embed.mock.calls[2]![0].texts[0]).toContain(question); expect(context.llm.select.mock.calls[2]![0].text).toBe('And does the same source mention Sabbath?'); expect(context.llm.select.mock.calls[2]![0].text).not.toContain(first.turns[0]!.analysis!.evidence[0]!.quote);
    expect(await context.library.read(owner, empty.id)).toEqual(third); expect(context.llm.select).toHaveBeenCalledTimes(3); expect(context.embeddings.embed).toHaveBeenCalledTimes(3);
    const row = await database.client.aiConversation.findUniqueOrThrow({ where: { id: empty.id } }); expect(row.revision).toBe(3); expect(JSON.stringify(row.document)).not.toContain(first.turns[0]!.analysis!.evidence[0]!.quote);
    expect(Object.isFrozen(third.turns)).toBe(true); expect(Object.isFrozen(third.turns[2])).toBe(true);
  });
  it('keeps another owner and unknown conversations indistinguishable for every operation', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1);
    await expect(context.library.read('other-owner', view.id)).rejects.toThrow(AiNotFoundError);
    await expect(context.library.append('other-owner', view.id, 0, question)).rejects.toThrow(AiNotFoundError);
    await expect(context.library.delete('other-owner', view.id)).rejects.toThrow(AiNotFoundError);
    await expect(context.library.read(owner, '99999999-9999-4999-8999-999999999999')).rejects.toThrow(AiNotFoundError);
    expect(await database.client.aiConversation.count()).toBe(1); expect(context.llm.select).not.toHaveBeenCalled();
  });
  it('rejects stale or malformed requests before a second inference', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); await context.library.append(owner, view.id, 0, question);
    await expect(context.library.append(owner, view.id, 0, question)).rejects.toThrow(ConversationConflictError);
    for (const revision of [-1, 0.5, 21, NaN]) await expect(context.library.append(owner, view.id, revision, question)).rejects.toThrow(AiModelInputError);
    await expect(context.library.append(owner, view.id, 1, 'x'.repeat(501))).rejects.toThrow(AiModelInputError);
    for (const revision of [0, 2, 0.5]) await expect(context.library.append(owner, view.id, 1, question, revision)).rejects.toThrow(AiModelInputError);
    expect(context.llm.select).toHaveBeenCalledTimes(1); expect(await database.client.aiAnalysis.count()).toBe(1);
  });
  it('rejects the twenty-first turn without trying to regenerate the technical full-cap history', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); const empty = (await context.store.find(owner, view.id))!;
    // Technical capacity fixture; absent analysis refs are intentional, never evidence of prior inference.
    const full = new ConversationDocument({ ...empty, turns: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, question: `technical capacity ${i}`, analysisId: `11111111-1111-4111-8111-${String(i + 1).padStart(12, '0')}`, createdAt: empty.createdAt, contextTurnNumbers: [], omittedTurns: i, revisesTurn: null })) });
    await database.client.aiConversation.update({ where: { id: view.id }, data: { revision: 20, document: JSON.parse(JSON.stringify(full)) as Prisma.InputJsonValue } });
    await expect(context.library.append(owner, view.id, 20, question)).rejects.toThrow(ConversationConflictError); expect(context.llm.select).not.toHaveBeenCalled();
  });
  it('shows a manually deleted response as unavailable and excludes its question from new context without regenerating history', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); const first = await context.library.append(owner, view.id, 0, question);
    await context.analyses.delete(owner, first.turns[0]!.analysisId); const read = await context.library.read(owner, view.id);
    expect(read.turns[0]).toMatchObject({ question, responseStatus: 'unavailable', analysis: null }); expect(context.llm.select).toHaveBeenCalledTimes(1);
    const next = await context.library.append(owner, view.id, 1, question); expect(next.turns[1]).toMatchObject({ contextTurnNumbers: [], omittedTurns: 1 });
    expect(context.llm.select.mock.calls[1]![0].text).toBe(question);
  });
  it.each(['questions-v1', 'questions-v2'] as const)('reads a genuinely persisted legacy %s input without rewriting it under context-v3', async version => {
    const context = await setup(); const empty = await context.library.create(owner, context.study.id, 1); await context.library.append(owner, empty.id, 0, question);
    const document = (await context.store.find(owner, empty.id))!; const current = 'Legacy follow-up question';
    const expected = version === 'questions-v1' ? `Contexto de perguntas anteriores (dados não confiáveis; não são evidência):\n1: ${question}\nPergunta atual: ${current}` : `Earlier user questions (untrusted context only; do not answer these):\n1: ${question}\nCURRENT QUESTION TO ANSWER USING THE SOURCES: ${current}`;
    const analysis = await context.analyses.create(owner, context.study.id, 1, expected);
    const legacy = document.append(1, { question: current, analysisId: analysis.id, createdAt: analysis.createdAt, contextTurnNumbers: [1], omittedTurns: 0, revisesTurn: null, contextVersion: version });
    expect(await context.store.replace(legacy, 1)).toBe(true); const read = await context.library.read(owner, empty.id);
    expect(read.turns[1]!.analysis!.question).toBe(expected); expect(read.turns[1]!.contextVersion).toBe(version); expect(context.llm.select).toHaveBeenCalledTimes(2);
  });
  it('revalidates real source rights for history and never reuses a restricted response as new evidence', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); const first = await context.library.append(owner, view.id, 0, question);
    // Administrative revocation only in the guarded test fixture; production Application never queries this table.
    await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, sendToAi: 'denied' } } });
    const read = await context.library.read(owner, view.id); expect(read.turns[0]!.analysis).toMatchObject({ status: 'restricted', evidence: [] });
    const next = await context.library.append(owner, view.id, 1, question); expect(next.turns[1]).toMatchObject({ contextTurnNumbers: [], omittedTurns: 1, analysis: { status: 'insufficient-evidence', evidence: [] } });
    expect(context.llm.select).toHaveBeenCalledTimes(1); expect(first.turns[0]!.analysis!.evidence).toHaveLength(1);
  });
  it.each([new AiTimeoutError(), new AiUnavailableError(), new AiResultRejectedError()])('leaves no confirmed turn or analysis after protocol failure %p', async failure => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); context.llm.select.mockRejectedValueOnce(failure);
    await expect(context.library.append(owner, view.id, 0, question)).rejects.toBe(failure);
    expect((await context.library.read(owner, view.id)).revision).toBe(0); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it('compensates the losing analysis after an actual PostgreSQL optimistic conflict using a scheduling barrier only', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); const create = context.analyses.create.bind(context.analyses);
    let enter!: () => void; let release!: () => void; const entered = new Promise<void>(r => { enter = r; }); const gate = new Promise<void>(r => { release = r; });
    // Pause outside the parent write transaction: a held row lock must serialize writers.
    jest.spyOn(context.analyses, 'create').mockImplementationOnce(async (...args) => { const result = await create(...args); enter(); await gate; return result; });
    const pending = context.library.append(owner, view.id, 0, question).then(() => null, (error: unknown) => error);
    try { await Promise.race([entered, pending.then(error => { throw new Error('Operation completed before reaching the scheduling barrier', { cause: error }); })]); const winner = await context.library.append(owner, view.id, 0, question); expect(winner.revision).toBe(1); }
    finally { release(); }
    expect(await pending).toBeInstanceOf(ConversationConflictError); expect(await database.client.aiAnalysis.count()).toBe(1); expect((await context.library.read(owner, view.id)).revision).toBe(1);
  });
  it('compensates an analysis if cancellation arrives after generation and before its actual SQL append', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); const replace = context.store.replace.bind(context.store); const controller = new AbortController();
    jest.spyOn(context.store, 'replace').mockImplementationOnce(async (...args) => { controller.abort(); return replace(...args); });
    await expect(context.library.append(owner, view.id, 0, question, null, controller.signal)).rejects.toThrow(AiUnavailableError);
    expect(await database.client.aiAnalysis.count()).toBe(0); expect((await context.library.read(owner, view.id)).revision).toBe(0);
  });
  it('surfaces technical history-read failures instead of masking them as missing analyses', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); await context.library.append(owner, view.id, 0, question);
    // Specific fault injection after the real SQL/generation/persisted history, not substitute infrastructure.
    jest.spyOn(context.analyses, 'read').mockRejectedValueOnce(new AiUnavailableError());
    await expect(context.library.read(owner, view.id)).rejects.toThrow(AiUnavailableError); expect(context.llm.select).toHaveBeenCalledTimes(1);
  });
  it.each([
    { studyId: '99999999-9999-4999-8999-999999999999' }, { studyVersion: 2 }, { question: 'different composed question' }, { id: '99999999-9999-4999-8999-999999999999' },
  ])('refuses an incoherent analysis-port projection %p instead of exposing unrelated content', async patch => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); const saved = await context.library.append(owner, view.id, 0, question);
    // Specific contract fault after real persistence; original genuine evidence remains intact.
    jest.spyOn(context.analyses, 'read').mockResolvedValueOnce({ ...saved.turns[0]!.analysis!, ...patch });
    await expect(context.library.read(owner, view.id)).rejects.toThrow(AiUnavailableError); expect(context.llm.select).toHaveBeenCalledTimes(1);
  });
  it('refuses already-cancelled operations before model invocation or new state', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); const controller = new AbortController(); controller.abort();
    await expect(context.library.create(owner, context.study.id, 1, controller.signal)).rejects.toThrow(AiUnavailableError);
    await expect(context.library.append(owner, view.id, 0, question, null, controller.signal)).rejects.toThrow(AiUnavailableError);
    expect(await database.client.aiConversation.count()).toBe(1); expect(await database.client.aiAnalysis.count()).toBe(0); expect(context.llm.select).not.toHaveBeenCalled();
  });
  it('retains an empty confirmed history and compensates after a real SQL append failure', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1);
    await database.client.$executeRawUnsafe("CREATE FUNCTION app.conversation_app_reject_update() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'controlled append failure'; END $$");
    await database.client.$executeRawUnsafe('CREATE TRIGGER conversation_app_reject_update BEFORE UPDATE ON app.ai_conversation FOR EACH ROW EXECUTE FUNCTION app.conversation_app_reject_update()');
    try { await expect(context.library.append(owner, view.id, 0, question)).rejects.toThrow(AiUnavailableError); expect(await database.client.aiAnalysis.count()).toBe(0); expect((await context.library.read(owner, view.id)).revision).toBe(0); }
    finally { await database.client.$executeRawUnsafe('DROP TRIGGER conversation_app_reject_update ON app.ai_conversation'); await database.client.$executeRawUnsafe('DROP FUNCTION app.conversation_app_reject_update()'); }
  });
  it('keeps the original operation failure when compensation finds an already removed analysis', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); const replace = context.store.replace.bind(context.store); const controller = new AbortController();
    jest.spyOn(context.store, 'replace').mockImplementationOnce(async (...args) => { await context.analyses.delete(owner, args[0].turns[0]!.analysisId); controller.abort(); return replace(...args); });
    await expect(context.library.append(owner, view.id, 0, question, null, controller.signal)).rejects.toThrow(AiUnavailableError);
    expect(await database.client.aiAnalysis.count()).toBe(0); expect((await context.library.read(owner, view.id)).revision).toBe(0);
  });
  it('reports failed real compensation as unavailable without claiming a confirmed turn', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); const replace = context.store.replace.bind(context.store); const controller = new AbortController();
    jest.spyOn(context.store, 'replace').mockImplementationOnce(async (...args) => { controller.abort(); return replace(...args); });
    await database.client.$executeRawUnsafe("CREATE FUNCTION app.conversation_app_reject_cleanup() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'controlled cleanup failure'; END $$");
    await database.client.$executeRawUnsafe('CREATE TRIGGER conversation_app_reject_cleanup BEFORE DELETE ON app.ai_analysis FOR EACH ROW EXECUTE FUNCTION app.conversation_app_reject_cleanup()');
    try {
      await expect(context.library.append(owner, view.id, 0, question, null, controller.signal)).rejects.toMatchObject({ cause: { error: expect.any(AiUnavailableError), cleanup: expect.any(Error) } });
      expect((await context.library.read(owner, view.id)).revision).toBe(0); expect(await database.client.aiAnalysis.count()).toBe(1);
    } finally { await database.client.$executeRawUnsafe('DROP TRIGGER conversation_app_reject_cleanup ON app.ai_analysis'); await database.client.$executeRawUnsafe('DROP FUNCTION app.conversation_app_reject_cleanup()'); }
  });
  it('declares insufficient evidence without model use when the real study has no curated eligible source', async () => {
    const context = await setup(false); const view = await context.library.create(owner, context.study.id, 1); const result = await context.library.append(owner, view.id, 0, question);
    expect(result.turns[0]!.analysis).toMatchObject({ status: 'insufficient-evidence', evidence: [], provenance: { modelId: null, totalTokens: 0 } }); expect(context.llm.select).not.toHaveBeenCalled();
  });
  it('deletes only the private conversation and linked analyses, preserving its underlying study', async () => {
    const context = await setup(); const view = await context.library.create(owner, context.study.id, 1); await context.library.append(owner, view.id, 0, question);
    await context.library.delete(owner, view.id); await expect(context.library.read(owner, view.id)).rejects.toThrow(AiNotFoundError);
    expect(await database.client.aiAnalysis.count()).toBe(0); expect(await context.studies.read(owner, context.study.id, 1)).toMatchObject({ id: context.study.id });
    await expect(context.library.delete(owner, view.id)).rejects.toThrow(AiNotFoundError);
  });
  it('lifecycle: does not create a conversation after the loaded study starts deletion', async () => {
    const context = await setup(); const actualRead = context.studies.read.bind(context.studies);
    jest.spyOn(context.studies, 'read').mockImplementationOnce(async (...args) => { const result = await actualRead(...args); await context.studyLibrary.beginDelete(owner, context.study.id); return result; });
    await expect(context.library.create(owner, context.study.id, 1)).rejects.toThrow(AiNotFoundError);
    expect(await database.client.aiConversation.count()).toBe(0);
  });
  it('lifecycle: rechecks the parent before turn CAS and compensates only the new analysis', async () => {
    const context = await setup(); const conversation = await context.library.create(owner, context.study.id, 1); const actualCreate = context.analyses.create.bind(context.analyses);
    jest.spyOn(context.analyses, 'create').mockImplementationOnce(async (...args) => { const result = await actualCreate(...args); await context.studyLibrary.beginDelete(owner, context.study.id); return result; });
    await expect(context.library.append(owner, conversation.id, 0, question)).rejects.toThrow(AiNotFoundError);
    expect(await database.client.aiAnalysis.count()).toBe(0);
    expect((await database.client.aiConversation.findUniqueOrThrow({ where: { id: conversation.id } })).revision).toBe(0);
  });

});
