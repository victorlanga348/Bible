import { Client } from 'pg';
import { assertAiTestTarget } from '../../../src/config/ai-target';
import { analysisDocument } from '../../helpers/ai-analysis';

// Technical vectors exercise real SQL constraints; no recorded or inferred embeddings.
const vector = (index = 0): number[] => Array.from({ length: 1024 }, (_, ordinal) => ordinal === index ? 1 : 0);
const profile = 'technical-sql-profile';
describe('own AI persistence migrations and actual vector extension, isolated biblia_test only', () => {
  let connection: Client;
  beforeAll(async () => {
    connection = new Client({ connectionString: assertAiTestTarget(process.env), connectionTimeoutMillis: 3000, query_timeout: 3000 });
    await connection.connect();
    expect((await connection.query('SELECT current_database() AS db,current_user AS role')).rows).toEqual([{ db: 'biblia_test', role: 'biblia_test' }]);
  });
  beforeEach(async () => { await connection.query('BEGIN'); });
  afterEach(async () => { await connection.query('ROLLBACK'); });
  afterAll(async () => { if (connection) await connection.end(); });
  const addProfile = async () => connection.query('INSERT INTO ai.embedding_profile(id,configuration,completed_at) VALUES($1,$2,now())', [profile, { purpose: 'technical SQL validation, no inference' }]);
  const addChunk = async (patch: Record<string, unknown> = {}) => {
    const row = { id: 'p1-c1', sourceId: 'technical-source', excerptId: 'technical-excerpt', sourceDigest: 'a'.repeat(64), textDigest: 'b'.repeat(64), startOffset: 0, endOffset: 1000, embedding: JSON.stringify(vector()), profileId: profile, ...patch };
    return connection.query('INSERT INTO ai.source_chunk(profile_id,id,source_id,excerpt_id,source_digest,text_digest,start_offset,end_offset,embedding) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::vector)', [row.profileId, row.id, row.sourceId, row.excerptId, row.sourceDigest, row.textDigest, row.startOffset, row.endOffset, row.embedding]);
  };
  it('provides PG17.11/pgvector0.8.7 and exactly1024-dimensional vectors without an ANN index', async () => {
    expect((await connection.query('SHOW server_version_num')).rows[0]).toEqual({ server_version_num: '170011' });
    expect((await connection.query("SELECT extversion FROM pg_extension WHERE extname='vector'")).rows).toEqual([{ extversion: '0.8.7' }]);
    const columns = await connection.query("SELECT a.attname,format_type(a.atttypid,a.atttypmod) AS type FROM pg_attribute a WHERE a.attrelid='ai.source_chunk'::regclass AND a.attnum>0 AND NOT a.attisdropped ORDER BY a.attnum");
    expect(columns.rows.find(row => row.attname === 'embedding')).toEqual({ attname: 'embedding', type: 'vector(1024)' });
    expect((await connection.query("SELECT indexdef FROM pg_indexes WHERE schemaname='ai' AND (indexdef ILIKE '%USING hnsw%' OR indexdef ILIKE '%USING ivfflat%')")).rows).toEqual([]);
  });
  it('keeps only the six owned analysis columns, JSONB and no foreign keys into study/source/canon', async () => {
    const result = await connection.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_schema='app' AND table_name='ai_analysis' ORDER BY ordinal_position");
    expect(result.rows).toEqual([{ column_name: 'id', data_type: 'uuid' }, { column_name: 'owner_id', data_type: 'text' }, { column_name: 'study_id', data_type: 'uuid' }, { column_name: 'study_version', data_type: 'bigint' }, { column_name: 'document', data_type: 'jsonb' }, { column_name: 'created_at', data_type: 'timestamp with time zone' }]);
    expect((await connection.query("SELECT conname FROM pg_constraint WHERE conrelid='app.ai_analysis'::regclass AND contype='f'")).rows).toEqual([]);
    expect((await connection.query("SELECT confrelid::regclass::text AS target FROM pg_constraint WHERE connamespace='ai'::regnamespace AND contype='f'")).rows).toEqual([{ target: 'ai.embedding_profile' }]);
  });
  it('inserts and rolls back actual analysis metadata independently of a study-table row', async () => {
    const document = analysisDocument();
    await connection.query('INSERT INTO app.ai_analysis(id,owner_id,study_id,study_version,document,created_at) VALUES($1,$2,$3,$4,$5,$6)', [document.id, document.ownerId, document.studyId, document.studyVersion, document, document.createdAt]);
    const rows = (await connection.query('SELECT document,created_at FROM app.ai_analysis WHERE id=$1', [document.id])).rows;
    expect(rows[0].document).toEqual(document); expect(rows[0].created_at.toISOString()).toBe(document.createdAt);
  });
  it.each([{ owner: '' }, { owner: 'a b' }, { owner: 'a\n' }, { owner: 'a'.repeat(65) }, { version: 0 }, { version: -1 }, { version: '9007199254740992' }, { document: [] }, { document: { schemaVersion: 2 } }, { document: {} }])('rejects invalid analysis row by real SQL constraints %j', async patch => {
    const document = analysisDocument(); const row = { owner: document.ownerId, version: document.studyVersion, document, ...patch };
    await expect(connection.query('INSERT INTO app.ai_analysis(id,owner_id,study_id,study_version,document) VALUES($1,$2,$3,$4,$5)', [document.id, row.owner, document.studyId, row.version, row.document])).rejects.toMatchObject({ code: '23514' });
  });
  it('stores only metadata/vectors and cascades only the internal profile relation', async () => {
    await addProfile(); await addChunk();
    expect((await connection.query('SELECT vector_dims(embedding) AS dims,vector_norm(embedding) AS norm FROM ai.source_chunk WHERE profile_id=$1', [profile])).rows).toEqual([{ dims: 1024, norm: 1 }]);
    const columns = (await connection.query("SELECT column_name FROM information_schema.columns WHERE table_schema='ai' AND table_name='source_chunk'")).rows.map(row => row.column_name);
    expect(columns).not.toContain('text'); expect(columns).not.toContain('question');
    await connection.query('DELETE FROM ai.embedding_profile WHERE id=$1', [profile]);
    expect((await connection.query('SELECT count(*)::int AS count FROM ai.source_chunk WHERE profile_id=$1', [profile])).rows).toEqual([{ count: 0 }]);
  });
  it.each([{ id: 'bad id' }, { sourceId: '-leading' }, { excerptId: 'bad\n' }, { sourceDigest: 'a'.repeat(63) }, { textDigest: 'G'.repeat(64) }, { startOffset: -1 }, { endOffset: 0 }, { startOffset: 1000 }, { endOffset: '9007199254740992' }, { embedding: JSON.stringify(Array(1024).fill(0)) }, { embedding: JSON.stringify(Array(1024).fill(1)) }])('enforces own chunk metadata/span/vector norm constraints %j', async patch => {
    await addProfile(); await expect(addChunk(patch)).rejects.toMatchObject({ code: '23514' });
  });
  it('rejects wrong vector dimensions and orphan profile before accepting a chunk', async () => {
    await addProfile(); await expect(addChunk({ embedding: JSON.stringify(vector().slice(1)) })).rejects.toMatchObject({ code: '22000' });
  });
  it('rejects an orphan profile using only the internal FK', async () => {
    await expect(addChunk()).rejects.toMatchObject({ code: '23503' });
  });
  it('computes exact cosine distance and deterministic metadata tie order using actual vectors', async () => {
    await addProfile(); await addChunk({ id: 'p1-c2', startOffset: 900, endOffset: 1900 }); await addChunk(); await addChunk({ id: 'p1-c3', startOffset: 1800, endOffset: 2127, embedding: JSON.stringify(vector(1)) });
    const result = await connection.query('SELECT id,embedding <=> $1::vector AS distance FROM ai.source_chunk WHERE profile_id=$2 ORDER BY distance,excerpt_id,start_offset,id LIMIT 3', [JSON.stringify(vector()), profile]);
    expect(result.rows).toEqual([{ id: 'p1-c1', distance: 0 }, { id: 'p1-c2', distance: 0 }, { id: 'p1-c3', distance: 1 }]);
  });
});
