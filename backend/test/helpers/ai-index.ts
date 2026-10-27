import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { segmentSourceText } from '../../src/modules/ai-assistant/domain/source-segments';
import type { AiIndexProfile, EligibleAiSourceRef, IndexedAiChunk } from '../../src/modules/ai-assistant/application/analysis-ports';

// Technical unit vectors, NOT outputs of any model. A technical profile pins no real model.
// Genuine source metadata/text is read only to identify exact unchanged spans.
export const technicalVector = (index = 0): readonly number[] => Array.from({ length: 1024 }, (_, ordinal) => ordinal === index ? 1 : 0);
export function technicalAiIndex(): { profile: AiIndexProfile; chunks: readonly IndexedAiChunk[]; eligible: readonly EligibleAiSourceRef[] } {
  const excerpts = (JSON.parse(readFileSync('test/fixtures/ai-assistant/source-library/josephus-antiquities-pg2848-en-local-ai-v1/excerpts.json', 'utf8')) as { id: string; sourceId: string; order: number; text: string; textSha256: string }[]).slice(0, 2);
  const chunks = excerpts.flatMap((excerpt, index) => segmentSourceText(excerpt.order, excerpt.text).slice(0, index === 0 ? 3 : 1).map((span, ordinal) => ({ metadata: { id: span.id, sourceId: excerpt.sourceId, excerptId: excerpt.id, sourceDigest: excerpt.textSha256, textDigest: createHash('sha256').update(span.text).digest('hex'), startOffset: span.start, endOffset: span.end }, embedding: technicalVector(index === 1 ? 2 : ordinal === 2 ? 1 : 0) })));
  return {
    profile: { id: 'technical-vector-profile', configuration: { schemaVersion: 1, runtimeProfileSha256: 'a'.repeat(64), sourceManifestSha256: '46469116db968afc44f32d4e6cc5fecc5890910c038cbaac5363aa80dacb66d4', sourceSnapshotSha256: '098d837010fea0f38b104d2c9397696ae5db9e5cbd15a8e8f400f36811fbcf99', sourceExcerptsSha256: '79228666d0b6d552d6a5dc7ac3072acb7781c73f63af54119dab1495abff92d8', embeddingModelSha256: 'b'.repeat(64), dimensions: 1024, segmentCodepoints: 1000, overlapCodepoints: 100 }, expectedSegments: chunks.map(chunk => chunk.metadata) },
    chunks, eligible: excerpts.map(excerpt => ({ sourceId: excerpt.sourceId, excerptId: excerpt.id, textSha256: excerpt.textSha256 })),
  };
}
