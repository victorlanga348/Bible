import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de cache padrão
      gcTime: 1000 * 60 * 30, // 30 minutos de retenção em memória
      refetchOnWindowFocus: false, // Evita requisições repetidas ao focar na janela
      retry: (failureCount, error) => {
        // Não repete erros 400, 401, 404, 409, 422
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: false, // Mutações (criação de estudo, novo turno de IA, anotações CAS) nunca repetem automaticamente
    },
  },
});

export const queryKeys = {
  health: () => ['health'] as const,
  canon: {
    translations: () => ['canon', 'translations'] as const,
    books: (translationId: string) => ['canon', 'books', translationId] as const,
    passage: (translationId: string, bookCode: string, chapter: number, from?: number, to?: number) =>
      ['canon', 'passage', translationId, bookCode, chapter, { from, to }] as const,
    resolved: (translationId: string, reference: string) =>
      ['canon', 'resolved', translationId, reference] as const,
  },
  sources: {
    all: () => ['sources', 'all'] as const,
    excerpts: (sourceId: string, q?: string) => ['sources', 'excerpts', sourceId, { q }] as const,
  },
  studies: {
    detail: (studyId: string, version?: number) => ['studies', 'detail', studyId, { version }] as const,
  },
  workspace: {
    studies: (cursor?: string | null) => ['workspace', 'studies', { cursor }] as const,
    notes: (studyId: string, version?: number) => ['workspace', 'notes', studyId, { version }] as const,
    favorites: (cursor?: string | null) => ['workspace', 'favorites', { cursor }] as const,
  },
  crossReferences: {
    relations: (translationId: string, reference: string) =>
      ['cross-references', translationId, reference] as const,
  },
  assistant: {
    conversation: (conversationId: string) => ['assistant', 'conversation', conversationId] as const,
    analyses: (studyId: string) => ['assistant', 'analyses', studyId] as const,
  },
};
