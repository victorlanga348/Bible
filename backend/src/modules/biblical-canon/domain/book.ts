export interface BookProps { readonly translationId: string; readonly code: string; readonly name: string; readonly order: number }
export class Book implements BookProps {
  readonly translationId: string;
  readonly code: string;
  readonly name: string;
  readonly order: number;

  constructor(input: BookProps) {
    assertTranslationId(input.translationId);
    assertNonBlank(input.name);
    assertPositiveInteger(input.order);
    this.translationId = input.translationId;
    this.code = normaliseBookCode(input.code);
    this.name = input.name;
    this.order = input.order;
    Object.freeze(this);
  }
}
import { assertNonBlank, assertPositiveInteger, assertTranslationId, normaliseBookCode } from './invariants';

