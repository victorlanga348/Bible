import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppContent } from '../App';
import { ThemeProvider } from '../shared/hooks/use-theme';
import { ToastProvider } from '../shared/ui/toast';
import { AccountAccessProvider } from '../shared/ui/shell';
import * as httpClient from '../shared/api/http-client';
import * as sessionHook from '../shared/hooks/use-session';

vi.mock('../shared/api/http-client', async () => {
  const actual = await vi.importActual<typeof httpClient>('../shared/api/http-client');
  return {
    ...actual,
    request: vi.fn(),
  };
});

describe('S10-T003: Fluxo de Contexto de Estudo na Aplicação', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

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

  it('conecta o estudo ativo ao painel do assistente após geração e navegação', async () => {
    vi.mocked(httpClient.request).mockImplementation((url) => {
      const u = String(url);
      if (u.includes('/translations')) {
        return Promise.resolve({ translations: [{ id: 'porbr2018', name: 'Bíblia Livre' }] });
      }
      if (u.includes('/books')) {
        return Promise.resolve({ books: [{ code: 'GEN', name: 'Gênesis', order: 1 }] });
      }
      if (u.includes('/verses')) {
        return Promise.resolve({
          translationId: 'porbr2018',
          bookCode: 'GEN',
          chapter: 1,
          verses: [{ number: 1, text: 'No princípio...' }],
        });
      }
      if (u.includes('/studies')) {
        return Promise.resolve({
          id: 'study-genesis-1',
          version: 1,
          createdAt: new Date().toISOString(),
          reference: {
            normalized: 'GEN 1:1',
            bookCode: 'GEN',
            chapter: 1,
            fromVerse: 1,
            toVerse: 1,
          },
          passage: {
            verses: [{ number: 1, text: 'No princípio...' }],
            attribution: 'Bíblia Livre',
            licenseUrl: 'https://creativecommons.org',
          },
          sections: [],
          evidence: [],
          interpretations: [],
          limitations: [],
        });
      }
      return Promise.resolve({});
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <AccountAccessProvider>
              <AppContent />
            </AccountAccessProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    // No leitor inicial, não há estudo conectado
    await waitFor(() => {
      expect(screen.getByText(/Estudo Não Selecionado/i)).toBeInTheDocument();
    });

    // Mudar para aba de Estudo
    const studyTabBtn = screen.getByRole('button', { name: /Estudo Estruturado/i });
    fireEvent.click(studyTabBtn);

    // O usuário gera o estudo
    const generateBtn = await screen.findByRole('button', { name: /Gerar Estudo/i });
    fireEvent.click(generateBtn);

    // Quando o estudo é criado/carregado na aba de estudos, o assistente deve conectar
    await waitFor(() => {
      expect(screen.getByText(/Estudo Conectado/i)).toBeInTheDocument();
    });
  });
});
