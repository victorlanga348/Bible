import { usingWriteScope } from '../../../infrastructure/write-scope';
import type { WriteScope } from '../../../application/write-scope';
import type { PageWindow } from '../../../application/pagination';
import { randomUUID } from 'node:crypto';
import type { Database } from '../../../infrastructure/database';
import type { Prisma } from '../../../generated/prisma/client';
import type { StudyStorePort, StudySummary } from '../application/ports';
import { StudyConflictError, StudyNotFoundError } from '../application/errors';
import { Study, type StudyContent } from '../domain/study';

export class PrismaStudyRepository implements StudyStorePort {
  constructor(private readonly database: Database) {}
  async metadata(ownerId: string, id: string, version?: number): Promise<StudySummary | null> {
    const study = await this.find(ownerId, id, version);
    return study ? { id: study.id, version: study.version, createdAt: study.createdAt, reference: study.content.reference } : null;
  }
  async list(ownerId: string, window: PageWindow): Promise<readonly StudySummary[]> {
    const after: Prisma.StudyRecordWhereInput[] = window.cursor ? [{ OR: [{ createdAt: { lt: new Date(window.cursor.createdAt) } }, { createdAt: new Date(window.cursor.createdAt), id: { lt: window.cursor.id } }] }] : [];
    const rows = await this.database.client.studyRecord.findMany({ where: { ownerId, lifecycle: 'active', AND: after }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: window.limit + 1, include: { versions: { orderBy: { number: 'desc' }, take: 1 } } });
    return rows.map(row => {
      const snapshot = row.versions[0];
      if (!snapshot || snapshot.number !== row.currentVersion) throw new Error('Current study snapshot is missing');
      const study = new Study({ id: row.id, ownerId: row.ownerId, version: Number(snapshot.number), createdAt: snapshot.createdAt.toISOString(), content: snapshot.document as unknown as StudyContent });
      return { id: study.id, version: study.version, createdAt: row.createdAt.toISOString(), reference: study.content.reference };
    });
  }
  async guardActive<T>(ownerId: string, id: string, write: (scope: WriteScope) => Promise<T>): Promise<T> {
    return this.database.client.$transaction(async transaction => {
      const rows = await transaction.$queryRaw<{ id: string }[]>`SELECT id FROM app.study_record WHERE id=${id}::uuid AND owner_id=${ownerId} AND lifecycle='active' FOR UPDATE`;
      if (rows.length !== 1) throw new StudyNotFoundError();
      return usingWriteScope(this.database, transaction, write);
    });
  }
  async beginDelete(ownerId: string, id: string): Promise<void> {
    const updated = await this.database.client.studyRecord.updateMany({ where: { id, ownerId }, data: { lifecycle: 'deleting' } });
    if (updated.count !== 1) throw new StudyNotFoundError();
  }
  async finishDelete(ownerId: string, id: string): Promise<void> {
    const removed = await this.database.client.studyRecord.deleteMany({ where: { id, ownerId, lifecycle: 'deleting' } });
    if (removed.count !== 1) throw new StudyNotFoundError();
  }
  async create(ownerId: string, content: StudyContent): Promise<Study> {
    const now = new Date(); const study = new Study({ id: randomUUID(), ownerId, version: 1, createdAt: now.toISOString(), content });
    return this.database.client.$transaction(async transaction => {
      await transaction.studyRecord.create({ data: { id: study.id, ownerId, currentVersion: 1n, createdAt: now } });
      await transaction.studyVersion.create({ data: { studyId: study.id, number: 1n, document: documentFor(study.content), createdAt: now } });
      return study;
    });
  }
  async find(ownerId: string, id: string, version?: number): Promise<Study | null> {
    const record = await this.database.client.studyRecord.findUnique({ where: { id, ownerId, lifecycle: 'active' } });
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
      const updated = await transaction.studyRecord.updateMany({ where: { id, ownerId, lifecycle: 'active', currentVersion: { equals: BigInt(expectedVersion), lt: BigInt(Number.MAX_SAFE_INTEGER) } }, data: { currentVersion: { increment: 1 } } });
      if (updated.count !== 1) {
        const current = await transaction.studyRecord.findFirst({ where: { id, ownerId } });
        if (current?.lifecycle === 'deleting') throw new StudyNotFoundError();
        throw new StudyConflictError();
      }
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
