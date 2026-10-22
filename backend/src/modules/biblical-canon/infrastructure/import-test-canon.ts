import { readCanonSnapshot, type CanonFiles } from './admitted-canon';
import { assertTestTarget } from '../../../config/runtime-config';
import { Database } from '../../../infrastructure/database';
import { CanonLibrary } from '../application/canon-library';
import { PrismaCanonRepository } from './prisma-canon-repository';
export async function importTestCanonSnapshot(environment: NodeJS.ProcessEnv, files: CanonFiles): Promise<'imported' | 'unchanged'> {
  const database = new Database(assertTestTarget(environment));
  try {
    const identities = await database.client.$queryRaw<{ db: string; role: string }[]>`SELECT current_database() AS db, current_user AS role`;
    if (identities[0]?.db !== 'biblia_test' || identities[0]?.role !== 'biblia_test') throw new Error('Unsafe test identity');
    const repository = new PrismaCanonRepository(database);
    return await new CanonLibrary(repository, repository).importSnapshot(await readCanonSnapshot(files));
  } finally { await database.onModuleDestroy(); }
}
