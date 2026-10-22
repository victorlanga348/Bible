const { withDevelopmentDatabase, failed } = require('./development-operation.cjs');
const { readAdmittedSnapshot } = require('../dist/modules/source-library/infrastructure/admitted-snapshot.js');
const { SourceLibrary } = require('../dist/modules/source-library/application/source-library.js');
const { PrismaSourceRepository } = require('../dist/modules/source-library/infrastructure/prisma-source-repository.js');
const { SourcePassageLinks } = require('../dist/modules/source-library/application/source-passage-links.js');
const { PrismaPassageLinkRepository } = require('../dist/modules/source-library/infrastructure/prisma-passage-link-repository.js');
const { CanonPassageValidator } = require('../dist/modules/source-library/infrastructure/canon-passage-validator.js');
const { CanonLibrary } = require('../dist/modules/biblical-canon/application/canon-library.js');
const { PrismaCanonRepository } = require('../dist/modules/biblical-canon/infrastructure/prisma-canon-repository.js');

async function run() {
  // Preflight and identity are checked before either artefact import or curation.
  await withDevelopmentDatabase(async database => {
    const args = process.argv.slice(2);
    if (args.length !== 4) throw new Error('Four explicit artefact paths required');
    const [source, manifest, excerpts, notice] = args;
    const snapshot = await readAdmittedSnapshot({ source, manifest, excerpts, notice }, 'local-development');
    const repository = new PrismaSourceRepository(database);
    const sources = new SourceLibrary(repository, repository, repository);
    const result = await sources.importSnapshot(snapshot);
    const canonicalRepository = new PrismaCanonRepository(database);
    const canon = new CanonLibrary(canonicalRepository, canonicalRepository);
    const links = new SourcePassageLinks(new PrismaPassageLinkRepository(database), sources, new CanonPassageValidator(canon));
    const curation = await links.curate({ id: 'gen-creation-parallel', excerptId: 'josephus-antiquities-pg2848-en-b1-c1-p1',
      translationId: 'porbr2018', bookCode: 'GEN', chapter: 1, fromVerse: 1, toVerse: 1, nature: 'narrative-parallel',
      rationale: 'Paralelo narrativo da criação do céu e da terra; não é prova histórica independente.' });
    console.info(JSON.stringify({ component: 'source-library-development-import', result, curation, excerpts: snapshot.excerpts.length, sendToAi: snapshot.source.permissions.sendToAi }));
  });
}
run().catch(failed);
