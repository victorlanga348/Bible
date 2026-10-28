import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mkdtemp, rm } from 'node:fs/promises';
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
import { AiResultRejectedError, AiTimeoutError, AiUnavailableError } from '../../src/modules/ai-assistant/application/errors';
import { AiModelInputError } from '../../src/modules/ai-assistant/domain/model-input';
import { AiAnalysisLibrary } from '../../src/modules/ai-assistant/application/ai-analysis-library';
import { cleanCanon, seedCanon } from '../helpers/canon';
import { cleanStudyTestData } from '../helpers/study-database';
import { cleanSourceTestData, openSourceTestDatabase } from '../helpers/source-library';
import { aiCurations, aiSourceFixture, seedAiSource } from '../helpers/ai-source-data';
import { createAiTestRuntime } from '../helpers/ai-runtime';

describe('AI HTTP with real Nest/JWT/libraries/SQL/vector/lease; explicit provider doubles, NOT inference', () => {
  const secret = 'ai-http-test-only-signing-material-2026'; const question = 'Which day does this source call Sabbath?';
  const absent = '00000000-0000-4000-8000-000000000000'; const input = { studyVersion: 1, question };
  let app: INestApplication; let database: Database; let vector: AiIndexDatabase; let home: string; let token: string; let other: string;
  let contexts: Awaited<ReturnType<typeof createAiTestRuntime>>[] = []; let vectorReady = false;
  beforeAll(async () => {
    database = await openSourceTestDatabase(); vector = new AiIndexDatabase(assertAiTestTarget(process.env));
    expect(await vector.client.$queryRaw`SELECT current_database() AS db,current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
    vectorReady = true;
    home = await mkdtemp(join(resolve('reports'), 'ai-http-'));
    app = await createApplication({ ...parseRuntimeConfig(process.env), jwtSecret: secret, aiHome: home, aiDatabaseUrl: assertAiTestTarget(process.env) }); await app.init();
    token = await new LocalAccessTokens(secret).issue('technical-ai-owner'); other = await new LocalAccessTokens(secret).issue('another-ai-owner');
  });
  beforeEach(async () => { contexts = []; await database.client.aiAnalysis.deleteMany(); await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); await seedCanon(database); await seedAiSource(database); await vector.client.embeddingProfile.deleteMany(); });
  afterEach(async () => { jest.restoreAllMocks(); for (const context of contexts) await context.operation.onModuleDestroy(); });
  afterAll(async () => {
    try { if (database) { await database.client.aiAnalysis.deleteMany(); await cleanStudyTestData(database); await cleanSourceTestData(database); await cleanCanon(database); } if (vectorReady) await vector.client.embeddingProfile.deleteMany(); }
    finally { try { await app?.close(); } finally { await database?.onModuleDestroy(); await vector?.onModuleDestroy(); await cleanHome(); } }
  });
  const cleanHome = async () => { if (home) { if (!home.startsWith(resolve('reports') + sep + 'ai-http-')) throw new Error('Unsafe technical cleanup'); await rm(home, { recursive: true, force: true }); } };
  const setup = async (indexed = true, associated = true) => {
    const context = await createAiTestRuntime(database, vector, home); contexts.push(context);
    if (associated) await context.links.curate(aiCurations[0]!);
    const study = await context.studyLibrary.create('technical-ai-owner', 'porbr2018', 'GEN 1:1');
    if (indexed) await new SourceIndexingLibrary(context.settings, context.sources, context.embeddings, context.index, context.operation, context.identity, context.hash).rebuild();
    context.embeddings.embed.mockClear();
    jest.spyOn(LocalModelProvider.prototype, 'embed').mockImplementation(context.embeddings.embed);
    jest.spyOn(LocalModelProvider.prototype, 'select').mockImplementation(context.llm.select);
    return { ...context, study };
  };
  const post = (id: string) => request(app.getHttpServer()).post(`/studies/${id}/ai-analyses`).auth(token, { type: 'bearer' });
  const read = (id: string) => request(app.getHttpServer()).get(`/ai-analyses/${id}`).auth(token, { type: 'bearer' });
  const remove = (id: string) => request(app.getHttpServer()).delete(`/ai-analyses/${id}`).auth(token, { type: 'bearer' });
  const error = (code: string, message: string) => ({ error: { code, message } });
  it('creates an attributed analysis, reads its exact snapshot and deletes only the owned analysis', async () => {
    const context = await setup(); const view = (await post(context.study.id).send(input).expect(201)).body;
    expect(view).toMatchObject({ studyId: context.study.id, studyVersion: 1, status: 'supported', question, reference: context.study.reference, evidence: [{ excerptId: aiCurations[0]!.excerptId, attribution: aiSourceFixture.attribution }] });
    expect(view).not.toHaveProperty('ownerId'); expect(view).not.toHaveProperty('evidenceRefs'); expect(view.provenance.runtimeVersion).toBe('controlled-technical-runtime');
    expect((await read(view.id).expect(200)).body).toEqual(view); expect((await remove(view.id).expect(204)).text).toBe(''); await read(view.id).expect(404); await remove(view.id).expect(404);
    expect(await database.client.aiAnalysis.count()).toBe(0); expect(await database.client.studyRecord.count()).toBe(1); expect(await database.client.sourceLibraryExcerpt.count()).toBe(4); expect(await vector.client.sourceChunk.count()).toBe(11);
    expect(context.embeddings.embed).toHaveBeenCalledTimes(1); expect(context.llm.select).toHaveBeenCalledTimes(1);
  });
  it.each(['create', 'read', 'delete'])('requires real Bearer authentication for %s', async operation => {
    const server = app.getHttpServer(); const call = operation === 'create' ? request(server).post(`/studies/${absent}/ai-analyses`).send(input) : operation === 'read' ? request(server).get(`/ai-analyses/${absent}`) : request(server).delete(`/ai-analyses/${absent}`);
    expect((await call.expect(401)).body).toEqual(error('UNAUTHORIZED', 'Autenticação necessária.'));
  });
  it.each([{}, { ...input, ownerId: 'another-ai-owner' }, { ...input, model: 'other' }, { ...input, studyVersion: '1' }, { ...input, studyVersion: 0 }, { ...input, studyVersion: 1.5 }, { ...input, studyVersion: Number.MAX_SAFE_INTEGER + 1 }, { ...input, question: '' }, { ...input, question: 'é'.repeat(501) }, { ...input, question: '\ud800' }, { ...input, question: '\u0000' }])('rejects strict body %j before models or persistence', async body => {
    expect((await post(absent).send(body).expect(400)).body).toEqual(error('VALIDATION_ERROR', 'Entrada inválida.')); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it.each(['create', 'read', 'delete'])('validates UUID and rejects extra query for %s', async operation => {
    for (const [id, query] of [['invalid', ''], [absent, '?unexpected=x']]) {
      const server = app.getHttpServer();
      const call = operation === 'create' ? request(server).post(`/studies/${id}/ai-analyses${query}`).send(input) : operation === 'read' ? request(server).get(`/ai-analyses/${id}${query}`) : request(server).delete(`/ai-analyses/${id}${query}`);
      await call.auth(token, { type: 'bearer' }).expect(400);
    }
  });
  it.each(['neither', 'home-only', 'index-only'] as const)('keeps owned GET/DELETE available and closes creation when runtime configuration is %s', async mode => {
    const context = await setup(); const view = (await post(context.study.id).send(input).expect(201)).body;
    const { aiHome: ignoredHome, aiDatabaseUrl: ignoredUrl, ...base } = parseRuntimeConfig(process.env); void ignoredHome; void ignoredUrl;
    const disabled = await createApplication({ ...base, jwtSecret: secret, ...(mode === 'home-only' ? { aiHome: home } : {}), ...(mode === 'index-only' ? { aiDatabaseUrl: assertAiTestTarget(process.env) } : {}) });
    try {
      await disabled.init(); const server = disabled.getHttpServer();
      await request(server).post(`/studies/${context.study.id}/ai-analyses`).auth(other, { type: 'bearer' }).send(input).expect(404);
      expect((await request(server).post(`/studies/${context.study.id}/ai-analyses`).auth(token, { type: 'bearer' }).send(input).expect(503)).body).toEqual(error('AI_UNAVAILABLE', 'Assistente temporariamente indisponível.'));
      expect((await request(server).get(`/ai-analyses/${view.id}`).auth(token, { type: 'bearer' }).expect(200)).body).toEqual(view);
      await request(server).delete(`/ai-analyses/${view.id}`).auth(token, { type: 'bearer' }).expect(204);
    } finally { await disabled.close(); }
  });
  it('keeps missing study/version and foreign owner indistinguishable before inference', async () => {
    const context = await setup(false);
    await request(app.getHttpServer()).post(`/studies/${context.study.id}/ai-analyses`).auth(other, { type: 'bearer' }).send(input).expect(404);
    for (const [id, body] of [[absent, input], [context.study.id, { ...input, studyVersion: 2 }]] as const) expect((await post(id).send(body).expect(404)).body).toEqual(error('NOT_FOUND', 'Recurso não encontrado.'));
    expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(context.llm.select).not.toHaveBeenCalled();
  });
  it('isolates existing analysis GET/DELETE by JWT subject', async () => {
    const context = await setup(); const view = (await post(context.study.id).send(input).expect(201)).body;
    for (const method of ['get', 'delete'] as const) await request(app.getHttpServer())[method](`/ai-analyses/${view.id}`).auth(other, { type: 'bearer' }).expect(404);
    expect(await database.client.aiAnalysis.count()).toBe(1); await read(view.id).expect(200);
  });
  it('returns explicit no-inference insufficiency for an unassociated version', async () => {
    const context = await setup(false, false); const view = (await post(context.study.id).send(input).expect(201)).body;
    expect(view.status).toBe('insufficient-evidence'); expect(view.evidence).toEqual([]); expect(view.provenance.modelId).toBeNull(); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(context.llm.select).not.toHaveBeenCalled();
  });
  it('returns sanitized unavailability for a missing index before question inference', async () => {
    const context = await setup(false); expect((await post(context.study.id).send(input).expect(503)).body).toEqual(error('AI_UNAVAILABLE', 'Assistente temporariamente indisponível.')); expect(context.embeddings.embed).not.toHaveBeenCalled(); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it.each(['invalid-input', 'rejected', 'timeout', 'unexpected'] as const)('sanitizes %s provider errors without storing an analysis', async kind => {
    const context = await setup(); context.llm.select.mockRejectedValue(kind === 'invalid-input' ? new AiModelInputError('private-technical-marker') : kind === 'rejected' ? new AiResultRejectedError('private-technical-marker') : kind === 'timeout' ? new AiTimeoutError('private-technical-marker') : new Error('private-technical-marker'));
    const expected = kind === 'invalid-input' ? [400, 'VALIDATION_ERROR', 'Entrada inválida.'] : kind === 'rejected' ? [422, 'AI_RESULT_REJECTED', 'Não foi possível fundamentar esta análise.'] : kind === 'timeout' ? [504, 'AI_TIMEOUT', 'O assistente excedeu o tempo de execução.'] : [500, 'INTERNAL_ERROR', 'Erro interno.'];
    expect((await post(context.study.id).send(input).expect(expected[0] as number)).body).toEqual(error(expected[1] as string, expected[2] as string)); expect(await database.client.aiAnalysis.count()).toBe(0);
  });
  it('redacts current rights at GET without rewriting the committed decision', async () => {
    const context = await setup(); const view = (await post(context.study.id).send(input).expect(201)).body; const before = await database.client.aiAnalysis.findUniqueOrThrow({ where: { id: view.id } });
    await database.client.sourceLibrarySource.update({ where: { id: aiSourceFixture.id }, data: { permissions: { ...aiSourceFixture.permissions, sendToAi: 'denied' } } });
    const restricted = (await read(view.id).expect(200)).body; expect(restricted.status).toBe('restricted'); expect(restricted.evidence).toEqual([]); expect(restricted.provenance.consultedSegments).toEqual([]); expect(await database.client.aiAnalysis.findUniqueOrThrow({ where: { id: view.id } })).toEqual(before);
  });
  it('publishes strict response/body, Bearer and all specified error contracts in OpenAPI', async () => {
    const doc = (await request(app.getHttpServer()).get('/openapi.json').expect(200)).body;
    for (const [path, method, status] of [['/studies/{studyId}/ai-analyses', 'post', '201'], ['/ai-analyses/{analysisId}', 'get', '200'], ['/ai-analyses/{analysisId}', 'delete', '204']]) {
      const operation = doc.paths[path!]?.[method!]; expect(operation).toBeDefined(); expect(operation.security).toEqual([{ bearer: [] }]);
      for (const code of ['400', '401', '404', '500', ...(method === 'post' ? ['422', '503', '504'] : [])]) expect(operation.responses[code].content['application/json'].schema).toBeDefined();
      if (status !== '204') expect(operation.responses[status!].content['application/json'].schema.additionalProperties).toBe(false); else expect(operation.responses['204'].content).toBeUndefined();
      if (method === 'post') expect(operation.requestBody.content['application/json'].schema.additionalProperties).toBe(false);
    }
  });
  it('refuses a second HTTP operation immediately while the first owns the actual filesystem lease', async () => {
    const context = await setup(); let entered!: () => void; let release!: () => void;
    const started = new Promise<void>(resolve => { entered = resolve; }); const gate = new Promise<void>(resolve => { release = resolve; }); const normal = context.llm.select.getMockImplementation()!;
    context.llm.select.mockImplementation(async (...args) => { entered(); await gate; return normal(...args); });
    const first = post(context.study.id).send(input).then(response => response); await started;
    try { expect((await post(context.study.id).send(input).expect(503)).body).toEqual(error('AI_UNAVAILABLE', 'Assistente temporariamente indisponível.')); }
    finally { release(); }
    expect((await first).status).toBe(201); expect(context.llm.select).toHaveBeenCalledTimes(1); expect(await database.client.aiAnalysis.count()).toBe(1);
  });
  it('propagates actual client disconnect into the provider signal and leaves no analysis or occupied slot', async () => {
    const context = await setup(); let entered!: (signal: AbortSignal | undefined) => void; let release!: () => void;
    const started = new Promise<AbortSignal | undefined>(resolve => { entered = resolve; }); const gate = new Promise<void>(resolve => { release = resolve; }); const normal = context.llm.select.getMockImplementation()!;
    context.llm.select.mockImplementation(async (...args) => { entered(args[2]); await gate; return normal(...args); });
    const calls = jest.spyOn(AiAnalysisLibrary.prototype, 'create');
    await app.listen(0, '127.0.0.1'); const address = app.getHttpServer().address() as AddressInfo;
    const client = httpRequest({ hostname: '127.0.0.1', port: address.port, method: 'POST', path: `/studies/${context.study.id}/ai-analyses`, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' } }, response => response.resume());
    client.on('error', () => undefined); client.end(JSON.stringify(input));
    const signal = await started; const finished = (calls.mock.results[0]!.value as ReturnType<AiAnalysisLibrary['create']>).then(() => null, (error: unknown) => error);
    client.destroy();
    let timer: NodeJS.Timeout | undefined; let listener!: () => void;
    const cancelled = await new Promise<boolean>(resolve => { listener = () => resolve(true); signal!.addEventListener('abort', listener, { once: true }); timer = setTimeout(() => resolve(false), 1000); });
    clearTimeout(timer); signal!.removeEventListener('abort', listener); release(); const failure = await finished;
    expect(cancelled).toBe(true); expect(failure).toBeInstanceOf(AiUnavailableError); expect(await database.client.aiAnalysis.count()).toBe(0);
    context.llm.select.mockImplementation(normal); await post(context.study.id).send(input).expect(201);
  });
});
