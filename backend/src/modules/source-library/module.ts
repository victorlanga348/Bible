import { Module } from '@nestjs/common';
import { Database } from '../../infrastructure/database';
import { SourceLibrary } from './application/source-library';
import { PrismaSourceRepository } from './infrastructure/prisma-source-repository';
import { SourceController } from './presentation/source.controller';
import { BiblicalCanonModule } from '../biblical-canon/module';
import { CanonLibrary } from '../biblical-canon/application/canon-library';
import { SourcePassageLinks } from './application/source-passage-links';
import { PrismaPassageLinkRepository } from './infrastructure/prisma-passage-link-repository';
import { CanonPassageValidator } from './infrastructure/canon-passage-validator';

@Module({
  imports: [BiblicalCanonModule],
  controllers: [SourceController],
  providers: [
    { provide: PrismaSourceRepository, useFactory: (database: Database) => new PrismaSourceRepository(database), inject: [Database] },
    { provide: SourceLibrary, useFactory: (repository: PrismaSourceRepository) => new SourceLibrary(repository, repository, repository), inject: [PrismaSourceRepository] },
    { provide: PrismaPassageLinkRepository, useFactory: (database: Database) => new PrismaPassageLinkRepository(database), inject: [Database] },
    { provide: SourcePassageLinks, useFactory: (repository: PrismaPassageLinkRepository, sources: SourceLibrary, canon: CanonLibrary) => new SourcePassageLinks(repository, sources, new CanonPassageValidator(canon)), inject: [PrismaPassageLinkRepository, SourceLibrary, CanonLibrary] },
  ],
  exports: [SourceLibrary, SourcePassageLinks],
})
export class SourceLibraryModule {}
