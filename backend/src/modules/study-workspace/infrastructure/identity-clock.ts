import { randomUUID } from 'node:crypto';
import type { WorkspaceIdentityClockPort } from '../application/ports';
export class NodeWorkspaceIdentityClock implements WorkspaceIdentityClockPort { id(): string { return randomUUID(); } now(): string { return new Date().toISOString(); } }
