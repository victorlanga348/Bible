import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import type { SourcePassageLinks } from '../modules/source-library/application/source-passage-links';
import type { CuratedPassageLinkProps } from '../modules/source-library/domain/curated-passage-link';
import { SourceSnapshotError } from '../modules/source-library/application/errors';

export async function admitAiCoverage(links: SourcePassageLinks, manifestPath: string, purpose: 'local-ai' | 'test-ai'): Promise<readonly ('imported' | 'unchanged')[]> {
  const pins = { 'local-ai': 'f67ede1ba6c6146c39202699bcc0d812ada9e5b1a05f8ba7251d4a54c2d2274a', 'test-ai': 'a286a7f83aca32955b3d461c8a9532097abd843a34a33c1ed33b54041350137e' };
  const bytes = await readFile(manifestPath).catch(() => { throw new SourceSnapshotError(); });
  if (createHash('sha256').update(bytes).digest('hex') !== pins[purpose]) throw new SourceSnapshotError();
  const manifest = JSON.parse(bytes.toString('utf8')) as { curatedPassageLinks: CuratedPassageLinkProps[] };
  const results: ('imported' | 'unchanged')[] = [];
  for (const link of manifest.curatedPassageLinks) results.push(await links.curate(link));
  return Object.freeze(results);
}
