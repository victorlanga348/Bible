import { SourceLibrary } from '../../../src/modules/source-library/application/source-library';
import { SourceAccessError, SourceConflictError, SourceNotFoundError, SourceSnapshotError } from '../../../src/modules/source-library/application/errors';
import { PrismaSourceRepository } from '../../../src/modules/source-library/infrastructure/prisma-source-repository';
import { SourceExcerpt } from '../../../src/modules/source-library/domain/source-excerpt';
import { Database } from '../../../src/infrastructure/database';
import { cleanSourceTestData, openSourceTestDatabase, seedCuratedSource, sourceFixture, sourceSnapshot } from '../../helpers/source-library';

describe('source use cases through real Prisma and isolated PostgreSQL', () => {
  let database: Database;
  let repository: PrismaSourceRepository;
  let library: SourceLibrary;
  beforeAll(async () => {
    database = await openSourceTestDatabase();
    repository = new PrismaSourceRepository(database);
    library = new SourceLibrary(repository, repository, repository);
  });
  beforeEach(async () => { await cleanSourceTestData(database); });
  afterAll(async () => { if (database) { try { await cleanSourceTestData(database); } finally { await database.onModuleDestroy(); } } });

  it('imports all four real texts and preserves exact provenance, location and precision', async () => {
    const snapshot = sourceSnapshot();
    expect(await library.importSnapshot(snapshot)).toBe('imported');
    expect(await library.listSources()).toEqual([snapshot.source]);
    const page = await library.listExcerpts(snapshot.source.id, { limit: 20, offset: 0 });
    expect(page).toEqual({ excerpts: snapshot.excerpts, limit: 20, offset: 0, hasMore: false, coverage: { sourceId: snapshot.source.id, excerptCount: 4, limitations: snapshot.source.limitations } });
    expect(await library.getExcerpt(snapshot.excerpts[0]!.id)).toEqual({ source: snapshot.source, excerpt: snapshot.excerpts[0] });
    expect((await database.client.sourceLibrarySource.findUniqueOrThrow({ where: { id: snapshot.source.id } })).retrievedAt).toBe(sourceFixture.retrievedAt);
  });
  it('has real empty coverage without turning an unavailable resource into an invented one', async () => {
    expect(await library.listSources()).toEqual([]);
    await expect(library.listExcerpts('absent', { limit: 20, offset: 0 })).rejects.toThrow(SourceNotFoundError);
    await expect(library.getExcerpt('absent')).rejects.toThrow(SourceNotFoundError);
  });
  it('is idempotent for identical identity and hash', async () => {
    const snapshot = sourceSnapshot();
    await library.importSnapshot(snapshot);
    expect(await library.importSnapshot(snapshot)).toBe('unchanged');
    expect(await database.client.sourceLibrarySource.count()).toBe(1);
    expect(await database.client.sourceLibraryExcerpt.count()).toBe(4);
  });
  it('rejects a conflicting hash without replacing metadata or text', async () => {
    const snapshot = sourceSnapshot();
    await library.importSnapshot(snapshot);
    await expect(library.importSnapshot(sourceSnapshot({ snapshotSha256: 'f'.repeat(64) }))).rejects.toThrow(SourceConflictError);
    expect(await library.listSources()).toEqual([snapshot.source]);
    expect((await library.listExcerpts(snapshot.source.id, { limit: 20, offset: 0 })).excerpts).toEqual(snapshot.excerpts);
  });
  it.each(['id', 'locator', 'order', 'sourceId'] as const)('rejects invalid snapshot relationship/uniqueness %s before persisting', async key => {
    const snapshot = sourceSnapshot();
    const first = snapshot.excerpts[0]!;
    const second = snapshot.excerpts[1]!;
    const replacement = new SourceExcerpt({ ...second, [key]: key === 'sourceId' ? 'foreign-source' : first[key] });
    await expect(library.importSnapshot({ source: snapshot.source, excerpts: [first, replacement] })).rejects.toThrow(SourceSnapshotError);
    expect(await database.client.sourceLibrarySource.count()).toBe(0);
    expect(await database.client.sourceLibraryExcerpt.count()).toBe(0);
  });
  it('verifies the text digest rather than accepting an unrelated valid hexadecimal checksum', async () => {
    const snapshot = sourceSnapshot();
    const bad = new SourceExcerpt({ ...snapshot.excerpts[0]!, textSha256: 'a'.repeat(64) });
    await expect(library.importSnapshot({ source: snapshot.source, excerpts: [bad] })).rejects.toThrow(SourceSnapshotError);
    expect(await database.client.sourceLibrarySource.count()).toBe(0);
  });
  it.each(['ingest', 'store'] as const)('requires %s permission before any import', async key => {
    for (const value of ['pending', 'denied'] as const) {
      const snapshot = sourceSnapshot({ permissions: { ...sourceFixture.permissions, [key]: value } });
      await expect(library.importSnapshot(snapshot)).rejects.toThrow(SourceAccessError);
      expect(await database.client.sourceLibrarySource.count()).toBe(0);
    }
  });
  it('rolls back the source and every excerpt after a real database write fails', async () => {
    // Test-only constraint forces failure after the source insert; no repository mock.
    await database.client.$executeRaw`ALTER TABLE app.source_library_excerpt ADD CONSTRAINT fixture_reject_second CHECK ("order" <> 2)`;
    try {
      await expect(library.importSnapshot(sourceSnapshot())).rejects.toThrow('fixture_reject_second');
      expect(await database.client.sourceLibrarySource.count()).toBe(0);
      expect(await database.client.sourceLibraryExcerpt.count()).toBe(0);
    } finally { await database.client.$executeRaw`ALTER TABLE app.source_library_excerpt DROP CONSTRAINT fixture_reject_second`; }
  });
  it('paginates with stable source order, accurate coverage and no arbitrary int32 truncation', async () => {
    const snapshot = sourceSnapshot();
    await seedCuratedSource(database, snapshot);
    const first = await library.listExcerpts(snapshot.source.id, { limit: 2, offset: 0 });
    expect(first.excerpts.map(row => row.order)).toEqual([1, 2]);
    expect(first.hasMore).toBe(true);
    expect(first.coverage.excerptCount).toBe(4);
    const last = await library.listExcerpts(snapshot.source.id, { limit: 2, offset: 2 });
    expect(last.excerpts.map(row => row.order)).toEqual([3, 4]);
    expect(last.hasMore).toBe(false);
    const absent = await library.listExcerpts(snapshot.source.id, { limit: 2, offset: Number.MAX_SAFE_INTEGER });
    expect(absent.excerpts).toEqual([]);
    expect(absent.hasMore).toBe(false);
    expect(absent.coverage.excerptCount).toBe(4);
  });
  it.each([['MOISTURE', [1]], ['serpents', [4]], ['God', [4, 1, 2, 3]], ['moisture OR serpents', []], ['the and', []], ["'; DROP TABLE app.source_library_excerpt; --", []]] as const)('uses lexical English search for %s, never query syntax or historical conclusions', async (query, orders) => {
    await seedCuratedSource(database);
    const result = await library.listExcerpts(sourceFixture.id, { query, limit: 20, offset: 0 });
    expect(result.excerpts.map(row => row.order)).toEqual(orders);
    expect(result.coverage).toEqual({ sourceId: sourceFixture.id, excerptCount: 4, limitations: sourceFixture.limitations });
    expect(result.hasMore).toBe(false);
    expect(await database.client.sourceLibraryExcerpt.count()).toBe(4);
  });
  it.each(['display', 'quote'] as const)('blocks pending/denied %s before materialising text', async key => {
    for (const value of ['pending', 'denied'] as const) {
      await cleanSourceTestData(database);
      const snapshot = sourceSnapshot({ permissions: { ...sourceFixture.permissions, [key]: value } });
      await seedCuratedSource(database, snapshot);
      // Observational spies retain real implementations; they are not repository doubles.
      const list = jest.spyOn(repository, 'listExcerpts');
      const read = jest.spyOn(repository, 'findExcerpt');
      try {
        expect(await library.listSources()).toEqual([]);
        await expect(library.listExcerpts(snapshot.source.id, { limit: 20, offset: 0 })).rejects.toThrow(SourceAccessError);
        await expect(library.getExcerpt(snapshot.excerpts[0]!.id)).rejects.toThrow(SourceAccessError);
        expect(list).not.toHaveBeenCalled();
        expect(read).not.toHaveBeenCalled();
      } finally { list.mockRestore(); read.mockRestore(); }
    }
  });
  it.each(['pending', 'denied'] as const)('can store and read while index is %s, without granting search', async index => {
    const snapshot = sourceSnapshot({ permissions: { ...sourceFixture.permissions, index } });
    expect(await library.importSnapshot(snapshot)).toBe('imported');
    expect((await library.listExcerpts(snapshot.source.id, { limit: 20, offset: 0 })).excerpts).toHaveLength(4);
    await expect(library.listExcerpts(snapshot.source.id, { query: 'God', limit: 20, offset: 0 })).rejects.toThrow(SourceAccessError);
  });
  it('lists only readable sources in identity order', async () => {
    const first = sourceSnapshot({ id: 'a-controlled-fixture' });
    const last = sourceSnapshot({ id: 'z-controlled-fixture' });
    const hidden = sourceSnapshot({ id: 'hidden-controlled-fixture', permissions: { ...sourceFixture.permissions, display: 'pending' } });
    for (const row of [last, hidden, first]) await seedCuratedSource(database, row);
    expect((await library.listSources()).map(source => source.id)).toEqual([first.source.id, last.source.id]);
  });
  it('keeps another source out of counts, lists, searches and excerpt identity reads', async () => {
    const first = sourceSnapshot();
    const other = sourceSnapshot({ id: 'another-controlled-fixture', translator: null });
    await seedCuratedSource(database, first);
    await seedCuratedSource(database, other);
    expect((await library.listExcerpts(first.source.id, { limit: 20, offset: 0 })).excerpts).toEqual(first.excerpts);
    const searched = await library.listExcerpts(other.source.id, { query: 'moisture', limit: 20, offset: 0 });
    expect(searched.excerpts).toEqual([other.excerpts[0]]);
    expect(searched.coverage.excerptCount).toBe(4);
    expect(await repository.findExcerpt(first.excerpts[0]!.id, other.source.id)).toBeNull();
    expect(await repository.findExcerptSourceId(other.excerpts[0]!.id)).toBe(other.source.id);
    expect((await library.getExcerpt(other.excerpts[0]!.id)).source.translator).toBeNull();
  });
  it('reports admitted source coverage as zero when it has no excerpts', async () => {
    const snapshot = sourceSnapshot();
    await seedCuratedSource(database, snapshot);
    await database.client.sourceLibraryExcerpt.deleteMany();
    expect(await library.listExcerpts(snapshot.source.id, { limit: 20, offset: 0 })).toEqual({ excerpts: [], limit: 20, offset: 0, hasMore: false,
      coverage: { sourceId: snapshot.source.id, excerptCount: 0, limitations: snapshot.source.limitations } });
  });
  it('compares hexadecimal digests case insensitively while preserving the admitted representation', async () => {
    const snapshot = sourceSnapshot({ snapshotSha256: sourceFixture.snapshotSha256.toUpperCase() });
    const uppercase = { source: snapshot.source, excerpts: snapshot.excerpts.map(excerpt => new SourceExcerpt({ ...excerpt, textSha256: excerpt.textSha256.toUpperCase() })) };
    expect(await library.importSnapshot(uppercase)).toBe('imported');
    expect(await library.importSnapshot(sourceSnapshot())).toBe('unchanged');
    expect((await library.listExcerpts(snapshot.source.id, { limit: 20, offset: 0 })).excerpts).toEqual(uppercase.excerpts);
  });
  it('recovers imported text, ranking and idempotency after the importing client disconnects', async () => {
    const writer = await openSourceTestDatabase();
    const writerPort = new PrismaSourceRepository(writer);
    const snapshot = sourceSnapshot();
    try {
      expect(await new SourceLibrary(writerPort, writerPort, writerPort).importSnapshot(snapshot)).toBe('imported');
    } finally { await writer.onModuleDestroy(); }
    expect(await library.importSnapshot(snapshot)).toBe('unchanged');
    const result = await library.listExcerpts(snapshot.source.id, { query: 'God', limit: 2, offset: 1 });
    expect(result.excerpts).toEqual([snapshot.excerpts[0], snapshot.excerpts[1]]);
    expect(result.hasMore).toBe(true);
    expect(result.coverage.excerptCount).toBe(4);
    expect(await library.getExcerpt(snapshot.excerpts[3]!.id)).toEqual({ source: snapshot.source, excerpt: snapshot.excerpts[3] });
  });
  it('propagates a real database outage instead of returning empty coverage', async () => {
    const unavailable = new Database('postgresql://localhost:9/biblia_test');
    const port = new PrismaSourceRepository(unavailable);
    // Prisma's pg adapter preserves the native refused-connection code.
    try { await expect(new SourceLibrary(port, port, port).listSources()).rejects.toMatchObject({ code: 'ECONNREFUSED' }); }
    finally { await unavailable.onModuleDestroy(); }
  });
  it('serialises simultaneous imports from two real clients without duplicate or partial data', async () => {
    const other = await openSourceTestDatabase();
    const otherPort = new PrismaSourceRepository(other);
    const otherLibrary = new SourceLibrary(otherPort, otherPort, otherPort);
    let release!: () => void;
    let acquired!: () => void;
    const held = new Promise<void>(resolve => { acquired = resolve; });
    const unblock = new Promise<void>(resolve => { release = resolve; });
    // SHARE permits both initial reads but holds INSERTs. This forces overlap in
    // PostgreSQL, making a missing identity lock observable rather than a timing guess.
    const locker = database.client.$transaction(async tx => {
      await tx.$executeRaw`LOCK TABLE app.source_library_source IN SHARE MODE`;
      acquired();
      await unblock;
    });
    await held;
    const attempts = [library.importSnapshot(sourceSnapshot()), otherLibrary.importSnapshot(sourceSnapshot())].map(promise => promise.catch(error => error as Error));
    let overlap = false;
    try {
      for (let attempt = 0; attempt < 40; attempt++) {
        const rows = await database.client.$queryRaw<{ blocked: number }[]>`
          SELECT count(*)::int AS blocked FROM pg_stat_activity
          WHERE datname = current_database() AND usename = current_user AND wait_event_type = 'Lock' AND pid <> pg_backend_pid()`;
        if (rows[0]!.blocked === 2) { overlap = true; break; }
        await new Promise(resolve => setTimeout(resolve, 15));
      }
    } finally { release(); await locker; }
    try {
      const results = await Promise.all(attempts);
      expect(overlap).toBe(true);
      expect(results.sort()).toEqual(['imported', 'unchanged']);
      expect(await database.client.sourceLibrarySource.count()).toBe(1);
      expect(await database.client.sourceLibraryExcerpt.count()).toBe(4);
    } finally { await other.onModuleDestroy(); }
  });
});
