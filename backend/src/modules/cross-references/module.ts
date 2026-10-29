import { Module } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Database } from '../../infrastructure/database';
import { BiblicalCanonModule } from '../biblical-canon/module';
import { CanonLibrary } from '../biblical-canon/application/canon-library';
import { SourceLibraryModule } from '../source-library/module';
import { SourceLibrary } from '../source-library/application/source-library';
import { RelationLibrary } from './application/relation-library';
import { PrismaRelationStore } from './infrastructure/prisma-relation-store';
import { RelationCanonAdapter, RelationSourcesAdapter } from './infrastructure/library-adapters';
import { RelationController } from './presentation/relation.controller';
@Module({ imports: [BiblicalCanonModule, SourceLibraryModule], controllers: [RelationController], providers: [
  { provide: RelationLibrary, useFactory: (database: Database, canon: CanonLibrary, sources: SourceLibrary) => new RelationLibrary(new PrismaRelationStore(database), new RelationCanonAdapter(canon), new RelationSourcesAdapter(sources), { nextId: randomUUID, now: () => new Date().toISOString() }), inject: [Database, CanonLibrary, SourceLibrary] },
], exports: [RelationLibrary] })
export class CrossReferencesModule {}
