import { randomUUID } from 'node:crypto';
import type { Database } from '../../../src/infrastructure/database';
import { AiHistoryLibrary } from '../../../src/modules/ai-assistant/application/ai-history-library';
import { AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import { AiModelInputError } from '../../../src/modules/ai-assistant/domain/model-input';
import { PrismaHistoryStore } from '../../../src/modules/ai-assistant/infrastructure/prisma-history-store';
import { PrismaConversationStore } from '../../../src/modules/ai-assistant/infrastructure/prisma-conversation-store';
import { PrismaAnalysisStore } from '../../../src/modules/ai-assistant/infrastructure/prisma-analysis-store';
import { ConversationDocument } from '../../../src/modules/ai-assistant/domain/conversation';
import { AnalysisDocument } from '../../../src/modules/ai-assistant/domain/analysis-document';
import { openSourceTestDatabase } from '../../helpers/source-library';
import { analysisDocument } from '../../helpers/ai-analysis';
const owner = 'history-owner'; const studyId = analysisDocument().studyId;
describe('AI-owned metadata history and cleanup with real SQL, no runtime', () => {
 let database: Database; let store: PrismaHistoryStore; let library: AiHistoryLibrary;
 const clean = async () => { await database.client.aiConversation.deleteMany(); await database.client.aiAnalysis.deleteMany(); };
 beforeAll(async () => { database = await openSourceTestDatabase(); store = new PrismaHistoryStore(database); library = new AiHistoryLibrary(store); });
 beforeEach(clean); afterAll(async () => { try { await clean(); } finally { await database?.onModuleDestroy(); } });
 const seed = async (id = randomUUID(), subject = owner, target = studyId) => {
  const document = new ConversationDocument({ schemaVersion: 1, id, ownerId: subject, studyId: target, studyVersion: 1, createdAt: '2026-10-29T00:00:00.000Z', turns: [] });
  await new PrismaConversationStore(database).create(document); return document;
 };
 it('paginates only private study conversation metadata with stable tied-date order', async () => {
  const a = await seed(); const b = await seed(); await seed(randomUUID(), 'foreign-owner'); await seed(randomUUID(), owner, randomUUID());
  const ordered = [a.id,b.id].sort().reverse(); const first = await library.listForStudy(owner, studyId, { limit: 1 });
  expect(first.items).toEqual([{ id: ordered[0], studyId, studyVersion: 1, revision: 0, createdAt: a.createdAt }]);
  expect(first.nextCursor).toEqual({ id: ordered[0], createdAt: a.createdAt });
  const last = await library.listForStudy(owner, studyId, { limit: 1, cursor: first.nextCursor! }); expect(last.items.map(row => row.id)).toEqual([ordered[1]]); expect(last.nextCursor).toBeNull();
  expect(await library.listForStudy('absent-owner', studyId, { limit: 20 })).toEqual({ items: [], nextCursor: null });
  expect(JSON.stringify(first)).not.toContain('ownerId'); expect(JSON.stringify(first)).not.toContain('turns');
 });
 it('deletes all owned study conversations and analyses, including unattached analyses, idempotently', async () => {
  await seed(); const foreign = await seed(randomUUID(), 'foreign-owner'); const other = await seed(randomUUID(), owner, randomUUID());
  const analysis = new PrismaAnalysisStore(database); await analysis.create(new AnalysisDocument({ ...analysisDocument(), id: randomUUID(), ownerId: owner }));
  await analysis.create(new AnalysisDocument({ ...analysisDocument(), id: randomUUID(), ownerId: 'foreign-owner' }));
  await library.deleteForStudy(owner, studyId); await library.deleteForStudy(owner, studyId);
  expect((await database.client.aiConversation.findMany()).map(row => row.id).sort()).toEqual([foreign.id,other.id].sort());
  expect((await database.client.aiAnalysis.findMany()).map(row => row.ownerId)).toEqual(['foreign-owner']);
 });
 it('rolls back conversation cleanup if the actual analysis DELETE fails', async () => {
  await seed(); await new PrismaAnalysisStore(database).create(new AnalysisDocument({ ...analysisDocument(), ownerId: owner }));
  await database.client.$executeRaw`CREATE FUNCTION app.history_test_fail_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'controlled-history-cleanup-failure'; END $$`;
  await database.client.$executeRaw`CREATE TRIGGER history_test_fail_delete BEFORE DELETE ON app.ai_analysis FOR EACH ROW EXECUTE FUNCTION app.history_test_fail_delete()`;
  try { await expect(library.deleteForStudy(owner, studyId)).rejects.toThrow(AiUnavailableError); expect(await database.client.aiConversation.count()).toBe(1); expect(await database.client.aiAnalysis.count()).toBe(1); }
  finally { await database.client.$executeRaw`DROP TRIGGER history_test_fail_delete ON app.ai_analysis`; await database.client.$executeRaw`DROP FUNCTION app.history_test_fail_delete()`; }
 });
 it('preserves the SQL cause without pretending an unavailable history is empty', async () => {
  await database.client.$executeRaw`ALTER TABLE app.ai_conversation RENAME TO history_test_offline`;
  try { const failing = library.listForStudy(owner, studyId, { limit: 20 }); await expect(failing).rejects.toThrow(AiUnavailableError); await expect(failing).rejects.toMatchObject({ cause: expect.any(Error), message: expect.stringMatching(/\S/) }); }
  finally { await database.client.$executeRaw`ALTER TABLE app.history_test_offline RENAME TO ai_conversation`; }
 });
 it.each([0,51,1.5])('rejects invalid metadata list limit %p', async limit => { await expect(library.listForStudy(owner, studyId, { limit })).rejects.toThrow(AiModelInputError); });
});
