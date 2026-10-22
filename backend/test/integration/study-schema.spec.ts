import type { Database } from '../../src/infrastructure/database';
import { cleanSourceTestData, openSourceTestDatabase, seedCuratedSource } from '../helpers/source-library';
import { studyProps, realEvidence } from '../helpers/study';

describe('study and curated passage-link schema on guarded real PostgreSQL', () => {
  let database: Database;
  const id = studyProps().id;
  const document = JSON.stringify(studyProps().content);
  async function clear(): Promise<void> {
    await database.client.$executeRaw`DELETE FROM app.source_library_passage_link`;
    await database.client.$executeRaw`DELETE FROM app.study_version`;
    await database.client.$executeRaw`DELETE FROM app.study_record`;
  }
  beforeAll(async () => { database = await openSourceTestDatabase(); await clear(); await cleanSourceTestData(database); await seedCuratedSource(database); });
  beforeEach(async () => {
    await clear();
    await database.client.$executeRaw`INSERT INTO app.study_record(id,owner_id,current_version,created_at) VALUES (${id}::uuid,'owner-a',1,now())`;
    await database.client.$executeRaw`INSERT INTO app.study_version(study_id,number,document,created_at) VALUES (${id}::uuid,1,${document}::jsonb,now())`;
    await database.client.$executeRaw`INSERT INTO app.source_library_passage_link(id,excerpt_id,translation_id,book_code,chapter,from_verse,to_verse,nature,rationale)
      VALUES ('gen-creation-parallel',${realEvidence().excerptId},'porbr2018','GEN',1,1,1,'narrative-parallel','Paralelo narrativo, sem comprovação histórica independente.')`;
  });
  afterAll(async () => { if (database) { try { await clear(); await cleanSourceTestData(database); } finally { await database.onModuleDestroy(); } } });
  it('places the three additive tables only in app', async () => {
    expect(await database.client.$queryRaw`SELECT table_schema,table_name FROM information_schema.tables WHERE table_name IN ('study_record','study_version','source_library_passage_link') ORDER BY table_name`).toEqual([
      { table_schema: 'app', table_name: 'source_library_passage_link' }, { table_schema: 'app', table_name: 'study_record' }, { table_schema: 'app', table_name: 'study_version' },
    ]);
  });
  it('keeps all foreign keys within each owning module and has the planned lookup indices', async () => {
    const foreignKeys = await database.client.$queryRaw<{ child: string; parent: string; parent_schema: string }[]>`
      SELECT c.relname AS child,p.relname AS parent,n.nspname AS parent_schema FROM pg_constraint fk
      JOIN pg_class c ON fk.conrelid=c.oid JOIN pg_class p ON fk.confrelid=p.oid JOIN pg_namespace n ON p.relnamespace=n.oid
      WHERE fk.contype='f' AND c.relname IN ('study_record','study_version','source_library_passage_link') ORDER BY c.relname`;
    expect(foreignKeys).toEqual([
      { child: 'source_library_passage_link', parent: 'source_library_excerpt', parent_schema: 'app' },
      { child: 'study_version', parent: 'study_record', parent_schema: 'app' },
    ]);
    const indices = await database.client.$queryRaw<{ indexdef: string }[]>`SELECT indexdef FROM pg_indexes WHERE schemaname='app' AND tablename IN ('study_record','source_library_passage_link')`;
    expect(indices.some(row => /owner_id, created_at DESC, id DESC/.test(row.indexdef))).toBe(true);
    expect(indices.some(row => /translation_id, book_code, chapter, from_verse, to_verse/.test(row.indexdef))).toBe(true);
  });
  it.each(['', 'owner with space', 'a'.repeat(65), 'owner-a\n'])('refuses out-of-profile persisted owner %j', async owner => {
    await expect(database.client.$executeRaw`UPDATE app.study_record SET owner_id=${owner} WHERE id=${id}::uuid`).rejects.toThrow();
  });
  it.each([0n, -1n, 9007199254740992n])('refuses invalid current and historical version %s', async version => {
    await expect(database.client.$executeRaw`UPDATE app.study_record SET current_version=${version} WHERE id=${id}::uuid`).rejects.toThrow();
    await expect(database.client.$executeRaw`INSERT INTO app.study_version(study_id,number,document,created_at) VALUES (${id}::uuid,${version},${document}::jsonb,now())`).rejects.toThrow();
  });
  it.each(['[]', 'null', '"not a document"', '1'])('requires a JSONB document object, rejecting %s', async malformed => {
    await expect(database.client.$executeRaw`INSERT INTO app.study_version(study_id,number,document,created_at) VALUES (${id}::uuid,2,${malformed}::jsonb,now())`).rejects.toThrow();
  });
  it('enforces version identity, own foreign keys and explicit record deletion of owned versions', async () => {
    await expect(database.client.$executeRaw`INSERT INTO app.study_version(study_id,number,document,created_at) VALUES (${id}::uuid,1,${document}::jsonb,now())`).rejects.toThrow();
    await expect(database.client.$executeRaw`INSERT INTO app.study_version(study_id,number,document,created_at) VALUES ('00000000-0000-0000-0000-000000000000'::uuid,1,${document}::jsonb,now())`).rejects.toThrow();
    await expect(database.client.$executeRaw`UPDATE app.source_library_passage_link SET excerpt_id='missing-excerpt'`).rejects.toThrow();
    await expect(database.client.$executeRaw`DELETE FROM app.source_library_excerpt`).rejects.toThrow();
    await database.client.$executeRaw`DELETE FROM app.study_record WHERE id=${id}::uuid`;
    expect(await database.client.$queryRaw`SELECT count(*)::int AS total FROM app.study_version`).toEqual([{ total: 0 }]);
  });
  it.each(['id', 'excerpt_id', 'translation_id', 'book_code', 'nature', 'rationale'])('rejects blank association %s', async column => {
    // Column names are this closed literal matrix, never transport input.
    await expect(database.client.$executeRawUnsafe(`UPDATE app.source_library_passage_link SET "${column}"=$1`, ' ')).rejects.toThrow();
  });
  it.each(['chapter', 'from_verse', 'to_verse'])('enforces safe positive association %s', async column => {
    for (const value of [0n, -1n, 9007199254740992n]) await expect(database.client.$executeRawUnsafe(`UPDATE app.source_library_passage_link SET "${column}"=$1`, value)).rejects.toThrow();
  });
  it('rejects reversed associations, unknown nature and malformed identities/book code', async () => {
    await expect(database.client.$executeRaw`UPDATE app.source_library_passage_link SET from_verse=2,to_verse=1`).rejects.toThrow();
    await expect(database.client.$executeRaw`UPDATE app.source_library_passage_link SET nature='historical-proof'`).rejects.toThrow();
    await expect(database.client.$executeRaw`UPDATE app.source_library_passage_link SET id='-invalid'`).rejects.toThrow();
    await expect(database.client.$executeRaw`UPDATE app.source_library_passage_link SET translation_id='BAD'`).rejects.toThrow();
    await expect(database.client.$executeRaw`UPDATE app.source_library_passage_link SET book_code='gen'`).rejects.toThrow();
    expect(await database.client.$queryRaw`SELECT count(*)::int AS total FROM app.study_version`).toEqual([{ total: 1 }]);
  });
});
