import type { Database } from '../../../infrastructure/database';
import { createHash } from 'node:crypto';
import type { SourceLibrarySource, SourceLibraryExcerpt } from '../../../generated/prisma/client';
import { Source, type SourceKind } from '../domain/source';
import { SourceExcerpt } from '../domain/source-excerpt';
import type { SourcePermissionProps } from '../domain/source-permissions';
import { SourceConflictError, SourceSnapshotError } from '../application/errors';
import type { SourceCatalogPort, SourceExcerptReadPort, SourceImportPort, SourceSnapshot, ExcerptQuery } from '../application/ports';

export class PrismaSourceRepository implements SourceCatalogPort, SourceExcerptReadPort, SourceImportPort {
  constructor(private readonly database: Database) {}
  async listSources(): Promise<Source[]> {
    return (await this.database.client.sourceLibrarySource.findMany({ orderBy: { id: 'asc' } })).map(toSource);
  }
  async findSource(id: string): Promise<Source | null> {
    const row = await this.database.client.sourceLibrarySource.findUnique({ where: { id } });
    return row === null ? null : toSource(row);
  }
  async findExcerptSourceId(id: string): Promise<string | null> {
    const row = await this.database.client.sourceLibraryExcerpt.findUnique({ where: { id }, select: { sourceId: true } });
    return row?.sourceId ?? null;
  }
  async findExcerpt(id: string, sourceId: string): Promise<SourceExcerpt | null> {
    const row = await this.database.client.sourceLibraryExcerpt.findUnique({ where: { id, sourceId } });
    return row === null ? null : toExcerpt(row);
  }
  async countExcerpts(sourceId: string): Promise<number> {
    return this.database.client.sourceLibraryExcerpt.count({ where: { sourceId } });
  }
  async listExcerpts(sourceId: string, query: ExcerptQuery): Promise<SourceExcerpt[]> {
    const rows = query.query === undefined
      ? await this.database.client.$queryRaw<SourceLibraryExcerpt[]>`
        SELECT id, source_id AS "sourceId", locator, "order", text, text_sha256 AS "textSha256", origin_url AS "originUrl"
        FROM app.source_library_excerpt WHERE source_id = ${sourceId}
        ORDER BY "order", id LIMIT ${BigInt(query.limit)} OFFSET ${BigInt(query.offset)}`
      : await this.database.client.$queryRaw<SourceLibraryExcerpt[]>`
        SELECT id, source_id AS "sourceId", locator, "order", text, text_sha256 AS "textSha256", origin_url AS "originUrl"
        FROM app.source_library_excerpt WHERE source_id = ${sourceId}
          AND to_tsvector('english', text) @@ plainto_tsquery('english', ${query.query})
        ORDER BY ts_rank(to_tsvector('english', text), plainto_tsquery('english', ${query.query})) DESC, "order", id
        LIMIT ${BigInt(query.limit)} OFFSET ${BigInt(query.offset)}`;
    return rows.map(toExcerpt);
  }
  async importSnapshot(snapshot: SourceSnapshot): Promise<'imported' | 'unchanged'> {
    for (const excerpt of snapshot.excerpts) {
      if (createHash('sha256').update(excerpt.text, 'utf8').digest('hex') !== excerpt.textSha256.toLowerCase()) throw new SourceSnapshotError();
    }
    return this.database.client.$transaction(async transaction => {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${snapshot.source.id}, 0))`;
      const existing = await transaction.sourceLibrarySource.findUnique({ where: { id: snapshot.source.id } });
      if (existing !== null) {
        if (existing.snapshotSha256.toLowerCase() !== snapshot.source.snapshotSha256.toLowerCase()) throw new SourceConflictError();
        return 'unchanged';
      }
      await transaction.sourceLibrarySource.create({ data: { ...snapshot.source, permissions: { ...snapshot.source.permissions } } });
      await transaction.sourceLibraryExcerpt.createMany({ data: snapshot.excerpts.map(excerpt => ({ ...excerpt, order: BigInt(excerpt.order) })) });
      return 'imported';
    });
  }
}

function toSource(row: SourceLibrarySource): Source {
  return new Source({ ...row, kind: row.kind as SourceKind, permissions: row.permissions as unknown as SourcePermissionProps });
}
function toExcerpt(row: SourceLibraryExcerpt): SourceExcerpt {
  return new SourceExcerpt({ ...row, order: Number(row.order) });
}
