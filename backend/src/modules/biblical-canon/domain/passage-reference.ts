export interface PassageReferenceProps {
  readonly translationId: string;
  readonly bookCode: string;
  readonly chapter: number;
  readonly fromVerse: number;
  readonly toVerse: number;
}

export class PassageReference {
  readonly translationId: string;
  readonly bookCode: string;
  readonly chapter: number;
  readonly fromVerse: number;
  readonly toVerse: number;

  constructor(input: PassageReferenceProps) {
    assertTranslationId(input.translationId);
    assertPositiveInteger(input.chapter);
    assertPositiveInteger(input.fromVerse);
    assertPositiveInteger(input.toVerse);
    if (input.fromVerse > input.toVerse) throw new CanonDomainError();
    this.translationId = input.translationId;
    this.bookCode = normaliseBookCode(input.bookCode);
    this.chapter = input.chapter;
    this.fromVerse = input.fromVerse;
    this.toVerse = input.toVerse;
    Object.freeze(this);
  }

  toString(): string {
    const ending = this.fromVerse === this.toVerse ? '' : `-${this.toVerse}`;
    return `${this.bookCode} ${this.chapter}:${this.fromVerse}${ending}`;
  }
}
import { CanonDomainError } from './canon-domain-error';
import { assertPositiveInteger, assertTranslationId, normaliseBookCode } from './invariants';

