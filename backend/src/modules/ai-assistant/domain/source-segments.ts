import { AiModelInputError } from './model-input';

export interface SourceSegment {
  readonly id: string; readonly paragraph: number; readonly start: number; readonly end: number; readonly text: string;
}

export function assertSourceText(paragraph: number, text: string): void {
  if (!Number.isSafeInteger(paragraph) || paragraph <= 0 || typeof text !== 'string' || !text.trim() || /[\uD800-\uDFFF]/u.test(text)) throw new AiModelInputError();
}

export function segmentSourceText(paragraph: number, text: string): readonly SourceSegment[] {
  assertSourceText(paragraph, text);
  const points = Array.from(text);
  const segments: SourceSegment[] = [];
  for (let start = 0; start < points.length; start += 900) {
    const end = Math.min(start + 1000, points.length);
    segments.push(Object.freeze({ id: `p${paragraph}-c${segments.length + 1}`, paragraph, start, end, text: points.slice(start, end).join('') }));
    if (end === points.length) break;
  }
  return Object.freeze(segments);
}
