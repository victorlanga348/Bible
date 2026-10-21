import { Global, Module, type DynamicModule } from '@nestjs/common';
import { Database } from './database';

@Global()
@Module({})
export class DatabaseModule {
  static register(databaseUrl: string): DynamicModule {
    return { module: DatabaseModule, providers: [{ provide: Database, useFactory: () => new Database(databaseUrl) }], exports: [Database] };
  }
}
