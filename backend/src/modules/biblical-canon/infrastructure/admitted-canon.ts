import type { CanonSnapshot } from '../application/ports';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Translation } from '../domain/translation';
import { Book } from '../domain/book';
import { Chapter } from '../domain/chapter';
import { CanonSnapshotError } from '../application/errors';
export interface CanonFiles { readonly archive: string; readonly snapshot: string; readonly manifest: string }
export async function readCanonSnapshot(files: CanonFiles): Promise<CanonSnapshot> {
  try {
    const [archive, snapshot, manifest] = await Promise.all([readFile(files.archive), readFile(files.snapshot), readFile(files.manifest)]);
    const hash = (bytes: Buffer | string): string => createHash('sha256').update(bytes).digest('hex');
    if (hash(archive) !== '1f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682'
      || hash(snapshot) !== '14c2103dc8fedc80007b4c37a05f09c43926f05e8a0dc8ccd62b3443dccd0a27'
      || hash(JSON.stringify(JSON.parse(manifest.toString('utf8')))) !== 'b3a9b624e175f5a6870d3e52f8ccd905b4a94232dc3e627eb74486c513d6a19e') throw new CanonSnapshotError();
    const data = JSON.parse(snapshot.toString('utf8')) as CanonSnapshot;
    return { translation: new Translation(data.translation), books: data.books.map(book => new Book(book)), chapters: data.chapters.map(chapter => new Chapter(chapter)), verses: data.verses };
  } catch { throw new CanonSnapshotError(); }
}
