import { SourceSentence } from './model-input';
import { assertSourceText, type SourceSegment } from './source-segments';

export interface SourceContextCandidate { readonly segment: SourceSegment; readonly sentences: readonly SourceSentence[] }

export function splitSourceSentences(paragraph: number, text: string): readonly SourceSentence[] {
  assertSourceText(paragraph, text);
  return Object.freeze([...text.matchAll(/\S[\s\S]*?(?:[.!?](?=\s|$)|$)/gu)].map((match, index) => {
    const value = match[0].trimEnd();
    const start = Array.from(text.slice(0, match.index)).length;
    return new SourceSentence({ id: `p${paragraph}-s${index + 1}`, paragraph, start, end: start + Array.from(value).length, text: value });
  }));
}

export function selectSourceContext(ranked: readonly SourceContextCandidate[]): readonly SourceSentence[] {
  const selected: SourceSentence[] = [];
  const seen = new Set<string>();
  let bytes = 0;
  for (const { segment, sentences } of ranked.slice(0, 2)) {
    for (const sentence of [...sentences].sort((left, right) => left.start - right.start)) {
      if (sentence.paragraph !== segment.paragraph || sentence.start >= segment.end || sentence.end <= segment.start || seen.has(sentence.id)) continue;
      const size = new TextEncoder().encode(sentence.text).byteLength;
      if (bytes + size > 2400 || selected.length === 32) continue;
      selected.push(sentence); seen.add(sentence.id); bytes += size;
    }
  }
  return Object.freeze(selected);
}
