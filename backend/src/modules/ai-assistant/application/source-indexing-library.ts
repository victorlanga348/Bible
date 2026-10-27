import type { AdmittedAiExcerpt, AiAnalysisSettings, AiIdentityClockPort, AiOperationPort, AiSourcesPort, AiTextHashPort, VectorIndexPort } from './analysis-ports';
import type { EmbeddingsPort, ModelProvenance, TokenUsage } from './ports';
import { sameConsultedSegment } from '../domain/analysis-values';
import { segmentSourceText } from '../domain/source-segments';
import { AiResultRejectedError, AiUnavailableError } from './errors';
import { checkedEmbedding } from './model-results';

export interface AiIndexingReport {
  readonly status: 'indexed' | 'unchanged'; readonly profileId: string; readonly chunkCount: number; readonly completedAt: string | null;
  readonly usage: TokenUsage | null; readonly provenance: ModelProvenance | null;
}
export class SourceIndexingLibrary {
  constructor(private readonly settings: AiAnalysisSettings, private readonly sources: AiSourcesPort, private readonly embeddings: EmbeddingsPort, private readonly index: VectorIndexPort, private readonly operation: AiOperationPort, private readonly identity: AiIdentityClockPort, private readonly hash: AiTextHashPort) {}
  async rebuild(signal?: AbortSignal): Promise<AiIndexingReport> {
    return this.operation.run(async active => {
      if (this.settings.profileId !== this.settings.indexProfile.id || this.settings.embeddingModelSha256 !== this.settings.indexProfile.configuration.embeddingModelSha256) throw new AiUnavailableError();
      const sources: AdmittedAiExcerpt[] = [];
      for (const ref of this.sources.listAdmitted()) {
        const source = await this.sources.read(ref.excerptId);
        if (!source) throw new AiUnavailableError();
        sources.push(source);
      }
      const chunks = sources.flatMap(source => segmentSourceText(source.paragraph, source.text).map(span => ({ text: span.text, metadata: { id: span.id, sourceId: source.sourceId, excerptId: source.excerptId, sourceDigest: source.textSha256, textDigest: this.hash.sha256(span.text), startOffset: span.start, endOffset: span.end } })));
      const expected = this.settings.indexProfile.expectedSegments;
      if (chunks.length !== expected.length || expected.some(candidate => !chunks.some(row => sameConsultedSegment(candidate, row.metadata)))) throw new AiResultRejectedError();
      const ready = await this.index.readiness(this.settings.indexProfile);
      await this.current(sources, active);
      if (ready) return Object.freeze({ status: 'unchanged', profileId: this.settings.profileId, chunkCount: chunks.length, completedAt: null, usage: null, provenance: null });
      const batch = checkedEmbedding(await this.embeddings.embed({ purpose: 'source', texts: chunks.map(row => row.text) }, active), chunks.length, this.settings);
      await this.current(sources, active);
      const completedAt = this.identity.now();
      const status = await this.index.replace(this.settings.indexProfile, chunks.map((row, ordinal) => ({ metadata: row.metadata, embedding: batch.vectors[ordinal]! })), completedAt);
      return Object.freeze({ status, profileId: this.settings.profileId, chunkCount: chunks.length, completedAt: status === 'indexed' ? completedAt : null, usage: batch.usage, provenance: batch.provenance });
    }, signal);
  }
  private async current(previous: readonly AdmittedAiExcerpt[], signal: AbortSignal): Promise<void> {
    for (const source of previous) {
      if (signal.aborted) throw new AiUnavailableError();
      const current = await this.sources.read(source.excerptId);
      if (!current || current.sourceId !== source.sourceId || current.locator !== source.locator || current.paragraph !== source.paragraph || current.textSha256 !== source.textSha256 || this.hash.sha256(current.text) !== source.textSha256) throw new AiResultRejectedError();
    }
    if (signal.aborted) throw new AiUnavailableError();
  }
}
