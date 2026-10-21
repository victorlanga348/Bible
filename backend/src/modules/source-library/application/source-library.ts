import type { Source } from '../domain/source';
import type { SourceExcerpt } from '../domain/source-excerpt';
import type { SourceCatalogPort, SourceExcerptReadPort, SourceImportPort, SourceSnapshot, ExcerptQuery, ExcerptPage } from './ports';
import { SourceAccessError, SourceNotFoundError, SourceSnapshotError } from './errors';

export class SourceLibrary {
  constructor(private readonly catalog: SourceCatalogPort, private readonly reader: SourceExcerptReadPort, private readonly importer: SourceImportPort) {}
  async listSources(): Promise<Source[]> {
    return (await this.catalog.listSources()).filter(source => source.permissions.canRead());
  }
  private async readableSource(id: string): Promise<Source> {
    const source = await this.catalog.findSource(id);
    if (!source) throw new SourceNotFoundError();
    if (!source.permissions.canRead()) throw new SourceAccessError();
    return source;
  }
  async listExcerpts(sourceId: string, query: ExcerptQuery): Promise<ExcerptPage> {
    const source = await this.readableSource(sourceId);
    if (query.query !== undefined && !source.permissions.canSearch()) throw new SourceAccessError();
    const [excerpts, excerptCount] = await Promise.all([
      this.reader.listExcerpts(sourceId, { ...query, limit: query.limit + 1 }),
      this.reader.countExcerpts(sourceId),
    ]);
    return { excerpts: excerpts.slice(0, query.limit), limit: query.limit, offset: query.offset,
      hasMore: excerpts.length > query.limit,
      coverage: { sourceId, excerptCount, limitations: source.limitations } };
  }
  async getExcerpt(id: string): Promise<{ source: Source; excerpt: SourceExcerpt }> {
    const sourceId = await this.reader.findExcerptSourceId(id);
    if (sourceId === null) throw new SourceNotFoundError();
    const source = await this.readableSource(sourceId);
    const excerpt = await this.reader.findExcerpt(id, sourceId);
    if (excerpt === null) throw new SourceNotFoundError();
    return { source, excerpt };
  }
  async importSnapshot(snapshot: SourceSnapshot): Promise<'imported' | 'unchanged'> {
    if (!snapshot.source.permissions.canIngest()) throw new SourceAccessError();
    const ids = new Set<string>();
    const locators = new Set<string>();
    const orders = new Set<number>();
    for (const excerpt of snapshot.excerpts) {
      if (excerpt.sourceId !== snapshot.source.id || ids.has(excerpt.id) || locators.has(excerpt.locator) || orders.has(excerpt.order)) throw new SourceSnapshotError();
      ids.add(excerpt.id); locators.add(excerpt.locator); orders.add(excerpt.order);
    }
    return this.importer.importSnapshot(snapshot);
  }
}
