import { z } from 'zod';
import { AiModelInputError, validateContext, type AiQuestion, type SourceSentence } from '../domain/model-input';
import type { EmbeddingBatch, EmbeddingRequest, EmbeddingsPort, GeneratedSelection, LlmProviderPort } from '../application/ports';
import { AiResultRejectedError, AiUnavailableError } from '../application/errors';
import type { LocalModelProfile } from './profile';
import type { ModelRuntimePort, ModelSession } from './session';
import { generationRequest } from './prompt';
import { decodeEmbeddingBatch, decodeGeneratedSelection } from './protocol';

const tokenList = z.object({ tokens: z.array(z.number().int().nonnegative()).min(1) });
const template = z.object({ prompt: z.string().refine(text => text.trim().length > 0) });

async function countTokens(session: ModelSession, content: string, special: boolean): Promise<number> {
  const parsed = tokenList.safeParse(await session.post('/tokenize', { content, add_special: !special, parse_special: special }, 262144));
  if (!parsed.success) throw new AiUnavailableError();
  return parsed.data.tokens.length;
}

export class LocalModelProvider implements EmbeddingsPort, LlmProviderPort {
  constructor(private readonly profile: LocalModelProfile, private readonly runtime: ModelRuntimePort) {}
  async embed(request: EmbeddingRequest, signal?: AbortSignal): Promise<EmbeddingBatch> {
    if (!['source', 'question'].includes(request.purpose) || !Array.isArray(request.texts) || request.texts.length < 1 || request.texts.length > 16) throw new AiModelInputError();
    const inputs = request.texts.map((text: string) => {
      if (typeof text !== 'string' || !text.trim() || /[\uD800-\uDFFF]/u.test(text) || new TextEncoder().encode(text).byteLength > 4000) throw new AiModelInputError();
      return request.purpose === 'question' ? this.profile.embedding.queryPrefix + text : text;
    });
    return this.runtime.run('embedding', async session => {
      for (const input of inputs) if (await countTokens(session, input, false) > this.profile.limits.embeddingContextTokens) throw new AiResultRejectedError();
      const raw = await session.post('/v1/embeddings', { model: 'biblia-embedding', input: inputs }, 4194304);
      return decodeEmbeddingBatch(raw, inputs.length, this.profile, session.runtimeVersion);
    }, signal);
  }
  async select(question: AiQuestion, context: readonly SourceSentence[], signal?: AbortSignal): Promise<GeneratedSelection> {
    validateContext(context);
    const snapshot = [...context];
    const request = generationRequest(question, snapshot, this.profile);
    return this.runtime.run('generation', async session => {
      const rendered = template.safeParse(await session.post('/apply-template', { messages: request.messages, chat_template_kwargs: request.chat_template_kwargs }, 65536));
      if (!rendered.success) throw new AiUnavailableError();
      if (await countTokens(session, rendered.data.prompt, true) + this.profile.limits.generationOutputTokens > this.profile.limits.generationContextTokens) throw new AiResultRejectedError();
      const raw = await session.post('/v1/chat/completions', request, 65536);
      return decodeGeneratedSelection(raw, snapshot, this.profile, session.runtimeVersion);
    }, signal);
  }
}
