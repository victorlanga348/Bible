import type { AiAnalysisSettings } from './analysis-ports';
import type { EmbeddingBatch, GeneratedSelection } from './ports';
import { AiResultRejectedError, AiUnavailableError } from './errors';
import { SourceSelection, type SourceSentence } from '../domain/model-input';

export function checkedEmbedding(batch: EmbeddingBatch, count: number, settings: AiAnalysisSettings): EmbeddingBatch {
  const { provenance: p, usage: u } = batch;
  if (p.profileId !== settings.profileId || p.modelId !== settings.embeddingModelId || p.modelSha256 !== settings.embeddingModelSha256 || typeof p.runtimeVersion !== 'string' || !p.runtimeVersion.trim() || p.promptVersion !== null || p.dimensions !== 1024 || p.contextLimit !== settings.embeddingContextLimit || p.outputLimit !== 0) throw new AiUnavailableError();
  if (![u.promptTokens, u.completionTokens, u.totalTokens].every(Number.isSafeInteger) || u.promptTokens <= 0 || u.completionTokens !== 0 || u.totalTokens !== u.promptTokens || u.promptTokens > count * settings.embeddingContextLimit || !Array.isArray(batch.vectors) || batch.vectors.length !== count) throw new AiUnavailableError();
  const vectors = batch.vectors.map(vector => {
    if (!Array.isArray(vector) || vector.length !== 1024) throw new AiUnavailableError();
    const points = Array.from(vector);
    if (!points.every(Number.isFinite) || Math.abs(Math.sqrt(points.reduce((sum, value) => sum + value * value, 0)) - 1) > 0.0001) throw new AiUnavailableError();
    return Object.freeze(points);
  });
  return Object.freeze({ vectors: Object.freeze(vectors), usage: Object.freeze({ promptTokens: u.promptTokens, completionTokens: 0, totalTokens: u.totalTokens }), provenance: Object.freeze({ profileId: p.profileId, modelId: p.modelId, modelSha256: p.modelSha256, runtimeVersion: p.runtimeVersion, promptVersion: null, dimensions: 1024, contextLimit: p.contextLimit, outputLimit: 0 }) });
}

export function checkedGeneration(result: GeneratedSelection, context: readonly SourceSentence[], settings: AiAnalysisSettings, runtimeVersion: string): GeneratedSelection {
  const { provenance: p, usage: u } = result;
  if (p.profileId !== settings.profileId || p.modelId !== settings.modelId || p.modelSha256 !== settings.modelSha256 || p.runtimeVersion !== runtimeVersion || p.promptVersion !== settings.promptVersion || p.dimensions !== null || p.contextLimit !== settings.contextLimit || p.outputLimit !== settings.outputLimit) throw new AiResultRejectedError();
  if (![u.promptTokens, u.completionTokens, u.totalTokens].every(Number.isSafeInteger) || u.promptTokens <= 0 || u.completionTokens <= 0 || u.completionTokens > settings.outputLimit || u.promptTokens + settings.outputLimit > settings.contextLimit || u.totalTokens !== u.promptTokens + u.completionTokens) throw new AiResultRejectedError();
  try {
    const selection = new SourceSelection(result.selection.citationId, context); const expected = selection.sentence; const actual = result.selection.sentence;
    if (result.selection.status !== selection.status || (expected === null ? actual !== null : !actual || actual.id !== expected.id || actual.paragraph !== expected.paragraph || actual.start !== expected.start || actual.end !== expected.end || actual.text !== expected.text)) throw new AiResultRejectedError();
    return Object.freeze({ selection, usage: Object.freeze({ promptTokens: u.promptTokens, completionTokens: u.completionTokens, totalTokens: u.totalTokens }), provenance: Object.freeze({ profileId: p.profileId, modelId: p.modelId, modelSha256: p.modelSha256, runtimeVersion: p.runtimeVersion, promptVersion: p.promptVersion, dimensions: null, contextLimit: p.contextLimit, outputLimit: p.outputLimit }) });
  } catch { throw new AiResultRejectedError(); }
}
