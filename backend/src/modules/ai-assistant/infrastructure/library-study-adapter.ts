import type { StudyLibrary } from '../../study/application/study-library';
import type { AiStudyContext, StudyContextPort } from '../application/analysis-ports';
import { StudyNotFoundError } from '../../study/application/errors';
import { AnalysisReference } from '../domain/analysis-values';
import { AiNotFoundError } from '../application/errors';

export class LibraryStudyContextAdapter implements StudyContextPort {
  constructor(private readonly library: StudyLibrary) {}
  async read(ownerId: string, studyId: string, version: number): Promise<AiStudyContext> {
    try {
      const study = await this.library.read(ownerId, studyId, version);
      const reference = new AnalysisReference(study.reference);
      const evidenceRefs = Object.freeze(study.evidence.map(row => Object.freeze({ sourceId: row.sourceId, excerptId: row.excerptId, textSha256: row.textSha256, locator: row.locator })));
      return Object.freeze({ id: study.id, version: study.version, reference, evidenceRefs });
    } catch (error) {
      if (error instanceof StudyNotFoundError) throw new AiNotFoundError();
      throw error;
    }
  }
}
