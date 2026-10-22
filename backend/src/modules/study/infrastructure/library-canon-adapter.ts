import type { CanonLibrary } from '../../biblical-canon/application/canon-library';
import { CanonNotFoundError } from '../../biblical-canon/application/errors';
import { CanonDomainError } from '../../biblical-canon/domain/canon-domain-error';
import { StudyInputError, StudyNotFoundError } from '../application/errors';
import type { StudyCanonPort, CanonicalStudyContent } from '../application/ports';

export class LibraryCanonAdapter implements StudyCanonPort {
  constructor(private readonly library: CanonLibrary) {}
  async load(translationId: string, reference: string): Promise<CanonicalStudyContent> {
    try {
      const selection = await this.library.resolve(translationId, reference);
      const passage = await this.library.passage(translationId, selection.bookCode, selection.chapter, selection.fromVerse, selection.toVerse);
      const chapter = await this.library.passage(translationId, selection.bookCode, selection.chapter);
      return {
        reference: { translationId, bookCode: selection.bookCode, chapter: selection.chapter, fromVerse: selection.fromVerse, toVerse: selection.toVerse, normalized: selection.toString() },
        passage: { verses: passage.verses, attribution: passage.attribution, licenseUrl: passage.licenseUrl },
        chapter: { verses: chapter.verses, attribution: chapter.attribution, licenseUrl: chapter.licenseUrl },
      };
    } catch (error) {
      if (error instanceof CanonNotFoundError) throw new StudyNotFoundError();
      if (error instanceof CanonDomainError) throw new StudyInputError();
      throw error;
    }
  }
}
