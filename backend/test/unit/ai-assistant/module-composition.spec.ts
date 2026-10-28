import type { FactoryProvider } from '@nestjs/common';
import type { RuntimeConfig } from '../../../src/config/runtime-config';
import { Database } from '../../../src/infrastructure/database';
import type { SourceLibrary } from '../../../src/modules/source-library/application/source-library';
import type { StudyLibrary } from '../../../src/modules/study/application/study-library';
import { AiAssistantModule } from '../../../src/modules/ai-assistant/module';
import { AiAnalysisLibrary } from '../../../src/modules/ai-assistant/application/ai-analysis-library';
import { SourceIndexingLibrary } from '../../../src/modules/ai-assistant/application/source-indexing-library';
import { AiIndexDatabase } from '../../../src/modules/ai-assistant/infrastructure/index-database';

// Explicit configuration-boundary double. No development connection, model or
// integration is claimed. Real admissions/profile files are still authenticated.
jest.mock('../../../src/modules/ai-assistant/infrastructure/index-database', () => ({ AiIndexDatabase: jest.fn().mockImplementation(() => ({ onModuleDestroy: jest.fn().mockResolvedValue(undefined) })) }));
interface Resources { library: AiAnalysisLibrary; indexer: SourceIndexingLibrary; onModuleDestroy(): Promise<void> }
const technicalTarget = 'postgresql://bible_ai_owner@127.0.0.1:55436/bible_ai?schema=ai';
const config: RuntimeConfig = { environment: 'development', port: 3000, databaseUrl: 'unused-main-database-double', aiDatabaseUrl: technicalTarget };
function compose(input: RuntimeConfig): Promise<Resources> {
  const provider = AiAssistantModule.register(input).providers!.find(value => typeof value === 'object' && value !== null && 'useFactory' in value && value.inject?.includes(Database)) as FactoryProvider<Resources>;
  return Promise.resolve(provider.useFactory({} as Database, {} as SourceLibrary, {} as StudyLibrary));
}
describe('technical development-composition boundary, never a development database test', () => {
  beforeEach(() => jest.clearAllMocks());
  it('uses genuine operational admissions and the exact guarded target, then closes only its owned connection double', async () => {
    const resources = await compose(config);
    try {
      expect(resources.library).toBeInstanceOf(AiAnalysisLibrary); expect(resources.indexer).toBeInstanceOf(SourceIndexingLibrary);
      expect(AiIndexDatabase).toHaveBeenCalledTimes(1); expect(AiIndexDatabase).toHaveBeenCalledWith(technicalTarget);
    } finally { await resources.onModuleDestroy(); }
    const connection = jest.mocked(AiIndexDatabase).mock.results[0]!.value as { onModuleDestroy: jest.Mock };
    expect(connection.onModuleDestroy).toHaveBeenCalledTimes(1);
  });
  it('refuses a different development identity before attempting any connection', async () => {
    await expect(compose({ ...config, aiDatabaseUrl: technicalTarget.replace('bible_ai_owner@', 'another-owner@') })).rejects.toThrow('Unsafe AI development database');
    expect(AiIndexDatabase).not.toHaveBeenCalled();
  });
});
