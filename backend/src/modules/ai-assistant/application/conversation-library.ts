import type { ConversationStorePort, ConversationAnalysesPort, ConversationView } from './conversation-ports';
import type { AiIdentityClockPort, StudyContextPort } from './analysis-ports';
import { ConversationConflictError, ConversationDocument } from '../domain/conversation';
import type { AiAnalysisView } from '../domain/analysis-document';
import { AiModelInputError } from '../domain/model-input';
import { AiNotFoundError, AiUnavailableError } from './errors';

function active(signal?: AbortSignal): void { if (signal?.aborted) throw new AiUnavailableError(); }
function coherent(document: ConversationDocument, analysis: AiAnalysisView, question: string): void {
  if (analysis.studyId !== document.studyId || analysis.studyVersion !== document.studyVersion || analysis.question !== question) throw new AiUnavailableError('Incoherent conversation analysis');
}

export class ConversationLibrary {
  constructor(private readonly store: ConversationStorePort, private readonly analyses: ConversationAnalysesPort, private readonly studies: StudyContextPort, private readonly identity: AiIdentityClockPort) {}
  async create(ownerId: string, studyId: string, studyVersion: number, signal?: AbortSignal): Promise<ConversationView> {
    active(signal);
    if (!Number.isSafeInteger(studyVersion) || studyVersion < 1) throw new AiModelInputError();
    const study = await this.studies.read(ownerId, studyId, studyVersion);
    const document = new ConversationDocument({ schemaVersion: 1, id: this.identity.newId(), ownerId, studyId: study.id, studyVersion: study.version, createdAt: this.identity.now(), turns: [] });
    await this.store.create(document, signal); return this.deliver(ownerId, document);
  }
  private async load(ownerId: string, id: string): Promise<ConversationDocument> {
    const document = await this.store.find(ownerId, id); if (!document) throw new AiNotFoundError();
    await this.studies.read(ownerId, document.studyId, document.studyVersion); return document;
  }
  async read(ownerId: string, id: string): Promise<ConversationView> { return this.deliver(ownerId, await this.load(ownerId, id)); }
  private async deliver(ownerId: string, document: ConversationDocument): Promise<ConversationView> {
    const turns = [];
    for (const [index, turn] of document.turns.entries()) {
      let analysis: AiAnalysisView | null;
      try { analysis = await this.analyses.read(ownerId, turn.analysisId); }
      catch (error) { if (!(error instanceof AiNotFoundError)) throw error; analysis = null; }
      if (analysis) {
        const expected = turn.contextVersion === 'questions-v3' ? turn.question : new ConversationDocument({ ...document, turns: document.turns.slice(0, index) }).context(turn.question, turn.contextTurnNumbers, turn.contextVersion ?? 'questions-v1').question;
        coherent(document, analysis, expected);
        if (analysis.id !== turn.analysisId) throw new AiUnavailableError('Incoherent conversation response');
      }
      turns.push(Object.freeze({ ...turn, analysis, responseStatus: analysis ? 'available' as const : 'unavailable' as const }));
    }
    return Object.freeze({ id: document.id, studyId: document.studyId, studyVersion: document.studyVersion, createdAt: document.createdAt, revision: document.revision, turns: Object.freeze(turns) });
  }
  async append(ownerId: string, id: string, expectedRevision: number, question: string, revisesTurn: number | null = null, signal?: AbortSignal): Promise<ConversationView> {
    active(signal); const document = await this.load(ownerId, id);
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || expectedRevision > 20) throw new AiModelInputError();
    if (expectedRevision !== document.revision || document.revision === 20) throw new ConversationConflictError();
    if (revisesTurn !== null && (!Number.isSafeInteger(revisesTurn) || revisesTurn < 1 || revisesTurn > document.revision)) throw new AiModelInputError();
    // Validate the current input before any historical read or model invocation.
    document.context(question, []);
    const previous = await this.deliver(ownerId, document);
    const eligible = previous.turns.filter(turn => turn.analysis && turn.analysis.status !== 'restricted').map(turn => turn.number);
    const context = document.context(question, eligible);
    let analysis: AiAnalysisView | undefined; let next: ConversationDocument;
    try {
      analysis = await this.analyses.create(ownerId, document.studyId, document.studyVersion, question.trim(), signal, context.question);
      active(signal); coherent(document, analysis, question.trim());
      next = document.append(expectedRevision, { question: question.trim(), analysisId: analysis.id, createdAt: analysis.createdAt, contextTurnNumbers: context.contextTurnNumbers, omittedTurns: context.omittedTurns, revisesTurn, contextVersion: context.contextVersion });
      if (!await this.store.replace(next, expectedRevision, signal)) throw new ConversationConflictError();
    } catch (error) {
      if (analysis) {
        try { await this.analyses.delete(ownerId, analysis.id); }
        catch (cleanup) { if (!(cleanup instanceof AiNotFoundError)) throw new AiUnavailableError('Conversation compensation failed', { cause: { error, cleanup } }); }
      }
      throw error;
    }
    // After CAS commits, response failure is uncertain delivery; never delete a confirmed analysis.
    return this.deliver(ownerId, next);
  }
  async delete(ownerId: string, id: string): Promise<void> { if (!await this.store.delete(ownerId, id)) throw new AiNotFoundError(); }
}
