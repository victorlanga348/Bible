import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateAiAnalysis } from '../shared/api/hooks';
import * as httpClient from '../shared/api/http-client';

vi.mock('../shared/hooks/use-session', () => ({
  useSession: () => ({ token: 'technical-test-token' }),
}));
vi.mock('../shared/api/http-client', async (original) => ({
  ...await original<typeof httpClient>(), request: vi.fn(),
}));

describe('S10-T003: contrato de cancelamento da análise direta', () => {
  it('envia o sinal real sem o incluir no JSON e propaga AbortError', async () => {
    vi.mocked(httpClient.request).mockImplementation((_url, options) =>
      new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Interrompido', 'AbortError')), { once: true });
      }));
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) =>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result, unmount } = renderHook(() => useCreateAiAnalysis(), { wrapper });
    const controller = new AbortController();
    let pending: Promise<unknown>;
    act(() => {
      pending = result.current.mutateAsync({ studyId: 'technical-study', studyVersion: 3,
        question: 'Qual a evidência?', signal: controller.signal });
    });
    await vi.waitFor(() => expect(httpClient.request).toHaveBeenCalledWith(
      '/studies/technical-study/ai-analyses', {
        method: 'POST', token: 'technical-test-token', signal: controller.signal,
        body: { studyVersion: 3, question: 'Qual a evidência?' },
      }));
    const rejected = expect(pending!).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await act(async () => { await rejected; });
    expect(controller.signal.aborted).toBe(true);
    unmount();
    client.clear();
  });
});
