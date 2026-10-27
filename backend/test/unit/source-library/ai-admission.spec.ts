import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, unlink, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { readAdmittedSnapshot, type SnapshotFiles } from '../../../src/modules/source-library/infrastructure/admitted-snapshot';
import { SourceSnapshotError } from '../../../src/modules/source-library/application/errors';
import type { SourceProps } from '../../../src/modules/source-library/domain/source';

const source = 'data/source-library/josephus-antiquities-pg2848-en/source.html';
const directory = (purpose: 'local-ai' | 'test-ai') => `${purpose === 'local-ai' ? 'admissions' : 'test/fixtures/ai-assistant/source-library'}/josephus-antiquities-pg2848-en-local-ai-v1`;
const files = (purpose: 'local-ai' | 'test-ai'): SnapshotFiles => ({ source, manifest: `${directory(purpose)}/manifest.json`, excerpts: `${directory(purpose)}/excerpts.json`, notice: `${directory(purpose)}/NOTICE.source.txt` });
describe('separate AI admission byte gates; real files, no database or inference', () => {
  it.each(['local-ai', 'test-ai'] as const)('reconstructs only the pinned %s source with exact unchanged texts and independent identity', async purpose => {
    const snapshot = await readAdmittedSnapshot(files(purpose), purpose);
    const manifest = JSON.parse(await readFile(files(purpose).manifest, 'utf8')) as { source: SourceProps; purpose: string };
    expect(snapshot.source).toEqual(manifest.source); expect(manifest.purpose).toBe(purpose);
    expect(snapshot.source.id).toBe('josephus-antiquities-pg2848-en-local-ai-v1'); expect(snapshot.source.permissions.sendToAi).toBe('allowed');
    expect(snapshot.excerpts).toHaveLength(4);
    const raw = JSON.parse(await readFile('data/source-library/josephus-antiquities-pg2848-en/operational/excerpts.json', 'utf8')) as { text: string; textSha256: string; locator: string; order: number }[];
    snapshot.excerpts.forEach((excerpt, index) => {
      expect(excerpt.id).toBe(`${snapshot.source.id}-b1-c1-p${index + 1}`); expect(excerpt.sourceId).toBe(snapshot.source.id);
      expect(excerpt.text).toBe(raw[index]!.text); expect(excerpt.textSha256).toBe(createHash('sha256').update(excerpt.text).digest('hex')); expect(excerpt.locator).toBe(raw[index]!.locator); expect(excerpt.order).toBe(raw[index]!.order);
    });
  });
  it.each(['local-ai', 'test-ai'] as const)('refuses the other AI purpose and both legacy purposes for %s bytes', async purpose => {
    for (const other of ['local-ai', 'test-ai', 'test', 'local-development'] as const) if (other !== purpose) await expect(readAdmittedSnapshot(files(purpose), other)).rejects.toThrow(SourceSnapshotError);
  });
  it.each(['local-ai', 'test-ai'] as const)('refuses legacy metadata and excerpt IDs under %s, without upgrading pending rights', async purpose => {
    await expect(readAdmittedSnapshot({ ...files(purpose), manifest: 'admissions/josephus-antiquities-pg2848-en.local.json' }, purpose)).rejects.toThrow(SourceSnapshotError);
    await expect(readAdmittedSnapshot({ ...files(purpose), excerpts: 'test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json' }, purpose)).rejects.toThrow(SourceSnapshotError);
    const legacy = JSON.parse(await readFile('test/fixtures/source-library/josephus-antiquities-pg2848-en/manifest.json', 'utf8')) as { source: SourceProps };
    expect(legacy.source.permissions.sendToAi).toBe('pending');
  });
  for (const purpose of ['local-ai', 'test-ai'] as const) {
    it.each(['source', 'manifest', 'excerpts', 'notice'] as const)(`rejects altered ${purpose} %s`, async key => {
      const temp = await mkdtemp('reports/ai-admission-'); const changed = join(temp, 'changed');
      try {
        await writeFile(changed, Buffer.concat([await readFile(files(purpose)[key]), Buffer.from('\nchanged')]));
        await expect(readAdmittedSnapshot({ ...files(purpose), [key]: changed }, purpose)).rejects.toThrow(SourceSnapshotError);
      } finally { await unlink(changed); await rmdir(temp); }
    });
    it.each(['source', 'manifest', 'excerpts', 'notice'] as const)(`rejects missing ${purpose} %s`, async key => {
      await expect(readAdmittedSnapshot({ ...files(purpose), [key]: 'reports/ai-admission-no-such-file' }, purpose)).rejects.toThrow(SourceSnapshotError);
    });
  }
  it('rejects unknown runtime purpose even if valid legacy bytes are supplied', async () => {
    const legacy = { source, manifest: 'test/fixtures/source-library/josephus-antiquities-pg2848-en/manifest.json', excerpts: 'test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json', notice: 'test/fixtures/source-library/josephus-antiquities-pg2848-en/NOTICE.source.txt' };
    await expect(readAdmittedSnapshot(legacy, 'unadmitted' as 'test')).rejects.toThrow(SourceSnapshotError);
  });
});
