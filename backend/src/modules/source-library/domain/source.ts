import { SourcePermissions, type SourcePermissionProps } from './source-permissions';
import { SourceDomainError } from './source-domain-error';
import { assertAbsoluteUrl, assertIdentifier, assertNonBlank, assertSha256 } from './invariants';

export type SourceKind = 'historical-work' | 'modern-study' | 'commentary';
export interface SourceProps {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly translator: string | null;
  readonly language: string;
  readonly edition: string;
  readonly kind: SourceKind;
  readonly originUrl: string;
  readonly snapshotSha256: string;
  readonly retrievedAt: string;
  readonly rightsStatement: string;
  readonly rightsUrl: string;
  readonly attribution: string;
  readonly permissions: SourcePermissionProps;
  readonly limitations: string;
}
export class Source implements SourceProps {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly translator: string | null;
  readonly language: string;
  readonly edition: string;
  readonly kind: SourceKind;
  readonly originUrl: string;
  readonly snapshotSha256: string;
  readonly retrievedAt: string;
  readonly rightsStatement: string;
  readonly rightsUrl: string;
  readonly attribution: string;
  readonly permissions: SourcePermissions;
  readonly limitations: string;
  constructor(input: SourceProps) {
    assertIdentifier(input.id);
    for (const value of [input.title, input.author, input.language, input.edition, input.rightsStatement, input.attribution, input.limitations]) assertNonBlank(value);
    if (input.translator !== null) assertNonBlank(input.translator);
    if (!['historical-work', 'modern-study', 'commentary'].includes(input.kind)) throw new SourceDomainError();
    assertAbsoluteUrl(input.originUrl);
    assertAbsoluteUrl(input.rightsUrl);
    assertSha256(input.snapshotSha256);
    if (!Number.isFinite(Date.parse(input.retrievedAt))) throw new SourceDomainError();
    this.id = input.id;
    this.title = input.title;
    this.author = input.author;
    this.translator = input.translator;
    this.language = input.language;
    this.edition = input.edition;
    this.kind = input.kind;
    this.originUrl = input.originUrl;
    this.snapshotSha256 = input.snapshotSha256;
    this.retrievedAt = input.retrievedAt;
    this.rightsStatement = input.rightsStatement;
    this.rightsUrl = input.rightsUrl;
    this.attribution = input.attribution;
    this.permissions = new SourcePermissions(input.permissions);
    this.limitations = input.limitations;
    Object.freeze(this);
  }
}
