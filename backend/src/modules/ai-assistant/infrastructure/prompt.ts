import { validateContext, type AiQuestion, type SourceSentence } from '../domain/model-input';
import type { LocalModelProfile, PromptMessage } from './profile';

export interface GenerationRequest {
  readonly model: string;
  readonly messages: { role: PromptMessage['role']; content: string }[];
  readonly max_tokens: number;
  readonly response_format: unknown;
  readonly [key: string]: unknown;
}
export function generationRequest(question: AiQuestion, context: readonly SourceSentence[], profile: LocalModelProfile): GenerationRequest {
  validateContext(context);
  // Keep the proven JSON separators and source order; untrusted strings remain
  // JSON values, never roles or controlled instructions.
  const sentences = context.map(sentence => `{"id": ${JSON.stringify(sentence.id)}, "paragraph": ${sentence.paragraph}, "text": ${JSON.stringify(sentence.text)}}`).join(', ');
  const content = `{"question": ${JSON.stringify(question.text)}, "source_sentences": [${sentences}]}`;
  return {
    model: 'biblia-generation',
    messages: [...profile.messagesPrefix.map(message => ({ ...message })), { role: 'user', content }],
    ...profile.generation.sampling,
    max_tokens: profile.limits.generationOutputTokens,
    chat_template_kwargs: { enable_thinking: profile.generation.enableThinking },
    response_format: { type: 'json_schema', json_schema: { name: 'source_extraction', strict: true, schema: {
      type: 'object', properties: { citationId: { anyOf: [{ type: 'string', enum: context.map(sentence => sentence.id) }, { type: 'null' }] } },
      required: ['citationId'], additionalProperties: false,
    } } },
  };
}
