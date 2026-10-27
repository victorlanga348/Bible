import type { AiQuestion, SourceSelection, SourceSentence } from '../domain/model-input';

export interface TokenUsage { readonly promptTokens: number; readonly completionTokens: number; readonly totalTokens: number }
export interface ModelProvenance {
  readonly profileId: string; readonly modelId: string; readonly modelSha256: string; readonly runtimeVersion: string;
  readonly promptVersion: string | null; readonly dimensions: number | null; readonly contextLimit: number; readonly outputLimit: number;
}
export interface EmbeddingRequest { readonly purpose: 'source' | 'question'; readonly texts: readonly string[] }
export interface EmbeddingBatch { readonly vectors: readonly (readonly number[])[]; readonly usage: TokenUsage; readonly provenance: ModelProvenance }
export interface GeneratedSelection { readonly selection: SourceSelection; readonly usage: TokenUsage; readonly provenance: ModelProvenance }
export interface EmbeddingsPort { embed(request: EmbeddingRequest, signal?: AbortSignal): Promise<EmbeddingBatch> }
export interface LlmProviderPort { select(question: AiQuestion, context: readonly SourceSentence[], signal?: AbortSignal): Promise<GeneratedSelection> }
