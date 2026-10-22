import type { CanonLibrary } from '../../biblical-canon/application/canon-library';
import { CanonNotFoundError } from '../../biblical-canon/application/errors';
import { CanonDomainError } from '../../biblical-canon/domain/canon-domain-error';
import type { CanonPassagePort } from '../application/passage-link-ports';
import type { PassageSelection } from '../domain/curated-passage-link';
import { SourceDomainError } from '../domain/source-domain-error';
import { SourceNotFoundError } from '../application/errors';

export class CanonPassageValidator implements CanonPassagePort {
  constructor(private readonly canon: CanonLibrary) {}
  async assertExists(selection: PassageSelection): Promise<void> {
    try { await this.canon.passage(selection.translationId, selection.bookCode, selection.chapter, selection.fromVerse, selection.toVerse); }
    catch (error) {
      if (error instanceof CanonNotFoundError) throw new SourceNotFoundError();
      if (error instanceof CanonDomainError) throw new SourceDomainError();
      throw error;
    }
  }
}
