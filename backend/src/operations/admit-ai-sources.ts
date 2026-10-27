import type { SourceLibrary } from '../modules/source-library/application/source-library';
import type { SourcePassageLinks } from '../modules/source-library/application/source-passage-links';
import type { SnapshotFiles } from '../modules/source-library/infrastructure/admitted-snapshot';
import { readAdmittedSnapshot } from '../modules/source-library/infrastructure/admitted-snapshot';
import { readFile } from 'node:fs/promises';
import type { CuratedPassageLinkProps } from '../modules/source-library/domain/curated-passage-link';
import { createHash } from 'node:crypto';
import { SourceSnapshotError } from '../modules/source-library/application/errors';

export async function admitAiSources(sources: SourceLibrary, links: SourcePassageLinks, files: SnapshotFiles, purpose: 'local-ai' | 'test-ai'): Promise<{ source: 'imported' | 'unchanged'; curations: readonly ('imported' | 'unchanged')[] }> {
  const snapshot = await readAdmittedSnapshot(files, purpose);
  const bytes = await readFile(files.manifest);
  const expected = purpose === 'local-ai' ? 'f7680eb9eaf5b0ef28b867fdb902da44d7856cb386efd317ee69a554f620d230' : '46469116db968afc44f32d4e6cc5fecc5890910c038cbaac5363aa80dacb66d4';
  if (createHash('sha256').update(bytes).digest('hex') !== expected) throw new SourceSnapshotError();
  const manifest = JSON.parse(bytes.toString('utf8')) as { curatedPassageLinks: CuratedPassageLinkProps[] };
  const source = await sources.importSnapshot(snapshot);
  const curations: ('imported' | 'unchanged')[] = [];
  for (const row of manifest.curatedPassageLinks) curations.push(await links.curate(row));
  return { source, curations: Object.freeze(curations) };
}
