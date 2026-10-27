import { createHash } from 'node:crypto';
import { readFile, mkdtemp, writeFile, unlink, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { readAiSourcePolicy, type AiSourcePolicyFiles } from '../../../src/modules/ai-assistant/infrastructure/source-policy';
import { AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';

const files = (purpose: 'local-ai' | 'test-ai'): AiSourcePolicyFiles => {
  const base = `${purpose === 'local-ai' ? 'admissions' : 'test/fixtures/ai-assistant/source-library'}/josephus-antiquities-pg2848-en-local-ai-v1`;
  return { manifest: `${base}/manifest.json`, excerpts: `${base}/excerpts.json` };
};
describe('own immutable source policy from authenticated files, no library write or inference', () => {
  it.each(['local-ai', 'test-ai'] as const)('pins %s metadata and derives all11 exact span digests without returning source text', async purpose => {
    const input = files(purpose); const policy = await readAiSourcePolicy(input, purpose);
    const manifest = JSON.parse(await readFile(input.manifest, 'utf8')) as { source: Record<string, unknown> };
    const source = { ...manifest.source }; delete source.permissions;
    expect(policy.source).toEqual(source);
    const excerpts = JSON.parse(await readFile(input.excerpts, 'utf8')) as { id: string; sourceId: string; text: string; textSha256: string; locator: string; order: number }[];
    expect(policy.excerpts).toEqual(excerpts.map(row => ({ sourceId: row.sourceId, excerptId: row.id, locator: row.locator, paragraph: row.order, textSha256: row.textSha256 })));
    expect(policy.indexProfile.id).toBe('local-extractive-v1');
    expect(policy.indexProfile.configuration).toEqual({ schemaVersion: 1, runtimeProfileSha256: 'cf12565112a0c5b84a7065200ee01362052f1ae3dee6296c16a8dccabbc5dc0f', sourceManifestSha256: createHash('sha256').update(await readFile(input.manifest)).digest('hex'), sourceSnapshotSha256: source.snapshotSha256, sourceExcerptsSha256: '79228666d0b6d552d6a5dc7ac3072acb7781c73f63af54119dab1495abff92d8', embeddingModelSha256: '06507c7b42688469c4e7298b0a1e16deff06caf291cf0a5b278c308249c3e439', dimensions: 1024, segmentCodepoints: 1000, overlapCodepoints: 100 });
    expect(policy.indexProfile.expectedSegments).toHaveLength(11);
    for (const row of policy.indexProfile.expectedSegments) {
      const excerpt = excerpts.find(value => value.id === row.excerptId)!; const original = Array.from(excerpt.text).slice(row.startOffset, row.endOffset).join('');
      expect(row.sourceId).toBe(excerpt.sourceId); expect(row.sourceDigest).toBe(excerpt.textSha256); expect(row.textDigest).toBe(createHash('sha256').update(original).digest('hex'));
      expect(row.id).toBe(`p${excerpt.order}-c${row.startOffset / 900 + 1}`); expect(row.endOffset).toBe(Math.min(row.startOffset + 1000, Array.from(excerpt.text).length));
      expect(Object.isFrozen(row)).toBe(true);
    }
    for (const value of [policy, policy.source, policy.excerpts, policy.excerpts[0], policy.indexProfile, policy.indexProfile.configuration, policy.indexProfile.expectedSegments]) expect(Object.isFrozen(value)).toBe(true);
    expect(JSON.stringify(policy)).not.toContain(excerpts[0]!.text); expect(JSON.stringify(policy)).not.toContain('permissions');
    expect(Reflect.set(policy.source, 'author', 'changed')).toBe(false);
  });
  it('refuses purpose swapping and legacy profiles rather than promoting pending rights', async () => {
    await expect(readAiSourcePolicy(files('test-ai'), 'local-ai')).rejects.toThrow(AiUnavailableError);
    await expect(readAiSourcePolicy(files('local-ai'), 'test-ai')).rejects.toThrow(AiUnavailableError);
    await expect(readAiSourcePolicy({ ...files('local-ai'), manifest: 'admissions/josephus-antiquities-pg2848-en.local.json' }, 'local-ai')).rejects.toThrow(AiUnavailableError);
    await expect(readAiSourcePolicy(files('local-ai'), 'unadmitted' as 'local-ai')).rejects.toThrow(AiUnavailableError);
  });
  it.each(['manifest', 'excerpts'] as const)('refuses altered %s before deriving any policy', async key => {
    const temp = await mkdtemp('reports/ai-policy-'); const changed = join(temp, 'changed');
    try {
      await writeFile(changed, Buffer.concat([await readFile(files('local-ai')[key]), Buffer.from('changed')]));
      await expect(readAiSourcePolicy({ ...files('local-ai'), [key]: changed }, 'local-ai')).rejects.toThrow(AiUnavailableError);
    } finally { await unlink(changed); await rmdir(temp); }
  });
  it.each(['manifest', 'excerpts'] as const)('sanitizes missing %s paths without disclosing configuration', async key => {
    await expect(readAiSourcePolicy({ ...files('local-ai'), [key]: 'reports/private-technical-file-absent' }, 'local-ai')).rejects.toThrow(AiUnavailableError);
  });
});
