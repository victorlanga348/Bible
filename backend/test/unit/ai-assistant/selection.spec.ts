import { AiModelInputError, SourceSelection, SourceSentence } from '../../../src/modules/ai-assistant/domain/model-input';

// Technical protocol data; these sentences are not historical sources.
const first = () => new SourceSentence({ id: 'technical-s1', paragraph: 1, start: 0, end: 5, text: 'first' });
const second = () => new SourceSentence({ id: 'technical-s2', paragraph: 2, start: 7, end: 13, text: 'second' });

describe('model selection is bound to the supplied context', () => {
  it('resolves only the selected supplied sentence without changing its content', () => {
    const context = [first(), second()];
    const selected = new SourceSelection('technical-s2', context);
    expect(selected.status).toBe('supported');
    expect(selected.citationId).toBe('technical-s2');
    expect(selected.sentence).toBe(context[1]);
  });
  it('derives insufficiency from null and emits no citation', () => {
    const selected = new SourceSelection(null, [first()]);
    expect(selected.status).toBe('insufficient-evidence');
    expect(selected.citationId).toBeNull();
    expect(selected.sentence).toBeNull();
  });
  it.each(['missing', '', 'technical-s3', 12, undefined, false])('rejects a fabricated/invalid selection %p', value => {
    expect(() => new SourceSelection(value as string, [first(), second()])).toThrow(AiModelInputError);
  });
  it('rejects ambiguity or missing context even when the model abstains', () => {
    expect(() => new SourceSelection(null, [])).toThrow(AiModelInputError);
    expect(() => new SourceSelection(null, [first(), first()])).toThrow(AiModelInputError);
  });
  it('cannot be changed or rebound by later caller writes', () => {
    const context = [first(), second()];
    const selected = new SourceSelection('technical-s1', context);
    context[0] = second();
    expect(selected.sentence?.text).toBe('first');
    expect(Reflect.set(selected, 'citationId', 'technical-s2')).toBe(false);
    expect(Object.isFrozen(selected)).toBe(true);
  });
});
