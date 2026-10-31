import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContextPanel } from '../features/assistant/context-panel';
import { ToastProvider } from '../shared/ui/toast';
import * as httpClient from '../shared/api/http-client';
import * as sessionHook from '../shared/hooks/use-session';

vi.mock('../shared/api/http-client', async () => {
  const actual = await vi.importActual<typeof httpClient>('../shared/api/http-client');
  return {
    ...actual,
    request: vi.fn(),
  };
});

describe('S10-T003: Assistente de IA — Cancelamento e Sinal de Abort', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    vi.clearAllMocks();
    vi.spyOn(sessionHook, 'useSession').mockReturnValue({
      isAuthenticated: true,
      token: 'fake-jwt-token',
      ownerId: 'operator-1',
      status: 'authenticated',
      setSession: vi.fn(),
      clearSession: vi.fn(),
      version: 1,
    });
  });

  it('encaminha o AbortSignal para a requisição de inferência e trata o cancelamento limpo pelo operador', async () => {
    let capturedSignal: AbortSignal | undefined;

    vi.mocked(httpClient.request).mockImplementation((_url, options) => {
      capturedSignal = options?.signal ?? undefined;
      return new Promise((_resolve, reject) => {
        if (capturedSignal) {
          capturedSignal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }
      });
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ContextPanel activeStudyId="study-123" activeStudyVersion={1} />
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Estudo Conectado/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/O que Josefo relata/i);
    fireEvent.change(input, { target: { value: 'Qual a evidência histórica para este relato?' } });

    const submitBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(submitBtn);

    // Deve estar em progresso e exibir o botão de interrupção (Stop)
    await waitFor(() => {
      expect(httpClient.request).toHaveBeenCalledTimes(1);
    });

    // O sinal deve ter sido capturado e estar ativo (não abortado ainda)
    expect(capturedSignal).toBeDefined();
    expect(capturedSignal?.aborted).toBe(false);

    // Clicar no botão de parada
    const stopButton = screen.getByRole('button', { name: '' });
    fireEvent.click(stopButton);

    expect(capturedSignal?.aborted).toBe(true);

    // Deve voltar ao estado pronto sem exibir erro de servidor
    await waitFor(() => {
      expect(screen.queryByText(/Executando busca vetorial/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Erro no assistente de IA/i)).not.toBeInTheDocument();
    });
  });
});
