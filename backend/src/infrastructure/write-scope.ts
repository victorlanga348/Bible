import type { WriteScope } from '../application/write-scope';
import type { Database } from './database';
import type { Prisma } from '../generated/prisma/client';
const bindings = new WeakMap<WriteScope, { database: Database; transaction: Prisma.TransactionClient }>();
export async function usingWriteScope<T>(database: Database, transaction: Prisma.TransactionClient, write: (scope: WriteScope) => Promise<T>): Promise<T> {
  const scope = Object.freeze({}) as WriteScope;
  bindings.set(scope, { database, transaction });
  try { return await write(scope); } finally { bindings.delete(scope); }
}
export async function writeTransaction<T>(database: Database, scope: WriteScope | undefined, write: (transaction: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  if (scope === undefined) return database.client.$transaction(write);
  const binding = bindings.get(scope);
  if (!binding || binding.database !== database) throw new Error('Invalid or expired write scope');
  return write(binding.transaction);
}
