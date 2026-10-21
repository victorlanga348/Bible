import { Module } from '@nestjs/common';
import { Database } from '../../infrastructure/database';
import { SourceLibrary } from './application/source-library';
import { PrismaSourceRepository } from './infrastructure/prisma-source-repository';
import { SourceController } from './presentation/source.controller';

@Module({
  controllers: [SourceController],
  providers: [
    { provide: PrismaSourceRepository, useFactory: (database: Database) => new PrismaSourceRepository(database), inject: [Database] },
    { provide: SourceLibrary, useFactory: (repository: PrismaSourceRepository) => new SourceLibrary(repository, repository, repository), inject: [PrismaSourceRepository] },
  ],
})
export class SourceLibraryModule {}
