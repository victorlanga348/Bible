import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContextPanel } from '../features/assistant/context-panel';
import { ToastProvider } from '../shared/ui/toast';
import * as sessionHook from '../shared/hooks/use-session';
import * as httpClient from '../shared/api/http-client';

vi.mock('../shared/api/http-client', async () => {
  const actual = await vi.importActual<typeof httpClient>('../shared/api/http-client');
  return {
    ...actual,
    request: vi.fn(),
  };
});

describe('ContextPanel — Criação de Anotações Inline (Opção A)', () => {
  it('renderiza o formulário inline de anotações e cria uma nota vinculada ao estudo', async () => {
    vi.spyOn(sessionHook, 'useSession').mockReturnValue({
      isAuthenticated: true,
      token: 'valid-test-token',
      ownerId: 'operator-test',
      status: 'authenticated',
      setSession: vi.fn(),
      clearSession: vi.fn(),
      version: 1,
    });

    const mockNotes = [
      {
        id: 'note-1',
        studyId: 'study-123',
        studyVersion: 1,
        revision: 1,
        content: 'Primeira anotação sobre a soberania divina.',
        createdAt: new Date().toISOString(),
      },
    ];

    vi.mocked(httpClient.request).mockImplementation((url, options) => {
      const u = String(url);
      if (u.includes('/notes') && options?.method === 'POST') {
        const body = options?.body as { studyVersion: number; content: string };
        return Promise.resolve({
          id: 'note-2',
          studyId: 'study-123',
          studyVersion: body.studyVersion,
          revision: 1,
          content: body.content,
          createdAt: new Date().toISOString(),
        });
      }
      if (u.includes('/notes')) {
        return Promise.resolve({ items: mockNotes, nextCursor: null });
      }
      return Promise.resolve({});
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ContextPanel activeStudyId="study-123" activeStudyVersion={1} />
        </ToastProvider>
      </QueryClientProvider>
    );

    // Clica na aba 'Anotações'
    const notesTab = screen.getByRole('tab', { name: /anotações/i });
    fireEvent.click(notesTab);

    // Deve renderizar a anotação existente
    expect(await screen.findByText('Primeira anotação sobre a soberania divina.')).toBeInTheDocument();

    // Deve possuir um campo de texto para nova anotação
    const noteInput = screen.getByPlaceholderText(/escreva uma anotação sobre este estudo/i);
    expect(noteInput).toBeInTheDocument();

    // Preenche o campo e envia
    fireEvent.change(noteInput, { target: { value: 'Nova reflexão hermenêutica.' } });
    const submitBtn = screen.getByRole('button', { name: /salvar anotação/i });
    fireEvent.click(submitBtn);

    // Deve chamar a API de criação de notas
    await waitFor(() => {
      expect(httpClient.request).toHaveBeenCalledWith(
        '/workspace/studies/study-123/notes',
        expect.objectContaining({
          method: 'POST',
          body: {
            studyVersion: 1,
            content: 'Nova reflexão hermenêutica.',
          },
        })
      );
    });
  });
});
