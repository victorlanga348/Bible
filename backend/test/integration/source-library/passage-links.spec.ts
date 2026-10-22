import type { Database } from '../../../src/infrastructure/database';
import { Database as UnavailableDatabase } from '../../../src/infrastructure/database';
import { assertTestTarget } from '../../../src/config/runtime-config';
import { CanonLibrary } from '../../../src/modules/biblical-canon/application/canon-library';
import { PrismaCanonRepository } from '../../../src/modules/biblical-canon/infrastructure/prisma-canon-repository';
import { SourceLibrary } from '../../../src/modules/source-library/application/source-library';
import { SourcePassageLinks } from '../../../src/modules/source-library/application/source-passage-links';
import { SourceAccessError, SourceConflictError, SourceNotFoundError } from '../../../src/modules/source-library/application/errors';
import { SourceDomainError } from '../../../src/modules/source-library/domain/source-domain-error';
import { CuratedPassageLink } from '../../../src/modules/source-library/domain/curated-passage-link';
import { PrismaSourceRepository } from '../../../src/modules/source-library/infrastructure/prisma-source-repository';
import { PrismaPassageLinkRepository } from '../../../src/modules/source-library/infrastructure/prisma-passage-link-repository';
import { CanonPassageValidator } from '../../../src/modules/source-library/infrastructure/canon-passage-validator';
import { cleanCanon, seedCanon } from '../../helpers/canon';
import { cleanSourceTestData, openSourceTestDatabase, seedCuratedSource, sourceFixture } from '../../helpers/source-library';
import { passageLinkProps } from '../../helpers/passage-links';

describe('curated passage links through real public libraries and PostgreSQL', () => {
  let database: Database; let repository: PrismaPassageLinkRepository; let library: SourcePassageLinks;
  beforeAll(async () => { database = await openSourceTestDatabase(); });
  beforeEach(async () => {
    await cleanSourceTestData(database); await cleanCanon(database); await seedCanon(database); await seedCuratedSource(database);
    const sourceRepository = new PrismaSourceRepository(database); const canonRepository = new PrismaCanonRepository(database);
    repository = new PrismaPassageLinkRepository(database);
    library = new SourcePassageLinks(repository, new SourceLibrary(sourceRepository, sourceRepository, sourceRepository), new CanonPassageValidator(new CanonLibrary(canonRepository, canonRepository)));
  });
  afterAll(async () => { if (database) { try { await cleanSourceTestData(database); await cleanCanon(database); } finally { await database.onModuleDestroy(); } } });
  it('writes the exact admitted association through its own real repository', async () => {
    const input = passageLinkProps();
    expect(await repository.save(new CuratedPassageLink(input))).toBe('imported');
    expect(await database.client.sourceLibraryPassageLink.findUnique({ where: { id: input.id } })).toEqual({ ...input, chapter: 1n, fromVerse: 1n, toVerse: 1n });
  });
  it('reads a pre-existing admitted relation through the public application contract', async () => {
    const input = passageLinkProps({ id: 'existing-curation' });
    await database.client.sourceLibraryPassageLink.create({ data: { ...input, chapter: 1n, fromVerse: 1n, toVerse: 1n } });
    expect(await library.find(input)).toEqual([new CuratedPassageLink(input)]);
  });
  it('rejects an invalid lookup selection independently of admission', async () => {
    await expect(library.find({ ...passageLinkProps(), fromVerse: 2, toVerse: 1 })).rejects.toThrow(SourceDomainError);
  });
  it('validates actual canonical existence independently of the curation writer', async () => {
    const canonical = new PrismaCanonRepository(database);
    await expect(new CanonPassageValidator(new CanonLibrary(canonical, canonical)).assertExists(passageLinkProps())).resolves.toBeUndefined();
  });
  it.each([['absent passage', 99, SourceNotFoundError], ['invalid chapter', 0, SourceDomainError]] as const)('maps %s at the public canonical boundary', async (_label, chapter, errorType) => {
    const canonical = new PrismaCanonRepository(database);
    await expect(new CanonPassageValidator(new CanonLibrary(canonical, canonical)).assertExists({ ...passageLinkProps(), chapter })).rejects.toThrow(errorType);
  });
  it('persists the genuine explicit relation and repeats it idempotently', async () => {
    expect(await library.curate(passageLinkProps())).toBe('imported'); expect(await library.curate(passageLinkProps())).toBe('unchanged');
    expect(await library.find(passageLinkProps())).toEqual([new CuratedPassageLink(passageLinkProps())]);
    expect(await database.client.sourceLibraryPassageLink.count()).toBe(1);
  });
  it('rejects replacement of an existing curation without overwriting provenance', async () => {
    await library.curate(passageLinkProps());
    await expect(library.curate(passageLinkProps({ rationale: 'Alteração técnica para verificar conflito; nenhum facto novo.' }))).rejects.toThrow(SourceConflictError);
    expect((await library.find(passageLinkProps()))[0]!.rationale).toBe(passageLinkProps().rationale);
  });
  it.each([{ excerptId: 'missing-excerpt' }, { chapter: 99 }])('requires both the excerpt and canonical selection to exist %j', async change => {
    await expect(library.curate(passageLinkProps(change))).rejects.toThrow(SourceNotFoundError);
    expect(await database.client.sourceLibraryPassageLink.count()).toBe(0);
  });
  it.each(['store', 'display', 'quote'] as const)('does not admit a link while %s is forbidden', async key => {
    await database.client.sourceLibrarySource.update({ where: { id: sourceFixture.id }, data: { permissions: { ...sourceFixture.permissions, [key]: 'denied' } } });
    await expect(library.curate(passageLinkProps())).rejects.toThrow(SourceAccessError);
    expect(await database.client.sourceLibraryPassageLink.count()).toBe(0);
  });
  it('scopes overlap to the exact edition/book/chapter and preserves deterministic order', async () => {
    // Two controlled identities describe the same admitted relation, not new claims.
    await library.curate(passageLinkProps({ id: 'zz-creation-parallel' })); await library.curate(passageLinkProps({ id: 'aa-creation-parallel' }));
    expect((await library.find({ ...passageLinkProps(), toVerse: 2 })).map(link => link.id)).toEqual(['aa-creation-parallel', 'zz-creation-parallel']);
    for (const change of [{ translationId: 'missing-edition' }, { bookCode: 'JHN' }, { chapter: 2 }, { fromVerse: 2, toVerse: 3 }]) expect(await library.find({ ...passageLinkProps(), ...change })).toEqual([]);
    await expect(library.find({ ...passageLinkProps(), fromVerse: 2, toVerse: 1 })).rejects.toThrow(SourceDomainError);
  });
  it('serializes two real concurrent admissions of the same identity', async () => {
    expect((await Promise.all([library.curate(passageLinkProps()), library.curate(passageLinkProps())])).sort()).toEqual(['imported', 'unchanged']);
    expect(await database.client.sourceLibraryPassageLink.count()).toBe(1);
  });
  it('keeps a failed own foreign-key insertion atomic', async () => {
    await expect(repository.save(new CuratedPassageLink(passageLinkProps({ excerptId: 'missing-excerpt' })))).rejects.toThrow();
    expect(await database.client.sourceLibraryPassageLink.count()).toBe(0);
  });
  it('propagates a real canonical outage without classifying it as missing evidence', async () => {
    const target = new URL(assertTestTarget(process.env)); target.port = '9';
    const unavailable = new UnavailableDatabase(target.href);
    try {
      const canonical = new PrismaCanonRepository(unavailable); const sources = new PrismaSourceRepository(database);
      const broken = new SourcePassageLinks(repository, new SourceLibrary(sources, sources, sources), new CanonPassageValidator(new CanonLibrary(canonical, canonical)));
      const failure: unknown = await broken.curate(passageLinkProps()).catch((error: unknown) => error);
      expect(failure).toBeInstanceOf(Error); expect(failure).not.toBeInstanceOf(SourceNotFoundError); expect(failure).not.toBeInstanceOf(SourceAccessError);
      expect(await database.client.sourceLibraryPassageLink.count()).toBe(0);
    } finally { await unavailable.onModuleDestroy(); }
  });
});
