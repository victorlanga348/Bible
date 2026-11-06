import type { AiAnalysisDto, StudyEvidenceDto } from '../shared/api/contracts';
import { createdAt, reference, studyId } from './workflow-fixtures';

// Authentic quote and digest from the admitted Josephus/Whiston PG2848 test excerpt.
// IDs for analyses and descriptive test limitations are technical fixtures.
export const excerptId = 'josephus-antiquities-pg2848-en-b1-c1-p1';
export const quote = 'In the beginning God created the heaven and the earth.';
export const evidence: StudyEvidenceDto = {
  excerptId, sourceId: 'josephus-antiquities-pg2848-en', locator: 'book-1/chapter-1/paragraph-1', quote,
  textSha256: 'f8665e8cfa6a7e46bf9b0e40bad7b68062d48502151c25a18e3ba506b1597221',
  attribution: 'Flavius Josephus, Antiquities of the Jews, translated by William Whiston.',
  rightsStatement: 'Project Gutenberg notice retained; fixture for controlled local tests.',
  rightsUrl: 'https://www.gutenberg.org/policy/license.html', availability: 'available',
  rightsSnapshot: { ingest: 'allowed', store: 'allowed', index: 'allowed', display: 'allowed', quote: 'allowed', sendToAi: 'pending' },
};
export function analysisFixture(overrides: Partial<AiAnalysisDto> = {}): AiAnalysisDto {
  return { id: '50000000-0000-4000-8000-000000000001', studyId, studyVersion: 3, createdAt,
    question: 'Technical question', reference, status: 'supported',
    evidence: [{ ...evidence, quote, startOffset: 0, endOffset: quote.length }], limitations: ['Apenas corpus admitido de teste.'],
    provenance: { profileId: 'local-extractive-v1', promptVersion: 'source-sentence-selection-v6', modelId: null, modelSha256: null, embeddingModelSha256: null, runtimeVersion: null, dimensions: null, contextLimit: 2048, outputLimit: 128, promptTokens: 4, completionTokens: 1, totalTokens: 5, embeddingPromptTokens: 1, consultedSegments: [] }, ...overrides };
}
