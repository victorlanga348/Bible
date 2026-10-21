import { CanonDomainError } from './canon-domain-error';

export function assertTranslationId(value: string): void {
  if (!/^[a-z0-9]/.test(value) || /[^a-z0-9-]/.test(value)) throw new CanonDomainError();
}

export function normaliseBookCode(value: string): string {
  if (value.length !== 3 || /[^A-Za-z0-9]/.test(value)) throw new CanonDomainError();
  return value.toUpperCase();
}

export function assertPositiveInteger(value: number): void {
  if (!Number.isSafeInteger(value) || value <= 0) throw new CanonDomainError();
}

export function assertNonBlank(value: string): void {
  if (value.trim().length === 0) throw new CanonDomainError();
}
