import type { Database } from '../../../infrastructure/database';
import type { CrossReferenceRecord, Prisma } from '../../../generated/prisma/client';
import type { RelationStorePort } from '../application/ports';
import type { RelationPassage, RelationWindow, RelationProps } from '../domain/relation';
import { CrossReference } from '../domain/relation';
import { RelationUnavailableError } from '../application/errors';
function coordinates(document: CrossReference) {
  return { fromTranslationId: document.from.translationId, fromBookCode: document.from.bookCode, fromChapter: BigInt(document.from.chapter), fromVerseStart: BigInt(document.from.fromVerse), fromVerseEnd: BigInt(document.from.toVerse),
    toTranslationId: document.to.translationId, toBookCode: document.to.bookCode, toChapter: BigInt(document.to.chapter), toVerseStart: BigInt(document.to.fromVerse), toVerseEnd: BigInt(document.to.toVerse) };
}
function hydrate(row: CrossReferenceRecord): CrossReference {
  const document = new CrossReference(row.document as unknown as RelationProps);
  if (document.id !== row.id || document.ownerId !== row.ownerId || document.createdAt !== row.createdAt.toISOString() || Object.entries(coordinates(document)).some(([key, value]) => row[key as keyof CrossReferenceRecord] !== value)) throw new Error('Incoherent cross-reference metadata');
  return document;
}
export class PrismaRelationStore implements RelationStorePort {
  constructor(private readonly database: Database) {}
  async create(document: CrossReference): Promise<void> {
    try { await this.database.client.crossReferenceRecord.create({ data: { id: document.id, ownerId: document.ownerId, ...coordinates(document), document: JSON.parse(JSON.stringify(document)) as Prisma.InputJsonValue, createdAt: new Date(document.createdAt) } }); }
    catch (cause) { throw new RelationUnavailableError('Cross-reference persistence failed', { cause }); }
  }
  async find(owner: string, id: string): Promise<CrossReference | null> {
    try { const row = await this.database.client.crossReferenceRecord.findUnique({ where: { id, ownerId: owner } }); return row === null ? null : hydrate(row); }
    catch (cause) { throw new RelationUnavailableError('Cross-reference read failed', { cause }); }
  }
  async list(owner: string, passage: RelationPassage, query: RelationWindow): Promise<readonly CrossReference[]> {
    try {
      const endpoints: Prisma.CrossReferenceRecordWhereInput[] = [
        { fromTranslationId: passage.translationId, fromBookCode: passage.bookCode, fromChapter: BigInt(passage.chapter), fromVerseStart: { lte: BigInt(passage.toVerse) }, fromVerseEnd: { gte: BigInt(passage.fromVerse) } },
        { toTranslationId: passage.translationId, toBookCode: passage.bookCode, toChapter: BigInt(passage.chapter), toVerseStart: { lte: BigInt(passage.toVerse) }, toVerseEnd: { gte: BigInt(passage.fromVerse) } },
      ];
      const after: Prisma.CrossReferenceRecordWhereInput[] = query.cursor ? [{ OR: [{ createdAt: { lt: new Date(query.cursor.createdAt) } }, { createdAt: new Date(query.cursor.createdAt), id: { lt: query.cursor.id } }] }] : [];
      const rows = await this.database.client.crossReferenceRecord.findMany({ where: { ownerId: owner, AND: [{ OR: endpoints }, ...after] }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: query.limit + 1 });
      return rows.map(hydrate);
    } catch (cause) { throw new RelationUnavailableError('Cross-reference list failed', { cause }); }
  }
  async delete(owner: string, id: string): Promise<boolean> {
    try { return (await this.database.client.crossReferenceRecord.deleteMany({ where: { id, ownerId: owner } })).count === 1; }
    catch (cause) { throw new RelationUnavailableError('Cross-reference delete failed', { cause }); }
  }
}
