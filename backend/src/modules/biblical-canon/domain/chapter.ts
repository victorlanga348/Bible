export interface ChapterProps { readonly translationId: string; readonly bookCode: string; readonly number: number }
export class Chapter implements ChapterProps {
  readonly translationId: string;
  readonly bookCode: string;
  readonly number: number;

  constructor(input: ChapterProps) {
    assertTranslationId(input.translationId);
    assertPositiveInteger(input.number);
    this.translationId = input.translationId;
    this.bookCode = normaliseBookCode(input.bookCode);
    this.number = input.number;
    Object.freeze(this);
  }
}
import { assertPositiveInteger, assertTranslationId, normaliseBookCode } from './invariants';

