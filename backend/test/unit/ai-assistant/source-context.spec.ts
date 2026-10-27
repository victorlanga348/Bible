import { readFileSync } from 'node:fs';
import { AiModelInputError, SourceSentence } from '../../../src/modules/ai-assistant/domain/model-input';
import { selectSourceContext, splitSourceSentences } from '../../../src/modules/ai-assistant/domain/source-context';
import { segmentSourceText } from '../../../src/modules/ai-assistant/domain/source-segments';

describe('original sentence spans and bounded retrieval context; no inference', () => {
  const fixture = JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json', 'utf8')) as { order: number; text: string }[];
  const sentence = (paragraph: number, ordinal: number, start: number, text: string): SourceSentence => new SourceSentence({ id: `p${paragraph}-s${ordinal}`, paragraph, start, end: start + Array.from(text).length, text });
  it('preserves the authentic 11/5/5/13 sentences, stable identifiers and exact original codepoint offsets', () => {
    const groups = fixture.map(excerpt => splitSourceSentences(excerpt.order, excerpt.text));
    expect(groups.map(group => group.length)).toEqual([11, 5, 5, 13]);
    groups.forEach((group, index) => group.forEach((value, ordinal) => {
      expect(value.id).toBe(`p${index + 1}-s${ordinal + 1}`);
      expect(value.paragraph).toBe(index + 1);
      expect(Array.from(fixture[index]!.text).slice(value.start, value.end).join('')).toBe(value.text);
      expect(Object.isFrozen(value)).toBe(true);
    }));
    expect(groups[0]![10]!.text).toContain('Sabbath');
    expect(Object.isFrozen(groups[0])).toBe(true);
  });
  it('splits punctuation only at whitespace/end and preserves supplementary character offsets, interior spaces and final unpunctuated text', () => {
    const text = ' \t😀A.b!\r\n  C  D?  E\nF.\t Final 😀 tail  ';
    const values = splitSourceSentences(2, text);
    expect(values.map(value => value.text)).toEqual(['😀A.b!', 'C  D?', 'E\nF.', 'Final 😀 tail']);
    expect(values.map(value => [value.start, value.end])).toEqual([[2, 7], [11, 16], [18, 22], [24, 36]]);
    values.forEach(value => expect(Array.from(text).slice(value.start, value.end).join('')).toBe(value.text));
  });
  it.each([0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1])('rejects invalid paragraph %p before sentence extraction', paragraph => {
    expect(() => splitSourceSentences(paragraph, 'technical')).toThrow(AiModelInputError);
  });
  it.each(['', ' \n', '\ud800', '\udfff', null, 3])('rejects invalid source text %p', text => {
    expect(() => splitSourceSentences(1, text as string)).toThrow(AiModelInputError);
  });
  it('expands whole intersecting sentences, ranks before offsets, deduplicates overlap and ignores the third retrieval', () => {
    const text = fixture[0]!.text; const segments = segmentSourceText(1, text); const sentences = splitSourceSentences(1, text);
    const selected = selectSourceContext([2, 1, 0].map(index => ({ segment: segments[index]!, sentences })));
    const expected = [...sentences.filter(value => value.end > 1800), ...sentences.filter(value => value.end > 900 && value.start < 1900 && value.end <= 1800)];
    expect(selected).toEqual(expected);
    expect(selected.slice(0, 3).map(value => value.id)).toEqual(['p1-s9', 'p1-s10', 'p1-s11']);
    expect(selected[2]!.text).toContain('Sabbath');
    expect(selected.some(value => value.id === 'p1-s1')).toBe(false);
    expect(new Set(selected.map(value => value.id)).size).toBe(selected.length);
    expect(Object.isFrozen(selected)).toBe(true);
  });
  it('counts UTF-8 bytes, accepts exactly2400, omits whole oversized sentences and continues to later sentences', () => {
    const sentences = [sentence(1, 1, 0, '😀'.repeat(601)), sentence(1, 2, 2404, 'é'.repeat(1200)), sentence(1, 3, 3604, 'x')];
    const selected = selectSourceContext([{ segment: { id: 'p1-c1', paragraph: 1, start: 0, end: 4000, text: '' }, sentences }]);
    expect(selected).toEqual([sentences[1]]);
    expect(new TextEncoder().encode(selected[0]!.text)).toHaveLength(2400);
    expect(sentences[0]!.text).toHaveLength(1202);
  });
  it('does not include sentences merely touching a segment boundary or from another paragraph, and sorts candidates by source offset', () => {
    const values = [sentence(1, 4, 200, 'after'), sentence(1, 3, 195, 'crossing'), sentence(1, 1, 90, '1234567890'), sentence(1, 2, 100, 'inside'), sentence(2, 1, 110, 'foreign')];
    const selected = selectSourceContext([{ segment: { id: 'p1-c1', paragraph: 1, start: 100, end: 200, text: '' }, sentences: values }]);
    expect(selected).toEqual([values[3], values[1]]);
  });
  it('omits the duplicate ID in a second segment without consuming its byte budget twice', () => {
    const value = sentence(1, 1, 0, 'x'.repeat(1300)); const second = sentence(1, 2, 1300, 'y'.repeat(1000));
    const segment = { id: 'p1-c1', paragraph: 1, start: 0, end: 2300, text: '' };
    expect(selectSourceContext([{ segment, sentences: [value] }, { segment, sentences: [value, second] }])).toEqual([value, second]);
  });
  it('returns an immutable empty context when no whole sentence fits', () => {
    const value = sentence(1, 1, 0, 'x'.repeat(2401));
    const selected = selectSourceContext([{ segment: { id: 'p1-c1', paragraph: 1, start: 0, end: 1000, text: '' }, sentences: [value] }]);
    expect(selected).toEqual([]); expect(Object.isFrozen(selected)).toBe(true);
    expect(selectSourceContext([])).toEqual([]);
  });
  it('caps the deterministic context at32 sentences accepted by the provider', () => {
    const values = Array.from({ length: 33 }, (_, index) => sentence(1, index + 1, index * 2, 'x'));
    expect(selectSourceContext([{ segment: { id: 'p1-c1', paragraph: 1, start: 0, end: 1000, text: '' }, sentences: values }])).toEqual(values.slice(0, 32));
  });
});
