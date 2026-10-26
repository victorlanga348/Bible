import { AiModelInputError, AiQuestion } from '../../../src/modules/ai-assistant/domain/model-input';

describe('bounded local AI question, using technical text only', () => {
  it('trims outer whitespace while preserving the question meaning and internal whitespace', () => {
    expect(new AiQuestion(' \n  teste técnico\tlocal\r\nseguinte  ').text).toBe('teste técnico\tlocal\r\nseguinte');
  });
  it.each(['a'.repeat(1000), 'é'.repeat(500), '😀'.repeat(250)])('accepts the exact 1000 UTF-8 byte boundary (%#. technical value)', value => {
    expect(new TextEncoder().encode(value).byteLength).toBe(1000);
    expect(new AiQuestion(value).text).toBe(value);
  });
  it.each([
    ['missing', undefined], ['null', null], ['number', 12], ['boolean', false], ['object', {}],
    ['empty', ''], ['blank', ' \n\r\t '], ['over ASCII bytes', 'a'.repeat(1001)],
    ['over UTF-8 bytes', 'é'.repeat(500) + 'a'], ['unpaired high surrogate', 'test\ud800'], ['unpaired low surrogate', '\udc00test'],
  ])('rejects %s with a domain error', (_label, value) => {
    expect(() => new AiQuestion(value as string)).toThrow(AiModelInputError);
  });
  it.each(['\u0000', '\u0008', '\u000b', '\u000c', '\u001b', '\u001f', '\u007f', '\u0085', '\u009f'])('rejects an embedded control %j', control => {
    expect(() => new AiQuestion('technical' + control + 'question')).toThrow(AiModelInputError);
  });
  it('keeps the accepted value immutable after construction', () => {
    const question = new AiQuestion('technical question');
    expect(Reflect.set(question, 'text', 'changed')).toBe(false);
    expect(question.text).toBe('technical question');
    expect(Object.isFrozen(question)).toBe(true);
  });
});
