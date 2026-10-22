import { SourceDomainError } from './source-domain-error';

export interface PassageSelection {
  readonly translationId: string; readonly bookCode: string; readonly chapter: number; readonly fromVerse: number; readonly toVerse: number;
}
export interface CuratedPassageLinkProps extends PassageSelection {
  readonly id: string; readonly excerptId: string; readonly nature: 'narrative-parallel'; readonly rationale: string;
}
function identifier(value: string): void {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(value)) throw new SourceDomainError();
}
export function assertPassageSelection(input: PassageSelection): void {
  identifier(input.translationId);
  if (typeof input.bookCode !== 'string' || !/^[A-Z0-9]{3}$/.test(input.bookCode)) throw new SourceDomainError();
  for (const value of [input.chapter, input.fromVerse, input.toVerse]) if (!Number.isSafeInteger(value) || value <= 0) throw new SourceDomainError();
  if (input.toVerse < input.fromVerse) throw new SourceDomainError();
}
export class CuratedPassageLink implements CuratedPassageLinkProps {
  readonly id: string; readonly excerptId: string; readonly translationId: string; readonly bookCode: string;
  readonly chapter: number; readonly fromVerse: number; readonly toVerse: number;
  readonly nature: 'narrative-parallel'; readonly rationale: string;
  constructor(input: CuratedPassageLinkProps) {
    assertPassageSelection(input); identifier(input.id); identifier(input.excerptId);
    if (input.nature !== 'narrative-parallel' || typeof input.rationale !== 'string' || input.rationale.trim().length === 0) throw new SourceDomainError();
    this.id = input.id; this.excerptId = input.excerptId; this.translationId = input.translationId; this.bookCode = input.bookCode;
    this.chapter = input.chapter; this.fromVerse = input.fromVerse; this.toVerse = input.toVerse; this.nature = input.nature; this.rationale = input.rationale;
    Object.freeze(this);
  }
}
