import type { Database } from '../../src/infrastructure/database';
import { StudyLibrary } from '../../src/modules/study/application/study-library';
import type { AiAnalysisSettings } from '../../src/modules/ai-assistant/application/analysis-ports';
import type { EmbeddingBatch, EmbeddingRequest, GeneratedSelection } from '../../src/modules/ai-assistant/application/ports';
import { AiQuestion, SourceSelection, type SourceSentence } from '../../src/modules/ai-assistant/domain/model-input';
import { AiIndexDatabase } from '../../src/modules/ai-assistant/infrastructure/index-database';
import { PrismaVectorIndex } from '../../src/modules/ai-assistant/infrastructure/prisma-vector-index';
import { PrismaAnalysisStore } from '../../src/modules/ai-assistant/infrastructure/prisma-analysis-store';
import { AiOperationSlot } from '../../src/modules/ai-assistant/infrastructure/operation-slot';
import { NodeAiIdentityClock } from '../../src/modules/ai-assistant/infrastructure/identity-clock';
import { NodeAiTextHash } from '../../src/modules/ai-assistant/infrastructure/text-hash';
import { LibraryAiSourcesAdapter } from '../../src/modules/ai-assistant/infrastructure/library-source-adapter';
import { LibraryStudyContextAdapter } from '../../src/modules/ai-assistant/infrastructure/library-study-adapter';
import { readAiSourcePolicy } from '../../src/modules/ai-assistant/infrastructure/source-policy';
import { readPinnedRuntimeProfile } from '../../src/modules/ai-assistant/infrastructure/runtime-artifacts';
import { createStudyTestServices } from './study-runtime';
import { aiFixtureFiles } from './ai-source-data';
import { technicalVector } from './ai-index';

export async function createAiTestRuntime(database: Database, indexDatabase: AiIndexDatabase, home: string) {
  const policy = await readAiSourcePolicy(aiFixtureFiles, 'test-ai'); const profile = await readPinnedRuntimeProfile('admissions/local-extractive-v1.json');
  const settings: AiAnalysisSettings = Object.freeze({ profileId: profile.id, promptVersion: profile.promptVersion, modelId: profile.generation.id, modelSha256: profile.generation.sha256, embeddingModelId: profile.embedding.id, embeddingModelSha256: profile.embedding.sha256, embeddingContextLimit: profile.limits.embeddingContextTokens, contextLimit: profile.limits.generationContextTokens, outputLimit: profile.limits.generationOutputTokens, indexProfile: policy.indexProfile });
  const real = createStudyTestServices(database); const studyLibrary = new StudyLibrary(real.builder, real.store, real.sourcePort);
  const hash = new NodeAiTextHash(); const operation = new AiOperationSlot(home, 5000);
  // These callbacks are explicit deterministic protocol doubles. Their vectors,
  // token counts and declared pinned metadata NEVER demonstrate model inference.
  const embeddings = { embed: jest.fn(async (request: EmbeddingRequest, signal?: AbortSignal): Promise<EmbeddingBatch> => { void signal; return ({
    vectors: request.texts.map((_, index) => technicalVector(request.purpose === 'question' ? 2 : index)),
    usage: { promptTokens: request.texts.length * 10, completionTokens: 0, totalTokens: request.texts.length * 10 },
    provenance: { profileId: profile.id, modelId: profile.embedding.id, modelSha256: profile.embedding.sha256, runtimeVersion: 'controlled-technical-runtime', promptVersion: null, dimensions: 1024, contextLimit: profile.limits.embeddingContextTokens, outputLimit: 0 },
  }); }) };
  const llm = { select: jest.fn(async (_question: AiQuestion, context: readonly SourceSentence[], signal?: AbortSignal): Promise<GeneratedSelection> => { void signal; return ({
    selection: new SourceSelection(context.find(row => row.id === 'p1-s11')?.id ?? null, context), usage: { promptTokens: 100, completionTokens: 5, totalTokens: 105 },
    provenance: { profileId: profile.id, modelId: profile.generation.id, modelSha256: profile.generation.sha256, runtimeVersion: 'controlled-technical-runtime', promptVersion: profile.promptVersion, dimensions: null, contextLimit: profile.limits.generationContextTokens, outputLimit: profile.limits.generationOutputTokens },
  }); }) };
  return { settings, policy, embeddings, llm, operation, hash, identity: new NodeAiIdentityClock(), sources: new LibraryAiSourcesAdapter(real.sources, policy, hash), studies: new LibraryStudyContextAdapter(studyLibrary), studyLibrary, links: real.links, index: new PrismaVectorIndex(indexDatabase), store: new PrismaAnalysisStore(database) };
}
