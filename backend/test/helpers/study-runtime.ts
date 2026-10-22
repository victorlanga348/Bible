import type { Database } from '../../src/infrastructure/database';
import { CanonLibrary } from '../../src/modules/biblical-canon/application/canon-library';
import { PrismaCanonRepository } from '../../src/modules/biblical-canon/infrastructure/prisma-canon-repository';
import { SourceLibrary } from '../../src/modules/source-library/application/source-library';
import { SourcePassageLinks } from '../../src/modules/source-library/application/source-passage-links';
import { PrismaSourceRepository } from '../../src/modules/source-library/infrastructure/prisma-source-repository';
import { PrismaPassageLinkRepository } from '../../src/modules/source-library/infrastructure/prisma-passage-link-repository';
import { CanonPassageValidator } from '../../src/modules/source-library/infrastructure/canon-passage-validator';
import { LibraryCanonAdapter } from '../../src/modules/study/infrastructure/library-canon-adapter';
import { LibrarySourceAdapter } from '../../src/modules/study/infrastructure/library-source-adapter';
import { PrismaStudyRepository } from '../../src/modules/study/infrastructure/prisma-study-repository';
import { GenerateStructuredStudy } from '../../src/modules/study/application/generate-structured-study';

export function createStudyTestServices(database: Database) {
  const canonicalRepository = new PrismaCanonRepository(database); const sourceRepository = new PrismaSourceRepository(database);
  const canonical = new CanonLibrary(canonicalRepository, canonicalRepository);
  const sources = new SourceLibrary(sourceRepository, sourceRepository, sourceRepository);
  const links = new SourcePassageLinks(new PrismaPassageLinkRepository(database), sources, new CanonPassageValidator(canonical));
  const canonPort = new LibraryCanonAdapter(canonical); const sourcePort = new LibrarySourceAdapter(sources, links);
  return { canonical, sources, links, canonPort, sourcePort, builder: new GenerateStructuredStudy(canonPort, sourcePort), store: new PrismaStudyRepository(database) };
}
