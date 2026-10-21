import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApplication } from '../../src/app';
import { parseRuntimeConfig } from '../../src/config/runtime-config';
import type { Database } from '../../src/infrastructure/database';
import { importTestSnapshot } from '../../src/modules/source-library/infrastructure/import-test-snapshot';
import { cleanSourceTestData, openSourceTestDatabase, sourceSnapshot } from '../helpers/source-library';

describe('admitted original through guarded import, PostgreSQL and real HTTP', () => {
  let app: INestApplication;
  let database: Database;
  beforeAll(async () => {
    database = await openSourceTestDatabase();
    await cleanSourceTestData(database);
    app = await createApplication(parseRuntimeConfig(process.env));
    await app.init();
  });
  afterAll(async () => {
    try { if (database) await cleanSourceTestData(database); }
    finally { try { await app?.close(); } finally { await database?.onModuleDestroy(); } }
  });
  it('recovers the exact admitted four paragraphs, provenance, coverage and lexical result without seeding the repository', async () => {
    expect(await database.client.sourceLibrarySource.count()).toBe(0);
    const fixture = 'test/fixtures/source-library/josephus-antiquities-pg2848-en/';
    const files = {
      source: 'data/source-library/josephus-antiquities-pg2848-en/source.html',
      manifest: fixture + 'manifest.json', excerpts: fixture + 'excerpts.json', notice: fixture + 'NOTICE.source.txt',
    };
    expect(await importTestSnapshot(process.env, files)).toBe('imported');
    expect(await importTestSnapshot(process.env, files)).toBe('unchanged');
    const snapshot = sourceSnapshot();
    expect((await request(app.getHttpServer()).get('/sources').expect(200)).body).toEqual({ sources: [JSON.parse(JSON.stringify(snapshot.source))] });
    const base = `/sources/${snapshot.source.id}/excerpts`;
    expect((await request(app.getHttpServer()).get(base).expect(200)).body).toEqual({
      excerpts: snapshot.excerpts, limit: 20, offset: 0, hasMore: false,
      coverage: { sourceId: snapshot.source.id, excerptCount: 4, limitations: snapshot.source.limitations },
    });
    const excerpt = snapshot.excerpts[0]!;
    expect((await request(app.getHttpServer()).get(`/source-excerpts/${excerpt.id}`).expect(200)).body).toEqual({ excerpt, source: JSON.parse(JSON.stringify(snapshot.source)) });
    expect((await request(app.getHttpServer()).get(base).query({ q: 'God', limit: '1', offset: '1' }).expect(200)).body).toEqual({
      excerpts: [excerpt], limit: 1, offset: 1, hasMore: true,
      coverage: { sourceId: snapshot.source.id, excerptCount: 4, limitations: snapshot.source.limitations },
    });
  });
});
