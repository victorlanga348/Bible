import { CuratedPassageLink, assertPassageSelection, type CuratedPassageLinkProps, type PassageSelection } from '../domain/curated-passage-link';
import type { PassageLinkRepositoryPort, SourceExcerptAccessPort, CanonPassagePort } from './passage-link-ports';
import { SourceAccessError } from './errors';

export class SourcePassageLinks {
  constructor(private readonly repository: PassageLinkRepositoryPort, private readonly sources: SourceExcerptAccessPort, private readonly canon: CanonPassagePort) {}
  async curate(input: CuratedPassageLinkProps): Promise<'imported' | 'unchanged'> {
    const link = new CuratedPassageLink(input);
    // The public excerpt contract already enforces display/quote rights.
    const { source } = await this.sources.getExcerpt(link.excerptId);
    if (source.permissions.store !== 'allowed') throw new SourceAccessError();
    await this.canon.assertExists(link);
    return this.repository.save(link);
  }
  async find(selection: PassageSelection): Promise<CuratedPassageLink[]> {
    assertPassageSelection(selection);
    return this.repository.find(selection);
  }
}
