import type { RelationCreate, RelationPage, RelationView, RelationStorePort, RelationCanonPort, RelationSourcesPort, RelationIdentityClockPort } from './ports';
import type { RelationWindow } from '../domain/relation';
import { CrossReference, RelationInputError, relationId, relationOwner, validateWindow } from '../domain/relation';
import { RelationNotFoundError } from './errors';
export class RelationLibrary {
  constructor(private readonly store: RelationStorePort, private readonly canon: RelationCanonPort, private readonly sources: RelationSourcesPort, private readonly identity: RelationIdentityClockPort) {}
  private async project(document: CrossReference): Promise<RelationView> {
    return { id: document.id, from: document.from, to: document.to, type: document.type, reading: document.reading, rationale: document.rationale, assessment: 'user-interpretation', evidence: await this.sources.deliver(document.evidence), createdAt: document.createdAt,
      limitations: ['Classificação e fundamento são uma interpretação pessoal fornecida pelo utilizador.', 'A ligação e as leituras requerem avaliação crítica das fontes e do contexto bíblico.', 'A cobertura da biblioteca é parcial; uma referência não constitui confirmação histórica independente.'] };
  }
  async create(owner: string, input: RelationCreate): Promise<RelationView> {
    relationOwner(owner);
    if (!Array.isArray(input.evidence) || input.evidence.length < 1 || input.evidence.length > 4 || typeof input.rationale !== 'string') throw new RelationInputError();
    const from = await this.canon.resolve(input.from.translationId, input.from.reference); const to = await this.canon.resolve(input.to.translationId, input.to.reference);
    const evidence = await this.sources.capture(input.evidence);
    const document = new CrossReference({ schemaVersion: 1, id: this.identity.nextId(), ownerId: owner, from, to, type: input.type, reading: input.reading, rationale: input.rationale.trim(), evidence, createdAt: this.identity.now() });
    const view = await this.project(document); await this.store.create(document); return view;
  }
  async read(owner: string, id: string): Promise<RelationView> {
    relationOwner(owner); relationId(id); const document = await this.store.find(owner, id); if (!document) throw new RelationNotFoundError(); return this.project(document);
  }
  async list(owner: string, translation: string, reference: string, query: RelationWindow): Promise<RelationPage> {
    validateWindow(owner, query); const passage = await this.canon.resolve(translation, reference); const rows = await this.store.list(owner, passage, query); const selected = rows.slice(0, query.limit); const last = selected.at(-1);
    return { items: await Promise.all(selected.map(row => this.project(row))), nextCursor: rows.length > query.limit && last ? { id: last.id, createdAt: last.createdAt } : null };
  }
  async delete(owner: string, id: string): Promise<void> { relationOwner(owner); relationId(id); if (!await this.store.delete(owner, id)) throw new RelationNotFoundError(); }
}
