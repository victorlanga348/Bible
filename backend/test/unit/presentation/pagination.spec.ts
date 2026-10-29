import { z } from 'zod';
import { paginationFields, encodeCursor } from '../../../src/presentation/pagination';
const query = z.strictObject(paginationFields);
const cursor = { createdAt: '2026-10-29T00:00:00.000Z', id: '11111111-1111-4111-8111-111111111111' };
describe('canonical transport cursor shared by the concrete history/relation lists', () => {
  it('round-trips only the public cursor metadata and communicates no next page with null', () => {
    const encoded = encodeCursor(cursor); expect(encoded).toBe(Buffer.from(JSON.stringify(cursor)).toString('base64url')); expect(query.parse({ cursor: encoded })).toEqual({ cursor, limit: 20 }); expect(encodeCursor(null)).toBeNull();
  });
  it('validates bounded decimal limits and rejects unknown query fields', () => {
    expect(query.parse({})).toEqual({ limit: 20 }); for (const limit of ['1', '20', '50']) expect(query.parse({ limit }).limit).toBe(Number(limit));
    for (const limit of ['', '0', '-1', '51', '1.5', '0x10', '1e1', '01']) expect(query.safeParse({ limit }).success).toBe(false);
    expect(query.safeParse({ owner: 'somebody' }).success).toBe(false);
  });
  it('refuses noncanonical, malformed, oversized and structurally invalid cursors', () => {
    const bad = ['', '!!!', 'x'.repeat(257), Buffer.from('{}').toString('base64url'), Buffer.from('null').toString('base64url'), Buffer.from('[]').toString('base64url'), Buffer.from('bad JSON').toString('base64url'), Buffer.from(JSON.stringify({ ...cursor, owner: 'another' })).toString('base64url'), Buffer.from(JSON.stringify({ ...cursor, id: 'invalid' })).toString('base64url'), Buffer.from(JSON.stringify({ ...cursor, createdAt: '2026-02-30T00:00:00.000Z' })).toString('base64url'), encodeCursor(cursor) + '='];
    for (const value of bad) expect(query.safeParse({ cursor: value }).success).toBe(false);
    expect(() => encodeCursor({ ...cursor, id: 'invalid' })).toThrow();
  });
});
