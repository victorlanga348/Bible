import { z } from 'zod';
import { AiModelInputError, SourceSelection, validateContext, type SourceSentence } from '../domain/model-input';
import type { EmbeddingBatch, GeneratedSelection, ModelProvenance } from '../application/ports';
import { AiResultRejectedError, AiUnavailableError } from '../application/errors';
import type { LocalModelProfile } from './profile';

const count = z.number().int().nonnegative();
const usage = z.object({ prompt_tokens: count.positive(), completion_tokens: count, total_tokens: count });
const generatedResponse = z.object({
  model: z.literal('biblia-generation'), object: z.literal('chat.completion'), usage,
  choices: z.array(z.object({ index: z.literal(0), finish_reason: z.literal('stop'), message: z.object({ role: z.literal('assistant'), content: z.string() }) })).length(1),
});
const selectedId = z.strictObject({ citationId: z.string().nullable() });
const embeddingResponse = z.object({
  model: z.literal('biblia-embedding'), object: z.literal('list'), usage: usage.omit({ completion_tokens: true }),
  data: z.array(z.object({ object: z.literal('embedding'), index: count, embedding: z.array(z.number()) })),
});
function provenance(profile: LocalModelProfile, runtimeVersion: string, generation: boolean): ModelProvenance {
  const model = generation ? profile.generation : profile.embedding;
  return Object.freeze({ profileId: profile.id, modelId: model.id, modelSha256: model.sha256, runtimeVersion,
    promptVersion: generation ? profile.promptVersion : null, dimensions: generation ? null : profile.embedding.dimensions,
    contextLimit: generation ? profile.limits.generationContextTokens : profile.limits.embeddingContextTokens,
    outputLimit: generation ? profile.limits.generationOutputTokens : 0 });
}
export function decodeGeneratedSelection(raw: unknown, context: readonly SourceSentence[], profile: LocalModelProfile, runtimeVersion: string): GeneratedSelection {
  validateContext(context);
  const parsed = generatedResponse.safeParse(raw);
  if (!parsed.success) throw new AiResultRejectedError();
  const tokens = parsed.data.usage;
  if (tokens.completion_tokens < 1 || tokens.completion_tokens > profile.limits.generationOutputTokens ||
    tokens.prompt_tokens + profile.limits.generationOutputTokens > profile.limits.generationContextTokens ||
    tokens.total_tokens !== tokens.prompt_tokens + tokens.completion_tokens) throw new AiResultRejectedError();
  try {
    const selected = selectedId.parse(JSON.parse(parsed.data.choices[0]!.message.content) as unknown);
    return Object.freeze({ selection: new SourceSelection(selected.citationId, context),
      usage: Object.freeze({ promptTokens: tokens.prompt_tokens, completionTokens: tokens.completion_tokens, totalTokens: tokens.total_tokens }),
      provenance: provenance(profile, runtimeVersion, true) });
  } catch { throw new AiResultRejectedError(); }
}
export function decodeEmbeddingBatch(raw: unknown, expectedCount: number, profile: LocalModelProfile, runtimeVersion: string): EmbeddingBatch {
  if (!Number.isSafeInteger(expectedCount) || expectedCount < 1 || expectedCount > 16) throw new AiModelInputError();
  const parsed = embeddingResponse.safeParse(raw);
  if (!parsed.success || parsed.data.data.length !== expectedCount || parsed.data.usage.total_tokens !== parsed.data.usage.prompt_tokens || parsed.data.usage.prompt_tokens > expectedCount * profile.limits.embeddingContextTokens) throw new AiUnavailableError();
  const rows = [...parsed.data.data].sort((first, second) => first.index - second.index);
  const vectors = rows.map((row, index) => {
    const norm = Math.sqrt(row.embedding.reduce((sum, value) => sum + value * value, 0));
    if (row.index !== index || row.embedding.length !== profile.embedding.dimensions || Math.abs(norm - 1) > 0.0001) throw new AiUnavailableError();
    return Object.freeze([...row.embedding]);
  });
  return Object.freeze({ vectors: Object.freeze(vectors),
    usage: Object.freeze({ promptTokens: parsed.data.usage.prompt_tokens, completionTokens: 0, totalTokens: parsed.data.usage.total_tokens }),
    provenance: provenance(profile, runtimeVersion, false) });
}
