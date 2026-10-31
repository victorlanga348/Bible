import type { AiAnalysisDto, ConversationDto, StudyViewDto, WorkspaceNoteDto } from '../shared/api/contracts';

// Technical IDs/timestamps. Verse copied verbatim from the admitted test fixture
// backend/test/fixtures/biblical-canon/porbr2018/verses.json (CC BY 4.0).
export const studyId = '10000000-0000-4000-8000-000000000001';
export const secondStudyId = '10000000-0000-4000-8000-000000000002';
export const createdAt = '2026-10-30T12:00:00.000Z';
export const reference = { translationId: 'porbr2018', bookCode: 'GEN', chapter: 1, fromVerse: 1, toVerse: 1, normalized: 'GEN 1:1' };
export function studyFixture(overrides: Partial<StudyViewDto> = {}): StudyViewDto {
  return { id: studyId, version: 3, createdAt, reference,
    passage: { verses: [{ number: 1, text: 'No princípio criou Deus os céus e a terra. ' }], attribution: 'Bíblia Livre (BLIVRE), copyright © 2018 Diego Santos, Mario Sérgio e Marco Teles. https://ebible.org/porbr2018/ . CC BY 4.0. Aviso editorial 2022-03-08; snapshot identificado pelo SHA-256 da fonte.', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' },
    sections: [], evidence: [], interpretations: [], limitations: [], ...overrides };
}
export function noteFixture(overrides: Partial<WorkspaceNoteDto> = {}): WorkspaceNoteDto {
  return { id: '20000000-0000-4000-8000-000000000001', studyId, studyVersion: 3, revision: 1,
    content: 'Nota técnica de teste; não é evidência histórica.', createdAt, updatedAt: createdAt, ...overrides };
}
export const conversationId = '40000000-0000-4000-8000-000000000001';
export function analysisFixture(question = 'Pergunta técnica de teste?'): AiAnalysisDto {
  return { id: '50000000-0000-4000-8000-000000000001', studyId, studyVersion: 3, createdAt, question, reference,
    status: 'insufficient-evidence', evidence: [], limitations: ['Resposta técnica de protocolo; não é uma avaliação de IA.'],
    provenance: { profileId: 'local-extractive-v1', promptVersion: 'source-sentence-selection-v6', modelId: null, modelSha256: null,
      embeddingModelSha256: null, runtimeVersion: null, dimensions: null, contextLimit: 2048, outputLimit: 128,
      promptTokens: 0, completionTokens: 0, totalTokens: 0, embeddingPromptTokens: 0, consultedSegments: [] } };
}
export function conversationFixture(revision = 1, question = 'Questão técnica anterior.'): ConversationDto {
  return { id: conversationId, studyId, studyVersion: 3, createdAt, revision,
    turns: Array.from({ length: revision }, (_, index) => ({ number: index + 1, question, analysisId: analysisFixture().id,
      createdAt, contextTurnNumbers: [], contextVersion: 'questions-v3' as const, omittedTurns: 0, revisesTurn: null,
      analysis: analysisFixture(question), responseStatus: 'available' as const })) };
}
