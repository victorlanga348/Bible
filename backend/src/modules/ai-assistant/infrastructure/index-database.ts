import type { OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma-ai/client';

export class AiIndexDatabase implements OnModuleDestroy {
  readonly client: PrismaClient;
  constructor(databaseUrl: string) {
    const adapter = new PrismaPg({ connectionString: databaseUrl, max: 2, connectionTimeoutMillis: 10000, query_timeout: 5000, statement_timeout: 2000 }, { schema: 'ai' });
    this.client = new PrismaClient({ adapter });
  }
  async onModuleDestroy(): Promise<void> { await this.client.$disconnect(); }
}
