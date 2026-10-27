import { readFileSync } from 'node:fs';
import { AiModelInputError } from '../../../src/modules/ai-assistant/domain/model-input';
import { segmentSourceText } from '../../../src/modules/ai-assistant/domain/source-segments';

describe('pure source segmentation; genuine source fixture is read only, never sent to AI', () => {
  const fixture = JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json', 'utf8')) as { order: number; text: string }[];
  it('segments the four authenticated paragraphs into exactly3+2+1+5 original spans', () => {
    expect(fixture).toHaveLength(4);
    const groups = fixture.map(excerpt => segmentSourceText(excerpt.order, excerpt.text));
    expect(groups.map(group => group.length)).toEqual([3, 2, 1, 5]);
    expect(groups.flat()).toHaveLength(11);
    groups.forEach((group, index) => {
      const original = Array.from(fixture[index]!.text);
      group.forEach((segment, ordinal) => {
        expect(segment).toEqual({ id: `p${index + 1}-c${ordinal + 1}`, paragraph: index + 1, start: ordinal * 900, end: Math.min(original.length, ordinal * 900 + 1000), text: original.slice(ordinal * 900, ordinal * 900 + 1000).join('') });
      });
      expect(group.at(-1)!.end).toBe(original.length);
    });
  });
  it.each([[1, 1], [1000, 1], [1001, 2], [1900, 2], [1901, 3]])('preserves exact technical length%p without redundant trailing overlap (%p segments)', (length, count) => {
    const original = 'x'.repeat(length); const segments = segmentSourceText(2, original);
    expect(segments).toHaveLength(count);
    expect(segments[0]!.start).toBe(0); expect(segments.at(-1)!.end).toBe(length);
    for (let i = 1; i < segments.length; i++) {
      expect(segments[i]!.start).toBe(segments[i - 1]!.end - 100);
      expect(segments[i - 1]!.text.slice(-100)).toBe(segments[i]!.text.slice(0, 100));
    }
  });
  it('counts technical supplementary characters as one codepoint and never splits a surrogate pair', () => {
    const segments = segmentSourceText(3, '😀'.repeat(1001));
    expect(segments).toEqual([
      { id: 'p3-c1', paragraph: 3, start: 0, end: 1000, text: '😀'.repeat(1000) },
      { id: 'p3-c2', paragraph: 3, start: 900, end: 1001, text: '😀'.repeat(101) },
    ]);
  });
  it('preserves all source whitespace without trimming or rewriting content', () => {
    const original = ' \ttechnical α😀 text\r\n ';
    expect(segmentSourceText(1, original)).toEqual([{ id: 'p1-c1', paragraph: 1, start: 0, end: Array.from(original).length, text: original }]);
  });
  it('freezes the segment collection and every value', () => {
    const segments = segmentSourceText(1, 'technical');
    expect(Object.isFrozen(segments)).toBe(true); expect(Object.isFrozen(segments[0])).toBe(true);
    expect(Reflect.set(segments[0]!, 'start', 99)).toBe(false);
  });
  it('accepts a safe positive paragraph ordinal without silently coercing it', () => {
    expect(segmentSourceText(Number.MAX_SAFE_INTEGER, 'technical')[0]!.id).toBe('p9007199254740991-c1');
  });
  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1', null])('rejects invalid paragraph ordinal %p', value => {
    expect(() => segmentSourceText(value as number, 'technical')).toThrow(AiModelInputError);
  });
  it.each(['', ' \t\r\n', '\ud800', '\udfff', null, 12, {}])('rejects blank, malformed scalar text or nonstring input %p', value => {
    expect(() => segmentSourceText(1, value as string)).toThrow(AiModelInputError);
  });
});
