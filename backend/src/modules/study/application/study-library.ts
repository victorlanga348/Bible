import type { WriteScope } from '../../../application/write-scope';
import type { PageWindow, PageCursor } from '../../../application/pagination';
import type { StudySummary } from './ports';
import type { StudyBuilderPort, StudySourcesPort, StudyStorePort } from './ports';
import type { Study, StudyView } from '../domain/study';
import { StudyConflictError, StudyNotFoundError, StudyInputError } from './errors';

export class StudyLibrary {
  constructor(private readonly builder: StudyBuilderPort, private readonly store: StudyStorePort, private readonly sources: StudySourcesPort) {}
  async metadata(ownerId: string, id: string, version?: number): Promise<StudySummary> {
    const summary = await this.store.metadata(ownerId, id, version);
    if (!summary) throw new StudyNotFoundError();
    return summary;
  }
  async list(ownerId: string, window: PageWindow): Promise<{ items: readonly StudySummary[]; nextCursor: PageCursor | null }> {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(ownerId) || !Number.isSafeInteger(window.limit) || window.limit < 1 || window.limit > 50) throw new StudyInputError();
    if (window.cursor !== undefined && (!window.cursor || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(window.cursor.id) || !Number.isFinite(Date.parse(window.cursor.createdAt)) || new Date(window.cursor.createdAt).toISOString() !== window.cursor.createdAt)) throw new StudyInputError();
    const rows = await this.store.list(ownerId, window); const items = rows.slice(0, window.limit); const last = items.at(-1);
    return { items, nextCursor: rows.length > window.limit && last ? { id: last.id, createdAt: last.createdAt } : null };
  }
  async guardActive<T>(ownerId: string, id: string, write: (scope: WriteScope) => Promise<T>): Promise<T> { return this.store.guardActive(ownerId, id, write); }
  async beginDelete(ownerId: string, id: string): Promise<void> { await this.store.beginDelete(ownerId, id); }
  async finishDelete(ownerId: string, id: string): Promise<void> { await this.store.finishDelete(ownerId, id); }
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
    let revised: Study;
    try { revised = await this.store.append(ownerId, id, expectedVersion, content); }
    catch (cause) { if (cause instanceof StudyConflictError && await this.store.find(ownerId, id) === null) throw new StudyNotFoundError(); throw cause; }
    return this.deliver(revised);
  }
}
