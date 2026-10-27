import { NodeAiIdentityClock } from '../../../src/modules/ai-assistant/infrastructure/identity-clock';

describe('own technical analysis identity and timestamp', () => {
  it('creates distinct canonical UUIDv4 identities for separate analyses', () => {
    const clock = new NodeAiIdentityClock(); const first = clock.newId(); const second = clock.newId();
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(second).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/); expect(first).not.toBe(second);
  });
  it('uses actual UTC ISO milliseconds within the current clock interval', () => {
    const before = Date.now(); const timestamp = new NodeAiIdentityClock().now(); const after = Date.now();
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/); expect(Date.parse(timestamp)).toBeGreaterThanOrEqual(before); expect(Date.parse(timestamp)).toBeLessThanOrEqual(after);
  });
});
