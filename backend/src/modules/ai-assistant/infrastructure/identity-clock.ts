import type { AiIdentityClockPort } from '../application/analysis-ports';
import { randomUUID } from 'node:crypto';

export class NodeAiIdentityClock implements AiIdentityClockPort {
  newId(): string { return randomUUID(); }
  now(): string { return new Date().toISOString(); }
}
