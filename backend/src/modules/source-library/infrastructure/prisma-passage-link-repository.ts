import type { Database } from '../../../infrastructure/database';
import type { SourceLibraryPassageLink } from '../../../generated/prisma/client';
import type { PassageLinkRepositoryPort } from '../application/passage-link-ports';
import { CuratedPassageLink, type PassageSelection } from '../domain/curated-passage-link';
import { SourceConflictError } from '../application/errors';

export class PrismaPassageLinkRepository implements PassageLinkRepositoryPort {
  constructor(private readonly database: Database) {}
  async save(link: CuratedPassageLink): Promise<'imported' | 'unchanged'> {
    return this.database.client.$transaction(async transaction => {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`source-link:${link.id}`},0))`;
      const existing = await transaction.sourceLibraryPassageLink.findUnique({ where: { id: link.id } });
      if (existing !== null) {
        if (JSON.stringify(toLink(existing)) !== JSON.stringify(link)) throw new SourceConflictError();
        return 'unchanged';
      }
      await transaction.sourceLibraryPassageLink.create({ data: { ...link, chapter: BigInt(link.chapter), fromVerse: BigInt(link.fromVerse), toVerse: BigInt(link.toVerse) } });
      return 'imported';
    });
  }
  async find(selection: PassageSelection): Promise<CuratedPassageLink[]> {
    return (await this.database.client.sourceLibraryPassageLink.findMany({ where: { translationId: selection.translationId, bookCode: selection.bookCode, chapter: BigInt(selection.chapter),
      fromVerse: { lte: BigInt(selection.toVerse) }, toVerse: { gte: BigInt(selection.fromVerse) } }, orderBy: { id: 'asc' } })).map(toLink);
  }
}

function toLink(row: SourceLibraryPassageLink): CuratedPassageLink {
  return new CuratedPassageLink({ ...row, nature: row.nature as 'narrative-parallel', chapter: Number(row.chapter), fromVerse: Number(row.fromVerse), toVerse: Number(row.toVerse) });
}
