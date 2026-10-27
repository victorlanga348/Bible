import { z } from 'zod';
import { AiQuestion } from '../domain/model-input';

const identifier = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);
const text = z.string().regex(/\S/);
const positive = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const count = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const digest = z.string().regex(/^[a-f0-9]{64}$/).length(64);
const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i).length(36);
export const emptyQuery = z.strictObject({});
export const studyParams = z.strictObject({ studyId: uuid });
export const analysisParams = z.strictObject({ analysisId: uuid });
export const createAnalysisBody = z.strictObject({ studyVersion: positive, question: z.string().refine(value => { try { new AiQuestion(value); return true; } catch { return false; } }) });
export const errorView = (code: string, message: string) => z.strictObject({ error: z.strictObject({ code: z.literal(code), message: z.literal(message) }) });
const segment = z.strictObject({ id: identifier, sourceId: identifier, excerptId: identifier, sourceDigest: digest, textDigest: digest, startOffset: count, endOffset: positive });
export const analysisView = z.strictObject({
  id: uuid, studyId: uuid, studyVersion: positive, createdAt: z.iso.datetime(), question: text,
  reference: z.strictObject({ translationId: identifier, bookCode: z.string().regex(/^[A-Z0-9]{3}$/).length(3), chapter: positive, fromVerse: positive, toVerse: positive, normalized: text }),
  status: z.enum(['supported', 'insufficient-evidence', 'restricted']),
  evidence: z.array(z.strictObject({ sourceId: identifier, excerptId: identifier, locator: text, textSha256: digest, startOffset: count, endOffset: positive, quote: text, attribution: text, rightsStatement: text, rightsUrl: z.url({ protocol: /^https?$/ }) })).max(1),
  limitations: z.array(text).min(1),
  provenance: z.strictObject({ profileId: identifier, promptVersion: identifier, modelId: z.string().regex(/^[a-z0-9][a-z0-9._-]*$/).nullable(), modelSha256: digest.nullable(), embeddingModelSha256: digest.nullable(), runtimeVersion: text.nullable(), dimensions: z.literal(1024).nullable(), contextLimit: positive, outputLimit: positive, promptTokens: count, completionTokens: count, totalTokens: count, embeddingPromptTokens: count, consultedSegments: z.array(segment).max(3) }),
});
