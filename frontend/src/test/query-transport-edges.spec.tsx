import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '../shared/api/query-client';
import {
  useWorkspaceNotes,
  useResolveReference,
  useResolvedReference,
  useSourceExcerpts,
} from '../shared/api/hooks';
import { studyId, reference } from './workflow-fixtures';
import excerpts from './fixtures/josephus-pg2848/excerpts.json';

const mockRequest = vi.fn();
const mockUseSession = vi.fn();
// Technical transport/session doubles; QueryClient is real.

vi.mock('../shared/api/http-client', () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

vi.mock('../shared/hooks/use-session', () => ({
  useSession: () => mockUseSession(),
}));

const technicalToken = 'session-token-technical-double';
const clients: QueryClient[] = [];

function createClient(): QueryClient {
  const client = createQueryClient();
  clients.push(client);
  return client;
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  mockRequest.mockReset();
  mockUseSession.mockReset();
  mockUseSession.mockReturnValue({ token: technicalToken });
});

afterEach(() => {
  for (const client of clients) {
    client.clear();
  }
  clients.length = 0;
  vi.clearAllMocks();
});

describe('query transport edge regressions', () => {
  it('useWorkspaceNotes with valid studyId without token does not call HTTP, and with token without studyId does not call HTTP', async () => {
    const client = createClient();

    // Valid studyId without token
    mockUseSession.mockReturnValueOnce({ token: undefined });
    renderHook(() => useWorkspaceNotes(studyId), {
      wrapper: createWrapper(client),
    });
    expect(mockRequest).not.toHaveBeenCalled();

    // Token present without studyId
    renderHook(() => useWorkspaceNotes(''), {
      wrapper: createWrapper(client),
    });
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('useResolveReference.mutateAsync sends POST /references/resolve and exact body translationId and reference', async () => {
    const client = createClient();
    mockRequest.mockResolvedValueOnce(reference);

    const { result } = renderHook(() => useResolveReference(), {
      wrapper: createWrapper(client),
    });

    let resolvedData;
    await act(async () => {
      resolvedData = await result.current.mutateAsync({
        translationId: 'porbr2018',
        reference: 'GEN 1:1',
      });
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith('/references/resolve', {
      method: 'POST',
      body: {
        translationId: 'porbr2018',
        reference: 'GEN 1:1',
      },
    });
    expect(resolvedData).toEqual(reference);
  });

  it('useResolvedReference makes POST with admitted translation porbr2018 and correct reference', async () => {
    const client = createClient();
    mockRequest.mockResolvedValueOnce(reference);

    const { result } = renderHook(() => useResolvedReference('GEN 1:1'), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith('/references/resolve', {
      method: 'POST',
      body: {
        translationId: 'porbr2018',
        reference: 'GEN 1:1',
      },
    });
    expect(result.current.data).toEqual(reference);
  });

  it('useSourceExcerpts receives sourceId and search query Sabbath and makes GET /sources/:id/excerpts with exact params.q', async () => {
    const client = createClient();
    const sourceId = 'josephus-antiquities-pg2848-en';
    const sabbathExcerpt = excerpts[0];

    mockRequest.mockResolvedValueOnce({ excerpts: [sabbathExcerpt] });

    const { result } = renderHook(() => useSourceExcerpts(sourceId, 'Sabbath'), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith(`/sources/${sourceId}/excerpts`, {
      params: { q: 'Sabbath' },
    });
    expect(result.current.data).toEqual([sabbathExcerpt]);
  });
});
