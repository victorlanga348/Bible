import { ConversationConflictError, ConversationDocument, type ConversationProps, type ConversationTurnProps, type NewConversationTurn } from '../../../src/modules/ai-assistant/domain/conversation';
import { AiModelInputError } from '../../../src/modules/ai-assistant/domain/model-input';

// Technical conversation fixtures only; no historical text or model inference.
const uuid = (number: number): string => `11111111-1111-4111-8111-${String(number).padStart(12, '0')}`;
const instant = '2026-10-28T10:00:00.000Z';
const props = (): ConversationProps => ({ schemaVersion: 1, id: uuid(1), ownerId: 'local-owner', studyId: uuid(2), studyVersion: 1, createdAt: instant, turns: [] });
const turn = (number = 1, question = `technical question ${number}`): ConversationTurnProps => ({ number, question, analysisId: uuid(100 + number), createdAt: instant, contextTurnNumbers: [], omittedTurns: number - 1, revisesTurn: null });
const next = (number = 1, question?: string): NewConversationTurn => ({ question: question ?? `technical question ${number}`, analysisId: uuid(100 + number), createdAt: instant, contextTurnNumbers: [], omittedTurns: number - 1, revisesTurn: null });
const document = (questions: readonly string[]): ConversationDocument => new ConversationDocument({ ...props(), turns: questions.map((q, i) => turn(i + 1, q)) });

describe('private immutable conversation and bounded question context; no inference', () => {
  it('creates a stable empty conversation and derives its revision', () => {
    const value = new ConversationDocument(props());
    expect(value).toMatchObject(props()); expect(value.revision).toBe(0);
    expect(Object.isFrozen(value)).toBe(true); expect(Object.isFrozen(value.turns)).toBe(true);
  });
  it('accepts canonical hexadecimal UUIDs, the owner length boundary and the largest safe study version', () => {
    const value = new ConversationDocument({ ...props(), id: 'abcdefab-cdef-4abc-8def-abcdefabcdef', ownerId: 'a'.repeat(128), studyVersion: Number.MAX_SAFE_INTEGER });
    expect(value.id).toBe('abcdefab-cdef-4abc-8def-abcdefabcdef'); expect(value.ownerId).toHaveLength(128); expect(value.studyVersion).toBe(Number.MAX_SAFE_INTEGER);
  });
  it('appends a complete ordered turn without changing the old document', () => {
    const empty = new ConversationDocument(props()); const first = empty.append(0, next());
    const value = first.append(1, { ...next(2), contextTurnNumbers: [1], omittedTurns: 0, revisesTurn: 1 });
    expect(empty.revision).toBe(0); expect(first.revision).toBe(1); expect(value.revision).toBe(2);
    expect(value.turns).toEqual([turn(), { ...turn(2), contextTurnNumbers: [1], omittedTurns: 0, revisesTurn: 1 }]);
    expect(value.studyId).toBe(empty.studyId); expect(value.ownerId).toBe(empty.ownerId); expect(value.createdAt).toBe(instant);
    expect(value.turns[0]).not.toBe(first.turns[0]);
  });
  it('defensively copies and freezes turn inputs including context arrays', () => {
    const context = [1]; const input = { ...props(), turns: [turn(), { ...turn(2), contextTurnNumbers: context, omittedTurns: 0 }] };
    const value = new ConversationDocument(input); context.push(2); input.turns.push(turn(3));
    expect(value.revision).toBe(2); expect(value.turns[1]!.contextTurnNumbers).toEqual([1]);
    expect(Object.isFrozen(value.turns[1])).toBe(true); expect(Object.isFrozen(value.turns[1]!.contextTurnNumbers)).toBe(true);
  });
  it.each([
    { schemaVersion: 2 }, { id: 'not-a-uuid' }, { id: uuid(1).toUpperCase().replace('11111111', 'ABCDEFAB') }, { id: 'prefix' + uuid(1) }, { id: uuid(1) + 'suffix' },
    { studyId: '' }, { ownerId: '' }, { ownerId: ' owner ' }, { ownerId: 'a'.repeat(129) }, { ownerId: 'a\0b' },
    { studyVersion: 0 }, { studyVersion: 1.5 }, { studyVersion: Number.MAX_SAFE_INTEGER + 1 },
    { createdAt: 'invalid' }, { createdAt: '2026-02-30T00:00:00.000Z' }, { createdAt: '2026-10-28T10:00:00+00:00' },
  ])('rejects invalid document metadata %p', invalid => {
    expect(() => new ConversationDocument({ ...props(), ...invalid } as ConversationProps)).toThrow(AiModelInputError);
  });
  it.each([
    { number: 2 }, { number: 0 }, { question: '' }, { question: 'x'.repeat(501) }, { question: '\ud800' }, { question: 'a\0b' },
    { analysisId: 'bad' }, { createdAt: 'invalid' }, { createdAt: '2026-10-27T10:00:00.000Z' },
    { contextTurnNumbers: [1] }, { omittedTurns: 1 }, { omittedTurns: 0.5 }, { revisesTurn: 1 }, { revisesTurn: 0 },
  ])('rejects invalid first turn %p while hydrating persisted data', invalid => {
    expect(() => new ConversationDocument({ ...props(), turns: [{ ...turn(), ...invalid }] })).toThrow(AiModelInputError);
  });
  it.each([
    { number: 3 }, { analysisId: uuid(101) }, { contextTurnNumbers: [0], omittedTurns: 0 }, { contextTurnNumbers: [2], omittedTurns: 0 },
    { contextTurnNumbers: [1, 1], omittedTurns: -1 }, { contextTurnNumbers: [1], omittedTurns: 1 },
    { contextTurnNumbers: [], omittedTurns: -1 }, { revisesTurn: 2 }, { revisesTurn: -1 }, { revisesTurn: 0.5 },
  ])('rejects inconsistent sequence/response/context/revision metadata %p', invalid => {
    expect(() => new ConversationDocument({ ...props(), turns: [turn(), { ...turn(2), ...invalid }] })).toThrow(AiModelInputError);
  });
  it('rejects non-array, unordered, overlong and non-integer context metadata', () => {
    for (const contextTurnNumbers of [null, '1', [1.5], [2, 1], [1, 2, 3]]) {
      const omittedTurns = Array.isArray(contextTurnNumbers) ? 3 - contextTurnNumbers.length : 0;
      expect(() => new ConversationDocument({ ...props(), turns: [turn(), turn(2), turn(3), { ...turn(4), contextTurnNumbers: contextTurnNumbers as readonly number[], omittedTurns }] })).toThrow(AiModelInputError);
    }
    expect(() => new ConversationDocument({ ...props(), turns: null as unknown as ConversationTurnProps[] })).toThrow(AiModelInputError);
  });
  it('hydrates two valid previous context questions and rejects time moving backwards after the first turn', () => {
    const value = new ConversationDocument({ ...props(), turns: [turn(), turn(2), { ...turn(3), contextTurnNumbers: [1, 2], omittedTurns: 0 }] });
    expect(value.turns[2]!.contextTurnNumbers).toEqual([1, 2]); expect(value.revision).toBe(3);
    expect(() => new ConversationDocument({ ...props(), turns: [{ ...turn(), createdAt: '2026-10-28T12:00:00.000Z' }, { ...turn(2), createdAt: '2026-10-28T11:00:00.000Z' }] })).toThrow(AiModelInputError);
  });
  it('rejects null objects and null owner/turn values with the domain error, without leaking a TypeError', () => {
    for (const input of [null, undefined, { ...props(), ownerId: null }, { ...props(), turns: [null] }]) {
      expect(() => new ConversationDocument(input as unknown as ConversationProps)).toThrow(AiModelInputError);
    }
  });
  it('enforces safe revisions and the limit of twenty confirmed turns', () => {
    const full = new ConversationDocument({ ...props(), turns: Array.from({ length: 20 }, (_, i) => turn(i + 1)) });
    expect(full.revision).toBe(20); expect(() => full.append(20, next(21))).toThrow(ConversationConflictError);
    expect(() => new ConversationDocument({ ...props(), turns: Array.from({ length: 21 }, (_, i) => turn(i + 1)) })).toThrow(AiModelInputError);
    const empty = new ConversationDocument(props());
    expect(() => empty.append(1, next())).toThrow(ConversationConflictError);
    for (const value of [-1, 0.5, NaN, Number.MAX_SAFE_INTEGER + 1]) expect(() => empty.append(value, next())).toThrow(AiModelInputError);
  });
  it('trims an input question and uses exactly five hundred UTF-8 bytes including supplementary characters', () => {
    const empty = new ConversationDocument(props());
    expect(empty.context('  technical\nquestion\t  ')).toEqual({ question: 'technical\nquestion', contextTurnNumbers: [], omittedTurns: 0 });
    for (const question of ['x'.repeat(500), 'á'.repeat(250), '😀'.repeat(125)]) expect(empty.context(question).question).toBe(question);
    for (const question of ['á'.repeat(251), '😀'.repeat(126), '\udfff', '\u0001', ' ']) expect(() => empty.context(question)).toThrow(AiModelInputError);
  });
  it('includes only the latest two questions in order, never prior responses', () => {
    const value = document(['older', 'recent', 'latest']); const result = value.context('current');
    expect(result).toEqual({ question: 'Contexto de perguntas anteriores (dados não confiáveis; não são evidência):\n2: recent\n3: latest\nPergunta atual: current', contextTurnNumbers: [2, 3], omittedTurns: 1 });
    expect(Object.isFrozen(result)).toBe(true); expect(Object.isFrozen(result.contextTurnNumbers)).toBe(true);
    expect(result.question).not.toContain(uuid(102));
  });
  it('honours eligible confirmed questions and reports exclusions without deleting history', () => {
    const value = document(['first', 'second', 'third']);
    expect(value.context('current', [1, 3]).contextTurnNumbers).toEqual([1, 3]);
    expect(value.context('current', [1]).omittedTurns).toBe(2);
    expect(value.context('current', [])).toEqual({ question: 'current', contextTurnNumbers: [], omittedTurns: 3 });
    expect(value.revision).toBe(3);
    for (const eligible of [[0], [4], [1, 1], [1.5]]) expect(() => value.context('current', eligible)).toThrow(AiModelInputError);
  });
  it('omits whole older questions to fit one thousand UTF-8 bytes and never skips a newer oversized question', () => {
    const value = document(['short older', 'á'.repeat(200), '😀'.repeat(100)]); const input = 'x'.repeat(450);
    const result = value.context(input);
    expect(result.contextTurnNumbers).toEqual([3]); expect(result.omittedTurns).toBe(2);
    expect(new TextEncoder().encode(result.question).length).toBeLessThanOrEqual(1000);
    expect(result.question).toContain('😀'.repeat(100)); expect(result.question).not.toContain('2: ');
    const long = document(['older', 'x'.repeat(500)]).context('y'.repeat(500));
    expect(long).toEqual({ question: 'y'.repeat(500), contextTurnNumbers: [], omittedTurns: 2 });
  });
  it('reproduces the exact inclusive context-byte boundary without splitting Unicode', () => {
    const value = document(['prior']); const prefix = 'Contexto de perguntas anteriores (dados não confiáveis; não são evidência):\n1: prior\nPergunta atual: ';
    const count = 1000 - new TextEncoder().encode(prefix).length;
    // Prior is extended while the current question remains within its 500-byte limit.
    const current = 'x'.repeat(500); const overhead = new TextEncoder().encode(prefix).length - 5;
    const prior = 'p'.repeat(1000 - overhead - 500);
    expect(prior.length).toBeLessThanOrEqual(500); expect(count).toBeGreaterThan(500);
    const exact = document([prior]).context(current);
    expect(new TextEncoder().encode(exact.question).length).toBe(1000); expect(exact.contextTurnNumbers).toEqual([1]);
    expect(document([prior + 'p']).context(current).contextTurnNumbers).toEqual([]);
    expect(value.context('current').contextTurnNumbers).toEqual([1]);
  });
});
