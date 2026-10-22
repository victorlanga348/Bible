import type { StudyBuilderPort, StudySourcesPort, StudyStorePort } from './ports';
import type { Study, StudyView } from '../domain/study';
import { StudyConflictError, StudyNotFoundError } from './errors';

export class StudyLibrary {
  constructor(private readonly builder: StudyBuilderPort, private readonly store: StudyStorePort, private readonly sources: StudySourcesPort) {}
  private async deliver(study: Study): Promise<StudyView> { return study.forDelivery(await this.sources.availability(study.content.evidence)); }
  async create(ownerId: string, translationId: string, reference: string): Promise<StudyView> {
    const content = await this.builder.execute(translationId, reference);
    return this.deliver(await this.store.create(ownerId, content));
  }
  async read(ownerId: string, id: string, version?: number): Promise<StudyView> {
    const study = await this.store.find(ownerId, id, version);
    if (study === null) throw new StudyNotFoundError();
    return this.deliver(study);
  }
  async revise(ownerId: string, id: string, expectedVersion: number): Promise<StudyView> {
    const study = await this.store.find(ownerId, id);
    if (study === null) throw new StudyNotFoundError();
    if (study.version !== expectedVersion || expectedVersion === Number.MAX_SAFE_INTEGER) throw new StudyConflictError();
    const content = await this.builder.execute(study.content.reference.translationId, study.content.reference.normalized);
    return this.deliver(await this.store.append(ownerId, id, expectedVersion, content));
  }
}
