import type { AdmittedAiExcerpt, AiAnalysisSettings, AiIdentityClockPort, AiOperationPort, AiSourcesPort, AiStudyContext, AiTextHashPort, AnalysisStorePort, RetrievedAiChunk, StudyContextPort, VectorIndexPort } from './analysis-ports';
import type { EmbeddingsPort, LlmProviderPort } from './ports';
import { AnalysisDocument, type AiAnalysisView, type AnalysisProvenanceProps, type ResolvedAnalysisEvidence } from '../domain/analysis-document';
import { requireAnalysisValue, sameConsultedSegment, type EvidenceRefProps } from '../domain/analysis-values';
import { AiModelInputError, AiQuestion } from '../domain/model-input';
import { selectSourceContext, splitSourceSentences } from '../domain/source-context';
import { AiNotFoundError, AiResultRejectedError, AiSourceIntegrityError, AiUnavailableError } from './errors';
import { checkedEmbedding, checkedGeneration } from './model-results';

const limitations = [
  'Cobertura limitada a quatro parágrafos de uma obra antiga (Josefo/Whiston); não são testemunhos independentes.',
  'Citação literal em inglês; este perfil seleciona no máximo uma frase.',
  'Relato atribuído à fonte; não constitui confirmação histórica independente nem consenso académico moderno.',
  'Somente trechos recuperados das fontes autorizadas associadas à versão do estudo foram considerados; a cobertura é parcial.',
] as const;
const noSources = 'Nenhuma fonte autorizada desta versão está disponível; nenhum modelo foi executado.';
const segmentKey = (row: RetrievedAiChunk): string => `${row.excerptId}/${row.id}`;

export class AiAnalysisLibrary {
  constructor(private readonly settings: AiAnalysisSettings, private readonly studies: StudyContextPort, private readonly sources: AiSourcesPort, private readonly embeddings: EmbeddingsPort, private readonly llm: LlmProviderPort, private readonly index: VectorIndexPort, private readonly store: AnalysisStorePort, private readonly operation: AiOperationPort, private readonly identity: AiIdentityClockPort, private readonly hash: AiTextHashPort) {}
  async create(ownerId: string, studyId: string, studyVersion: number, input: string, signal?: AbortSignal, retrievalInput?: string): Promise<AiAnalysisView> {
    const question = new AiQuestion(input);
    const retrieval = new AiQuestion(retrievalInput ?? input);
    if (!Number.isSafeInteger(studyVersion) || studyVersion <= 0) throw new AiModelInputError();
    const study = await this.studies.read(ownerId, studyId, studyVersion);
    return this.operation.run(async active => {
      const eligible: AdmittedAiExcerpt[] = [];
      for (const ref of study.evidenceRefs) {
        const source = await this.sources.read(ref.excerptId);
        if (source && source.sourceId === ref.sourceId && source.textSha256 === ref.textSha256 && source.locator === ref.locator) eligible.push(source);
      }
      if (active.aborted) throw new AiUnavailableError();
      if (eligible.length === 0) {
        const provenance: AnalysisProvenanceProps = { profileId: this.settings.profileId, promptVersion: this.settings.promptVersion, modelId: null, modelSha256: null, embeddingModelSha256: null, runtimeVersion: null, dimensions: null, contextLimit: this.settings.contextLimit, outputLimit: this.settings.outputLimit, promptTokens: 0, completionTokens: 0, totalTokens: 0, embeddingPromptTokens: 0, consultedSegments: [] };
        return this.persist(ownerId, study, question, 'insufficient-evidence', [], [...limitations, noSources], provenance, active);
      }
      if (!await this.index.readiness(this.settings.indexProfile)) throw new AiUnavailableError();
      const embedded = checkedEmbedding(await this.embeddings.embed({ purpose: 'question', texts: [retrieval.text] }, active), 1, this.settings);
      const retrieved = await this.index.search(this.settings.indexProfile, embedded.vectors[0]!, eligible.map(row => ({ sourceId: row.sourceId, excerptId: row.excerptId, textSha256: row.textSha256 })));
      if (retrieved.length < 1 || retrieved.length > 3 || new Set(retrieved.map(segmentKey)).size !== retrieved.length) throw new AiResultRejectedError();
      const used = new Map<string, AdmittedAiExcerpt>();
      const candidates = retrieved.map(row => {
        const source = eligible.find(value => value.sourceId === row.sourceId && value.excerptId === row.excerptId && value.textSha256 === row.sourceDigest);
        if (!source || !this.settings.indexProfile.expectedSegments.some(expected => sameConsultedSegment(expected, row))) throw new AiResultRejectedError();
        const points = Array.from(source.text); const text = points.slice(row.startOffset, row.endOffset).join('');
        if (row.endOffset > points.length || this.hash.sha256(text) !== row.textDigest) throw new AiResultRejectedError();
        used.set(source.excerptId, source);
        return { segment: { id: row.id, paragraph: source.paragraph, start: row.startOffset, end: row.endOffset, text }, sentences: splitSourceSentences(source.paragraph, source.text) };
      });
      const context = selectSourceContext(candidates);
      if (context.length === 0) throw new AiResultRejectedError();
      await this.current([...used.values()], active);
      const generated = checkedGeneration(await this.llm.select(question, context, active), context, this.settings, embedded.provenance.runtimeVersion);
      await this.current([...used.values()], active);
      const selected = generated.selection.sentence;
      const source = selected === null ? null : [...used.values()].find(value => value.paragraph === selected.paragraph)!;
      const refs: readonly EvidenceRefProps[] = selected === null ? [] : [{ sourceId: source!.sourceId, excerptId: source!.excerptId, locator: source!.locator, textSha256: source!.textSha256, startOffset: selected.start, endOffset: selected.end }];
      const provenance: AnalysisProvenanceProps = { profileId: generated.provenance.profileId, promptVersion: this.settings.promptVersion, modelId: generated.provenance.modelId, modelSha256: generated.provenance.modelSha256, embeddingModelSha256: embedded.provenance.modelSha256, runtimeVersion: generated.provenance.runtimeVersion, dimensions: embedded.provenance.dimensions, contextLimit: generated.provenance.contextLimit, outputLimit: generated.provenance.outputLimit, ...generated.usage, embeddingPromptTokens: embedded.usage.promptTokens, consultedSegments: retrieved };
      return this.persist(ownerId, study, question, generated.selection.status, refs, limitations, provenance, active);
    }, signal);
  }
  private async current(previous: readonly AdmittedAiExcerpt[], signal: AbortSignal): Promise<void> {
    for (const source of previous) {
      if (signal.aborted) throw new AiUnavailableError();
      const current = await this.sources.read(source.excerptId);
      if (!current || current.sourceId !== source.sourceId || current.locator !== source.locator || current.paragraph !== source.paragraph || current.textSha256 !== source.textSha256 || this.hash.sha256(current.text) !== source.textSha256) throw new AiResultRejectedError();
    }
    if (signal.aborted) throw new AiUnavailableError();
  }
  private async persist(ownerId: string, study: AiStudyContext, question: AiQuestion, status: 'supported' | 'insufficient-evidence', evidenceRefs: readonly EvidenceRefProps[], notes: readonly string[], provenance: AnalysisProvenanceProps, signal: AbortSignal): Promise<AiAnalysisView> {
    const document = new AnalysisDocument({ schemaVersion: 1, id: this.identity.newId(), ownerId, studyId: study.id, studyVersion: study.version, createdAt: this.identity.now(), reference: study.reference, question: question.text, status, evidenceRefs, limitations: notes, provenance });
    await this.store.create(document, signal);
    return this.deliver(ownerId, document);
  }
  async read(ownerId: string, id: string): Promise<AiAnalysisView> {
    const document = await this.store.find(ownerId, id);
    if (!document) throw new AiNotFoundError();
    return this.deliver(ownerId, document);
  }
  private async deliver(ownerId: string, document: AnalysisDocument): Promise<AiAnalysisView> {
    const study = await this.studies.read(ownerId, document.studyId, document.studyVersion); const actual = study.reference; const expected = document.reference;
    requireAnalysisValue(actual.translationId === expected.translationId && actual.bookCode === expected.bookCode && actual.chapter === expected.chapter && actual.fromVerse === expected.fromVerse && actual.toVerse === expected.toVerse && actual.normalized === expected.normalized);
    const sources = new Map<string, AdmittedAiExcerpt>();
    for (const ref of [...document.provenance.consultedSegments.map(row => ({ sourceId: row.sourceId, excerptId: row.excerptId, textSha256: row.sourceDigest })), ...document.evidenceRefs]) {
      const source = sources.get(ref.excerptId) ?? await this.sources.read(ref.excerptId);
      if (!source || source.sourceId !== ref.sourceId || source.textSha256 !== ref.textSha256) return document.forDelivery(null);
      sources.set(source.excerptId, source);
    }
    for (const row of document.provenance.consultedSegments) {
      const source = sources.get(row.excerptId)!; const points = Array.from(source.text);
      if (row.endOffset > points.length || this.hash.sha256(points.slice(row.startOffset, row.endOffset).join('')) !== row.textDigest) throw new AiSourceIntegrityError();
    }
    const evidence: ResolvedAnalysisEvidence[] = document.evidenceRefs.map(ref => {
      const source = sources.get(ref.excerptId)!;
      if (source.locator !== ref.locator || !splitSourceSentences(source.paragraph, source.text).some(sentence => sentence.start === ref.startOffset && sentence.end === ref.endOffset)) throw new AiSourceIntegrityError();
      return { ...ref, quote: Array.from(source.text).slice(ref.startOffset, ref.endOffset).join(''), attribution: source.attribution, rightsStatement: source.rightsStatement, rightsUrl: source.rightsUrl };
    });
    return document.forDelivery(evidence);
  }
  async delete(ownerId: string, id: string): Promise<void> { if (!await this.store.delete(ownerId, id)) throw new AiNotFoundError(); }
}
