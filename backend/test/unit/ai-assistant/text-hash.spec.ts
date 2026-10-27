import { readFileSync } from 'node:fs';
import { NodeAiTextHash } from '../../../src/modules/ai-assistant/infrastructure/text-hash';

describe('UTF-8 source integrity hash; pure local file read, never inference', () => {
  it('matches the genuine pinned source paragraph without altering text', () => {
    const [excerpt] = JSON.parse(readFileSync('test/fixtures/ai-assistant/source-library/josephus-antiquities-pg2848-en-local-ai-v1/excerpts.json', 'utf8')) as { text: string; textSha256: string }[];
    expect(new NodeAiTextHash().sha256(excerpt!.text)).toBe(excerpt!.textSha256);
  });
  it('does not normalize Unicode or strip source whitespace', () => {
    const hash = new NodeAiTextHash();
    expect(hash.sha256('e\u0301')).not.toBe(hash.sha256('\u00e9'));
    expect(hash.sha256('technical')).not.toBe(hash.sha256(' technical '));
  });
});
