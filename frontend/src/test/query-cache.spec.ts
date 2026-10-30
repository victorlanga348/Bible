import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient, queryKeys as keys } from '../shared/api/query-client';
const clients: ReturnType<typeof createQueryClient>[] = [];
const create = () => { const client = createQueryClient(); clients.push(client); return client; };
afterEach(() => { for (const client of clients) client.clear(); clients.length = 0; vi.useRealTimers(); });

describe('query cache separation and retry behavior', () => {
  it('keeps distinct public resources, versions, cursors and conversation histories separate in the actual cache', () => {
    const queries = [
      keys.health(), keys.canon.translations(), keys.sources.all(),
      keys.canon.books('porbr2018'), keys.canon.books('technical-other-translation-key'),
      keys.canon.passage('porbr2018', 'GEN', 1), keys.canon.passage('porbr2018', 'GEN', 1, 1, 3),
      keys.canon.resolved('porbr2018', 'GEN 1:1'), keys.canon.resolved('porbr2018', 'JHN 3:16'),
      keys.sources.excerpts('source-a'), keys.sources.excerpts('source-a', 'search'),
      keys.studies.detail('study-a'), keys.studies.detail('study-a', 2),
      keys.workspace.studies(), keys.workspace.studies('next-page'),
      keys.workspace.notes('study-a'), keys.workspace.notes('study-a', 2),
      keys.workspace.favorites(), keys.workspace.favorites('next-page'),
      keys.crossReferences.relations('porbr2018', 'GEN 1:1'), keys.crossReferences.relations('porbr2018', 'JHN 3:16'),
      keys.assistant.conversation('conversation-a'), keys.assistant.conversation('conversation-b'),
      keys.assistant.analyses('study-a'), keys.assistant.analyses('study-b'),
    ];
    const client = create();
    queries.forEach((key, index) => client.setQueryData(key, { resource: index }));
    queries.forEach((key, index) => expect(client.getQueryData(key)).toEqual({ resource: index }));
    expect(client.getQueryCache().getAll()).toHaveLength(queries.length);
    expect(create().getQueryCache().getAll()).toHaveLength(0);
  });
  it.each([400, 401, 404, 409, 422, 503])('does not repeat client errors but permits one transient retry: %i', async status => {
    const client = create(); const fetcher = vi.fn(async () => { throw { status }; });
    await expect(client.fetchQuery({ queryKey: ['technical-retry'], queryFn: fetcher, retryDelay: 0 })).rejects.toMatchObject({ status });
    expect(fetcher).toHaveBeenCalledTimes(status < 500 ? 1 : 2);
  });
  it('retries a generic transport failure only once', async () => {
    const client = create(); const fetcher = vi.fn(async () => { throw new Error('technical offline'); });
    await expect(client.fetchQuery({ queryKey: ['technical-network'], queryFn: fetcher, retryDelay: 0 })).rejects.toThrow('technical offline');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('reuses fresh data and fetches it again after the configured freshness period', async () => {
    vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(1000000);
    const client = create(); const fetcher = vi.fn(async () => ({ technical: true }));
    await client.fetchQuery({ queryKey: ['technical-freshness'], queryFn: fetcher });
    vi.setSystemTime(1020000);
    await client.fetchQuery({ queryKey: ['technical-freshness'], queryFn: fetcher });
    expect(fetcher).toHaveBeenCalledTimes(1);
    vi.setSystemTime(1300001);
    await client.fetchQuery({ queryKey: ['technical-freshness'], queryFn: fetcher });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
