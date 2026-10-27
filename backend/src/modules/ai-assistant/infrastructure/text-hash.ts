import type { AiTextHashPort } from '../application/analysis-ports';
import { createHash } from 'node:crypto';

export class NodeAiTextHash implements AiTextHashPort { sha256(text: string): string { return createHash('sha256').update(text).digest('hex'); } }
