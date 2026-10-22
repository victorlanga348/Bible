import { Evidence, StudySection, Interpretation, Study, StudyDomainError, type EvidenceProps, type SectionProps, type InterpretationProps } from '../../../src/modules/study/domain/study';
import { realEvidence, studyProps } from '../../helpers/study';
import { readFileSync } from 'node:fs';

describe('immutable private study domain with admitted genuine texts', () => {
  it('conserves the exact quote, digest, locator, attribution and historical rights', () => {
    const input = realEvidence();
    expect(new Evidence(input)).toEqual(input);
    expect(new Study(studyProps()).content.passage.verses[0]!.text.endsWith(' ')).toBe(true);
  });
  it.each(['excerptId', 'sourceId', 'locator', 'quote', 'attribution', 'rightsStatement'] as const)('rejects blank evidence %s', key => {
    for (const value of ['', ' \t\n']) expect(() => new Evidence({ ...realEvidence(), [key]: value })).toThrow(StudyDomainError);
  });
  it.each(['UPPER', 'with space', 'trailing\n', '../source'])('rejects invalid source/excerpt identity %j', value => {
    for (const key of ['sourceId', 'excerptId']) expect(() => new Evidence({ ...realEvidence(), [key]: value })).toThrow(StudyDomainError);
  });
  it.each(['a'.repeat(63), 'g'.repeat(64), 'x' + 'a'.repeat(64), 'a'.repeat(64) + 'x'])('rejects malformed digest %s', textSha256 => {
    expect(() => new Evidence({ ...realEvidence(), textSha256 })).toThrow(StudyDomainError);
  });
  it('accepts uppercase hexadecimal while preserving its representation', () => {
    const input = realEvidence(); const textSha256 = input.textSha256.toUpperCase();
    expect(new Evidence({ ...input, textSha256 }).textSha256).toBe(textSha256);
  });
  it.each(['not-a-url', '/relative', 'javascript:alert(1)'])('rejects non-web provenance URL %s', rightsUrl => {
    expect(() => new Evidence({ ...realEvidence(), rightsUrl })).toThrow(StudyDomainError);
  });
  it.each(['store', 'display', 'quote'] as const)('requires original %s permission before retaining a quote', key => {
    for (const value of ['pending', 'denied'] as const) {
      const input = realEvidence();
      expect(() => new Evidence({ ...input, rightsSnapshot: { ...input.rightsSnapshot, [key]: value } })).toThrow(StudyDomainError);
    }
  });
  it('rejects unknown permission values and copies nested rights without granting AI use', () => {
    const input = realEvidence();
    expect(() => new Evidence({ ...input, rightsSnapshot: { ...input.rightsSnapshot, index: 'unknown' } } as unknown as EvidenceProps)).toThrow(StudyDomainError);
    const result = new Evidence(input);
    Reflect.set(input.rightsSnapshot, 'sendToAi', 'allowed');
    Reflect.set(result.rightsSnapshot, 'sendToAi', 'allowed');
    expect(result.rightsSnapshot.sendToAi).toBe('pending');
    expect(Object.isFrozen(result)).toBe(true);
  });
  it('validates all section kinds, states and explicit evidence of an available comparison', () => {
    for (const section of studyProps().content.sections) expect(new StudySection(section)).toEqual(section);
    const available = studyProps().content.sections[4]!;
    for (const invalid of [{ ...available, kind: 'unknown' }, { ...available, status: 'unknown' }, { ...available, text: ' ' }, { ...available, evidenceIds: [] }]) {
      expect(() => new StudySection(invalid as SectionProps)).toThrow(StudyDomainError);
    }
  });
  it('rejects duplicate/invalid evidence ids in a section or interpretation', () => {
    const id = realEvidence().excerptId;
    const section = studyProps().content.sections[4]!;
    const interpretation = studyProps().content.interpretations[0]!;
    for (const evidenceIds of [[id, id], ['INVALID']]) {
      expect(() => new StudySection({ ...section, evidenceIds })).toThrow(StudyDomainError);
      expect(() => new Interpretation({ ...interpretation, evidenceIds })).toThrow(StudyDomainError);
    }
  });
  it('separates all four epistemic labels and rejects a documented fact without evidence', () => {
    const input = studyProps().content.interpretations[0]!;
    for (const classification of ['documented-fact', 'inference', 'tradition', 'hypothesis'] as const) expect(new Interpretation({ ...input, classification }).classification).toBe(classification);
    expect(() => new Interpretation({ ...input, classification: 'documented-fact', evidenceIds: [] })).toThrow(StudyDomainError);
    expect(() => new Interpretation({ ...input, classification: 'certainty' } as unknown as InterpretationProps)).toThrow(StudyDomainError);
    expect(() => new Interpretation({ ...input, text: '\n' })).toThrow(StudyDomainError);
  });
  it.each([{ id: 'not-uuid' }, { ownerId: '' }, { ownerId: 'owner with space' }, { ownerId: 'a'.repeat(65) }, { version: 0 }, { version: 1.5 }, { version: Number.MAX_SAFE_INTEGER + 1 }, { createdAt: 'not-a-date' }, { createdAt: '2026-10-22' }])('rejects invalid private version metadata %j', change => {
    expect(() => new Study({ ...studyProps(), ...change })).toThrow(StudyDomainError);
  });
  it('accepts safe version and subject boundaries without changing case', () => {
    const result = new Study({ ...studyProps(), ownerId: 'A'.repeat(64), version: Number.MAX_SAFE_INTEGER });
    expect(result.ownerId).toBe('A'.repeat(64)); expect(result.version).toBe(Number.MAX_SAFE_INTEGER);
  });
  it.each([{ bookCode: 'gen' }, { translationId: 'BAD' }, { chapter: 0 }, { fromVerse: 0 }, { fromVerse: 2 }, { toVerse: 0 }, { normalized: 'JHN 3:16' }])('rejects contradictory reference %j', change => {
    const input = studyProps();
    expect(() => new Study({ ...input, content: { ...input.content, reference: { ...input.content.reference, ...change } } })).toThrow(StudyDomainError);
  });
  it.each([{ bookCode: 'gen', normalized: 'gen 1:1' }, { bookCode: 'G?N', normalized: 'G?N 1:1' }, { chapter: 0, normalized: 'GEN 0:1' }, { chapter: 1.5, normalized: 'GEN 1.5:1' }])('rejects an invalid reference even when its normalized text agrees %j', change => {
    const input = studyProps();
    expect(() => new Study({ ...input, content: { ...input.content, reference: { ...input.content.reference, ...change } } })).toThrow(StudyDomainError);
  });
  it('rejects an empty reversed selection and a malformed UUID of the exact expected length', () => {
    const input = studyProps();
    expect(() => new Study({ ...input, id: 'z'.repeat(36) })).toThrow(StudyDomainError);
    expect(() => new Study({ ...input, content: { ...input.content,
      reference: { ...input.content.reference, fromVerse: 2, toVerse: 1, normalized: 'GEN 1:2-1' }, passage: { ...input.content.passage, verses: [] } } })).toThrow(StudyDomainError);
  });
  it.each(['inference', 'tradition', 'hypothesis'] as const)('allows an explicitly unsupported %s without labelling it a documented fact', classification => {
    const input = { classification, text: 'Declaração técnica sem suporte documental; não é um facto histórico.', evidenceIds: [] };
    expect(new Interpretation(input)).toEqual(input);
  });
  it.each(['evidence', 'sections', 'interpretations', 'limitations'] as const)('rejects a malformed rehydrated %s collection with a domain error', key => {
    const input = studyProps();
    const malformed = { ...input, content: { ...input.content, [key]: {} } } as unknown as typeof input;
    expect(() => new Study(malformed)).toThrow(StudyDomainError);
  });
  it('requires actual selected verse identities, text and credit', () => {
    const input = studyProps(); const passage = input.content.passage;
    for (const invalid of [{ ...passage, verses: [] }, { ...passage, verses: [{ ...passage.verses[0]!, number: 2 }] }, { ...passage, verses: [{ number: 1, text: ' ' }] }, { ...passage, attribution: '' }, { ...passage, licenseUrl: '/relative' }]) {
      expect(() => new Study({ ...input, content: { ...input.content, passage: invalid } })).toThrow(StudyDomainError);
    }
  });
  it('preserves the genuine three-verse selection and rejects reversed verse identities', () => {
    const rows = JSON.parse(readFileSync('test/fixtures/biblical-canon/porbr2018/verses.json', 'utf8')) as { bookCode: string; number: number; text: string }[];
    const verses = rows.filter(row => row.bookCode === 'JHN').map(({ number, text }) => ({ number, text }));
    const input = studyProps();
    const content = { ...input.content, reference: { translationId: 'porbr2018', bookCode: 'JHN', chapter: 3, fromVerse: 16, toVerse: 18, normalized: 'JHN 3:16-18' },
      passage: { ...input.content.passage, verses }, evidence: [], interpretations: [],
      sections: input.content.sections.map(section => ({ ...section, status: 'insufficient-evidence' as const, text: 'Não existe análise curada para esta seleção.', evidenceIds: [] })) };
    expect(new Study({ ...input, content }).content.passage.verses).toEqual(verses);
    expect(() => new Study({ ...input, content: { ...content, passage: { ...content.passage, verses: [...verses].reverse() } } })).toThrow(StudyDomainError);
  });
  it('requires six unique sections, real evidence references and nonblank limitations', () => {
    const input = studyProps(); const content = input.content;
    for (const invalid of [{ ...content, sections: content.sections.slice(1) }, { ...content, sections: [...content.sections.slice(0, 5), content.sections[0]!] }, { ...content, sections: [...content.sections, content.sections[0]!] }, { ...content, evidence: [...content.evidence, content.evidence[0]!] }, { ...content, evidence: [] }, { ...content, limitations: [' '] }]) {
      expect(() => new Study({ ...input, content: invalid })).toThrow(StudyDomainError);
    }
  });
  it('copies and freezes the entire validated snapshot instead of relying on readonly types', () => {
    const input = studyProps(); const result = new Study(input);
    Reflect.set(input.content.reference, 'bookCode', 'EXO');
    Reflect.set(input.content.passage.verses[0]!, 'text', 'changed');
    Reflect.set(result.content.passage.verses[0]!, 'text', 'changed');
    Reflect.set(result.content.sections[4]!.evidenceIds, '0', 'changed');
    Reflect.set(result.content.reference, 'bookCode', 'EXO');
    Reflect.set(result.content.passage, 'attribution', 'changed');
    Reflect.set(result.content.sections[4]!, 'text', 'changed');
    Reflect.set(result.content.interpretations[0]!, 'text', 'changed');
    Reflect.set(result.content.limitations, '0', 'changed');
    Reflect.set(result, 'ownerId', 'owner-b');
    expect(result.content.reference.bookCode).toBe('GEN');
    expect(result.content.passage.verses[0]!.text).toBe(studyProps().content.passage.verses[0]!.text);
    expect(result.content.sections[4]!.evidenceIds).toEqual([realEvidence().excerptId]);
    expect(result.content.passage.attribution).toBe(studyProps().content.passage.attribution);
    expect(result.content.sections[4]!.text).toBe(studyProps().content.sections[4]!.text);
    expect(result.content.interpretations[0]!.text).toBe(studyProps().content.interpretations[0]!.text);
    expect(result.content.limitations).toEqual(studyProps().content.limitations);
    expect(result.ownerId).toBe('owner-a');
    expect(Object.isFrozen(result.content)).toBe(true); expect(Object.isFrozen(result)).toBe(true);
  });
  it('projects available evidence without exposing the owner', () => {
    const input = studyProps(); const study = new Study(input); const id = realEvidence().excerptId;
    const view = study.forDelivery({ [id]: 'available' });
    expect(view).toEqual({ id: input.id, version: 1, createdAt: input.createdAt, ...input.content, evidence: [{ ...realEvidence(), availability: 'available' }] });
    expect(Object.hasOwn(view, 'ownerId')).toBe(false);
  });
  it.each(['restricted', 'missing'] as const)('redacts quote and derived analysis for %s evidence, retaining the stored original and Bible text', state => {
    const study = new Study(studyProps()); const id = realEvidence().excerptId;
    const view = study.forDelivery({ [id]: state });
    expect(view.evidence[0]).toMatchObject({ excerptId: id, availability: state, quote: null });
    expect(view.sections[4]).toMatchObject({ status: 'insufficient-evidence', evidenceIds: [id] });
    expect(view.sections[4]!.text).not.toBe(study.content.sections[4]!.text);
    expect(view.interpretations).toEqual([]);
    expect(view.passage).toEqual(study.content.passage);
    expect(view.limitations.length).toBeGreaterThan(study.content.limitations.length);
    expect(view.limitations.every(message => message.trim().length > 0)).toBe(true);
    expect(study.content.evidence[0]!.quote).toBe(realEvidence().quote);
    expect(JSON.stringify(view)).not.toContain(realEvidence().quote);
  });
  it('fails closed for unreported current rights and never changes an older projection', () => {
    const study = new Study(studyProps()); const id = realEvidence().excerptId;
    const available = study.forDelivery({ [id]: 'available' });
    expect(study.forDelivery({}).evidence[0]).toMatchObject({ availability: 'missing', quote: null });
    expect(available.evidence[0]!.quote).toBe(realEvidence().quote);
  });
  it('redacts an interpretation with one unavailable dependency while keeping independent content', () => {
    const rows = JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json', 'utf8')) as { id: string; locator: string; text: string; textSha256: string }[];
    const input = studyProps(); const first = realEvidence(); const secondRow = rows[1]!;
    const second = { ...first, excerptId: secondRow.id, locator: secondRow.locator, quote: secondRow.text, textSha256: secondRow.textSha256 };
    // Controlled epistemic metadata tests delivery policy, not historical truth.
    const independent = { classification: 'inference' as const, text: 'Objeto técnico independente; não é uma análise histórica curada.', evidenceIds: [first.excerptId] };
    const dependent = { classification: 'hypothesis' as const, text: 'Objeto técnico com duas dependências para verificar a entrega.', evidenceIds: [first.excerptId, second.excerptId] };
    const study = new Study({ ...input, content: { ...input.content, evidence: [first, second], interpretations: [independent, dependent] } });
    const view = study.forDelivery({ [first.excerptId]: 'available', [second.excerptId]: 'restricted' });
    expect(view.interpretations).toEqual([independent]);
    expect(view.evidence.map(row => row.quote)).toEqual([first.quote, null]);
    expect(view.passage).toEqual(study.content.passage);
    expect(study.content.interpretations).toEqual([independent, dependent]);
    expect(study.content.evidence[1]!.quote).toBe(second.quote);
  });
  it('treats a valid excerpt id matching an inherited object property as unreported', () => {
    // Controlled identity variant of the same admitted text; no additional work.
    const input = studyProps();
    const excerptId = 'constructor';
    const content = { ...input.content, evidence: [{ ...realEvidence(), excerptId }],
      sections: input.content.sections.map(row => ({ ...row, evidenceIds: row.evidenceIds.map(() => excerptId) })),
      interpretations: input.content.interpretations.map(row => ({ ...row, evidenceIds: [excerptId] })) };
    const study = new Study({ ...input, content });
    expect(study.forDelivery({}).evidence[0]).toMatchObject({ excerptId, availability: 'missing', quote: null });
    expect(study.forDelivery({ constructor: 'available' } as const).evidence[0]!.quote).toBe(realEvidence().quote);
  });
});
