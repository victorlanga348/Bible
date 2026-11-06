import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContextPanel } from '../features/assistant/context-panel';
import { ToastProvider } from '../shared/ui/toast';
import * as sessionHook from '../shared/hooks/use-session';

vi.mock('../shared/api/http-client', () => ({
  request: vi.fn().mockImplementation((url: string) => {
    if (url.includes('/cross-references')) {
      return Promise.resolve({
        items: [
          {
            id: 'rel-1',
            from: { normalized: 'ROM 8:28' },
            to: { normalized: 'EPH 1:11' },
            type: 'thematic-parallel',
            assessment: 'user-interpretation',
            rationale: 'Paralelo temático sobre a soberania e propósito divino.',
            evidence: [],
          },
        ],
        total: 1,
      });
    }
    return Promise.resolve({});
  }),
}));

describe('ContextPanel — Conexão Dinâmica de Referências Cruzadas (Passo 1)', () => {
  it('renderiza CrossRefPanel dinamicamente com a referência ativa na aba links', async () => {
    vi.spyOn(sessionHook, 'useSession').mockReturnValue({
      isAuthenticated: true,
      token: 'valid-test-token',
      ownerId: 'operator-test',
      status: 'authenticated',
      setSession: vi.fn(),
      clearSession: vi.fn(),
      version: 1,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const onNavigate = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ContextPanel
            activeStudyId="study-123"
            activeStudyVersion={1}
            activeReference="ROM 8:28"
            onNavigateToPassage={onNavigate}
          />
        </ToastProvider>
      </QueryClientProvider>
    );

    // Clica na aba de referências cruzadas ('links')
    const linksTab = screen.getByRole('tab', { name: /referências/i });
    fireEvent.click(linksTab);

    // Deve renderizar o painel dinâmico buscando referências para a passagem ativa ROM 8:28
    expect(await screen.findByText(/Referências para ROM 8:28/i)).toBeInTheDocument();

    // Clica na passagem relacionada para navegar
    const passageBtn = await screen.findByRole('button', { name: /EPH 1:11/i });
    fireEvent.click(passageBtn);
    expect(onNavigate).toHaveBeenCalledWith('EPH 1:11');
  });
});
