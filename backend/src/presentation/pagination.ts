import { z } from 'zod';
const cursorValue = z.strictObject({
  createdAt: z.iso.datetime().refine(value => Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value),
  id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
});
const cursor = z.string().min(1).max(256).regex(/^[A-Za-z0-9_-]+$/).transform((value, context) => {
  try {
    const bytes = Buffer.from(value, 'base64url'); if (bytes.toString('base64url') !== value) throw new Error();
    return cursorValue.parse(JSON.parse(bytes.toString('utf8')));
  } catch { context.addIssue({ code: 'custom', message: 'Cursor inválido.' }); return z.NEVER; }
});
export const paginationFields = { limit: z.string().regex(/^[1-9]\d?$/).default('20').transform(Number).pipe(z.number().int().min(1).max(50)), cursor: cursor.optional() };
export function encodeCursor(input: { createdAt: string; id: string } | null): string | null { return input === null ? null : Buffer.from(JSON.stringify(cursorValue.parse(input))).toString('base64url'); }
