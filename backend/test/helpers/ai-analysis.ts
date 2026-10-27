import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { AnalysisDocumentProps, AnalysisProvenanceProps, ResolvedAnalysisEvidence } from '../../src/modules/ai-assistant/domain/analysis-document';

// Technical domain metadata only. Genuine fixture is read locally, never sent to a model.
const original = (JSON.parse(readFileSync('test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json', 'utf8')) as { sourceId: string; id: string; locator: string; textSha256: string; text: string }[])[0]!;
export const analysisQuote = original.text.slice(0, original.text.indexOf('.') + 1);
export const analysisProvenance = (): AnalysisProvenanceProps => ({
  profileId: 'technical-profile', promptVersion: 'technical-prompt', modelId: 'technical-model', modelSha256: 'a'.repeat(64), embeddingModelSha256: 'b'.repeat(64), runtimeVersion: 'technical-runtime', dimensions: 1024,
  contextLimit: 2048, outputLimit: 128, promptTokens: 100, completionTokens: 5, totalTokens: 105, embeddingPromptTokens: 10,
  consultedSegments: [{ id: 'p1-c1', sourceId: original.sourceId, excerptId: original.id, sourceDigest: original.textSha256, textDigest: createHash('sha256').update(Array.from(original.text).slice(0, 1000).join('')).digest('hex'), startOffset: 0, endOffset: 1000 }],
});
export const noInferenceProvenance = (): AnalysisProvenanceProps => ({ ...analysisProvenance(), modelId: null, modelSha256: null, embeddingModelSha256: null, runtimeVersion: null, dimensions: null, promptTokens: 0, completionTokens: 0, totalTokens: 0, embeddingPromptTokens: 0, consultedSegments: [] });
export const analysisDocument = (): AnalysisDocumentProps => ({
  schemaVersion: 1, id: 'd6691905-1c29-43b1-991a-fbe359a9f452', ownerId: 'technical-owner', studyId: '14781c0a-a3b6-4ddb-a19d-9bd6fbf6f4a9', studyVersion: 1, createdAt: '2026-10-27T00:00:00.000Z',
  reference: { translationId: 'por-br-2018', bookCode: 'GEN', chapter: 1, fromVerse: 1, toVerse: 1, normalized: 'GEN 1:1' },
  question: 'What does this source report?', status: 'supported',
  evidenceRefs: [{ sourceId: original.sourceId, excerptId: original.id, locator: original.locator, textSha256: original.textSha256, startOffset: 0, endOffset: Array.from(analysisQuote).length }],
  limitations: ['Technical test metadata; one authentic source, no independent historical confirmation.'], provenance: analysisProvenance(),
});
export const resolvedAnalysisEvidence = (): ResolvedAnalysisEvidence => ({ ...analysisDocument().evidenceRefs[0]!, quote: analysisQuote, attribution: 'Flavius Josephus; William Whiston, translator; Project Gutenberg eBook2848.', rightsStatement: 'Public domain in the United States; Project Gutenberg License retained.', rightsUrl: 'https://www.gutenberg.org/policy/license.html' });
