import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContextPanel } from '../features/assistant/context-panel';
import { ToastProvider } from '../shared/ui/toast';
import * as sessionHook from '../shared/hooks/use-session';

vi.mock('../shared/api/http-client', () => ({
  request: vi.fn().mockResolvedValue({}),
}));

describe('ContextPanel — Acessibilidade WCAG 2.2 AA (Passo 2)', () => {
  it('estrutura as abas com padrão ARIA tablist/tab e live region para leitores de tela', () => {
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

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ContextPanel activeStudyId="study-1" activeStudyVersion={1} />
        </ToastProvider>
      </QueryClientProvider>
    );

    // 1. Tablist semântica
    const tablist = screen.getByRole('tablist', { name: /painel contextual/i });
    expect(tablist).toBeInTheDocument();

    // 2. Tabs com aria-selected correto
    const assistantTab = screen.getByRole('tab', { name: /assistente ia/i });
    const notesTab = screen.getByRole('tab', { name: /anotações/i });
    const linksTab = screen.getByRole('tab', { name: /referências/i });

    expect(assistantTab).toHaveAttribute('aria-selected', 'true');
    expect(notesTab).toHaveAttribute('aria-selected', 'false');
    expect(linksTab).toHaveAttribute('aria-selected', 'false');

    // Ao alternar para Anotações, o aria-selected deve refletir a mudança
    fireEvent.click(notesTab);
    expect(assistantTab).toHaveAttribute('aria-selected', 'false');
    expect(notesTab).toHaveAttribute('aria-selected', 'true');

    // 3. Tabpanel correspondente associado
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'panel-notes');

    // 4. Live region (role="status" com aria-live="polite")
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });
});
