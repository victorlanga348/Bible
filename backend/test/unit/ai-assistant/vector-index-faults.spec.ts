import type { AiIndexDatabase } from '../../../src/modules/ai-assistant/infrastructure/index-database';
import { PrismaVectorIndex } from '../../../src/modules/ai-assistant/infrastructure/prisma-vector-index';
import { AiUnavailableError } from '../../../src/modules/ai-assistant/application/errors';
import { technicalAiIndex, technicalVector } from '../../helpers/ai-index';

describe('technical malformed database-result double, not an integration or inference', () => {
  it.each([NaN, Infinity, -Infinity])('refuses a nonfinite returned distance %p rather than exposing a corrupt retrieval', async distance => {
    const { profile, eligible } = technicalAiIndex();
    // Real SQL constraints/operator normally guarantee finite results. This
    // isolated fault double exercises the defensive adapter boundary only.
    const query = jest.fn().mockResolvedValueOnce([{ configuration: profile.configuration, segments: profile.expectedSegments }]).mockResolvedValueOnce([{ ...profile.expectedSegments[0]!, distance }]);
    const database = { client: { $transaction: async (execute: (transaction: { $queryRaw: typeof query }) => Promise<unknown>): Promise<unknown> => execute({ $queryRaw: query }) } } as unknown as AiIndexDatabase;
    await expect(new PrismaVectorIndex(database).search(profile, technicalVector(), eligible)).rejects.toThrow(AiUnavailableError);
  });
});
