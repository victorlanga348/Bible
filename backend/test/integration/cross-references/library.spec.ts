import { createHash } from 'node:crypto';
import type { Database } from '../../../src/infrastructure/database';
import { RelationLibrary } from '../../../src/modules/cross-references/application/relation-library';
import { RelationNotFoundError, RelationEvidenceError, RelationUnavailableError } from '../../../src/modules/cross-references/application/errors';
import { RelationInputError } from '../../../src/modules/cross-references/domain/relation';
import { PrismaRelationStore } from '../../../src/modules/cross-references/infrastructure/prisma-relation-store';
import { RelationCanonAdapter, RelationSourcesAdapter } from '../../../src/modules/cross-references/infrastructure/library-adapters';
import type { RelationCreate } from '../../../src/modules/cross-references/application/ports';
import { relationProps } from '../../helpers/cross-references';
import { cleanCanon, seedCanon } from '../../helpers/canon';
import { cleanSourceTestData, openSourceTestDatabase, seedCuratedSource, sourceFixture, excerptFixture } from '../../helpers/source-library';
import { createStudyTestServices } from '../../helpers/study-runtime';
const p = relationProps();
const input = (): RelationCreate => ({ from: { translationId: p.from.translationId, reference: p.from.normalized }, to: { translationId: p.to.translationId, reference: p.to.normalized }, type: p.type, reading: p.reading, rationale: p.rationale, evidence: p.evidence.map(({ excerptId, startOffset, endOffset }) => ({ excerptId, startOffset, endOffset })) });
describe('cross-reference Application with real Canon/Source/Prisma/PostgreSQL; no inference', () => {
  let database: Database; let library: RelationLibrary; let sequence = 0;
  const clean = async () => { await database.client.crossReferenceRecord.deleteMany(); await cleanSourceTestData(database); await cleanCanon(database); };
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => { sequence = 0; await clean(); await seedCanon(database); await seedCuratedSource(database); const context = createStudyTestServices(database);
    library = new RelationLibrary(new PrismaRelationStore(database), new RelationCanonAdapter(context.canonical), new RelationSourcesAdapter(context.sources), { nextId: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`, now: () => p.createdAt });
  });
  afterAll(async () => { try { if (database) await clean(); } finally { await database?.onModuleDestroy(); } });
  it('creates a private interpretation, resolves both passages and returns the literal permitted source span', async () => {
    const view = await library.create(p.ownerId, { ...input(), rationale: `  ${p.rationale}  ` });
    expect(view).toMatchObject({ from: p.from, to: p.to, type: p.type, reading: p.reading, rationale: p.rationale, assessment: 'user-interpretation' }); expect(view).not.toHaveProperty('ownerId'); expect(view).not.toHaveProperty('schemaVersion');
    expect(view.evidence[0]).toEqual({ ...p.evidence[0], availability: 'available', quote: Array.from(excerptFixture[0]!.text).slice(0, 30).join(''), attribution: sourceFixture.attribution, rightsStatement: sourceFixture.rightsStatement, rightsUrl: sourceFixture.rightsUrl });
    expect(view.limitations.join(' ')).toMatch(/utilizador/); expect(await library.read(p.ownerId, view.id)).toEqual(view);
    const row = await database.client.crossReferenceRecord.findUniqueOrThrow({ where: { id: view.id } }); expect(JSON.stringify(row.document)).not.toContain('quote');
  });
  it('returns an empty page, both endpoint pages and keyset pagination without duplicates', async () => {
    expect(await library.list(p.ownerId, p.from.translationId, p.from.normalized, { limit: 20 })).toEqual({ items: [], nextCursor: null });
    const first = await library.create(p.ownerId, input()); const second = await library.create(p.ownerId, input());
    const a = await library.list(p.ownerId, p.from.translationId, p.from.normalized, { limit: 1 }); expect(a.items.map(v => v.id)).toEqual([second.id]); expect(a.nextCursor).toEqual({ id: second.id, createdAt: p.createdAt });
    await library.create(p.ownerId, input());
    const b = await library.list(p.ownerId, p.to.translationId, p.to.normalized, { limit: 1, cursor: a.nextCursor! }); expect(b.items.map(v => v.id)).toEqual([first.id]); expect(b.nextCursor).toBeNull();
    expect((await library.list('other-owner', p.from.translationId, p.from.normalized, { limit: 20 })).items).toEqual([]);
  });
  it('denies another owner identically to absence and never deletes their record', async () => {
    const view = await library.create(p.ownerId, input()); await expect(library.read('other-owner', view.id)).rejects.toThrow(RelationNotFoundError); await expect(library.delete('other-owner', view.id)).rejects.toThrow(RelationNotFoundError);
    expect(await library.read(p.ownerId, view.id)).toEqual(view); await library.delete(p.ownerId, view.id); await expect(library.read(p.ownerId, view.id)).rejects.toThrow(RelationNotFoundError); await expect(library.delete(p.ownerId, view.id)).rejects.toThrow(RelationNotFoundError);
  });
  it.each([{ from: { translationId: 'missing', reference: p.from.normalized } }, { to: { translationId: p.to.translationId, reference: 'JHN 3:9999' } }])('requires each actual endpoint %p', async patch => { await expect(library.create(p.ownerId, { ...input(), ...patch })).rejects.toThrow(RelationNotFoundError); expect(await database.client.crossReferenceRecord.count()).toBe(0); });
  it.each([{ rationale: '' }, { reading: 'historical' }, { type: 'prophetic-relation', reading: 'textual' }, { evidence: [] }])('rejects invalid personal relation %p without persisting', async patch => { await expect(library.create(p.ownerId, { ...input(), ...patch } as RelationCreate)).rejects.toThrow(RelationInputError); expect(await database.client.crossReferenceRecord.count()).toBe(0); });
  it.each([{ excerptId: 'missing' }, { startOffset: -1 }, { endOffset: 999999 }, { endOffset: 0 }])('requires a real permitted bounded source span %p', async patch => { await expect(library.create(p.ownerId, { ...input(), evidence: [{ ...input().evidence[0]!, ...patch }] })).rejects.toThrow(RelationEvidenceError); });
  it('refuses a quote exceeding the permitted byte limit', async () => {
    await expect(library.create(p.ownerId, { ...input(), evidence: [{ excerptId: excerptFixture[0]!.id, startOffset: 0, endOffset: Array.from(excerptFixture[0]!.text).length }] })).rejects.toThrow(RelationEvidenceError);
  });
  it('revalidates revoked/missing sources without returning cached quotes', async () => {
    const view = await library.create(p.ownerId, input());
    await database.client.sourceLibrarySource.update({ where: { id: sourceFixture.id }, data: { permissions: { ...sourceFixture.permissions, quote: 'denied' } } });
    expect((await library.read(p.ownerId, view.id)).evidence[0]).toMatchObject({ availability: 'restricted', quote: null, attribution: null });
    await expect(library.create(p.ownerId, input())).rejects.toThrow(RelationEvidenceError);
    await database.client.sourceLibraryExcerpt.delete({ where: { id: excerptFixture[0]!.id } }); expect((await library.read(p.ownerId, view.id)).evidence[0]).toMatchObject({ availability: 'missing', quote: null });
  });
  it('marks a legitimately changed source digest missing and rejects actual integrity corruption', async () => {
    const view = await library.create(p.ownerId, input()); const original = excerptFixture[0]!;
    const changed = original.text + '\n'; await database.client.sourceLibraryExcerpt.update({ where: { id: original.id }, data: { text: changed, textSha256: createHash('sha256').update(changed).digest('hex') } });
    expect((await library.read(p.ownerId, view.id)).evidence[0]).toMatchObject({ availability: 'missing', quote: null });
    await database.client.sourceLibraryExcerpt.update({ where: { id: original.id }, data: { textSha256: original.textSha256 } });
    await expect(library.read(p.ownerId, view.id)).rejects.toThrow(RelationUnavailableError); await expect(library.create(p.ownerId, input())).rejects.toThrow(RelationUnavailableError);
  });
  it('does not claim SQL failure as an empty history or a confirmed creation', async () => {
    await database.client.$executeRawUnsafe('ALTER TABLE app.cross_reference RENAME TO cross_reference_test_unavailable');
    try { await expect(library.create(p.ownerId, input())).rejects.toThrow(RelationUnavailableError); await expect(library.list(p.ownerId, p.from.translationId, p.from.normalized, { limit: 20 })).rejects.toThrow(RelationUnavailableError); }
    finally { await database.client.$executeRawUnsafe('ALTER TABLE app.cross_reference_test_unavailable RENAME TO cross_reference'); }
  });
  it('rejects malformed direct owner/id/window/reference requests', async () => {
    await expect(library.list(p.ownerId, 'porbr2018', 'not a reference', { limit: 1 })).rejects.toThrow(RelationInputError);
    await expect(library.list(p.ownerId, 'porbr2018', p.from.normalized, { limit: 0 })).rejects.toThrow(RelationInputError);
    await expect(library.read('', p.id)).rejects.toThrow(RelationInputError); await expect(library.read(p.ownerId, 'invalid')).rejects.toThrow(RelationInputError);
  });
});
