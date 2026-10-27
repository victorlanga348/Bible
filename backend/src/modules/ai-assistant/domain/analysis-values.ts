export class AnalysisDomainError extends Error {}
export function requireAnalysisValue(condition: boolean): asserts condition { if (!condition) throw new AnalysisDomainError('Invalid analysis value'); }
export function requireAnalysisText(value: string): void { requireAnalysisValue(typeof value === 'string' && value.trim().length > 0 && !/[\uD800-\uDFFF]/u.test(value)); }
export function requireAnalysisIdentity(value: string): void { requireAnalysisText(value); requireAnalysisValue(value === value.trim() && /^[a-z0-9][a-z0-9-]*$/.test(value)); }
export function requireAnalysisPositive(value: number): void { requireAnalysisValue(Number.isSafeInteger(value) && value > 0); }
export function requireAnalysisDigest(value: string): void { requireAnalysisValue(typeof value === 'string' && value.length === 64 && /^[a-f0-9]{64}$/.test(value)); }
function requireSpan(start: number, end: number): void { requireAnalysisValue(Number.isSafeInteger(start) && start >= 0); requireAnalysisPositive(end); requireAnalysisValue(end > start); }
export interface AnalysisReferenceProps {
  readonly translationId: string; readonly bookCode: string; readonly chapter: number; readonly fromVerse: number; readonly toVerse: number; readonly normalized: string;
}
export interface EvidenceRefProps {
  readonly sourceId: string; readonly excerptId: string; readonly locator: string; readonly textSha256: string; readonly startOffset: number; readonly endOffset: number;
}
export interface ConsultedSegmentProps {
  readonly id: string; readonly sourceId: string; readonly excerptId: string; readonly sourceDigest: string; readonly textDigest: string; readonly startOffset: number; readonly endOffset: number;
}
export function sameConsultedSegment(left: ConsultedSegmentProps, right: ConsultedSegmentProps): boolean {
  return left.id === right.id && left.sourceId === right.sourceId && left.excerptId === right.excerptId && left.sourceDigest === right.sourceDigest && left.textDigest === right.textDigest && left.startOffset === right.startOffset && left.endOffset === right.endOffset;
}
export class AnalysisReference implements AnalysisReferenceProps {
  declare readonly translationId: string; declare readonly bookCode: string; declare readonly chapter: number;
  declare readonly fromVerse: number; declare readonly toVerse: number; declare readonly normalized: string;
  constructor(input: AnalysisReferenceProps) {
    requireAnalysisIdentity(input.translationId);
    requireAnalysisValue(typeof input.bookCode === 'string' && input.bookCode.length === 3 && /^[A-Z0-9]{3}$/.test(input.bookCode));
    [input.chapter, input.fromVerse, input.toVerse].forEach(requireAnalysisPositive);
    requireAnalysisValue(input.toVerse >= input.fromVerse);
    const normalized = `${input.bookCode} ${input.chapter}:${input.fromVerse}${input.fromVerse === input.toVerse ? '' : `-${input.toVerse}`}`;
    requireAnalysisValue(input.normalized === normalized);
    this.translationId = input.translationId; this.bookCode = input.bookCode; this.chapter = input.chapter;
    this.fromVerse = input.fromVerse; this.toVerse = input.toVerse; this.normalized = input.normalized;
    Object.freeze(this);
  }
}
export class EvidenceRef implements EvidenceRefProps {
  declare readonly sourceId: string; declare readonly excerptId: string; declare readonly locator: string;
  declare readonly textSha256: string; declare readonly startOffset: number; declare readonly endOffset: number;
  constructor(input: EvidenceRefProps) {
    requireAnalysisIdentity(input.sourceId); requireAnalysisIdentity(input.excerptId); requireAnalysisText(input.locator);
    requireAnalysisDigest(input.textSha256); requireSpan(input.startOffset, input.endOffset);
    this.sourceId = input.sourceId; this.excerptId = input.excerptId; this.locator = input.locator;
    this.textSha256 = input.textSha256; this.startOffset = input.startOffset; this.endOffset = input.endOffset;
    Object.freeze(this);
  }
}
export class ConsultedSegment implements ConsultedSegmentProps {
  declare readonly id: string; declare readonly sourceId: string; declare readonly excerptId: string;
  declare readonly sourceDigest: string; declare readonly textDigest: string; declare readonly startOffset: number; declare readonly endOffset: number;
  constructor(input: ConsultedSegmentProps) {
    [input.id, input.sourceId, input.excerptId].forEach(requireAnalysisIdentity);
    [input.sourceDigest, input.textDigest].forEach(requireAnalysisDigest); requireSpan(input.startOffset, input.endOffset);
    this.id = input.id; this.sourceId = input.sourceId; this.excerptId = input.excerptId;
    this.sourceDigest = input.sourceDigest; this.textDigest = input.textDigest; this.startOffset = input.startOffset; this.endOffset = input.endOffset;
    Object.freeze(this);
  }
}
