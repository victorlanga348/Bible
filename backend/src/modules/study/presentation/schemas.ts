import { z } from 'zod';

const identifier = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);
const text = z.string().regex(/\S/);
const positive = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const kind = z.enum(['immediate-context', 'book-argument', 'history-culture', 'authorship-audience-purpose', 'comparison', 'interpretations']);
const permission = z.enum(['allowed', 'pending', 'denied']);
const url = z.url({ protocol: /^https?$/ });
export const emptyQuery = z.strictObject({});
export const studyParams = z.strictObject({ id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i).length(36) });
export const studyQuery = z.strictObject({ version: z.string().regex(/^\d+$/).transform(Number).pipe(positive).optional() });
export const createStudyBody = z.strictObject({ translationId: identifier, reference: text });
export const reviseStudyBody = z.strictObject({ expectedVersion: positive });
export const studyView = z.strictObject({
  id: studyParams.shape.id, version: positive, createdAt: z.iso.datetime(),
  reference: z.strictObject({ translationId: identifier, bookCode: z.string().regex(/^[A-Z0-9]{3}$/).length(3), chapter: positive, fromVerse: positive, toVerse: positive, normalized: text }),
  passage: z.strictObject({ verses: z.array(z.strictObject({ number: positive, text })).min(1), attribution: text, licenseUrl: url }),
  sections: z.array(z.strictObject({ kind, status: z.enum(['available', 'insufficient-evidence']), text, evidenceIds: z.array(identifier) })).length(6),
  evidence: z.array(z.strictObject({ excerptId: identifier, sourceId: identifier, locator: text, quote: text.nullable(), textSha256: z.string().regex(/^[a-fA-F0-9]{64}$/).length(64),
    attribution: text, rightsStatement: text, rightsUrl: url, availability: z.enum(['available', 'restricted', 'missing']),
    rightsSnapshot: z.strictObject({ ingest: permission, store: permission, index: permission, display: permission, quote: permission, sendToAi: permission }) })),
  interpretations: z.array(z.strictObject({ classification: z.enum(['documented-fact', 'inference', 'tradition', 'hypothesis']), text, evidenceIds: z.array(identifier) })),
  limitations: z.array(text),
});
export const errorView = (code: string, message: string) => z.strictObject({ error: z.strictObject({ code: z.literal(code), message: z.literal(message) }) });
