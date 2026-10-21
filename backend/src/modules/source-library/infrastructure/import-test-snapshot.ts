import { readAdmittedSnapshot, type SnapshotFiles } from './admitted-snapshot';
import { assertTestTarget } from '../../../config/runtime-config';
import { Database } from '../../../infrastructure/database';
import { PrismaSourceRepository } from './prisma-source-repository';
import { SourceLibrary } from '../application/source-library';

export async function importTestSnapshot(environment: NodeJS.ProcessEnv, files: SnapshotFiles): Promise<'imported' | 'unchanged'> {
  const database = new Database(assertTestTarget(environment));
  try {
    const identities = await database.client.$queryRaw<{ db: string; role: string }[]>`SELECT current_database() AS db, current_user AS role`;
    if (identities[0]?.db !== 'biblia_test' || identities[0]?.role !== 'biblia_test') throw new Error('Unsafe test identity');
    const snapshot = await readAdmittedSnapshot(files);
    const repository = new PrismaSourceRepository(database);
    return await new SourceLibrary(repository, repository, repository).importSnapshot(snapshot);
  } finally { await database.onModuleDestroy(); }
}
