import type { AiIndexProfile, EligibleAiSourceRef, IndexedAiChunk, RetrievedAiChunk, VectorIndexPort } from '../application/analysis-ports';
import type { AiIndexDatabase } from './index-database';
import { Prisma } from '../../../generated/prisma-ai/client';
import { isDeepStrictEqual } from 'node:util';
import { ConsultedSegment, requireAnalysisDigest, requireAnalysisIdentity, type ConsultedSegmentProps } from '../domain/analysis-values';
import { AiResultRejectedError, AiUnavailableError } from '../application/errors';

const key = (row: ConsultedSegmentProps): string => `${row.excerptId}/${row.id}`;
const canonical = (rows: readonly ConsultedSegmentProps[]): ConsultedSegmentProps[] => rows.map(row => ({ ...new ConsultedSegment(row) })).sort((left, right) => key(left).localeCompare(key(right)));

function indexFailure(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const metadata = error.meta as { driverAdapterError?: { cause?: { kind?: string } } } | undefined;
    if (error.code === 'P1001' || error.code === 'P2010' && metadata?.driverAdapterError?.cause?.kind === 'DatabaseNotReachable') throw new AiUnavailableError();
  }
  throw error;
}

function ownedProfile(input: AiIndexProfile): AiIndexProfile {
  requireAnalysisIdentity(input.id);
  const config = input.configuration;
  if (config.schemaVersion !== 1 || config.dimensions !== 1024 || config.segmentCodepoints !== 1000 || config.overlapCodepoints !== 100 || !Array.isArray(input.expectedSegments) || input.expectedSegments.length === 0) throw new AiResultRejectedError();
  [config.runtimeProfileSha256, config.sourceManifestSha256, config.sourceSnapshotSha256, config.sourceExcerptsSha256, config.embeddingModelSha256].forEach(requireAnalysisDigest);
  const expectedSegments = canonical(input.expectedSegments);
  if (new Set(expectedSegments.map(key)).size !== expectedSegments.length) throw new AiResultRejectedError();
  return { id: input.id, configuration: { schemaVersion: 1, runtimeProfileSha256: config.runtimeProfileSha256, sourceManifestSha256: config.sourceManifestSha256, sourceSnapshotSha256: config.sourceSnapshotSha256, sourceExcerptsSha256: config.sourceExcerptsSha256, embeddingModelSha256: config.embeddingModelSha256, dimensions: 1024, segmentCodepoints: 1000, overlapCodepoints: 100 }, expectedSegments };
}

function vectorLiteral(vector: readonly number[]): string {
  if (!Array.isArray(vector) || vector.length !== 1024) throw new AiResultRejectedError();
  const points = Array.from(vector);
  if (!points.every(Number.isFinite)) throw new AiResultRejectedError();
  for (const values of [points, points.map(Math.fround)]) {
    if (Math.abs(Math.sqrt(values.reduce((sum, value) => sum + value * value, 0)) - 1) > 0.0001) throw new AiResultRejectedError();
  }
  return JSON.stringify(points);
}

async function ready(client: Prisma.TransactionClient, profile: AiIndexProfile): Promise<boolean> {
  const [row] = await client.$queryRaw<{ configuration: unknown; segments: ConsultedSegmentProps[] }[]>`
    SELECT p.configuration,COALESCE(jsonb_agg(jsonb_build_object(
      'id',c.id,'sourceId',c.source_id,'excerptId',c.excerpt_id,'sourceDigest',c.source_digest,'textDigest',c.text_digest,'startOffset',c.start_offset,'endOffset',c.end_offset
    )) FILTER (WHERE c.id IS NOT NULL),'[]'::jsonb) AS segments
    FROM ai.embedding_profile p LEFT JOIN ai.source_chunk c ON c.profile_id=p.id WHERE p.id=${profile.id} GROUP BY p.id`;
  return !!row && isDeepStrictEqual(row.configuration, profile.configuration) && isDeepStrictEqual(canonical(row.segments), profile.expectedSegments);
}

export class PrismaVectorIndex implements VectorIndexPort {
  constructor(private readonly database: AiIndexDatabase) {}
  async replace(input: AiIndexProfile, chunks: readonly IndexedAiChunk[], completedAt: string): Promise<'indexed' | 'unchanged'> {
    const profile = ownedProfile(input);
    if (!Array.isArray(chunks) || !isDeepStrictEqual(canonical(chunks.map(chunk => chunk.metadata)), profile.expectedSegments) || typeof completedAt !== 'string' || !Number.isFinite(Date.parse(completedAt)) || new Date(completedAt).toISOString() !== completedAt) throw new AiResultRejectedError();
    const snapshot = chunks.map(chunk => ({ metadata: new ConsultedSegment(chunk.metadata), vector: vectorLiteral(chunk.embedding) }));
    return this.database.client.$transaction(async transaction => {
      if (await ready(transaction, profile)) return 'unchanged';
      await transaction.embeddingProfile.deleteMany({ where: { id: profile.id } });
      await transaction.embeddingProfile.create({ data: { id: profile.id, configuration: { ...profile.configuration }, completedAt: new Date(completedAt) } });
      for (const { metadata: row, vector } of snapshot) await transaction.$executeRaw`
        INSERT INTO ai.source_chunk(profile_id,id,source_id,excerpt_id,source_digest,text_digest,start_offset,end_offset,embedding)
        VALUES(${profile.id},${row.id},${row.sourceId},${row.excerptId},${row.sourceDigest},${row.textDigest},${BigInt(row.startOffset)},${BigInt(row.endOffset)},${vector}::public.vector)`;
      return 'indexed';
    }, { isolationLevel: 'Serializable', timeout: 10000 }).catch(indexFailure);
  }
  async readiness(profile: AiIndexProfile): Promise<boolean> { return ready(this.database.client, ownedProfile(profile)).catch(indexFailure); }
  async search(input: AiIndexProfile, vector: readonly number[], eligible: readonly EligibleAiSourceRef[]): Promise<readonly RetrievedAiChunk[]> {
    const literal = vectorLiteral(vector); const profile = ownedProfile(input);
    if (eligible.length === 0) return Object.freeze([]);
    const filter = Prisma.join(eligible.map(row => Prisma.sql`(c.source_id=${row.sourceId} AND c.excerpt_id=${row.excerptId} AND c.source_digest=${row.textSha256})`), ' OR ');
    return this.database.client.$transaction(async transaction => {
      if (!await ready(transaction, profile)) throw new AiUnavailableError();
      const rows = await transaction.$queryRaw<(ConsultedSegmentProps & { distance: number })[]>`
        SELECT c.id,c.source_id AS "sourceId",c.excerpt_id AS "excerptId",c.source_digest AS "sourceDigest",c.text_digest AS "textDigest",c.start_offset::double precision AS "startOffset",c.end_offset::double precision AS "endOffset",c.embedding OPERATOR(public.<=>) ${literal}::public.vector AS distance
        FROM ai.source_chunk c WHERE c.profile_id=${profile.id} AND (${filter})
        ORDER BY distance,c.excerpt_id COLLATE "C",c.start_offset,c.id COLLATE "C" LIMIT 3`;
      return Object.freeze(rows.map(row => {
        if (!Number.isFinite(row.distance)) throw new AiUnavailableError();
        return Object.freeze({ ...new ConsultedSegment(row), distance: row.distance });
      }));
    }, { isolationLevel: 'RepeatableRead', timeout: 10000 }).catch(indexFailure);
  }
}
