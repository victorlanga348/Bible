import { z } from 'zod';

const identifier = z.string().regex(/^[a-z0-9-]+$/);
const nonblank = z.string().regex(/\S/);
const sha256 = z.string().regex(/^[a-fA-F0-9]{64}$/);
const status = z.enum(['allowed', 'pending', 'denied']);
export const sourceView = z.strictObject({
  id: identifier, title: nonblank, author: nonblank, translator: nonblank.nullable(),
  language: nonblank, edition: nonblank, kind: z.enum(['historical-work', 'modern-study', 'commentary']),
  originUrl: z.url(), snapshotSha256: sha256, retrievedAt: z.string().refine(value => Number.isFinite(Date.parse(value))),
  rightsStatement: nonblank, rightsUrl: z.url(), attribution: nonblank,
  permissions: z.strictObject({ ingest: status, store: status, index: status, display: status, quote: status, sendToAi: status }),
  limitations: nonblank,
});
export const excerptView = z.strictObject({ id: identifier, sourceId: identifier, locator: nonblank,
  order: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER), text: nonblank, textSha256: sha256, originUrl: z.url().nullable() });
export const catalogueView = z.strictObject({ sources: z.array(sourceView) });
export const excerptDetailView = z.strictObject({ excerpt: excerptView, source: sourceView });
export const excerptPageView = z.strictObject({ excerpts: z.array(excerptView), limit: z.number().int().min(1).max(50),
  offset: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER), hasMore: z.boolean(),
  coverage: z.strictObject({ sourceId: identifier, excerptCount: z.number().int().min(0), limitations: nonblank }) });
export const emptyQuery = z.strictObject({});
export const sourceParams = z.strictObject({ sourceId: identifier });
export const excerptParams = z.strictObject({ excerptId: identifier });
export const excerptQuery = z.strictObject({
  q: z.string().trim().min(1).max(200).optional(),
  limit: z.string().regex(/^\d+$/).default('20').transform(Number).pipe(z.number().int().min(1).max(50)),
  offset: z.string().regex(/^\d+$/).default('0').transform(Number).pipe(z.number().int().min(0).max(Number.MAX_SAFE_INTEGER)),
});
export const errorView = (code: string, message: string) => z.strictObject({ error: z.strictObject({ code: z.literal(code), message: z.literal(message) }) });
