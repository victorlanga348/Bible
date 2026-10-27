import { readFileSync } from 'node:fs';
import { AiModelInputError, SourceSentence, validateContext, type SourceSentenceProps } from '../../../src/modules/ai-assistant/domain/model-input';

const original = (JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json', 'utf8')) as { text: string }[])[0]!.text;
const quote = original.slice(0, original.indexOf('.') + 1);
const props = (): SourceSentenceProps => ({ id: 'p1-s1', paragraph: 1, start: 0, end: Array.from(quote).length, text: quote });
const technical = (id = 'technical-s1', text = 'technical') => new SourceSentence({ id, paragraph: 1, start: 0, end: Array.from(text).length, text });

describe('unchanged source spans and bounded model context', () => {
  it('preserves a genuine source sentence, locator ordinal and original offsets', () => {
    const sentence = new SourceSentence(props());
    expect(sentence).toEqual(props());
    expect(original.slice(sentence.start, sentence.end)).toBe(sentence.text);
  });
  it('copies and freezes source metadata without rewriting text', () => {
    const input = props(); const sentence = new SourceSentence(input);
    Reflect.set(input, 'text', 'technical changed value');
    expect(sentence.text).toBe(quote);
    expect(Reflect.set(sentence, 'paragraph', 2)).toBe(false);
    expect(Object.isFrozen(sentence)).toBe(true);
  });
  it.each(['', 'UPPER', '-leading', 'with space', '../path', 'trailing\n', 'a'.repeat(65), '😀', undefined])('rejects unsafe sentence identity %p', id => {
    expect(() => new SourceSentence({ ...props(), id: id as string })).toThrow(AiModelInputError);
  });
  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects ordinal %p', paragraph => {
    expect(() => new SourceSentence({ ...props(), paragraph })).toThrow(AiModelInputError);
  });
  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects start offset %p', start => {
    expect(() => new SourceSentence({ ...props(), start })).toThrow(AiModelInputError);
  });
  it.each([-1, 0, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid end offset %p', end => {
    expect(() => new SourceSentence({ ...props(), end })).toThrow(AiModelInputError);
  });
  it('rejects a span whose offsets cannot identify its exact text', () => {
    expect(() => new SourceSentence({ ...props(), end: props().end + 1 })).toThrow(AiModelInputError);
  });
  it('rejects a negative start even when the span length is otherwise coherent (mutation regression)', () => {
    expect(() => new SourceSentence({ ...props(), start: -1, end: props().end - 1 })).toThrow(AiModelInputError);
  });
  it('counts original offsets in codepoints instead of UTF-16 units for technical Unicode text', () => {
    const input = { id: 'technical-s1', paragraph: 1, start: 7, end: 9, text: '😀x' };
    expect(new SourceSentence(input)).toEqual(input);
    expect(() => new SourceSentence({ ...input, end: 10 })).toThrow(AiModelInputError);
  });
  it.each([['blank', ' ', 1], ['non-text', 12, 2], ['unpaired surrogate', 'bad\ud800', 4]] as const)('rejects %s source text', (_label, text, end) => {
    expect(() => new SourceSentence({ ...props(), text: text as string, end })).toThrow(AiModelInputError);
  });
  it('accepts safe boundary identities and nonzero original offsets', () => {
    expect(new SourceSentence({ ...props(), id: 'a'.repeat(64), paragraph: Number.MAX_SAFE_INTEGER, start: 3, end: props().end + 3 }).id).toHaveLength(64);
  });
  it('accepts a genuine context and exactly 32 unique technical sentence identities', () => {
    expect(() => validateContext([new SourceSentence(props())])).not.toThrow();
    expect(() => validateContext(Array.from({ length: 32 }, (_, index) => technical('technical-' + index)))).not.toThrow();
  });
  it('enforces total UTF-8 context bytes at the exact 2400-byte boundary', () => {
    expect(() => validateContext([technical('technical-a', 'é'.repeat(600)), technical('technical-b', '😀'.repeat(300))])).not.toThrow();
    expect(() => validateContext([technical('technical-a', 'é'.repeat(600)), technical('technical-b', '😀'.repeat(300) + 'a')])).toThrow(AiModelInputError);
  });
  it('rejects empty, oversized or ambiguous contexts before inference', () => {
    expect(() => validateContext([])).toThrow(AiModelInputError);
    expect(() => validateContext(Array.from({ length: 33 }, (_, index) => technical('technical-' + index)))).toThrow(AiModelInputError);
    expect(() => validateContext([technical(), technical()])).toThrow(AiModelInputError);
  });
  it.each([null, undefined, {}])('rejects non-array context %p as a domain error', value => {
    expect(() => validateContext(value as unknown as SourceSentence[])).toThrow(AiModelInputError);
  });
});
