import { randomUUID } from 'node:crypto';
import type { Database } from '../../../infrastructure/database';
import type { Prisma } from '../../../generated/prisma/client';
import type { StudyStorePort } from '../application/ports';
import { StudyConflictError } from '../application/errors';
import { Study, type StudyContent } from '../domain/study';

export class PrismaStudyRepository implements StudyStorePort {
  constructor(private readonly database: Database) {}
  async create(ownerId: string, content: StudyContent): Promise<Study> {
    const now = new Date(); const study = new Study({ id: randomUUID(), ownerId, version: 1, createdAt: now.toISOString(), content });
    return this.database.client.$transaction(async transaction => {
      await transaction.studyRecord.create({ data: { id: study.id, ownerId, currentVersion: 1n, createdAt: now } });
      await transaction.studyVersion.create({ data: { studyId: study.id, number: 1n, document: documentFor(study.content), createdAt: now } });
      return study;
    });
  }
  async find(ownerId: string, id: string, version?: number): Promise<Study | null> {
    const record = await this.database.client.studyRecord.findUnique({ where: { id, ownerId } });
    if (record === null) return null;
    const row = await this.database.client.studyVersion.findUnique({ where: { studyId_number: { studyId: id, number: version === undefined ? record.currentVersion : BigInt(version) } } });
    if (row === null) {
      if (version === undefined) throw new Error('Current study snapshot is missing');
      return null;
    }
    return new Study({ id: record.id, ownerId: record.ownerId, version: Number(row.number), createdAt: row.createdAt.toISOString(), content: row.document as unknown as StudyContent });
  }
  async append(ownerId: string, id: string, expectedVersion: number, content: StudyContent): Promise<Study> {
    return this.database.client.$transaction(async transaction => {
      const updated = await transaction.studyRecord.updateMany({ where: { id, ownerId, currentVersion: { equals: BigInt(expectedVersion), lt: BigInt(Number.MAX_SAFE_INTEGER) } }, data: { currentVersion: { increment: 1 } } });
      if (updated.count !== 1) throw new StudyConflictError();
      const now = new Date(); const study = new Study({ id, ownerId, version: expectedVersion + 1, createdAt: now.toISOString(), content });
      await transaction.studyVersion.create({ data: { studyId: id, number: BigInt(study.version), document: documentFor(study.content), createdAt: now } });
      return study;
    });
  }
}

function documentFor(content: StudyContent): Prisma.InputJsonObject {
  // Persist JSON values, not domain prototypes or Prisma entities in Domain.
  return JSON.parse(JSON.stringify(content)) as Prisma.InputJsonObject;
}
