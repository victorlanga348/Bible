import { readFileSync } from 'node:fs';
import type { EvidenceProps, StudyContent, StudyProps, SectionKind } from '../../src/modules/study/domain/study';

const canon = JSON.parse(readFileSync('test/fixtures/biblical-canon/porbr2018/manifest.json', 'utf8')) as { translation: { attribution: string; licenseUrl: string } };
const verse = (JSON.parse(readFileSync('test/fixtures/biblical-canon/porbr2018/verses.json', 'utf8')) as { bookCode: string; text: string }[]).find(row => row.bookCode === 'GEN')!;
const source = (JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/manifest.json', 'utf8')) as { source: Omit<EvidenceProps, 'excerptId' | 'sourceId' | 'locator' | 'quote' | 'textSha256' | 'rightsSnapshot'> & { id: string; permissions: EvidenceProps['rightsSnapshot'] } }).source;
const excerpt = (JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json', 'utf8')) as { id: string; locator: string; text: string; textSha256: string }[])[0]!;

export function realEvidence(): EvidenceProps {
  return { excerptId: excerpt.id, sourceId: source.id, locator: excerpt.locator, quote: excerpt.text, textSha256: excerpt.textSha256,
    attribution: source.attribution, rightsStatement: source.rightsStatement, rightsUrl: source.rightsUrl, rightsSnapshot: { ...source.permissions } };
}
export function studyContent(): StudyContent {
  const evidence = realEvidence();
  const kinds: SectionKind[] = ['immediate-context', 'book-argument', 'history-culture', 'authorship-audience-purpose', 'comparison', 'interpretations'];
  return {
    reference: { translationId: 'porbr2018', bookCode: 'GEN', chapter: 1, fromVerse: 1, toVerse: 1, normalized: 'GEN 1:1' },
    passage: { verses: [{ number: 1, text: verse.text }], attribution: canon.translation.attribution, licenseUrl: canon.translation.licenseUrl },
    sections: kinds.map(kind => kind === 'immediate-context' ? { kind, status: 'available', text: verse.text, evidenceIds: [] }
      : kind === 'comparison' ? { kind, status: 'available', text: 'Paralelo narrativo da criação do céu e da terra; não é prova histórica independente.', evidenceIds: [evidence.excerptId] }
        : { kind, status: 'insufficient-evidence', text: 'Não existe análise curada suficiente nesta biblioteca.', evidenceIds: [] }),
    evidence: [evidence], interpretations: [{ classification: 'inference', text: 'O excerto de Josefo apresenta um paralelo narrativo ao início da criação.', evidenceIds: [evidence.excerptId] }],
    limitations: ['Uma obra e quatro parágrafos não cobrem toda a investigação histórica.'],
  };
}
export function studyProps(): StudyProps {
  // UUID/owner/time are controlled technical metadata, not historical fixtures.
  return { id: '0c0f7906-630e-42ca-a280-3c942113a701', ownerId: 'owner-a', version: 1, createdAt: '2026-10-22T12:00:00.000Z', content: studyContent() };
}
