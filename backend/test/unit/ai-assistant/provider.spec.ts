import { readFileSync } from 'node:fs';
import { AiModelInputError, AiQuestion, SourceSentence } from '../../../src/modules/ai-assistant/domain/model-input';
import { AiResultRejectedError, AiTimeoutError, AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import type { EmbeddingRequest } from '../../../src/modules/ai-assistant/application/ports';
import { LocalModelProvider } from '../../../src/modules/ai-assistant/infrastructure/local-model-provider';
import type { LocalModelProfile } from '../../../src/modules/ai-assistant/infrastructure/profile';
import type { ModelEndpoint, ModelKind, ModelRuntimePort, ModelSession } from '../../../src/modules/ai-assistant/infrastructure/session';

const profile = JSON.parse(readFileSync('admissions/local-extractive-v1.json', 'utf8')) as LocalModelProfile;
const fixture = (name: string): unknown => JSON.parse(readFileSync('test/fixtures/ai-assistant/protocol/' + name + '.json', 'utf8'));
class TechnicalRecordedRuntime implements ModelRuntimePort {
  readonly calls: { endpoint: ModelEndpoint; body: unknown; bytes: number }[] = [];
  readonly kinds: ModelKind[] = [];
  signal: AbortSignal | undefined;
  fail: Error | undefined;
  responses: Record<ModelEndpoint, unknown> = { '/tokenize': { tokens: [1, 2, 3] }, '/apply-template': { prompt: 'technical rendered template, not historical content' }, '/v1/embeddings': fixture('embedding-actual'), '/v1/chat/completions': fixture('selection-actual') };
  async run<T>(kind: ModelKind, execute: (session: ModelSession) => Promise<T>, signal?: AbortSignal): Promise<T> {
    this.kinds.push(kind); this.signal = signal;
    return execute({ runtimeVersion: 'technical-recorded-runtime', post: async (endpoint, body, bytes) => {
      this.calls.push({ endpoint, body, bytes });
      if (this.fail) throw this.fail;
      return this.responses[endpoint];
    } });
  }
}
const source = () => new SourceSentence({ id: 'p1-s11', paragraph: 1, start: 0, end: 9, text: 'technical' });
describe('provider coordination with an explicitly recorded technical session double', () => {
  it('embeds unchanged source input after real-protocol tokenizer checks and returns decoded indexed vectors', async () => {
    const runtime = new TechnicalRecordedRuntime(); const provider = new LocalModelProvider(profile, runtime);
    const output = await provider.embed({ purpose: 'source', texts: [' technical first ', 'technical second'] });
    expect(runtime.kinds).toEqual(['embedding']);
    expect(runtime.calls).toEqual([
      { endpoint: '/tokenize', body: { content: ' technical first ', add_special: true, parse_special: false }, bytes: 262144 },
      { endpoint: '/tokenize', body: { content: 'technical second', add_special: true, parse_special: false }, bytes: 262144 },
      { endpoint: '/v1/embeddings', body: { model: 'biblia-embedding', input: [' technical first ', 'technical second'] }, bytes: 4194304 },
    ]);
    expect(output.vectors).toHaveLength(2);
    expect(output.provenance.runtimeVersion).toBe('technical-recorded-runtime');
  });
  it('adds the pinned query instruction only to question inputs', async () => {
    const runtime = new TechnicalRecordedRuntime();
    await new LocalModelProvider(profile, runtime).embed({ purpose: 'question', texts: ['first', 'second'] });
    expect(runtime.calls[0]!.body).toEqual({ content: profile.embedding.queryPrefix + 'first', add_special: true, parse_special: false });
    expect(runtime.calls[2]!.body).toEqual({ model: 'biblia-embedding', input: [profile.embedding.queryPrefix + 'first', profile.embedding.queryPrefix + 'second'] });
  });
  it('accepts a single question embedding using an identified one-vector recording variant', async () => {
    const runtime = new TechnicalRecordedRuntime();
    const raw = fixture('embedding-actual') as { data: { index: number }[] }; raw.data = [raw.data[0]!];
    runtime.responses['/v1/embeddings'] = raw;
    await expect(new LocalModelProvider(profile, runtime).embed({ purpose: 'question', texts: ['technical query'] })).resolves.toMatchObject({ vectors: [expect.any(Array)] });
    expect(runtime.calls.filter(call => call.endpoint === '/tokenize')).toHaveLength(1);
  });
  it('snapshots source inputs before asynchronous tokenizer work', async () => {
    const runtime = new TechnicalRecordedRuntime(); const texts = ['first', 'second'];
    const pending = new LocalModelProvider(profile, runtime).embed({ purpose: 'source', texts });
    texts[0] = 'later technical change'; await pending;
    expect(runtime.calls.find(call => call.endpoint === '/v1/embeddings')?.body).toEqual({ model: 'biblia-embedding', input: ['first', 'second'] });
  });
  it('supports sixteen inputs using controlled copies of normalized fixture vectors, without live inference', async () => {
    const runtime = new TechnicalRecordedRuntime();
    const raw = fixture('embedding-actual') as { data: { index: number; object: string; embedding: number[] }[] };
    raw.data = Array.from({ length: 16 }, (_, index) => ({ ...raw.data[0]!, index })); runtime.responses['/v1/embeddings'] = raw;
    const output = await new LocalModelProvider(profile, runtime).embed({ purpose: 'source', texts: Array(16).fill('technical') });
    expect(output.vectors).toHaveLength(16);
    expect(runtime.kinds).toEqual(['embedding']);
    expect(runtime.calls.filter(call => call.endpoint === '/v1/embeddings')).toHaveLength(1);
  });
  it.each([
    ['no inputs', { purpose: 'source', texts: [] }], ['too many inputs', { purpose: 'source', texts: Array(17).fill('technical') }],
    ['unknown purpose', { purpose: 'remote', texts: ['technical'] }], ['not an array', { purpose: 'source', texts: null }],
    ['not text', { purpose: 'source', texts: [12] }], ['blank', { purpose: 'source', texts: [' '] }],
    ['UTF-8 byte excess', { purpose: 'source', texts: ['é'.repeat(2001)] }], ['unpaired scalar', { purpose: 'source', texts: ['bad\ud800'] }],
  ])('rejects %s before reserving model resources', async (_label, request) => {
    const runtime = new TechnicalRecordedRuntime();
    await expect(new LocalModelProvider(profile, runtime).embed(request as EmbeddingRequest)).rejects.toBeInstanceOf(AiModelInputError);
    expect(runtime.kinds).toEqual([]);
  });
  it('accepts the exact input bytes and tokenizer context boundaries', async () => {
    const runtime = new TechnicalRecordedRuntime(); runtime.responses['/tokenize'] = { tokens: Array(1024).fill(1) };
    await expect(new LocalModelProvider(profile, runtime).embed({ purpose: 'source', texts: ['é'.repeat(2000), 'second'] })).resolves.toMatchObject({ usage: { promptTokens: 28 } });
  });
  it('rejects over-budget embedding tokens without making an embedding inference', async () => {
    const runtime = new TechnicalRecordedRuntime(); runtime.responses['/tokenize'] = { tokens: Array(1025).fill(1) };
    await expect(new LocalModelProvider(profile, runtime).embed({ purpose: 'source', texts: ['first', 'second'] })).rejects.toBeInstanceOf(AiResultRejectedError);
    expect(runtime.calls.map(call => call.endpoint)).toEqual(['/tokenize']);
  });
  it('renders/tokenizes generation before inference, preserving the pinned request and actual session version', async () => {
    const runtime = new TechnicalRecordedRuntime(); const controller = new AbortController();
    const output = await new LocalModelProvider(profile, runtime).select(new AiQuestion('technical question'), [source()], controller.signal);
    expect(runtime.kinds).toEqual(['generation']); expect(runtime.signal).toBe(controller.signal);
    expect(runtime.calls.map(call => call.endpoint)).toEqual(['/apply-template', '/tokenize', '/v1/chat/completions']);
    expect(runtime.calls[0]!.body).toMatchObject({ chat_template_kwargs: { enable_thinking: false } });
    expect(runtime.calls[1]).toEqual({ endpoint: '/tokenize', body: { content: 'technical rendered template, not historical content', add_special: false, parse_special: true }, bytes: 262144 });
    expect(runtime.calls[2]!.body).toMatchObject({ model: 'biblia-generation', max_tokens: 128 });
    expect(runtime.calls[2]!.bytes).toBe(65536);
    expect(output.selection.sentence?.text).toBe('technical');
    expect(output.provenance.runtimeVersion).toBe('technical-recorded-runtime');
  });
  it('rejects duplicate source identity before loading a model', async () => {
    const runtime = new TechnicalRecordedRuntime();
    await expect(new LocalModelProvider(profile, runtime).select(new AiQuestion('technical'), [source(), source()])).rejects.toBeInstanceOf(AiModelInputError);
    expect(runtime.kinds).toEqual([]);
  });
  it('binds selection to the snapshot sent before asynchronous work', async () => {
    const runtime = new TechnicalRecordedRuntime(); const context = [source()];
    const pending = new LocalModelProvider(profile, runtime).select(new AiQuestion('technical'), context);
    context[0] = new SourceSentence({ id: 'other', paragraph: 1, start: 0, end: 5, text: 'other' });
    await expect(pending).resolves.toMatchObject({ selection: { citationId: 'p1-s11', sentence: { text: 'technical' } } });
  });
  it('accepts the exact prompt plus output context budget', async () => {
    const runtime = new TechnicalRecordedRuntime(); runtime.responses['/tokenize'] = { tokens: Array(1920).fill(1) };
    await expect(new LocalModelProvider(profile, runtime).select(new AiQuestion('technical'), [source()])).resolves.toMatchObject({ selection: { status: 'supported' } });
  });
  it('rejects a generation exceeding the reserved context before inference', async () => {
    const runtime = new TechnicalRecordedRuntime(); runtime.responses['/tokenize'] = { tokens: Array(1921).fill(1) };
    await expect(new LocalModelProvider(profile, runtime).select(new AiQuestion('technical'), [source()])).rejects.toBeInstanceOf(AiResultRejectedError);
    expect(runtime.calls.map(call => call.endpoint)).toEqual(['/apply-template', '/tokenize']);
  });
  it.each([{}, { prompt: '' }, { prompt: ' \t\r\n' }, { prompt: 12 }])('rejects invalid rendered template %j', async response => {
    const runtime = new TechnicalRecordedRuntime(); runtime.responses['/apply-template'] = response;
    await expect(new LocalModelProvider(profile, runtime).select(new AiQuestion('technical'), [source()])).rejects.toBeInstanceOf(AiUnavailableError);
    expect(runtime.calls).toHaveLength(1);
  });
  it.each([{}, { tokens: [] }, { tokens: [-1] }, { tokens: [1.5] }, { tokens: ['1'] }])('rejects invalid tokenizer output %j', async response => {
    const runtime = new TechnicalRecordedRuntime(); runtime.responses['/tokenize'] = response;
    await expect(new LocalModelProvider(profile, runtime).select(new AiQuestion('technical'), [source()])).rejects.toBeInstanceOf(AiUnavailableError);
    expect(runtime.calls).toHaveLength(2);
  });
  it.each([new AiTimeoutError(), new AiUnavailableError(), new AiResultRejectedError()])('preserves a classified runtime failure %p', async error => {
    const runtime = new TechnicalRecordedRuntime(); runtime.fail = error;
    await expect(new LocalModelProvider(profile, runtime).select(new AiQuestion('technical'), [source()])).rejects.toBe(error);
  });
});
