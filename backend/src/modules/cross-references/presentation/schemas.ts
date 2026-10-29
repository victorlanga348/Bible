import { z } from 'zod';
import { paginationFields } from '../../../presentation/pagination';
const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
const identifier = z.string().regex(/^[a-z0-9][a-z0-9-]{0,199}$/);
const translation = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
const positive = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const sourceRef = z.strictObject({ sourceId: identifier, excerptId: identifier, locator: z.string().min(1), textSha256: z.string().regex(/^[0-9a-f]{64}$/), startOffset: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER), endOffset: positive });
const passage = z.strictObject({ translationId: translation, bookCode: z.string().regex(/^[A-Z0-9]{3}$/), chapter: positive, fromVerse: positive, toVerse: positive, normalized: z.string().min(1) });
const requestPassage = z.strictObject({ translationId: translation, reference: z.string().trim().min(1).max(200) });
const rationale = z.string().trim().min(1).max(2000).refine(value => !/[\uD800-\uDFFF]/u.test(value) && !/\p{Cc}/u.test(value.replace(/[\t\r\n]/g, '')) && new TextEncoder().encode(value).byteLength <= 2000).describe('Fundamento pessoal até 2000 bytes UTF-8; não é classificação histórica verificada.');
export const createRelationBody = z.strictObject({ from: requestPassage, to: requestPassage, type: z.enum(['citation', 'allusion', 'thematic-parallel', 'prophetic-relation']), reading: z.enum(['textual', 'historical', 'messianic', 'eschatological']), rationale, evidence: z.array(z.strictObject({ excerptId: identifier, startOffset: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER), endOffset: positive })).min(1).max(4) });
export const relationParams = z.strictObject({ id: uuid });
export const emptyQuery = z.strictObject({});
export const emptyBody = z.strictObject({}).optional();
export const relationQuery = z.strictObject({ translationId: translation, reference: z.string().trim().min(1).max(200), ...paginationFields });
export const relationView = z.strictObject({ id: uuid, from: passage, to: passage, type: z.enum(['citation', 'allusion', 'thematic-parallel', 'prophetic-relation']), reading: z.enum(['textual', 'historical', 'messianic', 'eschatological']), rationale, assessment: z.literal('user-interpretation'), createdAt: z.iso.datetime(), limitations: z.array(z.string().min(1)).min(1),
  evidence: z.array(sourceRef.extend({ availability: z.enum(['available', 'missing', 'restricted']), quote: z.string().min(1).nullable(), attribution: z.string().min(1).nullable(), rightsStatement: z.string().min(1).nullable(), rightsUrl: z.url().nullable() })).min(1).max(4),
});
export const relationPageView = z.strictObject({ items: z.array(relationView), nextCursor: z.string().min(1).max(256).nullable() });
export const errorView = (code: string, message: string) => z.strictObject({ error: z.strictObject({ code: z.literal(code), message: z.literal(message) }) });
