import type { Source } from '../domain/source';
import type { SourceExcerpt } from '../domain/source-excerpt';

export interface SourceSnapshot { readonly source: Source; readonly excerpts: readonly SourceExcerpt[] }
export interface ExcerptQuery { readonly query?: string; readonly limit: number; readonly offset: number }
export interface SourceCatalogPort {
  listSources(): Promise<Source[]>;
  findSource(id: string): Promise<Source | null>;
}
export interface SourceExcerptReadPort {
  findExcerptSourceId(id: string): Promise<string | null>;
  findExcerpt(id: string, sourceId: string): Promise<SourceExcerpt | null>;
  countExcerpts(sourceId: string): Promise<number>;
  listExcerpts(sourceId: string, query: ExcerptQuery): Promise<SourceExcerpt[]>;
}
export interface SourceImportPort { importSnapshot(snapshot: SourceSnapshot): Promise<'imported' | 'unchanged'> }
export interface ExcerptPage {
  readonly excerpts: SourceExcerpt[];
  readonly limit: number;
  readonly offset: number;
  readonly hasMore: boolean;
  readonly coverage: { readonly sourceId: string; readonly excerptCount: number; readonly limitations: string };
}
