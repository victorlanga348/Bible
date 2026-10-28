import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mkdtemp, rm, access } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { request as httpRequest } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApplication } from '../../src/app';
import { parseRuntimeConfig } from '../../src/config/runtime-config';
import { assertAiTestTarget } from '../../src/config/ai-target';
import { LocalAccessTokens } from '../../src/infrastructure/access-token';
import type { Database } from '../../src/infrastructure/database';
import { AiIndexDatabase } from '../../src/modules/ai-assistant/infrastructure/index-database';
import { LocalModelProvider } from '../../src/modules/ai-assistant/infrastructure/local-model-provider';
import { SourceIndexingLibrary } from '../../src/modules/ai-assistant/application/source-indexing-library';
import { AiTimeoutError, AiUnavailableError, AiResultRejectedError } from '../../src/modules/ai-assistant/application/errors';
import { ConversationDocument } from '../../src/modules/ai-assistant/domain/conversation';
import { cleanCanon, seedCanon } from '../helpers/canon';
import { cleanStudyTestData } from '../helpers/study-database';
import { cleanSourceTestData, openSourceTestDatabase } from '../helpers/source-library';
import { aiCurations, aiSourceFixture, seedAiSource } from '../helpers/ai-source-data';
import { createAiTestRuntime } from '../helpers/ai-runtime';

const owner = 'technical-ai-owner'; const secret = 'conversation-http-test-only-signing-material-2026'; const question = 'Which day does this source call Sabbath?';
describe('conversation HTTP with actual Nest/JWT/SQL/libraries/vector; model protocol doubles, NOT inference', () => {
  let app: INestApplication; let database: Database; let vector: AiIndexDatabase; let ready = false; let home: string; let token: string; let other: string;
  let contexts: Awaited<ReturnType<typeof createAiTestRuntime>>[] = [];
  beforeAll(async () => {
    database = await openSourceTestDatabase(); vector = new AiIndexDatabase(assertAiTestTarget(process.env));
    expect(await vector.client.$queryRaw`SELECT current_database() AS db,current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]); ready = true;
    home = await mkdtemp(join(resolve('reports'), 'conversation-http-'));
    app = await createApplication({ ...parseRuntimeConfig(process.env), jwtSecret: secret, aiHome: home, aiDatabaseUrl: assertAiTestTarget(process.env) }); await app.init(); await app.listen(0, '127.0.0.1');
    token = await new LocalAccessTokens(secret).issue(owner); other = await new LocalAccessTokens(secret).issue('other-owner');
  });
  const clean = async () => { await database.client.aiConversation.deleteMany(); await database.client.aiAnalysis.deleteMany(); await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); };
  const cleanHome = async () => { if (home) { if (!home.startsWith(resolve('reports') + sep + 'conversation-http-')) throw new Error('Unsafe technical cleanup'); await rm(home, { recursive: true, force: true }); } };
  beforeEach(async () => { contexts = []; await clean(); await seedCanon(database); await seedAiSource(database); await vector.client.embeddingProfile.deleteMany(); });
  afterEach(async () => { jest.restoreAllMocks(); for (const context of contexts) await context.operation.onModuleDestroy(); });
  afterAll(async () => {
    try { if (ready) { await clean(); await vector.client.embeddingProfile.deleteMany(); } }
    finally { try { await app?.close(); } finally { await database?.onModuleDestroy(); await vector?.onModuleDestroy(); await cleanHome(); } }
  });
  const setup = async () => {
    const context = await createAiTestRuntime(database, vector, home); contexts.push(context); await context.links.curate(aiCurations[0]!);
    const study = await context.studyLibrary.create(owner, 'porbr2018', 'GEN 1:1');
    await new SourceIndexingLibrary(context.settings, context.sources, context.embeddings, context.index, context.operation, context.identity, context.hash).rebuild(); context.embeddings.embed.mockClear();
    jest.spyOn(LocalModelProvider.prototype, 'embed').mockImplementation(context.embeddings.embed); jest.spyOn(LocalModelProvider.prototype, 'select').mockImplementation(context.llm.select);
    return { ...context, study };
  };
  const create = (studyId: string) => request(app.getHttpServer()).post(`/studies/${studyId}/conversations`).auth(token, { type: 'bearer' });
  const post = (id: string) => request(app.getHttpServer()).post(`/conversations/${id}/turns`).auth(token, { type: 'bearer' });
  const read = (id: string) => request(app.getHttpServer()).get(`/conversations/${id}`).auth(token, { type: 'bearer' });
  const remove = (id: string) => request(app.getHttpServer()).delete(`/conversations/${id}`).auth(token, { type: 'bearer' });
  const seed = async () => { const context = await setup(); const response = await create(context.study.id).send({ studyVersion: 1 }).expect(201); return { ...context, conversation: response.body as { id: string } }; };
  it('creates, appends three ordered turns, reads without generation and deletes only its own analyses', async () => {
    const context = await seed(); const id = context.conversation.id;
    expect((await read(id).expect(200)).body).toMatchObject({ revision: 0, turns: [] }); expect(context.llm.select).not.toHaveBeenCalled();
    const first = (await post(id).send({ expectedRevision: 0, question: ` ${question} ` }).expect(201)).body;
    const second = (await post(id).send({ expectedRevision: 1, question, revisesTurn: 1 }).expect(201)).body;
    const third = (await post(id).send({ expectedRevision: 2, question }).expect(201)).body;
    expect(first.turns[0]).toMatchObject({ number: 1, question, analysis: { status: 'supported' } }); expect(first).not.toHaveProperty('ownerId');
    expect(second.turns[1]).toMatchObject({ revisesTurn: 1, contextTurnNumbers: [1], omittedTurns: 0 }); expect(third.turns[2].contextTurnNumbers).toEqual([1, 2]);
    expect((await read(id).expect(200)).body).toEqual(third); expect(context.llm.select).toHaveBeenCalledTimes(3);
    await remove(id).expect(204); await read(id).expect(404); expect(await database.client.aiAnalysis.count()).toBe(0); expect(await database.client.studyRecord.count()).toBe(1);
  });
  it('requires real authentication and keeps foreign ownership indistinguishable from absence', async () => {
    const context = await seed(); const id = context.conversation.id;
    await request(app.getHttpServer()).post(`/studies/${context.study.id}/conversations`).send({ studyVersion: 1 }).expect(401);
    for (const verb of ['get', 'delete'] as const) await request(app.getHttpServer())[verb](`/conversations/${id}`).auth(other, { type: 'bearer' }).expect(404);
    await request(app.getHttpServer()).post(`/conversations/${id}/turns`).auth(other, { type: 'bearer' }).send({ expectedRevision: 0, question }).expect(404);
    await request(app.getHttpServer()).post(`/studies/${context.study.id}/conversations`).auth(other, { type: 'bearer' }).send({ studyVersion: 1 }).expect(404);
    await read('99999999-9999-4999-8999-999999999999').expect(404); expect(context.llm.select).not.toHaveBeenCalled();
  });
  it.each([
    {}, { question }, { expectedRevision: 0, question: '' }, { expectedRevision: 0, question: '\0' }, { expectedRevision: 0, question: 'x'.repeat(501) },
    { expectedRevision: -1, question }, { expectedRevision: 21, question }, { expectedRevision: 0.5, question },
    { expectedRevision: 0, question, ownerId: 'other-owner' }, { expectedRevision: 0, question, revisesTurn: 0 },
  ])('rejects strict malformed turn input %p before inference', async input => {
    const context = await seed(); const response = await post(context.conversation.id).send(input).expect(400); expect(response.body.error.code).toBe('VALIDATION_ERROR'); expect(context.llm.select).not.toHaveBeenCalled();
  });
  it('rejects invalid parameters, strict queries, unexpected bodies and unknown creation fields', async () => {
    const context = await seed(); const id = context.conversation.id;
    await post('bad-id').send({ expectedRevision: 0, question }).expect(400);
    await create(context.study.id).send({ studyVersion: 1, ownerId: 'other' }).expect(400);
    await create(context.study.id).send({ studyVersion: 0 }).expect(400);
    await create(context.study.id).send({ studyVersion: 2 }).expect(404);
    await read(id).query({ ownerId: owner }).expect(400); await remove(id).query({ unsafe: 'true' }).expect(400);
    await read(id).send({ extra: 'invalid' }).expect(400); await remove(id).send({ ownerId: owner }).expect(400);
    expect(context.llm.select).not.toHaveBeenCalled();
  });
  it('returns the declared conflict envelope for stale requests without a second inference', async () => {
    const context = await seed(); const id = context.conversation.id; await post(id).send({ expectedRevision: 0, question }).expect(201);
    const response = await post(id).send({ expectedRevision: 0, question }).expect(409);
    expect(response.body).toEqual({ error: { code: 'CONVERSATION_CONFLICT', message: 'A conversa foi alterada ou atingiu o limite de turnos.' } }); expect(context.llm.select).toHaveBeenCalledTimes(1);
  });
  it('delivers an actual twenty-turn technical capacity fixture with missing analyses and refuses turn twenty-one', async () => {
    const context = await seed(); const row = await database.client.aiConversation.findUniqueOrThrow({ where: { id: context.conversation.id } });
    const full = new ConversationDocument({ schemaVersion: 1, id: row.id, ownerId: owner, studyId: row.studyId, studyVersion: 1, createdAt: row.createdAt.toISOString(), turns: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, question: 'Technical capacity fixture, no inference', analysisId: `11111111-1111-4111-8111-${String(i + 1).padStart(12, '0')}`, createdAt: row.createdAt.toISOString(), contextTurnNumbers: [], omittedTurns: i, revisesTurn: null })) });
    await database.client.aiConversation.update({ where: { id: row.id }, data: { revision: 20, document: JSON.parse(JSON.stringify(full)) } });
    const view = (await read(row.id).expect(200)).body; expect(view.turns).toHaveLength(20); expect(view.turns.every((turn: { responseStatus: string }) => turn.responseStatus === 'unavailable')).toBe(true);
    await post(row.id).send({ expectedRevision: 20, question }).expect(409); expect(context.llm.select).not.toHaveBeenCalled();
  });
  it.each([[new AiTimeoutError(), 504, 'AI_TIMEOUT'], [new AiUnavailableError(), 503, 'AI_UNAVAILABLE'], [new AiResultRejectedError(), 422, 'AI_RESULT_REJECTED']] as const)('maps controlled protocol failure to the contract %p', async (failure, status, code) => {
    const context = await seed(); context.llm.select.mockRejectedValueOnce(failure); const response = await post(context.conversation.id).send({ expectedRevision: 0, question }).expect(status);
    expect(response.body.error.code).toBe(code); expect(await database.client.aiAnalysis.count()).toBe(0); expect((await read(context.conversation.id).expect(200)).body.revision).toBe(0);
  });
  it('redacts real revoked source rights on GET and preserves deterministic no-source responses', async () => {
    const context = await seed(); const id = context.conversation.id; await post(id).send({ expectedRevision: 0, question }).expect(201);
    await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, quote: 'denied' } } });
    expect((await read(id).expect(200)).body.turns[0].analysis).toMatchObject({ status: 'restricted', evidence: [] });
    const next = (await post(id).send({ expectedRevision: 1, question }).expect(201)).body;
    expect(next.turns[1].analysis).toMatchObject({ status: 'insufficient-evidence', evidence: [], provenance: { modelId: null } }); expect(context.llm.select).toHaveBeenCalledTimes(1);
  });
  it('publishes the four strict authenticated OpenAPI operations and conflict response', async () => {
    const document = (await request(app.getHttpServer()).get('/openapi.json').expect(200)).body;
    expect(document.paths['/studies/{studyId}/conversations'].post.security).toEqual([{ bearer: [] }]);
    expect(document.paths['/conversations/{conversationId}']).toHaveProperty('get'); expect(document.paths['/conversations/{conversationId}']).toHaveProperty('delete');
    expect(document.paths['/conversations/{conversationId}/turns'].post.responses).toHaveProperty('409');
  });
  it('propagates an actual HTTP client disconnect to the controlled provider and confirms no turn', async () => {
    const context = await seed(); let enter!: () => void; const entered = new Promise<void>(r => { enter = r; }); let aborted = false;
    context.llm.select.mockImplementationOnce(async (_question, _sentences, signal) => { enter(); await new Promise<never>((_resolve, reject) => { signal!.addEventListener('abort', () => { aborted = true; reject(new AiUnavailableError()); }, { once: true }); }); throw new Error('Unreachable controlled abort'); });
    const address = app.getHttpServer().address() as AddressInfo;
    const client = httpRequest({ hostname: '127.0.0.1', port: address.port, path: `/conversations/${context.conversation.id}/turns`, method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' } }); client.on('error', () => undefined); client.end(JSON.stringify({ expectedRevision: 0, question }));
    let timeout: NodeJS.Timeout | undefined;
    try { await Promise.race([entered, new Promise<never>((_resolve, reject) => { timeout = setTimeout(() => reject(new Error('Provider not entered')), 2000); })]); }
    finally { if (timeout) clearTimeout(timeout); client.destroy(); }
    let closed = false;
    for (let attempt = 0; attempt < 100; attempt++) { try { await access(join(home, '.biblia-ai-operation.lock')); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') { closed = true; break; } throw error; } await new Promise(r => setTimeout(r, 10)); }
    expect(aborted).toBe(true); expect(closed).toBe(true); expect(await database.client.aiAnalysis.count()).toBe(0); expect((await read(context.conversation.id).expect(200)).body.revision).toBe(0);
  });
});
