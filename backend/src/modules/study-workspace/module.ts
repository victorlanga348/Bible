import { Module, type DynamicModule } from '@nestjs/common';
import type { RuntimeConfig } from '../../config/runtime-config';
import { Database } from '../../infrastructure/database';
import { StudyModule } from '../study/module';
import { StudyLibrary } from '../study/application/study-library';
import { AiAssistantModule } from '../ai-assistant/module';
import { AiHistoryLibrary } from '../ai-assistant/application/ai-history-library';
import { WorkspaceLibrary } from './application/workspace-library';
import { PrismaWorkspaceStore } from './infrastructure/prisma-workspace-store';
import { WorkspaceStudyAdapter, WorkspaceHistoryAdapter } from './infrastructure/library-adapters';
import { NodeWorkspaceIdentityClock } from './infrastructure/identity-clock';
import { WorkspaceController } from './presentation/workspace.controller';
@Module({})
export class WorkspaceModule {
  static register(config: RuntimeConfig): DynamicModule {
    return { module: WorkspaceModule, imports: [StudyModule, AiAssistantModule.register(config)], controllers: [WorkspaceController], providers: [
      { provide: PrismaWorkspaceStore, useFactory: (database: Database) => new PrismaWorkspaceStore(database), inject: [Database] },
      { provide: WorkspaceStudyAdapter, useFactory: (library: StudyLibrary) => new WorkspaceStudyAdapter(library), inject: [StudyLibrary] },
      { provide: WorkspaceHistoryAdapter, useFactory: (library: AiHistoryLibrary) => new WorkspaceHistoryAdapter(library), inject: [AiHistoryLibrary] },
      NodeWorkspaceIdentityClock,
      { provide: WorkspaceLibrary, useFactory: (store: PrismaWorkspaceStore, studies: WorkspaceStudyAdapter, history: WorkspaceHistoryAdapter, identity: NodeWorkspaceIdentityClock) => new WorkspaceLibrary(store, studies, history, identity), inject: [PrismaWorkspaceStore, WorkspaceStudyAdapter, WorkspaceHistoryAdapter, NodeWorkspaceIdentityClock] },
    ], exports: [WorkspaceLibrary] };
  }
}
