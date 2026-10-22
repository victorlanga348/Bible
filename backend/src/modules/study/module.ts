import { Module } from '@nestjs/common';
import { Database } from '../../infrastructure/database';
import { BiblicalCanonModule } from '../biblical-canon/module';
import { CanonLibrary } from '../biblical-canon/application/canon-library';
import { SourceLibraryModule } from '../source-library/module';
import { SourceLibrary } from '../source-library/application/source-library';
import { SourcePassageLinks } from '../source-library/application/source-passage-links';
import { StudyLibrary } from './application/study-library';
import { GenerateStructuredStudy } from './application/generate-structured-study';
import { LibraryCanonAdapter } from './infrastructure/library-canon-adapter';
import { LibrarySourceAdapter } from './infrastructure/library-source-adapter';
import { PrismaStudyRepository } from './infrastructure/prisma-study-repository';
import { StudyController } from './presentation/study.controller';

@Module({ imports: [BiblicalCanonModule, SourceLibraryModule], controllers: [StudyController], providers: [
  { provide: LibraryCanonAdapter, useFactory: (canon: CanonLibrary) => new LibraryCanonAdapter(canon), inject: [CanonLibrary] },
  { provide: LibrarySourceAdapter, useFactory: (sources: SourceLibrary, links: SourcePassageLinks) => new LibrarySourceAdapter(sources, links), inject: [SourceLibrary, SourcePassageLinks] },
  { provide: GenerateStructuredStudy, useFactory: (canon: LibraryCanonAdapter, sources: LibrarySourceAdapter) => new GenerateStructuredStudy(canon, sources), inject: [LibraryCanonAdapter, LibrarySourceAdapter] },
  { provide: PrismaStudyRepository, useFactory: (database: Database) => new PrismaStudyRepository(database), inject: [Database] },
  { provide: StudyLibrary, useFactory: (builder: GenerateStructuredStudy, store: PrismaStudyRepository, sources: LibrarySourceAdapter) => new StudyLibrary(builder, store, sources), inject: [GenerateStructuredStudy, PrismaStudyRepository, LibrarySourceAdapter] },
], exports: [StudyLibrary] })
export class StudyModule {}
