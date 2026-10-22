import type { OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

export class Database implements OnModuleDestroy {
  readonly client: PrismaClient;

  constructor(databaseUrl: string) {
    const adapter = new PrismaPg({
      connectionString: databaseUrl,
      max: 5,
      connectionTimeoutMillis: 10000,
      // Let the server's SQL cancellation arrive before the client read limit.
      query_timeout: 5000,
      statement_timeout: 2000,
    }, { schema: 'app' });
    this.client = new PrismaClient({ adapter });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
