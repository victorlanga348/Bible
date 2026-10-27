import type { Database } from '../../../infrastructure/database';
import type { AnalysisStorePort } from '../application/analysis-ports';
import { AnalysisDocument, type AnalysisDocumentProps } from '../domain/analysis-document';
import { requireAnalysisValue } from '../domain/analysis-values';
import type { Prisma } from '../../../generated/prisma/client';

export class PrismaAnalysisStore implements AnalysisStorePort {
  constructor(private readonly database: Database) {}
  async create(input: AnalysisDocument): Promise<void> {
    const document = new AnalysisDocument(input);
    await this.database.client.aiAnalysis.create({ data: { id: document.id, ownerId: document.ownerId, studyId: document.studyId, studyVersion: BigInt(document.studyVersion), document: JSON.parse(JSON.stringify(document)) as Prisma.InputJsonValue, createdAt: new Date(document.createdAt) } });
  }
  async find(ownerId: string, id: string): Promise<AnalysisDocument | null> {
    const row = await this.database.client.aiAnalysis.findFirst({ where: { id, ownerId } });
    if (!row) return null;
    const document = new AnalysisDocument(row.document as unknown as AnalysisDocumentProps);
    requireAnalysisValue(document.id.toLowerCase() === row.id && document.ownerId === row.ownerId && document.studyId.toLowerCase() === row.studyId && BigInt(document.studyVersion) === row.studyVersion && document.createdAt === row.createdAt.toISOString());
    return document;
  }
  async delete(ownerId: string, id: string): Promise<boolean> {
    return (await this.database.client.aiAnalysis.deleteMany({ where: { id, ownerId } })).count === 1;
  }
}
