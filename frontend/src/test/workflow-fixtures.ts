import type { StudyViewDto, WorkspaceNoteDto } from '../shared/api/contracts';

// Technical IDs/timestamps. Verse copied verbatim from the admitted test fixture
// backend/test/fixtures/biblical-canon/porbr2018/verses.json (CC BY 4.0).
export const studyId = '10000000-0000-4000-8000-000000000001';
export const secondStudyId = '10000000-0000-4000-8000-000000000002';
export const createdAt = '2026-10-30T12:00:00.000Z';
export const reference = { translationId: 'porbr2018', bookCode: 'GEN', chapter: 1, fromVerse: 1, toVerse: 1, normalized: 'GEN 1:1' };
export function studyFixture(overrides: Partial<StudyViewDto> = {}): StudyViewDto {
  return { id: studyId, version: 3, createdAt, reference,
    passage: { verses: [{ number: 1, text: 'No princípio criou Deus os céus e a terra. ' }], attribution: 'Bíblia Livre (BLIVRE), copyright © 2018 Diego Santos, Mario Sergio e Marcus', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' },
    sections: [], evidence: [], interpretations: [], limitations: [], ...overrides };
}
export function noteFixture(overrides: Partial<WorkspaceNoteDto> = {}): WorkspaceNoteDto {
  return { id: '20000000-0000-4000-8000-000000000001', studyId, studyVersion: 3, revision: 1,
    content: 'Nota técnica de teste; não é evidência histórica.', createdAt, updatedAt: createdAt, ...overrides };
}
