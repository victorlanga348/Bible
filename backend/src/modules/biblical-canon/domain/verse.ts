import type { PassageReference } from './passage-reference';
import { CanonDomainError } from './canon-domain-error';
import { assertNonBlank } from './invariants';
export interface VerseProps { readonly reference: PassageReference; readonly text: string }
export class Verse implements VerseProps {
  readonly reference: PassageReference;
  readonly text: string;

  constructor(input: VerseProps) {
    if (input.reference.fromVerse !== input.reference.toVerse) throw new CanonDomainError();
    assertNonBlank(input.text);
    this.reference = input.reference;
    this.text = input.text;
    Object.freeze(this);
  }
}
