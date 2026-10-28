import { assertTestTarget } from '../../../src/config/runtime-config';
import { Database } from '../../../src/infrastructure/database';
import { AnalysisDocument } from '../../../src/modules/ai-assistant/domain/analysis-document';
import { AnalysisDomainError } from '../../../src/modules/ai-assistant/domain/analysis-values';
import { PrismaAnalysisStore } from '../../../src/modules/ai-assistant/infrastructure/prisma-analysis-store';
import { analysisDocument, analysisQuote } from '../../helpers/ai-analysis';
import { AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';

describe('owned analysis storage, actual PostgreSQL/Prisma and no cross-module access', () => {
  let database: Database;
  let ready = false;
  beforeAll(async () => {
    database = new Database(assertTestTarget(process.env));
    expect(await database.client.$queryRaw`SELECT current_database() AS db,current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
    ready = true;
  });
  beforeEach(async () => { await database.client.aiAnalysis.deleteMany(); });
  afterAll(async () => { if (database) { try { if (ready) await database.client.aiAnalysis.deleteMany(); } finally { await database.onModuleDestroy(); } } });
  const seed = async () => {
    const document = new AnalysisDocument(analysisDocument());
    await database.client.aiAnalysis.create({ data: { id: document.id, ownerId: document.ownerId, studyId: document.studyId, studyVersion: BigInt(document.studyVersion), document: JSON.parse(JSON.stringify(document)), createdAt: new Date(document.createdAt) } });
    return document;
  };
  it('atomically inserts exact metadata without text/prompt/vector and reconstructs the immutable document', async () => {
    const store = new PrismaAnalysisStore(database); const document = new AnalysisDocument(analysisDocument());
    await store.create(document);
    const rows = await database.client.aiAnalysis.findMany(); expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: document.id, ownerId: document.ownerId, studyId: document.studyId, studyVersion: 1n, createdAt: new Date(document.createdAt) });
    expect(rows[0]!.document).toEqual(JSON.parse(JSON.stringify(document))); expect(JSON.stringify(rows[0]!.document)).not.toContain(analysisQuote);
    const restored = await store.find(document.ownerId, document.id); expect(restored).toEqual(document); expect(Object.isFrozen(restored)).toBe(true); expect(Object.isFrozen(restored!.evidenceRefs)).toBe(true);
  });
  it('filters by owner in SQL and returns null for missing/foreign identity without leaking the document', async () => {
    const document = await seed(); const store = new PrismaAnalysisStore(database);
    expect(await store.find('another-owner', document.id)).toBeNull(); expect(await store.find(document.ownerId, '00000000-0000-0000-0000-000000000000')).toBeNull();
    expect(await store.find(document.ownerId, document.id)).toEqual(document);
  });
  it('deletes only the requested owner analysis, returns false for missing/foreign and leaves another analysis intact', async () => {
    const document = await seed(); const store = new PrismaAnalysisStore(database);
    const other = new AnalysisDocument({ ...analysisDocument(), id: '27165efb-377e-4bb5-935c-aa6d7513b83a', ownerId: 'another-owner' });
    await store.create(other);
    expect(await store.delete('another-owner', document.id)).toBe(false); expect(await store.delete(document.ownerId, document.id)).toBe(true);
    expect(await store.delete(document.ownerId, document.id)).toBe(false); expect(await store.find(other.ownerId, other.id)).toEqual(other);
    expect(await database.client.aiAnalysis.count()).toBe(1);
  });
  it('preserves the existing record after a real duplicate-key failure instead of reporting a second insert', async () => {
    const document = await seed(); const store = new PrismaAnalysisStore(database);
    await expect(store.create(new AnalysisDocument({ ...analysisDocument(), question: 'Technical duplicate write' }))).rejects.toMatchObject({ code: 'P2002' });
    expect(await store.find(document.ownerId, document.id)).toEqual(document); expect(await database.client.aiAnalysis.count()).toBe(1);
  });
  it('rejects invalid domain metadata before writing and strips additional prompt/text properties at the storage boundary', async () => {
    const store = new PrismaAnalysisStore(database);
    await expect(store.create({ ...analysisDocument(), studyVersion: 0 } as unknown as AnalysisDocument)).rejects.toThrow(AnalysisDomainError);
    expect(await database.client.aiAnalysis.count()).toBe(0);
    await store.create({ ...analysisDocument(), rawPrompt: analysisQuote, embedding: [1, 0] } as unknown as AnalysisDocument);
    expect((await database.client.aiAnalysis.findMany())[0]!.document).toEqual(analysisDocument());
  });
  it.each([
    { id: '27165efb-377e-4bb5-935c-aa6d7513b83a' }, { ownerId: 'another-owner' }, { studyId: '27165efb-377e-4bb5-935c-aa6d7513b83a' }, { studyVersion: 2 }, { createdAt: '2026-10-27T00:00:00.001Z' },
  ])('rejects incoherence between owned row metadata and stored document %j', async patch => {
    const document = await seed(); const store = new PrismaAnalysisStore(database);
    await database.client.aiAnalysis.update({ where: { id: document.id }, data: { document: { ...JSON.parse(JSON.stringify(document)), ...patch } } });
    await expect(store.find(document.ownerId, document.id)).rejects.toThrow(AnalysisDomainError);
  });
  it('preserves accepted UUID case in the document while comparing normalized PostgreSQL UUID columns', async () => {
    const input = analysisDocument(); const document = new AnalysisDocument({ ...input, id: input.id.toUpperCase(), studyId: input.studyId.toUpperCase() });
    const store = new PrismaAnalysisStore(database); await store.create(document);
    expect(await store.find(document.ownerId, document.id.toLowerCase())).toEqual(document);
  });
  it('refuses an already-cancelled write without inserting a private analysis', async () => {
    const controller = new AbortController(); controller.abort(); const store = new PrismaAnalysisStore(database);
    await expect(store.create(new AnalysisDocument(analysisDocument()), controller.signal)).rejects.toThrow(AiUnavailableError);
    expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it('rolls back an INSERT actually started before cancellation rather than confirming a late private analysis', async () => {
    const controller = new AbortController(); const store = new PrismaAnalysisStore(database);
    await database.client.$executeRawUnsafe('CREATE SEQUENCE app.ai_test_insert_started');
    await database.client.$executeRawUnsafe("CREATE FUNCTION app.ai_test_pause_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN PERFORM nextval('app.ai_test_insert_started'); PERFORM pg_sleep(0.5); RETURN NEW; END $$");
    await database.client.$executeRawUnsafe('CREATE TRIGGER ai_test_pause_insert BEFORE INSERT ON app.ai_analysis FOR EACH ROW EXECUTE FUNCTION app.ai_test_pause_insert()');
    try {
      const writing = store.create(new AnalysisDocument(analysisDocument()), controller.signal); const completed = writing.then(() => null, (error: unknown) => error);
      let started = false;
      for (let attempt = 0; attempt < 100; attempt++) { const [row] = await database.client.$queryRaw<{ is_called: boolean }[]>`SELECT is_called FROM app.ai_test_insert_started`; if (row!.is_called) { started = true; break; } await new Promise(resolve => setTimeout(resolve, 5)); }
      controller.abort(); const failure = await completed; expect(started).toBe(true); expect(failure).toBeInstanceOf(AiUnavailableError); expect(await database.client.aiAnalysis.count()).toBe(0);
    } finally {
      await database.client.$executeRawUnsafe('DROP TRIGGER ai_test_pause_insert ON app.ai_analysis'); await database.client.$executeRawUnsafe('DROP FUNCTION app.ai_test_pause_insert()'); await database.client.$executeRawUnsafe('DROP SEQUENCE app.ai_test_insert_started');
    }
  });
});
