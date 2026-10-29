import type { Database } from '../../../src/infrastructure/database';
import { CrossReference } from '../../../src/modules/cross-references/domain/relation';
import { RelationUnavailableError } from '../../../src/modules/cross-references/application/errors';
import { PrismaRelationStore } from '../../../src/modules/cross-references/infrastructure/prisma-relation-store';
import { relationProps } from '../../helpers/cross-references';
import { openSourceTestDatabase } from '../../helpers/source-library';
const secondId = '22222222-2222-4222-8222-222222222222'; const thirdId = '33333333-3333-4333-8333-333333333333';
describe('cross-reference repository in actual isolated PostgreSQL', () => {
  let database: Database; let store: PrismaRelationStore;
  beforeAll(async () => { database = await openSourceTestDatabase(); store = new PrismaRelationStore(database); });
  beforeEach(async () => { await database.client.crossReferenceRecord.deleteMany(); });
  afterAll(async () => { try { await database?.client.crossReferenceRecord.deleteMany(); } finally { await database?.onModuleDestroy(); } });
  const seed = async () => { const d = new CrossReference(relationProps()); await store.create(d); return d; };
  it('round-trips immutable metadata and persists references without quote text', async () => {
    const d = await seed(); expect(await store.find(d.ownerId, d.id)).toEqual(d);
    const row = await database.client.crossReferenceRecord.findUniqueOrThrow({ where: { id: d.id } });
    expect(row.document).toEqual(JSON.parse(JSON.stringify(d))); expect(row.document).not.toHaveProperty('quote'); expect(JSON.stringify(row.document)).not.toContain('attribution');
    expect(await store.find('other-owner', d.id)).toBeNull(); expect(await store.find(d.ownerId, thirdId)).toBeNull();
  });
  it('preserves the existing record after duplicate-key failure and retains the internal cause', async () => {
    const d = await seed(); await expect(store.create(d)).rejects.toMatchObject({ message: expect.stringMatching(/\S/), cause: { code: 'P2002' } }); expect(await store.find(d.ownerId, d.id)).toEqual(d);
  });
  it('finds either overlapping endpoint, excludes other owners/non-overlap and uses keyset order', async () => {
    const p = relationProps(); await seed();
    await store.create(new CrossReference({ ...p, id: secondId, from: { ...p.from, toVerse: 2, normalized: 'GEN 1:1-2' } }));
    await store.create(new CrossReference({ ...p, id: thirdId, from: { ...p.from, fromVerse: 3, toVerse: 3, normalized: 'GEN 1:3' }, createdAt: '2026-10-29T00:00:00.001Z' }));
    await store.create(new CrossReference({ ...p, id: '44444444-4444-4444-8444-444444444444', ownerId: 'other-owner' }));
    expect((await store.list(p.ownerId, p.from, { limit: 1 })).map(v => v.id)).toEqual([secondId, p.id]);
    expect((await store.list(p.ownerId, p.to, { limit: 50 })).map(v => v.id)).toEqual([thirdId, secondId, p.id]);
    const query = { limit: 1, cursor: { id: secondId, createdAt: p.createdAt } };
    expect((await store.list(p.ownerId, p.from, query)).map(v => v.id)).toEqual([p.id]);
    expect(await store.list(p.ownerId, { ...p.from, translationId: 'missing' }, { limit: 20 })).toEqual([]);
    expect(await store.list(p.ownerId, { ...p.from, bookCode: 'EXO' }, { limit: 20 })).toEqual([]);
    expect(await store.list(p.ownerId, { ...p.from, chapter: 2 }, { limit: 20 })).toEqual([]);
    expect(await store.list(p.ownerId, { ...p.from, fromVerse: 4, toVerse: 4 }, { limit: 20 })).toEqual([]);
  });
  it.each([
    { id: secondId }, { ownerId: 'tampered-owner' }, { createdAt: '2026-10-29T00:00:00.001Z' },
    { from: { ...relationProps().from, translationId: 'other-edition' } },
    { from: { ...relationProps().from, bookCode: 'EXO', normalized: 'EXO 1:1' } },
    { from: { ...relationProps().from, chapter: 2, normalized: 'GEN 2:1' } },
    { from: { ...relationProps().from, fromVerse: 2, toVerse: 2, normalized: 'GEN 1:2' } },
    { to: { ...relationProps().to, toVerse: 17, normalized: 'JHN 3:16-17' } },
  ])('rejects row/document incoherence %p as unavailable', async patch => {
    const d = await seed(); await database.client.crossReferenceRecord.update({ where: { id: d.id }, data: { document: { ...JSON.parse(JSON.stringify(d)), ...patch } } });
    await expect(store.find(d.ownerId, d.id)).rejects.toThrow(RelationUnavailableError);
    await expect(store.list(d.ownerId, relationProps().from, { limit: 20 })).rejects.toThrow(RelationUnavailableError);
  });
  it('deletes only the owned relation and reports actual absence', async () => {
    const d = await seed(); expect(await store.delete('other-owner', d.id)).toBe(false); expect(await store.find(d.ownerId, d.id)).toEqual(d);
    expect(await store.delete(d.ownerId, d.id)).toBe(true); expect(await store.delete(d.ownerId, d.id)).toBe(false); expect(await database.client.crossReferenceRecord.count()).toBe(0);
  });
  it('maps real SQL failure without accepting it as an empty result', async () => {
    await database.client.$executeRawUnsafe('ALTER TABLE app.cross_reference RENAME TO cross_reference_test_unavailable');
    try {
      const p = relationProps(); for (const operation of [() => store.find(p.ownerId, p.id), () => store.list(p.ownerId, p.from, { limit: 1 }), () => store.delete(p.ownerId, p.id)]) {
        const failing = operation(); await expect(failing).rejects.toThrow(RelationUnavailableError); await expect(failing).rejects.toMatchObject({ message: expect.stringMatching(/\S/), cause: expect.any(Error) });
      }
    } finally { await database.client.$executeRawUnsafe('ALTER TABLE app.cross_reference_test_unavailable RENAME TO cross_reference'); }
  });
});
