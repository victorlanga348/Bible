export interface TranslationProps {
  readonly id: string;
  readonly name: string;
  readonly language: string;
  readonly canonId: string;
  readonly sourceUrl: string;
  readonly sourceSha256: string;
  readonly retrievedAt: string;
  readonly licenseId: string;
  readonly licenseUrl: string;
  readonly attribution: string;
}
export class Translation implements TranslationProps {
  readonly id: string;
  readonly name: string;
  readonly language: string;
  readonly canonId: string;
  readonly sourceUrl: string;
  readonly sourceSha256: string;
  readonly retrievedAt: string;
  readonly licenseId: string;
  readonly licenseUrl: string;
  readonly attribution: string;

  constructor(input: TranslationProps) {
    assertTranslationId(input.id);
    for (const value of [input.name, input.language, input.canonId, input.licenseId, input.attribution]) assertNonBlank(value);
    if (!URL.canParse(input.sourceUrl) || !URL.canParse(input.licenseUrl)) throw new CanonDomainError();
    if (!Number.isFinite(Date.parse(input.retrievedAt))) throw new CanonDomainError();
    if (input.sourceSha256.length !== 64 || /[^a-fA-F0-9]/.test(input.sourceSha256)) throw new CanonDomainError();
    this.id = input.id;
    this.name = input.name;
    this.language = input.language;
    this.canonId = input.canonId;
    this.sourceUrl = input.sourceUrl;
    this.sourceSha256 = input.sourceSha256.toLowerCase();
    this.retrievedAt = input.retrievedAt;
    this.licenseId = input.licenseId;
    this.licenseUrl = input.licenseUrl;
    this.attribution = input.attribution;
    Object.freeze(this);
  }
}
import { CanonDomainError } from './canon-domain-error';
import { assertNonBlank, assertTranslationId } from './invariants';

