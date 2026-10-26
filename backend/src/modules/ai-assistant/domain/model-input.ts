export class AiModelInputError extends Error {}

export class AiQuestion {
  readonly text: string;
  constructor(input: string) {
    if (typeof input !== 'string' || /[\uD800-\uDFFF]/u.test(input) || /\p{Cc}/u.test(input.replace(/[\t\r\n]/g, ''))) throw new AiModelInputError();
    const text = input.trim();
    if (!text || new TextEncoder().encode(text).byteLength > 1000) throw new AiModelInputError();
    this.text = text;
    Object.freeze(this);
  }
}

export interface SourceSentenceProps {
  readonly id: string; readonly paragraph: number; readonly start: number; readonly end: number; readonly text: string;
}
export class SourceSentence implements SourceSentenceProps {
  readonly id: string; readonly paragraph: number; readonly start: number; readonly end: number; readonly text: string;
  constructor(input: SourceSentenceProps) {
    if (typeof input.id !== 'string' || input.id.length > 64 || !/^[a-z0-9]/.test(input.id) || /[^a-z0-9-]/.test(input.id)) throw new AiModelInputError();
    if (!Number.isSafeInteger(input.paragraph) || input.paragraph <= 0 || !Number.isSafeInteger(input.start) || input.start < 0 || !Number.isSafeInteger(input.end) || input.end <= input.start) throw new AiModelInputError();
    if (typeof input.text !== 'string' || !input.text.trim() || /[\uD800-\uDFFF]/u.test(input.text) || Array.from(input.text).length !== input.end - input.start) throw new AiModelInputError();
    this.id = input.id; this.paragraph = input.paragraph; this.start = input.start; this.end = input.end; this.text = input.text;
    Object.freeze(this);
  }
}
export function validateContext(context: readonly SourceSentence[]): void {
  if (!Array.isArray(context) || context.length < 1 || context.length > 32) throw new AiModelInputError();
  if (new Set(context.map(sentence => sentence.id)).size !== context.length || context.reduce((bytes, sentence) => bytes + new TextEncoder().encode(sentence.text).byteLength, 0) > 2400) throw new AiModelInputError();
}
export class SourceSelection {
  readonly status: 'supported' | 'insufficient-evidence';
  readonly citationId: string | null;
  readonly sentence: SourceSentence | null;
  constructor(citationId: string | null, context: readonly SourceSentence[]) {
    validateContext(context);
    const sentence = citationId === null ? null : context.find(candidate => candidate.id === citationId);
    if (sentence === undefined) throw new AiModelInputError();
    this.citationId = citationId;
    this.sentence = sentence;
    this.status = citationId === null ? 'insufficient-evidence' : 'supported';
    Object.freeze(this);
  }
}
