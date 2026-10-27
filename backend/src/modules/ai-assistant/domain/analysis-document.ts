import { AnalysisReference, ConsultedSegment, EvidenceRef, requireAnalysisDigest, requireAnalysisIdentity, requireAnalysisPositive, requireAnalysisText, requireAnalysisValue, type AnalysisReferenceProps, type ConsultedSegmentProps, type EvidenceRefProps } from './analysis-values';
import { AiQuestion } from './model-input';

export interface AnalysisProvenanceProps {
  readonly profileId: string; readonly promptVersion: string;
  readonly modelId: string | null; readonly modelSha256: string | null; readonly embeddingModelSha256: string | null; readonly runtimeVersion: string | null; readonly dimensions: number | null;
  readonly contextLimit: number; readonly outputLimit: number; readonly promptTokens: number; readonly completionTokens: number; readonly totalTokens: number; readonly embeddingPromptTokens: number;
  readonly consultedSegments: readonly ConsultedSegmentProps[];
}
export class AnalysisProvenance implements AnalysisProvenanceProps {
  declare readonly profileId: string; declare readonly promptVersion: string;
  declare readonly modelId: string | null; declare readonly modelSha256: string | null; declare readonly embeddingModelSha256: string | null; declare readonly runtimeVersion: string | null; declare readonly dimensions: number | null;
  declare readonly contextLimit: number; declare readonly outputLimit: number; declare readonly promptTokens: number; declare readonly completionTokens: number; declare readonly totalTokens: number; declare readonly embeddingPromptTokens: number;
  declare readonly consultedSegments: readonly ConsultedSegmentProps[];
  constructor(input: AnalysisProvenanceProps) {
    requireAnalysisIdentity(input.profileId); requireAnalysisIdentity(input.promptVersion);
    requireAnalysisPositive(input.contextLimit); requireAnalysisPositive(input.outputLimit); requireAnalysisValue(input.outputLimit < input.contextLimit);
    const counts = [input.promptTokens, input.completionTokens, input.totalTokens, input.embeddingPromptTokens];
    counts.forEach(value => requireAnalysisValue(Number.isSafeInteger(value) && value >= 0));
    requireAnalysisValue(Array.isArray(input.consultedSegments) && input.consultedSegments.length <= 3);
    const segments = input.consultedSegments.map(row => new ConsultedSegment(row));
    requireAnalysisValue(new Set(segments.map(row => `${row.sourceId}/${row.excerptId}/${row.id}`)).size === segments.length);
    if (input.modelId === null) {
      requireAnalysisValue(input.modelSha256 === null && input.embeddingModelSha256 === null && input.runtimeVersion === null && input.dimensions === null);
      requireAnalysisValue(counts.every(value => value === 0) && segments.length === 0);
    } else {
      requireAnalysisIdentity(input.modelId); requireAnalysisDigest(input.modelSha256!); requireAnalysisDigest(input.embeddingModelSha256!); requireAnalysisText(input.runtimeVersion!);
      requireAnalysisValue(input.dimensions === 1024 && segments.length > 0 && counts.every(value => value > 0));
      requireAnalysisValue(input.totalTokens === input.promptTokens + input.completionTokens && input.completionTokens <= input.outputLimit && input.promptTokens + input.outputLimit <= input.contextLimit);
    }
    this.profileId = input.profileId; this.promptVersion = input.promptVersion;
    this.modelId = input.modelId; this.modelSha256 = input.modelSha256; this.embeddingModelSha256 = input.embeddingModelSha256; this.runtimeVersion = input.runtimeVersion; this.dimensions = input.dimensions;
    this.contextLimit = input.contextLimit; this.outputLimit = input.outputLimit; this.promptTokens = input.promptTokens; this.completionTokens = input.completionTokens; this.totalTokens = input.totalTokens; this.embeddingPromptTokens = input.embeddingPromptTokens;
    this.consultedSegments = Object.freeze(segments); Object.freeze(this);
  }
}
export interface AnalysisDocumentProps {
  readonly schemaVersion: 1; readonly id: string; readonly ownerId: string; readonly studyId: string; readonly studyVersion: number; readonly createdAt: string;
  readonly reference: AnalysisReferenceProps; readonly question: string; readonly status: 'supported' | 'insufficient-evidence';
  readonly evidenceRefs: readonly EvidenceRefProps[]; readonly limitations: readonly string[]; readonly provenance: AnalysisProvenanceProps;
}
export interface ResolvedAnalysisEvidence extends EvidenceRefProps { readonly quote: string; readonly attribution: string; readonly rightsStatement: string; readonly rightsUrl: string }
export interface AiAnalysisView {
  readonly id: string; readonly studyId: string; readonly studyVersion: number; readonly createdAt: string;
  readonly reference: AnalysisReferenceProps; readonly question: string; readonly status: 'supported' | 'insufficient-evidence' | 'restricted';
  readonly evidence: readonly ResolvedAnalysisEvidence[]; readonly limitations: readonly string[]; readonly provenance: AnalysisProvenanceProps;
}
export class AnalysisDocument implements AnalysisDocumentProps {
  declare readonly schemaVersion: 1; declare readonly id: string; declare readonly ownerId: string; declare readonly studyId: string; declare readonly studyVersion: number; declare readonly createdAt: string;
  declare readonly reference: AnalysisReferenceProps; declare readonly question: string; declare readonly status: 'supported' | 'insufficient-evidence';
  declare readonly evidenceRefs: readonly EvidenceRefProps[]; declare readonly limitations: readonly string[]; declare readonly provenance: AnalysisProvenanceProps;
  constructor(input: AnalysisDocumentProps) {
    requireAnalysisValue(input.schemaVersion === 1);
    for (const id of [input.id, input.studyId]) requireAnalysisValue(typeof id === 'string' && id.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
    requireAnalysisText(input.ownerId); requireAnalysisValue(input.ownerId === input.ownerId.trim() && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(input.ownerId));
    requireAnalysisPositive(input.studyVersion);
    requireAnalysisText(input.createdAt); requireAnalysisValue(Number.isFinite(Date.parse(input.createdAt)) && new Date(input.createdAt).toISOString() === input.createdAt);
    const reference = new AnalysisReference(input.reference); const question = new AiQuestion(input.question);
    const provenance = new AnalysisProvenance(input.provenance);
    requireAnalysisValue(Array.isArray(input.evidenceRefs));
    const evidence = input.evidenceRefs.map(row => new EvidenceRef(row));
    requireAnalysisValue(input.status === 'supported' ? evidence.length === 1 && provenance.modelId !== null : input.status === 'insufficient-evidence' && evidence.length === 0);
    for (const ref of evidence) requireAnalysisValue(provenance.consultedSegments.slice(0, 2).some(row => row.sourceId === ref.sourceId && row.excerptId === ref.excerptId && row.sourceDigest === ref.textSha256 && row.startOffset < ref.endOffset && row.endOffset > ref.startOffset));
    requireAnalysisValue(Array.isArray(input.limitations) && input.limitations.length > 0); input.limitations.forEach(requireAnalysisText);
    this.schemaVersion = 1; this.id = input.id; this.ownerId = input.ownerId; this.studyId = input.studyId; this.studyVersion = input.studyVersion; this.createdAt = input.createdAt;
    this.reference = reference; this.question = question.text; this.status = input.status;
    this.evidenceRefs = Object.freeze(evidence); this.limitations = Object.freeze([...input.limitations]); this.provenance = provenance;
    Object.freeze(this);
  }
  forDelivery(resolved: readonly ResolvedAnalysisEvidence[] | null): AiAnalysisView {
    const restricted = resolved === null;
    const evidence: ResolvedAnalysisEvidence[] = [];
    if (!restricted) {
      requireAnalysisValue(Array.isArray(resolved) && resolved.length === this.evidenceRefs.length);
      resolved.forEach((row, index) => {
        const metadata = new EvidenceRef(row); const expected = this.evidenceRefs[index]!;
        requireAnalysisValue(metadata.sourceId === expected.sourceId && metadata.excerptId === expected.excerptId && metadata.locator === expected.locator && metadata.textSha256 === expected.textSha256 && metadata.startOffset === expected.startOffset && metadata.endOffset === expected.endOffset);
        requireAnalysisText(row.quote); requireAnalysisValue(Array.from(row.quote).length === metadata.endOffset - metadata.startOffset);
        requireAnalysisText(row.attribution); requireAnalysisText(row.rightsStatement); requireAnalysisText(row.rightsUrl);
        requireAnalysisValue(URL.canParse(row.rightsUrl) && ['http:', 'https:'].includes(new URL(row.rightsUrl).protocol));
        evidence.push(Object.freeze({ ...metadata, quote: row.quote, attribution: row.attribution, rightsStatement: row.rightsStatement, rightsUrl: row.rightsUrl }));
      });
    }
    const provenance = restricted ? Object.freeze({ ...this.provenance, consultedSegments: Object.freeze([]) }) : this.provenance;
    const limitations = restricted ? Object.freeze([...this.limitations, 'Uma ou mais fontes estão indisponíveis nesta leitura.']) : this.limitations;
    return Object.freeze({ id: this.id, studyId: this.studyId, studyVersion: this.studyVersion, createdAt: this.createdAt, reference: this.reference, question: this.question, status: restricted ? 'restricted' : this.status, evidence: Object.freeze(evidence), limitations, provenance });
  }
}
