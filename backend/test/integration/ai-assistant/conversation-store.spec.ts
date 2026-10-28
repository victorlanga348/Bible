import { assertTestTarget } from '../../../src/config/runtime-config';
import { Database } from '../../../src/infrastructure/database';
import { PrismaConversationStore } from '../../../src/modules/ai-assistant/infrastructure/prisma-conversation-store';
import { ConversationDocument, type ConversationProps } from '../../../src/modules/ai-assistant/domain/conversation';
import { PrismaAnalysisStore } from '../../../src/modules/ai-assistant/infrastructure/prisma-analysis-store';
import { AnalysisDocument } from '../../../src/modules/ai-assistant/domain/analysis-document';
import { AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import { AiModelInputError } from '../../../src/modules/ai-assistant/domain/model-input';
import { analysisDocument } from '../../helpers/ai-analysis';

describe('conversation persistence/CAS/cleanup, actual PostgreSQL and genuine source fixture; no inference', () => {
  let database: Database; let ready = false; let store: PrismaConversationStore;
  const props = (): ConversationProps => ({ schemaVersion: 1, id: '11111111-1111-4111-8111-111111111111', ownerId: 'technical-owner', studyId: analysisDocument().studyId, studyVersion: 1, createdAt: analysisDocument().createdAt, turns: [] });
  beforeAll(async () => {
    database = new Database(assertTestTarget(process.env));
    expect(await database.client.$queryRaw`SELECT current_database() AS db,current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
    ready = true; store = new PrismaConversationStore(database);
  });
  const clean = async () => { await database.client.aiConversation.deleteMany(); await database.client.aiAnalysis.deleteMany(); };
  beforeEach(clean);
  afterAll(async () => { if (database) { try { if (ready) await clean(); } finally { await database.onModuleDestroy(); } } });
  const seed = async () => { const document = new ConversationDocument(props()); await store.create(document); return document; };
  const analysis = async (id = analysisDocument().id) => {
    const value = new AnalysisDocument({ ...analysisDocument(), id }); await new PrismaAnalysisStore(database).create(value); return value;
  };
  const append = (document: ConversationDocument, value: AnalysisDocument) => document.append(document.revision, { question: value.question, analysisId: value.id, createdAt: value.createdAt, contextTurnNumbers: [], omittedTurns: document.revision, revisesTurn: null });
  it('round-trips a private empty document with durable matching metadata', async () => {
    const document = await seed(); expect(await store.find(document.ownerId, document.id)).toEqual(document);
    const row = await database.client.aiConversation.findUniqueOrThrow({ where: { id: document.id } });
    expect(row).toMatchObject({ ownerId: document.ownerId, studyId: document.studyId, studyVersion: 1n, revision: 0 });
    expect(row.document).toEqual(JSON.parse(JSON.stringify(document)));
    expect(await store.find('other-owner', document.id)).toBeNull(); expect(await store.find(document.ownerId, '99999999-9999-4999-8999-999999999999')).toBeNull();
  });
  it('preserves an existing record after a real duplicate-key failure with internal cause', async () => {
    const document = await seed(); await expect(store.create(document)).rejects.toMatchObject({ cause: { code: 'P2002' } });
    expect(await store.find(document.ownerId, document.id)).toEqual(document); expect(await database.client.aiConversation.count()).toBe(1);
  });
  it('performs an optimistic append and rejects a stale revision without overwriting the winner', async () => {
    const document = await seed(); const first = append(document, await analysis());
    for (const patch of [{ id: '99999999-9999-4999-8999-999999999999' }, { studyId: '99999999-9999-4999-8999-999999999999' }, { studyVersion: 2 }, { createdAt: '2026-10-26T00:00:00.000Z' }]) expect(await store.replace(new ConversationDocument({ ...first, ...patch }), 0)).toBe(false);
    expect(await store.replace(first, 0)).toBe(true); expect(await store.replace(first, 0)).toBe(false);
    expect(await store.find(document.ownerId, document.id)).toEqual(first);
    const forged = new ConversationDocument({ ...first, ownerId: 'other-owner' }); expect(await store.replace(forged, 0)).toBe(false);
  });
  it('allows only one of two real concurrent updates to confirm the same next turn', async () => {
    const document = await seed(); const a = append(document, await analysis()); const b = append(document, await analysis('99999999-9999-4999-8999-999999999999'));
    const results = await Promise.all([store.replace(a, 0), store.replace(b, 0)]); expect(results.sort()).toEqual([false, true]);
    const saved = await store.find(document.ownerId, document.id); expect(saved!.revision).toBe(1); expect([a.turns[0]!.analysisId, b.turns[0]!.analysisId]).toContain(saved!.turns[0]!.analysisId);
  });
  it.each([
    { id: '99999999-9999-4999-8999-999999999999' }, { ownerId: 'tampered-owner' }, { studyId: '99999999-9999-4999-8999-999999999999' },
    { studyVersion: 2 }, { createdAt: '2026-10-27T00:00:00.001Z' },
  ])('rejects durable row/document incoherence %p as an unavailable resource, not valid history', async patch => {
    const document = await seed(); await database.client.aiConversation.update({ where: { id: document.id }, data: { document: { ...JSON.parse(JSON.stringify(document)), ...patch } } });
    await expect(store.find(document.ownerId, document.id)).rejects.toThrow(AiUnavailableError);
  });
  it('rejects cancelled inserts and updates without durable changes', async () => {
    const controller = new AbortController(); controller.abort(); const document = new ConversationDocument(props());
    await expect(store.create(document, controller.signal)).rejects.toThrow(AiUnavailableError); expect(await database.client.aiConversation.count()).toBe(0);
    await store.create(document); const next = append(document, await analysis());
    await expect(store.replace(next, 0, controller.signal)).rejects.toThrow(AiUnavailableError); expect(await store.find(document.ownerId, document.id)).toEqual(document);
  });
  it.each(['INSERT', 'UPDATE'] as const)('rolls back a real %s actually started before cancellation', async operation => {
    const document = operation === 'INSERT' ? new ConversationDocument(props()) : await seed();
    const next = operation === 'UPDATE' ? append(document, await analysis()) : null; const controller = new AbortController();
    await database.client.$executeRawUnsafe('CREATE SEQUENCE app.conversation_test_update_started');
    await database.client.$executeRawUnsafe("CREATE FUNCTION app.conversation_test_pause() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN PERFORM nextval('app.conversation_test_update_started'); PERFORM pg_sleep(0.5); RETURN NEW; END $$");
    await database.client.$executeRawUnsafe(`CREATE TRIGGER conversation_test_pause BEFORE ${operation} ON app.ai_conversation FOR EACH ROW EXECUTE FUNCTION app.conversation_test_pause()`);
    try {
      const writing = operation === 'INSERT' ? store.create(document, controller.signal) : store.replace(next!, 0, controller.signal);
      const completed = writing.then(() => null, (error: unknown) => error); let started = false;
      for (let attempt = 0; attempt < 100; attempt++) { const [row] = await database.client.$queryRaw<{ is_called: boolean }[]>`SELECT is_called FROM app.conversation_test_update_started`; if (row!.is_called) { started = true; break; } await new Promise(resolve => setTimeout(resolve, 5)); }
      controller.abort(); const failure = await completed; expect(started).toBe(true); expect(failure).toBeInstanceOf(AiUnavailableError); expect(await store.find(document.ownerId, document.id)).toEqual(operation === 'INSERT' ? null : document);
    } finally {
      await database.client.$executeRawUnsafe('DROP TRIGGER conversation_test_pause ON app.ai_conversation'); await database.client.$executeRawUnsafe('DROP FUNCTION app.conversation_test_pause()'); await database.client.$executeRawUnsafe('DROP SEQUENCE app.conversation_test_update_started');
    }
  });
  it('rejects invalid initial documents and update counters before issuing a write', async () => {
    const document = new ConversationDocument(props()); const full = append(document, await analysis());
    const failure = await store.create(full).then(() => null, (error: unknown) => error);
    expect(failure).toBeInstanceOf(AiUnavailableError); expect((failure as Error).cause).toBeInstanceOf(AiModelInputError);
    expect(await database.client.aiConversation.count()).toBe(0); await store.create(document);
    for (const revision of [-1, 0.5, NaN]) await expect(store.replace(full, revision)).rejects.toMatchObject({ cause: expect.any(AiModelInputError) });
    await expect(store.replace(document, 0)).rejects.toMatchObject({ cause: expect.any(AiModelInputError) });
    expect(await store.find(document.ownerId, document.id)).toEqual(document);
  });
  it('deletes an empty conversation without treating an empty analysis selection as all analyses', async () => {
    const document = await seed(); const unrelated = await analysis();
    expect(await store.delete(document.ownerId, document.id)).toBe(true); expect(await database.client.aiAnalysis.count()).toBe(1);
    expect((await database.client.aiAnalysis.findMany())[0]!.id).toBe(unrelated.id);
  });
  it('deletes only the owner conversation and its linked analyses, leaving unrelated private analyses intact', async () => {
    const document = await seed(); const next = append(document, await analysis()); await store.replace(next, 0);
    const unrelated = await analysis('99999999-9999-4999-8999-999999999999');
    expect(await store.delete('other-owner', document.id)).toBe(false); expect(await database.client.aiAnalysis.count()).toBe(2);
    expect(await store.delete(document.ownerId, document.id)).toBe(true); expect(await store.find(document.ownerId, document.id)).toBeNull();
    expect((await database.client.aiAnalysis.findMany()).map(row => row.id)).toEqual([unrelated.id]); expect(await store.delete(document.ownerId, document.id)).toBe(false);
  });
  it('rolls back conversation deletion if real deletion of its analysis fails', async () => {
    const document = await seed(); const next = append(document, await analysis()); await store.replace(next, 0);
    await database.client.$executeRawUnsafe("CREATE FUNCTION app.conversation_test_reject_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'controlled conversation deletion failure'; END $$");
    await database.client.$executeRawUnsafe('CREATE TRIGGER conversation_test_reject_delete BEFORE DELETE ON app.ai_analysis FOR EACH ROW EXECUTE FUNCTION app.conversation_test_reject_delete()');
    try { await expect(store.delete(document.ownerId, document.id)).rejects.toThrow(AiUnavailableError); expect(await store.find(document.ownerId, document.id)).toEqual(next); expect(await database.client.aiAnalysis.count()).toBe(1); }
    finally { await database.client.$executeRawUnsafe('DROP TRIGGER conversation_test_reject_delete ON app.ai_analysis'); await database.client.$executeRawUnsafe('DROP FUNCTION app.conversation_test_reject_delete()'); }
  });
});
