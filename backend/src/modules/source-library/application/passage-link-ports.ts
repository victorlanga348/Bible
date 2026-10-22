import type { Source } from '../domain/source';
import type { SourceExcerpt } from '../domain/source-excerpt';
import type { CuratedPassageLink, PassageSelection } from '../domain/curated-passage-link';

export interface PassageLinkRepositoryPort {
  save(link: CuratedPassageLink): Promise<'imported' | 'unchanged'>;
  find(selection: PassageSelection): Promise<CuratedPassageLink[]>;
}
export interface SourceExcerptAccessPort { getExcerpt(id: string): Promise<{ source: Source; excerpt: SourceExcerpt }> }
export interface CanonPassagePort { assertExists(selection: PassageSelection): Promise<void> }
