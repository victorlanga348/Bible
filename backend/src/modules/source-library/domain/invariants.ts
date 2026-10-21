import { SourceDomainError } from './source-domain-error';

export function assertNonBlank(value: string): void {
  if (value.trim().length === 0) throw new SourceDomainError();
}

export function assertIdentifier(value: string): void {
  if (value.length === 0 || /[^a-z0-9-]/.test(value)) throw new SourceDomainError();
}

export function assertSha256(value: string): void {
  if (value.length !== 64 || /[^a-fA-F0-9]/.test(value)) throw new SourceDomainError();
}

export function assertAbsoluteUrl(value: string): void {
  if (!URL.canParse(value)) throw new SourceDomainError();
}
