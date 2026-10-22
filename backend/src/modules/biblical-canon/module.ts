import { Module } from '@nestjs/common';
import { Database } from '../../infrastructure/database';
import { CanonLibrary } from './application/canon-library';
import { PrismaCanonRepository } from './infrastructure/prisma-canon-repository';
import { CanonController } from './presentation/canon.controller';
@Module({ controllers: [CanonController], providers: [
  { provide: PrismaCanonRepository, useFactory: (database: Database) => new PrismaCanonRepository(database), inject: [Database] },
  { provide: CanonLibrary, useFactory: (repository: PrismaCanonRepository) => new CanonLibrary(repository, repository), inject: [PrismaCanonRepository] },
], exports: [CanonLibrary] })
export class BiblicalCanonModule {}
