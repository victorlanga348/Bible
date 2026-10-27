import type { AiIndexProfile } from '../application/analysis-ports';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { segmentSourceText } from '../domain/source-segments';
import { AiUnavailableError } from '../application/errors';
import { readPinnedRuntimeProfile } from './runtime-artifacts';

export interface AiSourceMetadata {
  readonly id: string; readonly title: string; readonly author: string; readonly translator: string | null; readonly language: string; readonly edition: string; readonly kind: string;
  readonly originUrl: string; readonly snapshotSha256: string; readonly retrievedAt: string; readonly rightsStatement: string; readonly rightsUrl: string; readonly attribution: string; readonly limitations: string;
}
export interface AiAdmittedExcerptMetadata { readonly sourceId: string; readonly excerptId: string; readonly locator: string; readonly paragraph: number; readonly textSha256: string }
export interface AiSourcePolicy { readonly source: AiSourceMetadata; readonly excerpts: readonly AiAdmittedExcerptMetadata[]; readonly indexProfile: AiIndexProfile }
export interface AiSourcePolicyFiles { readonly manifest: string; readonly excerpts: string }
export async function readAiSourcePolicy(files: AiSourcePolicyFiles, purpose: 'local-ai' | 'test-ai'): Promise<AiSourcePolicy> {
  const digest = (bytes: string | Buffer): string => createHash('sha256').update(bytes).digest('hex');
  const admitted = { 'local-ai': 'f7680eb9eaf5b0ef28b867fdb902da44d7856cb386efd317ee69a554f620d230', 'test-ai': '46469116db968afc44f32d4e6cc5fecc5890910c038cbaac5363aa80dacb66d4' };
  try {
    const [manifestBytes, excerptBytes, runtime] = await Promise.all([readFile(files.manifest), readFile(files.excerpts), readPinnedRuntimeProfile('admissions/local-extractive-v1.json')]);
    const manifestSha256 = digest(manifestBytes); const excerptSha256 = digest(excerptBytes);
    if (manifestSha256 !== admitted[purpose] || excerptSha256 !== '79228666d0b6d552d6a5dc7ac3072acb7781c73f63af54119dab1495abff92d8') throw new AiUnavailableError();
    const { source } = JSON.parse(manifestBytes.toString('utf8')) as { source: AiSourceMetadata };
    const excerpts = JSON.parse(excerptBytes.toString('utf8')) as { id: string; sourceId: string; locator: string; order: number; text: string; textSha256: string }[];
    const metadata: AiSourceMetadata = Object.freeze({ id: source.id, title: source.title, author: source.author, translator: source.translator, language: source.language, edition: source.edition, kind: source.kind, originUrl: source.originUrl, snapshotSha256: source.snapshotSha256, retrievedAt: source.retrievedAt, rightsStatement: source.rightsStatement, rightsUrl: source.rightsUrl, attribution: source.attribution, limitations: source.limitations });
    const catalogue = Object.freeze(excerpts.map(row => Object.freeze({ sourceId: row.sourceId, excerptId: row.id, locator: row.locator, paragraph: row.order, textSha256: row.textSha256 })));
    const expectedSegments = Object.freeze(excerpts.flatMap(row => segmentSourceText(row.order, row.text).map(span => Object.freeze({ id: span.id, sourceId: row.sourceId, excerptId: row.id, sourceDigest: row.textSha256, textDigest: digest(span.text), startOffset: span.start, endOffset: span.end }))));
    const indexProfile: AiIndexProfile = Object.freeze({ id: runtime.id, configuration: Object.freeze({ schemaVersion: 1, runtimeProfileSha256: 'cf12565112a0c5b84a7065200ee01362052f1ae3dee6296c16a8dccabbc5dc0f', sourceManifestSha256: manifestSha256, sourceSnapshotSha256: metadata.snapshotSha256, sourceExcerptsSha256: excerptSha256, embeddingModelSha256: runtime.embedding.sha256, dimensions: 1024, segmentCodepoints: 1000, overlapCodepoints: 100 }), expectedSegments });
    return Object.freeze({ source: metadata, excerpts: catalogue, indexProfile });
  } catch { throw new AiUnavailableError(); }
}
