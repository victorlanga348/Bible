import { catalogueView, excerptDetailView, excerptPageView } from '../../../src/modules/source-library/presentation/schemas';
import { sourceSnapshot } from '../../helpers/source-library';

const snapshot = sourceSnapshot();
const catalogue = () => JSON.parse(JSON.stringify({ sources: [snapshot.source] }));
const detail = () => JSON.parse(JSON.stringify({ source: snapshot.source, excerpt: snapshot.excerpts[0] }));
const page = () => ({ excerpts: snapshot.excerpts, limit: 20, offset: 0, hasMore: false,
  coverage: { sourceId: snapshot.source.id, excerptCount: 4, limitations: snapshot.source.limitations } });

describe('approved source response contracts fail closed on damaged transport output', () => {
  it('allows genuine provenance, independent pending AI rights and nullable metadata', () => {
    expect(catalogueView.parse(catalogue())).toEqual(catalogue());
    const response = detail();
    response.source.translator = null;
    response.excerpt.originUrl = null;
    response.source.snapshotSha256 = response.source.snapshotSha256.toUpperCase();
    expect(excerptDetailView.parse(response)).toEqual(response);
    for (const status of ['allowed', 'pending', 'denied']) {
      response.source.permissions.index = status;
      expect(excerptDetailView.parse(response)).toEqual(response);
    }
    expect(excerptPageView.parse(page())).toEqual(page());
  });
  it.each([
    ['id', ''], ['id', 'UPPERCASE'], ['id', `X${snapshot.source.id}`], ['id', `${snapshot.source.id}X`], ['title', ' '], ['author', ''], ['translator', ' '],
    ['language', ''], ['edition', ' '], ['kind', 'unclassified'], ['originUrl', 'relative/path'],
    ['snapshotSha256', 'a'.repeat(63)], ['snapshotSha256', 'a'.repeat(65)], ['snapshotSha256', 'z'.repeat(64)],
    ['retrievedAt', 'not-a-date'], ['rightsStatement', ' '], ['rightsUrl', 'relative'], ['attribution', ''], ['limitations', ' '],
  ])('rejects invalid source %s before serialisation', (field, value) => {
    const response = catalogue();
    response.sources[0][field] = value;
    expect(catalogueView.safeParse(response).success).toBe(false);
  });
  it.each(['ingest', 'store', 'index', 'display', 'quote', 'sendToAi'])('requires an explicit recognised %s status in output', operation => {
    for (const invalid of [null, 'unknown', true]) {
      const response = catalogue();
      response.sources[0].permissions[operation] = invalid;
      expect(catalogueView.safeParse(response).success).toBe(false);
    }
    const missing = catalogue();
    delete missing.sources[0].permissions[operation];
    expect(catalogueView.safeParse(missing).success).toBe(false);
  });
  it.each([
    ['id', ''], ['sourceId', 'UPPERCASE'], ['locator', ' '], ['order', 0], ['order', 1.5], ['order', Number.MAX_SAFE_INTEGER + 1],
    ['text', ' '], ['textSha256', 'short'], ['textSha256', 'z'.repeat(64)], ['originUrl', 'relative'],
  ])('rejects invalid excerpt %s before serialisation', (field, value) => {
    const response = detail();
    response.excerpt[field] = value;
    expect(excerptDetailView.safeParse(response).success).toBe(false);
  });
  it('rejects extra internal fields at every public response boundary', () => {
    expect(catalogueView.safeParse({ ...catalogue(), driver: 'internal' }).success).toBe(false);
    const response = detail();
    response.source.driver = 'internal';
    expect(excerptDetailView.safeParse(response).success).toBe(false);
    const permissions = catalogue();
    permissions.sources[0].permissions.override = 'allowed';
    expect(catalogueView.safeParse(permissions).success).toBe(false);
    const excerpt = detail();
    excerpt.excerpt.driver = 'internal';
    expect(excerptDetailView.safeParse(excerpt).success).toBe(false);
    expect(excerptDetailView.safeParse({ ...detail(), internal: true }).success).toBe(false);
    expect(excerptPageView.safeParse({ ...page(), internal: true }).success).toBe(false);
    expect(excerptPageView.safeParse({ ...page(), coverage: { ...page().coverage, inferred: true } }).success).toBe(false);
  });
  it.each([{ limit: 0 }, { limit: 51 }, { limit: 1.5 }, { offset: -1 }, { offset: 0.5 }, { offset: Number.MAX_SAFE_INTEGER + 1 }, { hasMore: 1 }])('rejects pagination output outside the approved contract %j', override => {
    expect(excerptPageView.safeParse({ ...page(), ...override }).success).toBe(false);
  });
  it('accepts boundary pagination while rejecting invalid coverage counts and identity', () => {
    expect(excerptPageView.parse({ ...page(), limit: 1, offset: Number.MAX_SAFE_INTEGER }).limit).toBe(1);
    expect(excerptPageView.parse({ ...page(), limit: 50 }).limit).toBe(50);
    for (const override of [{ excerptCount: -1 }, { excerptCount: 1.5 }, { sourceId: '' }, { limitations: ' ' }]) {
      expect(excerptPageView.safeParse({ ...page(), coverage: { ...page().coverage, ...override } }).success).toBe(false);
    }
  });
});
