import { AnalysisDocument, AnalysisProvenance, type AnalysisDocumentProps, type AnalysisProvenanceProps } from '../../../src/modules/ai-assistant/domain/analysis-document';
import { AnalysisDomainError } from '../../../src/modules/ai-assistant/domain/analysis-values';
import { AiModelInputError } from '../../../src/modules/ai-assistant/domain/model-input';
import { analysisDocument, analysisProvenance, analysisQuote, noInferenceProvenance, resolvedAnalysisEvidence } from '../../helpers/ai-analysis';

describe('actual-use provenance and explicit absence of inference', () => {
  it('deep copies known fields and freezes provenance/segments, dropping raw responses and vectors', () => {
    const input = { ...analysisProvenance(), rawResponse: 'technical forbidden' }; const value = new AnalysisProvenance(input);
    expect(value).toEqual(analysisProvenance()); expect(Object.isFrozen(value)).toBe(true); expect(Object.isFrozen(value.consultedSegments)).toBe(true); expect(Object.isFrozen(value.consultedSegments[0])).toBe(true);
    Reflect.set(input.consultedSegments[0]!, 'id', 'changed'); expect(value.consultedSegments[0]!.id).toBe('p1-c1');
  });
  it('represents no inference with null model metadata, zero usage and no consulted sources', () => {
    expect(new AnalysisProvenance(noInferenceProvenance())).toEqual(noInferenceProvenance());
  });
  it.each(['profileId', 'promptVersion'] as const)('requires a canonical %s', key => {
    for (const invalid of ['', 'a b', 'a\n', null]) expect(() => new AnalysisProvenance({ ...analysisProvenance(), [key]: invalid } as AnalysisProvenanceProps)).toThrow(AnalysisDomainError);
  });
  it.each(['modelId', 'modelSha256', 'embeddingModelSha256', 'runtimeVersion', 'dimensions'] as const)('requires coherent model execution field %s', key => {
    expect(() => new AnalysisProvenance({ ...analysisProvenance(), [key]: null })).toThrow(AnalysisDomainError);
    expect(() => new AnalysisProvenance({ ...noInferenceProvenance(), [key]: analysisProvenance()[key] })).toThrow(AnalysisDomainError);
  });
  it('checks executed identities, hashes, runtime text and exactly1024 dimensions', () => {
    for (const patch of [{ modelId: 'bad id' }, { modelSha256: 'a'.repeat(63) }, { embeddingModelSha256: 'G'.repeat(64) }, { runtimeVersion: ' \n' }, { dimensions: 1023 }, { dimensions: 1025 }]) expect(() => new AnalysisProvenance({ ...analysisProvenance(), ...patch })).toThrow(AnalysisDomainError);
  });
  it.each(['contextLimit', 'outputLimit'] as const)('requires positive safe %s and a viable prompt budget', key => {
    for (const invalid of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) expect(() => new AnalysisProvenance({ ...analysisProvenance(), [key]: invalid })).toThrow(AnalysisDomainError);
    expect(() => new AnalysisProvenance({ ...noInferenceProvenance(), contextLimit: 128, outputLimit: 128 })).toThrow(AnalysisDomainError);
  });
  it.each(['promptTokens', 'completionTokens', 'totalTokens', 'embeddingPromptTokens'] as const)('requires safe nonnegative actual %s and zero counters without execution', key => {
    for (const invalid of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1']) expect(() => new AnalysisProvenance({ ...analysisProvenance(), [key]: invalid } as AnalysisProvenanceProps)).toThrow(AnalysisDomainError);
    expect(() => new AnalysisProvenance({ ...noInferenceProvenance(), [key]: 1 })).toThrow(AnalysisDomainError);
    expect(() => new AnalysisProvenance({ ...analysisProvenance(), [key]: 0 })).toThrow(AnalysisDomainError);
  });
  it('checks usage sums and exact input/output limits, without silently truncating', () => {
    expect(() => new AnalysisProvenance({ ...analysisProvenance(), totalTokens: 106 })).toThrow(AnalysisDomainError);
    expect(() => new AnalysisProvenance({ ...analysisProvenance(), completionTokens: 129, totalTokens: 229 })).toThrow(AnalysisDomainError);
    expect(() => new AnalysisProvenance({ ...analysisProvenance(), promptTokens: 1921, totalTokens: 1926 })).toThrow(AnalysisDomainError);
    expect(new AnalysisProvenance({ ...analysisProvenance(), promptTokens: 1920, completionTokens: 128, totalTokens: 2048 }).totalTokens).toBe(2048);
  });
  it('requires one to three distinct consulted spans with inference and none without inference', () => {
    const base = analysisProvenance(); const row = base.consultedSegments[0]!;
    for (const consultedSegments of [null, [], [row, row], [1, 2, 3, 4].map(index => ({ ...row, id: `p1-c${index}` }))]) expect(() => new AnalysisProvenance({ ...base, consultedSegments } as AnalysisProvenanceProps)).toThrow(AnalysisDomainError);
    expect(() => new AnalysisProvenance({ ...noInferenceProvenance(), consultedSegments: [row] })).toThrow(AnalysisDomainError);
    expect(new AnalysisProvenance({ ...base, consultedSegments: [1, 2, 3].map(index => ({ ...row, id: `p1-c${index}` })) }).consultedSegments).toHaveLength(3);
  });
});

describe('private immutable analysis document and rights-aware projection', () => {
  it('keeps only metadata and exact reference fields, copies/freeze all values, and trims the validated question', () => {
    const input = { ...analysisDocument(), question: '  What does this source report?\n', rawPrompt: analysisQuote }; const value = new AnalysisDocument(input);
    expect(value).toEqual(analysisDocument()); expect(JSON.stringify(value)).not.toContain(analysisQuote);
    for (const nested of [value, value.reference, value.evidenceRefs, value.evidenceRefs[0], value.limitations, value.provenance]) expect(Object.isFrozen(nested)).toBe(true);
    Reflect.set(input.reference, 'chapter', 3); Reflect.set(input.evidenceRefs[0]!, 'locator', 'changed'); Reflect.set(input.limitations, '0', 'changed');
    expect(value.reference.chapter).toBe(1); expect(value.evidenceRefs[0]!.locator).toBe(analysisDocument().evidenceRefs[0]!.locator); expect(value.limitations).toEqual(analysisDocument().limitations);
  });
  it.each(['id', 'studyId'] as const)('requires exact UUID %s', key => {
    for (const invalid of ['', 'abc', analysisDocument()[key] + '\n', null]) expect(() => new AnalysisDocument({ ...analysisDocument(), [key]: invalid } as AnalysisDocumentProps)).toThrow(AnalysisDomainError);
  });
  it('validates versioned document format and safe positive study version', () => {
    for (const schemaVersion of [0, 2, '1', null]) expect(() => new AnalysisDocument({ ...analysisDocument(), schemaVersion } as AnalysisDocumentProps)).toThrow(AnalysisDomainError);
    for (const studyVersion of [0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1]) expect(() => new AnalysisDocument({ ...analysisDocument(), studyVersion })).toThrow(AnalysisDomainError);
    expect(new AnalysisDocument({ ...analysisDocument(), studyVersion: Number.MAX_SAFE_INTEGER }).studyVersion).toBe(Number.MAX_SAFE_INTEGER);
  });
  it.each(['', 'a b', '-a', 'a\n', 'a'.repeat(65), null])('requires a valid owner subject %p', ownerId => {
    expect(() => new AnalysisDocument({ ...analysisDocument(), ownerId: ownerId as string })).toThrow(AnalysisDomainError);
  });
  it('preserves valid subject case and punctuation', () => {
    expect(new AnalysisDocument({ ...analysisDocument(), ownerId: 'Owner.Name_12-a' }).ownerId).toBe('Owner.Name_12-a');
  });
  it.each(['', '2026-02-30T00:00:00.000Z', '2026-10-27', '2026-10-27T00:00:00Z', null])('requires a canonical real ISO timestamp %p', createdAt => {
    expect(() => new AnalysisDocument({ ...analysisDocument(), createdAt: createdAt as string })).toThrow(AnalysisDomainError);
  });
  it('validates question and reference using owned domain rules', () => {
    expect(() => new AnalysisDocument({ ...analysisDocument(), question: ' \n' })).toThrow(AiModelInputError);
    expect(() => new AnalysisDocument({ ...analysisDocument(), question: 'x'.repeat(1001) })).toThrow(AiModelInputError);
    expect(() => new AnalysisDocument({ ...analysisDocument(), reference: { ...analysisDocument().reference, normalized: 'wrong' } })).toThrow(AnalysisDomainError);
  });
  it('requires supported to have exactly one reference, insufficient to have none, and a persisted status from the model contract', () => {
    const base = analysisDocument(); const ref = base.evidenceRefs[0]!;
    for (const patch of [{ status: 'restricted' }, { status: 'unknown' }, { evidenceRefs: [] }, { evidenceRefs: [ref, ref] }, { evidenceRefs: null }, { status: 'insufficient-evidence', evidenceRefs: [ref] }, { provenance: noInferenceProvenance() }]) expect(() => new AnalysisDocument({ ...base, ...patch } as AnalysisDocumentProps)).toThrow(AnalysisDomainError);
    expect(new AnalysisDocument({ ...base, status: 'insufficient-evidence', evidenceRefs: [] }).status).toBe('insufficient-evidence');
    expect(new AnalysisDocument({ ...base, status: 'insufficient-evidence', evidenceRefs: [], provenance: noInferenceProvenance() }).status).toBe('insufficient-evidence');
  });
  it('requires selected evidence to match a source/digest and intersect a context segment among the first two retrieved', () => {
    const base = analysisDocument(); const ref = base.evidenceRefs[0]!; const row = base.provenance.consultedSegments[0]!;
    for (const patch of [{ sourceId: 'another' }, { excerptId: 'another' }, { textSha256: 'c'.repeat(64) }, { startOffset: 1000, endOffset: 1001 }]) expect(() => new AnalysisDocument({ ...base, evidenceRefs: [{ ...ref, ...patch }] })).toThrow(AnalysisDomainError);
    expect(() => new AnalysisDocument({ ...base, provenance: { ...base.provenance, consultedSegments: [{ ...row, id: 'p1-c2', startOffset: 900, endOffset: 1900 }, { ...row, id: 'p1-c3', startOffset: 1800, endOffset: 2127 }, row] } })).toThrow(AnalysisDomainError);
    expect(new AnalysisDocument({ ...base, evidenceRefs: [{ ...ref, startOffset: 990, endOffset: 1010 }] }).evidenceRefs[0]!.endOffset).toBe(1010);
  });
  it.each([[], null, [''], [' \n']])('requires explicit nonempty limitations %p', limitations => {
    expect(() => new AnalysisDocument({ ...analysisDocument(), limitations } as AnalysisDocumentProps)).toThrow(AnalysisDomainError);
  });
  it('delivers an exact attributed quote while omitting owner, storage version and evidence references', () => {
    const document = new AnalysisDocument(analysisDocument()); const input = { ...resolvedAnalysisEvidence(), rawResponse: 'technical secret' }; const view = document.forDelivery([input]);
    expect(view.evidence).toEqual([resolvedAnalysisEvidence()]); expect(view.status).toBe('supported'); expect(view.question).toBe(document.question);
    for (const key of ['ownerId', 'schemaVersion', 'evidenceRefs', 'rawResponse']) expect(view).not.toHaveProperty(key);
    expect(view).toEqual({ id: document.id, studyId: document.studyId, studyVersion: 1, createdAt: document.createdAt, reference: document.reference, question: document.question, status: 'supported', evidence: [resolvedAnalysisEvidence()], limitations: document.limitations, provenance: document.provenance });
    for (const value of [view, view.evidence, view.evidence[0]]) expect(Object.isFrozen(value)).toBe(true);
    Reflect.set(input, 'quote', 'changed'); expect(view.evidence[0]!.quote).toBe(analysisQuote);
  });
  it('redacts evidence and all consulted segments upon current rights restriction without rewriting the original snapshot', () => {
    const document = new AnalysisDocument(analysisDocument()); const before = JSON.stringify(document); const view = document.forDelivery(null);
    expect(view.status).toBe('restricted'); expect(view.evidence).toEqual([]); expect(view.provenance.consultedSegments).toEqual([]);
    expect(view.limitations).toEqual([...document.limitations, 'Uma ou mais fontes estão indisponíveis nesta leitura.']);
    expect(JSON.stringify(view)).not.toContain(analysisQuote); expect(JSON.stringify(document)).toBe(before);
    expect(document.forDelivery([resolvedAnalysisEvidence()]).status).toBe('supported'); expect(Object.isFrozen(view.provenance.consultedSegments)).toBe(true);
  });
  it('allows an insufficient result with no evidence and preserves actual model absence', () => {
    const document = new AnalysisDocument({ ...analysisDocument(), status: 'insufficient-evidence', evidenceRefs: [], provenance: noInferenceProvenance() });
    expect(document.forDelivery([]).status).toBe('insufficient-evidence'); expect(document.forDelivery([]).provenance.modelId).toBeNull();
  });
  it('checks every evidence reference field against resolved metadata and exact quote codepoint length', () => {
    const document = new AnalysisDocument(analysisDocument()); const resolved = resolvedAnalysisEvidence();
    for (const patch of [{ sourceId: 'another' }, { excerptId: 'another' }, { locator: 'another' }, { textSha256: 'c'.repeat(64) }, { startOffset: 1 }, { endOffset: 53 }, { quote: 'short' }, { quote: '\ud800'.repeat(52) }, { attribution: '' }, { rightsStatement: '' }, { rightsUrl: 'file:///private' }]) expect(() => document.forDelivery([{ ...resolved, ...patch }])).toThrow(AnalysisDomainError);
    expect(() => document.forDelivery([])).toThrow(AnalysisDomainError); expect(() => document.forDelivery([resolved, resolved])).toThrow(AnalysisDomainError);
    expect(() => new AnalysisDocument({ ...analysisDocument(), status: 'insufficient-evidence', evidenceRefs: [] }).forDelivery([resolved])).toThrow(AnalysisDomainError);
  });
});
