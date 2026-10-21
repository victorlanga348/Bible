import { SourceDomainError } from './source-domain-error';
import { assertAbsoluteUrl, assertIdentifier, assertNonBlank, assertSha256 } from './invariants';

export interface SourceExcerptProps {
  readonly id: string;
  readonly sourceId: string;
  readonly locator: string;
  readonly order: number;
  readonly text: string;
  readonly textSha256: string;
  readonly originUrl: string | null;
}
export class SourceExcerpt implements SourceExcerptProps {
  readonly id: string;
  readonly sourceId: string;
  readonly locator: string;
  readonly order: number;
  readonly text: string;
  readonly textSha256: string;
  readonly originUrl: string | null;
  constructor(input: SourceExcerptProps) {
    assertIdentifier(input.id);
    assertIdentifier(input.sourceId);
    assertNonBlank(input.locator);
    assertNonBlank(input.text);
    if (!Number.isSafeInteger(input.order) || input.order <= 0) throw new SourceDomainError();
    assertSha256(input.textSha256);
    if (input.originUrl !== null) assertAbsoluteUrl(input.originUrl);
    this.id = input.id;
    this.sourceId = input.sourceId;
    this.locator = input.locator;
    this.order = input.order;
    this.text = input.text;
    this.textSha256 = input.textSha256;
    this.originUrl = input.originUrl;
    Object.freeze(this);
  }
}
