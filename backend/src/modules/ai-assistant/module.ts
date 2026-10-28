import { Module, type DynamicModule } from '@nestjs/common';
import { join } from 'node:path';
import type { RuntimeConfig } from '../../config/runtime-config';
import { assertAiDevelopmentTarget, assertAiTestTarget } from '../../config/ai-target';
import { Database } from '../../infrastructure/database';
import { SourceLibraryModule } from '../source-library/module';
import { SourceLibrary } from '../source-library/application/source-library';
import { StudyModule } from '../study/module';
import { StudyLibrary } from '../study/application/study-library';
import { AiAnalysisLibrary } from './application/ai-analysis-library';
import { SourceIndexingLibrary } from './application/source-indexing-library';
import type { AiAnalysisSettings, AiOperationPort, VectorIndexPort } from './application/analysis-ports';
import { AiUnavailableError } from './application/errors';
import { AiIndexDatabase } from './infrastructure/index-database';
import { NodeAiIdentityClock } from './infrastructure/identity-clock';
import { NodeAiTextHash } from './infrastructure/text-hash';
import { LibraryAiSourcesAdapter } from './infrastructure/library-source-adapter';
import { LibraryStudyContextAdapter } from './infrastructure/library-study-adapter';
import { LocalModelProvider } from './infrastructure/local-model-provider';
import { NativeRuntime } from './infrastructure/native-runtime';
import { AiOperationSlot } from './infrastructure/operation-slot';
import { PrismaAnalysisStore } from './infrastructure/prisma-analysis-store';
import { PrismaVectorIndex } from './infrastructure/prisma-vector-index';
import { readPinnedRuntimeProfile, VerifiedRuntimeArtifacts } from './infrastructure/runtime-artifacts';
import { readAiSourcePolicy } from './infrastructure/source-policy';
import { AiAnalysisController } from './presentation/ai-analysis.controller';
import { ConversationLibrary } from './application/conversation-library';
import { PrismaConversationStore } from './infrastructure/prisma-conversation-store';
import { ConversationController } from './presentation/conversation.controller';

const resourcesToken = Symbol('ai-assistant-owned-resources');
async function compose(config: RuntimeConfig, database: Database, sourceLibrary: SourceLibrary, studyLibrary: StudyLibrary) {
  const test = config.environment === 'test';
  const directory = test ? 'test/fixtures/ai-assistant/source-library/josephus-antiquities-pg2848-en-local-ai-v1' : 'admissions/josephus-antiquities-pg2848-en-local-ai-v1';
  const profile = await readPinnedRuntimeProfile('admissions/local-extractive-v1.json');
  const policy = await readAiSourcePolicy({ manifest: join(directory, 'manifest.json'), excerpts: join(directory, 'excerpts.json') }, test ? 'test-ai' : 'local-ai');
  const settings: AiAnalysisSettings = Object.freeze({ profileId: profile.id, promptVersion: profile.promptVersion, modelId: profile.generation.id, modelSha256: profile.generation.sha256, embeddingModelId: profile.embedding.id, embeddingModelSha256: profile.embedding.sha256, embeddingContextLimit: profile.limits.embeddingContextTokens, contextLimit: profile.limits.generationContextTokens, outputLimit: profile.limits.generationOutputTokens, indexProfile: policy.indexProfile });
  const unavailable = async (): Promise<never> => { throw new AiUnavailableError(); };
  let indexDatabase: AiIndexDatabase | undefined;
  if (config.aiDatabaseUrl) {
    const target = test ? assertAiTestTarget({ NODE_ENV: 'test', TEST_DATABASE_URL: config.databaseUrl }) : assertAiDevelopmentTarget({ NODE_ENV: 'development', BIBLE_AI_DATABASE_URL: config.aiDatabaseUrl });
    if (target !== config.aiDatabaseUrl) throw new AiUnavailableError();
    indexDatabase = new AiIndexDatabase(target);
  }
  const index: VectorIndexPort = indexDatabase ? new PrismaVectorIndex(indexDatabase) : { readiness: unavailable, search: unavailable, replace: unavailable };
  const configured = Boolean(config.aiHome && indexDatabase);
  const operation: AiOperationPort = configured ? new AiOperationSlot(config.aiHome!) : { run: unavailable };
  const runtime = configured ? new NativeRuntime(new VerifiedRuntimeArtifacts(profile, config.aiHome!)) : null;
  const provider = runtime ? new LocalModelProvider(profile, runtime) : { embed: unavailable, select: unavailable };
  const hash = new NodeAiTextHash(); const identity = new NodeAiIdentityClock();
  const sources = new LibraryAiSourcesAdapter(sourceLibrary, policy, hash); const studies = new LibraryStudyContextAdapter(studyLibrary);
  const library = new AiAnalysisLibrary(settings, studies, sources, provider, provider, index, new PrismaAnalysisStore(database), operation, identity, hash);
  return {
    library,
    conversations: new ConversationLibrary(new PrismaConversationStore(database), library, studies, identity),
    indexer: new SourceIndexingLibrary(settings, sources, provider, index, operation, identity, hash),
    async onModuleDestroy() { try { if (operation instanceof AiOperationSlot) await operation.onModuleDestroy(); } finally { try { await runtime?.close(); } finally { await indexDatabase?.onModuleDestroy(); } } },
  };
}
@Module({})
export class AiAssistantModule {
  static register(config: RuntimeConfig): DynamicModule {
    return { module: AiAssistantModule, imports: [SourceLibraryModule, StudyModule], controllers: [AiAnalysisController, ConversationController], providers: [
      { provide: resourcesToken, useFactory: (database: Database, sources: SourceLibrary, studies: StudyLibrary) => compose(config, database, sources, studies), inject: [Database, SourceLibrary, StudyLibrary] },
      { provide: AiAnalysisLibrary, useFactory: (resources: Awaited<ReturnType<typeof compose>>) => resources.library, inject: [resourcesToken] },
      { provide: ConversationLibrary, useFactory: (resources: Awaited<ReturnType<typeof compose>>) => resources.conversations, inject: [resourcesToken] },
      { provide: SourceIndexingLibrary, useFactory: (resources: Awaited<ReturnType<typeof compose>>) => resources.indexer, inject: [resourcesToken] },
    ], exports: [AiAnalysisLibrary, SourceIndexingLibrary, ConversationLibrary] };
  }
}
