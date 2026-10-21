import type { SourceSnapshot } from '../application/ports';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Source, type SourceProps } from '../domain/source';
import { SourceExcerpt, type SourceExcerptProps } from '../domain/source-excerpt';
import { SourceSnapshotError } from '../application/errors';

export interface SnapshotFiles { readonly source: string; readonly manifest: string; readonly excerpts: string; readonly notice: string }

export async function readAdmittedSnapshot(files: SnapshotFiles): Promise<SourceSnapshot> {
  // Admission pins metadata/permissions, all original bytes, the curated excerpt
  // set and the conserved notice. Paths supplied by the CLI grant no new rights.
  const admission = {
    source: '098d837010fea0f38b104d2c9397696ae5db9e5cbd15a8e8f400f36811fbcf99',
    manifest: '292fce94d8c1a08dca6b6ff6f5b8fa22d53d40fdd3fde76692e96c9eab03e0a2',
    excerpts: '2171bd34f61e74b22d61e58e6c71caa336716b8ad15e2c60f8210ce2e35d7f63',
    notice: '18bc5c6f86b23ade32c4d711e765328b0c642c383a993c8d7f11c7ee21da4bf1',
  };
  try {
    const contents = await Promise.all((Object.keys(admission) as (keyof SnapshotFiles)[]).map(async key => {
      const bytes = await readFile(files[key]);
      if (createHash('sha256').update(bytes).digest('hex') !== admission[key]) throw new SourceSnapshotError();
      return [key, bytes] as const;
    }));
    const verified = Object.fromEntries(contents) as Record<keyof SnapshotFiles, Buffer>;
    const manifest = JSON.parse(verified.manifest.toString('utf8')) as { source: SourceProps };
    const excerpts = JSON.parse(verified.excerpts.toString('utf8')) as SourceExcerptProps[];
    return { source: new Source(manifest.source), excerpts: excerpts.map(excerpt => new SourceExcerpt(excerpt)) };
  } catch { throw new SourceSnapshotError(); }
}
