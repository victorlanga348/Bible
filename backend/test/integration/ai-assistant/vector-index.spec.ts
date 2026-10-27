import { assertAiTestTarget } from '../../../src/config/ai-target';
import { AiIndexDatabase } from '../../../src/modules/ai-assistant/infrastructure/index-database';
import { PrismaVectorIndex } from '../../../src/modules/ai-assistant/infrastructure/prisma-vector-index';
import { AiResultRejectedError, AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import type { AiIndexProfile, IndexedAiChunk } from '../../../src/modules/ai-assistant/application/analysis-ports';
import { technicalAiIndex, technicalVector } from '../../helpers/ai-index';
import { createServer } from 'node:net';

const at = '2026-10-27T00:00:00.000Z';
describe('actual Prisma/pgvector index, technical vectors only; no inference', () => {
  let database: AiIndexDatabase;
  beforeAll(async () => {
    database = new AiIndexDatabase(assertAiTestTarget(process.env));
    expect(await database.client.$queryRaw`SELECT current_database() AS db,current_user AS role`).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
  });
  beforeEach(async () => { await database.client.embeddingProfile.deleteMany(); });
  afterAll(async () => { if (database?.client) { try { await database.client.embeddingProfile.deleteMany(); } finally { await database.client.$disconnect(); } } });
  it.each(['readiness', 'search', 'replace'] as const)('maps actual index connection refusal to unavailability for %s without stopping any service', async operation => {
    const socket = createServer(); await new Promise<void>(resolve => socket.listen(0, '127.0.0.1', resolve)); const address = socket.address(); if (!address || typeof address === 'string') throw new Error('Missing controlled port'); await new Promise<void>((resolve, reject) => socket.close(error => error ? reject(error) : resolve()));
    const target = new URL(assertAiTestTarget(process.env)); target.hostname = '127.0.0.1'; target.port = String(address.port); const offline = new AiIndexDatabase(target.href); const index = new PrismaVectorIndex(offline); const { profile, chunks, eligible } = technicalAiIndex();
    try { const call = operation === 'readiness' ? index.readiness(profile) : operation === 'search' ? index.search(profile, technicalVector(), eligible) : index.replace(profile, chunks, at); await expect(call).rejects.toThrow(AiUnavailableError); }
    finally { await offline.onModuleDestroy(); }
  });
  it('atomically builds the full expected metadata set and persists only profile/chunks/vectors', async () => {
    const { profile, chunks } = technicalAiIndex(); const index = new PrismaVectorIndex(database);
    expect(await index.readiness(profile)).toBe(false);
    expect(await index.replace(profile, chunks, at)).toBe('indexed'); expect(await index.readiness(profile)).toBe(true);
    expect(await database.client.sourceChunk.count()).toBe(4);
    const saved = await database.client.embeddingProfile.findUniqueOrThrow({ where: { id: profile.id } });
    expect(saved.configuration).toEqual(profile.configuration); expect(saved.completedAt.toISOString()).toBe(at);
  });
  it('keeps compatible reimport idempotent with original timestamp/vectors and ignores JSON key order/metadata array order', async () => {
    const { profile, chunks, eligible } = technicalAiIndex(); const index = new PrismaVectorIndex(database);
    expect(await index.replace(profile, chunks, at)).toBe('indexed');
    const reordered: AiIndexProfile = { ...profile, configuration: Object.fromEntries(Object.entries(profile.configuration).reverse()) as unknown as AiIndexProfile['configuration'], expectedSegments: [...profile.expectedSegments].reverse() };
    expect(await index.replace(reordered, chunks.map(chunk => ({ ...chunk, embedding: technicalVector(3) })), '2026-10-27T00:00:01.000Z')).toBe('unchanged');
    expect((await database.client.embeddingProfile.findUniqueOrThrow({ where: { id: profile.id } })).completedAt.toISOString()).toBe(at);
    expect((await index.search(profile, technicalVector(), eligible))[0]).toMatchObject({ id: 'p1-c1', distance: 0 });
  });
  it('retrieves exactly top3 with exact cosine and deterministic excerpt/offset/id tie order, returning no text/vector', async () => {
    const { profile, chunks, eligible } = technicalAiIndex(); const index = new PrismaVectorIndex(database); await index.replace(profile, chunks, at);
    const result = await index.search(profile, technicalVector(), eligible);
    expect(result).toEqual(chunks.slice(0, 3).map((chunk, ordinal) => ({ ...chunk.metadata, distance: ordinal === 2 ? 1 : 0 })));
    expect(Object.isFrozen(result)).toBe(true); result.forEach(row => { expect(Object.isFrozen(row)).toBe(true); expect(row).not.toHaveProperty('embedding'); expect(row).not.toHaveProperty('text'); });
    expect(Reflect.set(result[0]!, 'distance', 1)).toBe(false);
    expect((await index.search(profile, technicalVector(1), eligible)).map(row => row.id)).toEqual(['p1-c3', 'p1-c1', 'p1-c2']);
  });
  it('filters on current source/excerpt/digest together, never persisting a private query vector', async () => {
    const { profile, chunks, eligible } = technicalAiIndex(); const index = new PrismaVectorIndex(database); await index.replace(profile, chunks, at);
    expect(await index.search(profile, technicalVector(), [eligible[1]!])).toEqual([{ ...chunks[3]!.metadata, distance: 1 }]);
    for (const patch of [{ sourceId: 'unrelated' }, { excerptId: 'unrelated' }, { textSha256: 'c'.repeat(64) }]) expect(await index.search(profile, technicalVector(), [{ ...eligible[0]!, ...patch }])).toEqual([]);
    const empty = await index.search(profile, technicalVector(), []); expect(empty).toEqual([]); expect(Object.isFrozen(empty)).toBe(true);
    expect(await database.client.sourceChunk.count()).toBe(4);
  });
  it('marks missing or changed configuration, incomplete and extra metadata as stale and refuses to search', async () => {
    const { profile, chunks, eligible } = technicalAiIndex(); const index = new PrismaVectorIndex(database);
    await expect(index.search(profile, technicalVector(), eligible)).rejects.toThrow(AiUnavailableError);
    await index.replace(profile, chunks, at);
    const changed = { ...profile, configuration: { ...profile.configuration, embeddingModelSha256: 'c'.repeat(64) } };
    expect(await index.readiness(changed)).toBe(false); await expect(index.search(changed, technicalVector(), eligible)).rejects.toThrow(AiUnavailableError);
    await database.client.sourceChunk.deleteMany({ where: { profileId: profile.id, id: 'p1-c2' } });
    expect(await index.readiness(profile)).toBe(false); await expect(index.search(profile, technicalVector(), eligible)).rejects.toThrow(AiUnavailableError);
    expect(await index.replace(profile, chunks, at)).toBe('indexed');
    const row = chunks[0]!.metadata;
    await database.client.$executeRaw`INSERT INTO ai.source_chunk(profile_id,id,source_id,excerpt_id,source_digest,text_digest,start_offset,end_offset,embedding) VALUES(${profile.id},'p1-c9',${row.sourceId},${row.excerptId},${row.sourceDigest},${row.textDigest},0,1000,${JSON.stringify(technicalVector())}::public.vector)`;
    expect(await index.readiness(profile)).toBe(false); await expect(index.search(profile, technicalVector(), eligible)).rejects.toThrow(AiUnavailableError);
  });
  it('compares every expected metadata field, not merely count and profile digest', async () => {
    const { profile, chunks } = technicalAiIndex(); const index = new PrismaVectorIndex(database); await index.replace(profile, chunks, at);
    for (const patch of [{ id: 'p1-c9' }, { sourceId: 'changed' }, { excerptId: 'changed' }, { sourceDigest: 'c'.repeat(64) }, { textDigest: 'c'.repeat(64) }, { startOffset: 1 }, { endOffset: 999 }]) {
      const expectedSegments = profile.expectedSegments.map((row, ordinal) => ordinal === 0 ? { ...row, ...patch } : row);
      expect(await index.readiness({ ...profile, expectedSegments })).toBe(false);
    }
  });
  it('replaces only the requested incompatible profile and preserves another profile', async () => {
    const { profile, chunks } = technicalAiIndex(); const index = new PrismaVectorIndex(database);
    await index.replace(profile, chunks, at); const other = { ...profile, id: 'another-technical-profile' }; await index.replace(other, chunks, at);
    const changed = { ...profile, configuration: { ...profile.configuration, embeddingModelSha256: 'c'.repeat(64) } };
    expect(await index.replace(changed, chunks, '2026-10-27T00:00:01.000Z')).toBe('indexed'); expect(await index.readiness(changed)).toBe(true); expect(await index.readiness(profile)).toBe(false); expect(await index.readiness(other)).toBe(true);
    expect(await database.client.sourceChunk.count()).toBe(8);
  });
  it('rolls back a real failure after the first chunk write, retaining the previous complete index', async () => {
    const { profile, chunks, eligible } = technicalAiIndex(); const index = new PrismaVectorIndex(database); await index.replace(profile, chunks, at);
    await database.client.$executeRaw`CREATE FUNCTION ai.fail_chunk_insert_for_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.id = 'p1-c2' THEN RAISE EXCEPTION 'controlled test insertion failure'; END IF; RETURN NEW; END; $$`;
    try {
      await database.client.$executeRaw`CREATE TRIGGER reject_chunk_for_test BEFORE INSERT ON ai.source_chunk FOR EACH ROW EXECUTE FUNCTION ai.fail_chunk_insert_for_test()`;
      const changed = { ...profile, configuration: { ...profile.configuration, embeddingModelSha256: 'c'.repeat(64) } };
      await expect(index.replace(changed, chunks, at)).rejects.toThrow();
      expect(await index.readiness(profile)).toBe(true); expect(await index.readiness(changed)).toBe(false); expect(await database.client.sourceChunk.count()).toBe(4);
      expect((await index.search(profile, technicalVector(), eligible))[0]!.distance).toBe(0);
    } finally { await database.client.$executeRaw`DROP TRIGGER IF EXISTS reject_chunk_for_test ON ai.source_chunk`; await database.client.$executeRaw`DROP FUNCTION ai.fail_chunk_insert_for_test()`; }
  });
  it.each([[], [1], Array(1023).fill(0), [...technicalVector(), 0], Array(1024).fill(0), [NaN, ...technicalVector().slice(1)], [Infinity, ...technicalVector().slice(1)], [1.001, ...technicalVector().slice(1)], 'not a vector', null])('rejects invalid technical vector before search or replacement %p', async embedding => {
    const { profile, chunks, eligible } = technicalAiIndex(); const index = new PrismaVectorIndex(database);
    await expect(index.search(profile, embedding as readonly number[], eligible)).rejects.toThrow(AiResultRejectedError);
    await expect(index.replace(profile, chunks.map((row, ordinal) => ordinal === 0 ? { ...row, embedding: embedding as readonly number[] } : row), at)).rejects.toThrow(AiResultRejectedError);
    expect(await database.client.embeddingProfile.count()).toBe(0);
  });
  it('rejects missing/extra/duplicate chunk sets, duplicate expected metadata and invalid timestamps before storage', async () => {
    const { profile, chunks } = technicalAiIndex(); const index = new PrismaVectorIndex(database);
    for (const candidate of [[], chunks.slice(1), [...chunks, chunks[0]!], [...chunks.slice(1), chunks[1]!], chunks.map((row, ordinal) => ordinal === 0 ? { ...row, metadata: { ...row.metadata, textDigest: 'c'.repeat(64) } } : row)]) await expect(index.replace(profile, candidate, at)).rejects.toThrow(AiResultRejectedError);
    for (const expectedSegments of [[], [...profile.expectedSegments, profile.expectedSegments[0]!]]) await expect(index.replace({ ...profile, expectedSegments }, chunks, at)).rejects.toThrow(AiResultRejectedError);
    for (const date of ['invalid', '2026-02-30T00:00:00.000Z', '2026-10-27T00:00:00Z']) await expect(index.replace(profile, chunks, date)).rejects.toThrow(AiResultRejectedError);
    expect(await database.client.embeddingProfile.count()).toBe(0);
  });
  it('does not convert a real SQL infrastructure failure into missing/stale readiness', async () => {
    const { profile } = technicalAiIndex(); const index = new PrismaVectorIndex(database);
    await database.client.$executeRaw`ALTER TABLE ai.embedding_profile RENAME TO embedding_profile_offline_for_test`;
    try { await expect(index.readiness(profile)).rejects.toThrow(); }
    finally { await database.client.$executeRaw`ALTER TABLE ai.embedding_profile_offline_for_test RENAME TO embedding_profile`; }
  });
  it('rejects partial replacement even when the invalid set was supplied through an untyped boundary', async () => {
    const { profile } = technicalAiIndex(); const index = new PrismaVectorIndex(database);
    await expect(index.replace(profile, null as unknown as readonly IndexedAiChunk[], at)).rejects.toThrow(AiResultRejectedError);
  });
  it('validates declared profile parameters and drops extra configuration properties before persisting', async () => {
    const { profile, chunks } = technicalAiIndex(); const index = new PrismaVectorIndex(database);
    for (const patch of [{ schemaVersion: 2 }, { dimensions: 512 }, { segmentCodepoints: 999 }, { overlapCodepoints: 101 }, ...['runtimeProfileSha256', 'sourceManifestSha256', 'sourceSnapshotSha256', 'sourceExcerptsSha256', 'embeddingModelSha256'].map(key => ({ [key]: 'bad hash' }))]) await expect(index.replace({ ...profile, configuration: { ...profile.configuration, ...patch } } as AiIndexProfile, chunks, at)).rejects.toThrow();
    const extra = { ...profile, configuration: { ...profile.configuration, rawPrompt: 'technical forbidden retention' } };
    expect(await index.replace(extra, chunks, at)).toBe('indexed');
    expect((await database.client.embeddingProfile.findUniqueOrThrow({ where: { id: profile.id } })).configuration).toEqual(profile.configuration);
  });
  it.each(['sparse', 'upper-float32-boundary', 'lower-float32-boundary'])('rejects %s before SQL instead of a late vector parser/constraint error', async kind => {
    const { profile, chunks, eligible } = technicalAiIndex(); const index = new PrismaVectorIndex(database);
    const invalid: number[] = kind === 'sparse' ? Array(1024) as number[] : [...technicalVector()];
    invalid[0] = kind === 'upper-float32-boundary' ? 1.0001 : kind === 'lower-float32-boundary' ? 0.9999 : 1;
    await expect(index.replace(profile, chunks.map((row, ordinal) => ordinal === 0 ? { ...row, embedding: invalid } : row), at)).rejects.toThrow(AiResultRejectedError);
    await expect(index.search(profile, invalid, eligible)).rejects.toThrow(AiResultRejectedError);
    expect(await database.client.embeddingProfile.count()).toBe(0);
  });
  it('accepts raw and actual float32 norms inside the unchanged tolerance', async () => {
    const { profile, chunks, eligible } = technicalAiIndex(); const index = new PrismaVectorIndex(database);
    const nearUpper = [...technicalVector()]; nearUpper[0] = 1.00009;
    const nearLower = [...technicalVector()]; nearLower[0] = 0.99991;
    expect(await index.replace(profile, chunks.map((row, ordinal) => ordinal === 0 ? { ...row, embedding: nearUpper } : row), at)).toBe('indexed');
    expect((await index.search(profile, nearLower, eligible))[0]!.distance).toBe(0);
  });
});
