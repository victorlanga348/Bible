import { SourceDomainError } from './source-domain-error';

export type PermissionStatus = 'allowed' | 'pending' | 'denied';
export interface SourcePermissionProps {
  readonly ingest: PermissionStatus;
  readonly store: PermissionStatus;
  readonly index: PermissionStatus;
  readonly display: PermissionStatus;
  readonly quote: PermissionStatus;
  readonly sendToAi: PermissionStatus;
}

export class SourcePermissions implements SourcePermissionProps {
  readonly ingest: PermissionStatus;
  readonly store: PermissionStatus;
  readonly index: PermissionStatus;
  readonly display: PermissionStatus;
  readonly quote: PermissionStatus;
  readonly sendToAi: PermissionStatus;
  constructor(input: SourcePermissionProps) {
    for (const key of ['ingest', 'store', 'index', 'display', 'quote', 'sendToAi'] as const) {
      if (!['allowed', 'pending', 'denied'].includes(input[key])) throw new SourceDomainError();
    }
    this.ingest = input.ingest;
    this.store = input.store;
    this.index = input.index;
    this.display = input.display;
    this.quote = input.quote;
    this.sendToAi = input.sendToAi;
    Object.freeze(this);
  }

  canIngest(): boolean { return this.ingest === 'allowed' && this.store === 'allowed'; }
  canRead(): boolean { return this.display === 'allowed' && this.quote === 'allowed'; }
  canSearch(): boolean { return this.index === 'allowed' && this.canRead(); }
}
