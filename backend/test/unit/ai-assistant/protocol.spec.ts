import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { AiModelInputError, SourceSentence } from '../../../src/modules/ai-assistant/domain/model-input';
import { AiResultRejectedError, AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import { decodeEmbeddingBatch, decodeGeneratedSelection } from '../../../src/modules/ai-assistant/infrastructure/protocol';
import type { LocalModelProfile } from '../../../src/modules/ai-assistant/infrastructure/profile';

const path = 'test/fixtures/ai-assistant/protocol/';
const read = (name: string) => JSON.parse(readFileSync(path + name + '.json', 'utf8'));
const profile = JSON.parse(readFileSync('admissions/local-extractive-v1.json', 'utf8')) as LocalModelProfile;
const context = () => [new SourceSentence({ id: 'p1-s11', paragraph: 1, start: 0, end: 9, text: 'technical' })];
const parseSelection = (raw: unknown) => decodeGeneratedSelection(raw, context(), profile, '9ff0d7e90');
const parseEmbedding = (raw: unknown) => decodeEmbeddingBatch(raw, 2, profile, '9ff0d7e90');

describe('recorded native protocol is a parser fixture, never live AI proof', () => {
  it('conserves all three recording digests and their test-only scope', () => {
    const manifest = read('manifest') as { newInference: boolean; productionSeed: boolean; sendFixtureToAi: boolean; files: { file: string; sha256: string }[] };
    expect([manifest.newInference, manifest.productionSeed, manifest.sendFixtureToAi]).toEqual([false, false, false]);
    for (const file of manifest.files) expect(createHash('sha256').update(readFileSync(path + file.file)).digest('hex')).toBe(file.sha256);
  });
  it('decodes the recorded ID and real usage but resolves only the supplied technical span', () => {
    const output = parseSelection(read('selection-actual'));
    expect(output.selection.status).toBe('supported');
    expect(output.selection.sentence?.text).toBe('technical');
    expect(output.usage).toEqual({ promptTokens: 818, completionTokens: 11, totalTokens: 829 });
    expect(output.provenance).toEqual({ profileId: profile.id, modelId: profile.generation.id, modelSha256: profile.generation.sha256, runtimeVersion: '9ff0d7e90', promptVersion: profile.promptVersion, dimensions: null, contextLimit: 2048, outputLimit: 128 });
  });
  it('decodes null as insufficiency with no invented citation', () => {
    const output = parseSelection(read('abstention-actual'));
    expect(output.selection.status).toBe('insufficient-evidence');
    expect(output.selection.sentence).toBeNull();
  });
  it.each([
    ['no response', () => null],
    ['no choices', () => ({ ...read('selection-actual'), choices: [] })],
    ['multiple choices', () => { const raw = read('selection-actual'); raw.choices.push(raw.choices[0]); return raw; }],
    ['different model', () => ({ ...read('selection-actual'), model: 'technical-other-model' })],
    ['wrong object', () => ({ ...read('selection-actual'), object: 'list' })],
    ['truncated', () => { const raw = read('selection-actual'); raw.choices[0].finish_reason = 'length'; return raw; }],
    ['wrong role', () => { const raw = read('selection-actual'); raw.choices[0].message.role = 'system'; return raw; }],
    ['wrong choice index', () => { const raw = read('selection-actual'); raw.choices[0].index = 1; return raw; }],
    ['invalid JSON', () => { const raw = read('selection-actual'); raw.choices[0].message.content = '{'; return raw; }],
    ['extra field', () => { const raw = read('selection-actual'); raw.choices[0].message.content = '{"citationId":null,"secret":"technical"}'; return raw; }],
    ['missing field', () => { const raw = read('selection-actual'); raw.choices[0].message.content = '{}'; return raw; }],
    ['wrong field type', () => { const raw = read('selection-actual'); raw.choices[0].message.content = '{"citationId":false}'; return raw; }],
    ['unknown citation', () => { const raw = read('selection-actual'); raw.choices[0].message.content = '{"citationId":"not-supplied"}'; return raw; }],
    ['no completion', () => { const raw = read('selection-actual'); raw.usage.completion_tokens = 0; raw.usage.total_tokens = raw.usage.prompt_tokens; return raw; }],
    ['output over budget', () => { const raw = read('selection-actual'); raw.usage.completion_tokens = 129; raw.usage.total_tokens = raw.usage.prompt_tokens + 129; return raw; }],
    ['prompt over context', () => { const raw = read('selection-actual'); raw.usage.prompt_tokens = 2049; raw.usage.total_tokens = 2060; return raw; }],
    ['no reserved output space', () => { const raw = read('selection-actual'); raw.usage.prompt_tokens = 1921; raw.usage.total_tokens = 1932; return raw; }],
    ['inconsistent usage', () => { const raw = read('selection-actual'); raw.usage.total_tokens++; return raw; }],
    ['negative usage', () => { const raw = read('selection-actual'); raw.usage.prompt_tokens = -1; return raw; }],
    ['fractional usage', () => { const raw = read('selection-actual'); raw.usage.prompt_tokens = 1.5; return raw; }],
    ['unsafe usage', () => { const raw = read('selection-actual'); raw.usage.prompt_tokens = Number.MAX_SAFE_INTEGER + 1; return raw; }],
  ])('rejects generation %s without leaking its body', (_label, make) => {
    expect(() => parseSelection((make as () => unknown)())).toThrow(AiResultRejectedError);
  });
  it('returns immutable usage/provenance instead of exposing mutable provider objects', () => {
    const output = parseSelection(read('selection-actual'));
    expect(Reflect.set(output.usage, 'totalTokens', 1)).toBe(false);
    expect(Reflect.set(output.provenance, 'modelSha256', 'technical')).toBe(false);
  });
  it('accepts the exact context/output token budget with controlled technical usage', () => {
    const raw = read('selection-actual'); raw.usage = { prompt_tokens: 1920, completion_tokens: 128, total_tokens: 2048 };
    expect(parseSelection(raw).usage).toEqual({ promptTokens: 1920, completionTokens: 128, totalTokens: 2048 });
  });
  it('decodes actual normalized technical embeddings by index and protects the returned vectors', () => {
    const raw = read('embedding-actual'); raw.data.reverse();
    const output = parseEmbedding(raw);
    expect(output.vectors).toEqual([...raw.data].sort((a: { index: number }, b: { index: number }) => a.index - b.index).map((row: { embedding: number[] }) => row.embedding));
    expect(output.usage).toEqual({ promptTokens: 28, completionTokens: 0, totalTokens: 28 });
    expect(output.provenance).toEqual({ profileId: profile.id, modelId: profile.embedding.id, modelSha256: profile.embedding.sha256, runtimeVersion: '9ff0d7e90', promptVersion: null, dimensions: 1024, contextLimit: 1024, outputLimit: 0 });
    expect(Reflect.set(output.vectors[0]!, '0', 999)).toBe(false);
    expect(Object.isFrozen(output.vectors)).toBe(true);
  });
  it.each([0, 17, 1.5, NaN])('rejects invalid expected request count %p before response parsing', count => {
    expect(() => decodeEmbeddingBatch(read('embedding-actual'), count, profile, '9ff0d7e90')).toThrow(AiModelInputError);
  });
  it('accepts the maximum request count with controlled copies of normalized technical vectors', () => {
    const raw = read('embedding-actual'); const vector = raw.data[0];
    raw.data = Array.from({ length: 16 }, (_, index) => ({ ...vector, index }));
    expect(decodeEmbeddingBatch(raw, 16, profile, '9ff0d7e90').vectors).toHaveLength(16);
  });
  it.each([
    ['missing data', () => ({})],
    ['different model', () => ({ ...read('embedding-actual'), model: 'other-model' })],
    ['wrong object', () => ({ ...read('embedding-actual'), object: 'chat.completion' })],
    ['wrong vector object', () => { const raw = read('embedding-actual'); raw.data[0].object = 'choice'; return raw; }],
    ['missing vector', () => { const raw = read('embedding-actual'); raw.data.pop(); return raw; }],
    ['duplicate index', () => { const raw = read('embedding-actual'); raw.data[1].index = 0; return raw; }],
    ['out of range index', () => { const raw = read('embedding-actual'); raw.data[1].index = 2; return raw; }],
    ['negative index', () => { const raw = read('embedding-actual'); raw.data[0].index = -1; return raw; }],
    ['fractional index', () => { const raw = read('embedding-actual'); raw.data[0].index = 0.5; return raw; }],
    ['wrong dimensions', () => { const raw = read('embedding-actual'); raw.data[0].embedding.pop(); return raw; }],
    ['non-number', () => { const raw = read('embedding-actual'); raw.data[0].embedding[0] = '0'; return raw; }],
    ['non-finite', () => { const raw = read('embedding-actual'); raw.data[0].embedding[0] = Infinity; return raw; }],
    ['zero norm', () => { const raw = read('embedding-actual'); raw.data[0].embedding.fill(0); return raw; }],
    ['not normalized', () => { const raw = read('embedding-actual'); raw.data[0].embedding[0] = 2; return raw; }],
    ['no usage', () => { const raw = read('embedding-actual'); delete raw.usage; return raw; }],
    ['no input tokens', () => { const raw = read('embedding-actual'); raw.usage = { prompt_tokens: 0, total_tokens: 0 }; return raw; }],
    ['mismatched total', () => { const raw = read('embedding-actual'); raw.usage.total_tokens++; return raw; }],
    ['input tokens over aggregate context budget', () => { const raw = read('embedding-actual'); raw.usage = { prompt_tokens: 2049, total_tokens: 2049 }; return raw; }],
  ])('rejects embedding %s as a technical protocol failure', (_label, make) => {
    expect(() => parseEmbedding((make as () => unknown)())).toThrow(AiUnavailableError);
  });
  it('accepts the exact aggregate embedding context budget with controlled technical usage', () => {
    const raw = read('embedding-actual'); raw.usage = { prompt_tokens: 2048, total_tokens: 2048 };
    expect(parseEmbedding(raw).usage.totalTokens).toBe(2048);
  });
});
