import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { AnalysisDomainError, AnalysisReference, ConsultedSegment, EvidenceRef, type AnalysisReferenceProps, type ConsultedSegmentProps, type EvidenceRefProps } from '../../../src/modules/ai-assistant/domain/analysis-values';

// Domain-only reads of genuine source; no admission, persistence or inference.
const original = (JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json', 'utf8')) as { sourceId: string; id: string; locator: string; textSha256: string; text: string }[])[0]!;
const reference = (): AnalysisReferenceProps => ({ translationId: 'por-br-2018', bookCode: 'GEN', chapter: 1, fromVerse: 1, toVerse: 1, normalized: 'GEN 1:1' });
const evidence = (): EvidenceRefProps => ({ sourceId: original.sourceId, excerptId: original.id, locator: original.locator, textSha256: original.textSha256, startOffset: 0, endOffset: 52 });
const segment = (): ConsultedSegmentProps => ({ id: 'p1-c1', sourceId: original.sourceId, excerptId: original.id, sourceDigest: original.textSha256, textDigest: createHash('sha256').update(Array.from(original.text).slice(0, 1000).join('')).digest('hex'), startOffset: 0, endOffset: 1000 });

describe('owned analysis references, no dependency on other module types', () => {
  it('copies and freezes exact single verse and range references', () => {
    const input = reference(); const value = new AnalysisReference(input);
    expect(value).toEqual(input); expect(Object.isFrozen(value)).toBe(true);
    Reflect.set(input, 'chapter', 3); expect(value.chapter).toBe(1);
    expect(new AnalysisReference({ ...reference(), toVerse: 3, normalized: 'GEN 1:1-3' }).normalized).toBe('GEN 1:1-3');
  });
  it.each(['', 'UPPER', 'a b', '-a', 'a\n', '../a', null])('rejects translation identity %p', translationId => {
    expect(() => new AnalysisReference({ ...reference(), translationId: translationId as string })).toThrow(AnalysisDomainError);
  });
  it.each(['gen', 'GEN\n', 'GG', 'ABCD', null])('rejects book code %p', bookCode => {
    expect(() => new AnalysisReference({ ...reference(), bookCode: bookCode as string })).toThrow(AnalysisDomainError);
  });
  it.each(['chapter', 'fromVerse', 'toVerse'] as const)('requires safe positive %s', field => {
    for (const invalid of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1', null]) expect(() => new AnalysisReference({ ...reference(), [field]: invalid } as AnalysisReferenceProps)).toThrow(AnalysisDomainError);
  });
  it('requires ordered range and exact normalized reference', () => {
    expect(() => new AnalysisReference({ ...reference(), fromVerse: 2 })).toThrow(AnalysisDomainError);
    for (const normalized of ['GEN 1:1-1', 'GEN 1:2', 'GEN 1:1\n', null]) expect(() => new AnalysisReference({ ...reference(), normalized: normalized as string })).toThrow(AnalysisDomainError);
    expect(new AnalysisReference({ ...reference(), chapter: Number.MAX_SAFE_INTEGER, normalized: `GEN ${Number.MAX_SAFE_INTEGER}:1` }).chapter).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe('persistent evidence is only immutable metadata and original spans', () => {
  it('copies known identities/digest/offsets, never retaining supplied source text or extra fields', () => {
    const input = { ...evidence(), quote: original.text, privateExtra: 'technical' }; const value = new EvidenceRef(input);
    expect(value).toEqual(evidence()); expect(Object.isFrozen(value)).toBe(true);
    expect(JSON.stringify(value)).not.toContain('quote'); expect(JSON.stringify(value)).not.toContain(original.text);
    Reflect.set(input, 'sourceId', 'changed'); expect(value.sourceId).toBe(original.sourceId);
    expect(Reflect.set(value, 'endOffset', 99)).toBe(false);
  });
  it.each(['sourceId', 'excerptId'] as const)('requires a source-library slug for %s', field => {
    for (const invalid of ['', 'a b', 'a\n', '-leading', null, 1]) expect(() => new EvidenceRef({ ...evidence(), [field]: invalid } as EvidenceRefProps)).toThrow(AnalysisDomainError);
  });
  it.each(['', ' \t', '\ud800', null, 1])('rejects invalid locator %p', locator => {
    expect(() => new EvidenceRef({ ...evidence(), locator: locator as string })).toThrow(AnalysisDomainError);
  });
  it.each(['', 'a'.repeat(63), 'a'.repeat(65), 'G'.repeat(64), 'A'.repeat(64), 'a'.repeat(64) + '\n', null, 1])('rejects a noncanonical sha256 %p', textSha256 => {
    expect(() => new EvidenceRef({ ...evidence(), textSha256: textSha256 as string })).toThrow(AnalysisDomainError);
  });
  it.each(['startOffset', 'endOffset'] as const)('requires safe integral %s and an ordered nonempty span', field => {
    for (const invalid of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, null, '1']) expect(() => new EvidenceRef({ ...evidence(), [field]: invalid } as EvidenceRefProps)).toThrow(AnalysisDomainError);
    expect(() => new EvidenceRef({ ...evidence(), endOffset: 0 })).toThrow(AnalysisDomainError);
    expect(() => new EvidenceRef({ ...evidence(), startOffset: 52 })).toThrow(AnalysisDomainError);
    expect(new EvidenceRef({ ...evidence(), startOffset: Number.MAX_SAFE_INTEGER - 1, endOffset: Number.MAX_SAFE_INTEGER }).endOffset).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe('consulted retrieval metadata', () => {
  it('retains only exact segment identities, digests and span, without vectors/text', () => {
    const input = { ...segment(), text: original.text, embedding: [1, 0] }; const value = new ConsultedSegment(input);
    expect(value).toEqual(segment()); expect(Object.isFrozen(value)).toBe(true);
    Reflect.set(input, 'sourceDigest', 'b'.repeat(64)); expect(value.sourceDigest).toBe(original.textSha256);
    expect(Reflect.set(value, 'id', 'p1-c2')).toBe(false);
  });
  it.each(['id', 'sourceId', 'excerptId'] as const)('rejects unsafe segment %s', field => {
    for (const invalid of ['', 'a\n', '../a', null]) expect(() => new ConsultedSegment({ ...segment(), [field]: invalid } as ConsultedSegmentProps)).toThrow(AnalysisDomainError);
  });
  it.each(['sourceDigest', 'textDigest'] as const)('rejects invalid %s', field => {
    for (const invalid of ['a'.repeat(63), 'G'.repeat(64), null]) expect(() => new ConsultedSegment({ ...segment(), [field]: invalid } as ConsultedSegmentProps)).toThrow(AnalysisDomainError);
  });
  it('validates nonnegative safe offset and positive safe end strictly greater than start', () => {
    expect(() => new ConsultedSegment({ ...segment(), startOffset: -1 })).toThrow(AnalysisDomainError);
    expect(() => new ConsultedSegment({ ...segment(), startOffset: 0.5 })).toThrow(AnalysisDomainError);
    expect(() => new ConsultedSegment({ ...segment(), endOffset: Number.MAX_SAFE_INTEGER + 1 })).toThrow(AnalysisDomainError);
    expect(() => new ConsultedSegment({ ...segment(), startOffset: 1000 })).toThrow(AnalysisDomainError);
    expect(() => new ConsultedSegment({ ...segment(), endOffset: 0 })).toThrow(AnalysisDomainError);
  });
});
