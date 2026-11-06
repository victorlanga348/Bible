import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createQueryClient } from '../shared/api/query-client';
import { ThemeProvider } from '../shared/hooks/use-theme';
import { ToastProvider } from '../shared/ui/toast';
import { AccountAccessProvider } from '../shared/ui/shell';
import { HistoryView } from '../features/workspace/history-view';
import { createdAt, noteFixture, reference, secondStudyId, studyFixture, studyId } from './workflow-fixtures';
let authenticated = true;

// Doubles técnicos de transporte e sessão isolam o percurso da interface HistoryView.
vi.mock('../shared/hooks/use-session', () => ({
  useSession: () => ({
    isAuthenticated: authenticated,
    token: authenticated ? 'technical-token' : null,
    ownerId: 'technical-owner',
    status: 'authenticated',
    version: 1,
    clearSession: vi.fn(),
    setSession: vi.fn(),
  }),
}));

const clients: ReturnType<typeof createQueryClient>[] = [];
const calls = () =>
  vi.mocked(fetch).mock.calls.map(([url, options]) => ({
    url: String(url),
    path: new URL(String(url)).pathname,
    searchParams: new URL(String(url)).searchParams,
    options,
  }));

beforeEach(() => {
  authenticated = true;
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
      const parsed = new URL(url);
      const path = parsed.pathname;
      const cursor = parsed.searchParams.get('cursor');

      if (path === '/api/workspace/studies') {
        if (cursor === 'cursor-studies-2') {
          return Response.json({
            items: [studyFixture({ id: secondStudyId, version: 1 })],
            nextCursor: null,
          });
        }
        return Response.json({
          items: [studyFixture({ id: studyId, version: 3 })],
          nextCursor: 'cursor-studies-2',
        });
      }

      if (path === `/api/workspace/studies/${studyId}` && options?.method === 'DELETE') {
        return new Response(null, { status: 204 });
      }

      if (path === '/api/workspace/favorites') {
        if (cursor === 'cursor-fav-2') {
          return Response.json({
            items: [
              {
                id: '30000000-0000-4000-8000-000000000002',
                studyId: secondStudyId,
                studyVersion: 1,
                createdAt,
                reference: { ...reference, normalized: 'GEN 1:2', fromVerse: 2, toVerse: 2 },
              },
            ],
            nextCursor: null,
          });
        }
        return Response.json({
          items: [
            {
              id: '30000000-0000-4000-8000-000000000001',
              studyId,
              studyVersion: 3,
              createdAt,
              reference,
            },
          ],
          nextCursor: 'cursor-fav-2',
        });
      }

      if (path === `/api/workspace/studies/${studyId}/notes`) {
        if (cursor === 'cursor-notes-2') {
          return Response.json({
            items: [
              noteFixture({
                id: '20000000-0000-4000-8000-000000000002',
                revision: 1,
                content: 'Nota técnica página 2; fixture controlada.',
              }),
            ],
            nextCursor: null,
          });
        }
        return Response.json({
          items: [
            noteFixture({
              id: '20000000-0000-4000-8000-000000000001',
              revision: 1,
              content: 'Nota técnica página 1; fixture controlada.',
            }),
          ],
          nextCursor: 'cursor-notes-2',
        });
      }

      if (path.startsWith('/api/workspace/notes/') && options?.method === 'PATCH') {
        return Response.json(
          {
            error: {
              code: 'WORKSPACE_CONFLICT',
              message: 'Não foi possível atualizar esta revisão da nota.',
            },
          },
          { status: 409 }
        );
      }

      if (path === `/api/studies/${studyId}`) {
        return Response.json(studyFixture({ id: studyId, version: 3 }));
      }

      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'technical route not found' } },
        { status: 404 }
      );
    })
  );
});

afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.unstubAllGlobals();
});

function mount(view: React.ReactNode = <HistoryView />) {
  const client = createQueryClient();
  client.setDefaultOptions({ ...client.getDefaultOptions(), queries: { ...client.getDefaultOptions().queries, retry: false } });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <ToastProvider>
          <AccountAccessProvider>{view}</AccountAccessProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

it('pagina estudos por nextCursor com avançar e voltar', async () => {
  mount(<HistoryView />);

  expect(await screen.findByText('GEN 1:1')).toBeInTheDocument();
  expect(screen.getByText('v3')).toBeInTheDocument();

  const nextButton = await screen.findByRole('button', { name: 'Página seguinte' });
  fireEvent.click(nextButton);

  await waitFor(() => expect(screen.getByText('v1')).toBeInTheDocument());
  expect(
    calls().some(
      (c) => c.path === '/api/workspace/studies' && c.searchParams.get('cursor') === 'cursor-studies-2'
    )
  ).toBe(true);

  const prevButton = screen.getByRole('button', { name: 'Página anterior' });
  fireEvent.click(prevButton);

  await waitFor(() => expect(screen.getByText('v3')).toBeInTheDocument());
});

it('exibe referência recebida no favorito e abre id e versão correspondentes', async () => {
  const onOpenStudy = vi.fn();
  mount(<HistoryView onOpenStudy={onOpenStudy} />);

  fireEvent.click(screen.getByRole('button', { name: /Favoritos/i }));

  expect(await screen.findByText('GEN 1:1')).toBeInTheDocument();
  expect(screen.getByText(/v3/i)).toBeInTheDocument();

  const openButton = await screen.findByRole('button', { name: 'Abrir' });
  fireEvent.click(openButton);

  expect(onOpenStudy).toHaveBeenCalledWith(
    expect.objectContaining({ id: studyId, version: 3 })
  );
});

it('elimina estudo somente após diálogo de confirmação e chamada DELETE ao backend', async () => {
  mount(<HistoryView />);
  expect(await screen.findByText('GEN 1:1')).toBeInTheDocument();

  const deleteTrigger = await screen.findByRole('button', { name: 'Excluir estudo' });
  fireEvent.click(deleteTrigger);

  expect(
    calls().filter(
      (c) => c.options?.method === 'DELETE' && c.path === `/api/workspace/studies/${studyId}`
    )
  ).toHaveLength(0);

  const confirmButton = await screen.findByRole('button', { name: 'Excluir definitivamente' });
  fireEvent.click(confirmButton);
  await screen.findByText('Estudo e dados associados eliminados.');

  await waitFor(() => {
    expect(
      calls().some(
        (c) => c.options?.method === 'DELETE' && c.path === `/api/workspace/studies/${studyId}`
      )
    ).toBe(true);
  });
});

it('preserva rascunho de nota em conflito 409 e oferece carregar revisão atual antes de novo CAS', async () => {
  mount(<HistoryView />);

  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });

  const editTrigger = await screen.findByRole('button', { name: 'Editar Nota (CAS)' });
  fireEvent.click(editTrigger);

  const input = await screen.findByDisplayValue('Nota técnica página 1; fixture controlada.');
  fireEvent.change(input, { target: { value: 'Rascunho técnico com alterações locais.' } });

  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));

  await waitFor(() => {
    expect(screen.getByDisplayValue('Rascunho técnico com alterações locais.')).toBeInTheDocument();
  });

  const reloadButton = await screen.findByRole('button', { name: 'Carregar revisão atual' });
  expect(reloadButton).toBeInTheDocument();
});

it('pagina anotações por nextCursor com avançar e voltar', async () => {
  mount(<HistoryView />);

  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });

  expect(await screen.findByText('Nota técnica página 1; fixture controlada.')).toBeInTheDocument();

  const nextButton = await screen.findByRole('button', { name: 'Página seguinte' });
  fireEvent.click(nextButton);

  await waitFor(() => {
    expect(screen.getByText('Nota técnica página 2; fixture controlada.')).toBeInTheDocument();
  });
  expect(
    calls().some(
      (c) =>
        c.path === `/api/workspace/studies/${studyId}/notes` &&
        c.searchParams.get('cursor') === 'cursor-notes-2'
    )
  ).toBe(true);

  const prevButton = screen.getByRole('button', { name: 'Página anterior' });
  fireEvent.click(prevButton);

  await waitFor(() => {
    expect(screen.getByText('Nota técnica página 1; fixture controlada.')).toBeInTheDocument();
  });
});

it('pagina favoritos por nextCursor com avançar e voltar', async () => {
  mount(<HistoryView />);

  fireEvent.click(screen.getByRole('button', { name: /Favoritos/i }));

  expect(await screen.findByText('GEN 1:1')).toBeInTheDocument();

  const nextButton = await screen.findByRole('button', { name: 'Página seguinte' });
  fireEvent.click(nextButton);

  await waitFor(() => {
    expect(screen.getByText('GEN 1:2')).toBeInTheDocument();
  });
  expect(
    calls().some(
      (c) =>
        c.path === '/api/workspace/favorites' && c.searchParams.get('cursor') === 'cursor-fav-2'
    )
  ).toBe(true);

  const prevButton = screen.getByRole('button', { name: 'Página anterior' });
  fireEvent.click(prevButton);

  await waitFor(() => {
    expect(screen.getByText('GEN 1:1')).toBeInTheDocument();
  });
});

it('edits a note using its actual revision and deletes only after confirmation', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  let note = noteFixture(), deleted = false;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    const path = new URL(String(url)).pathname;
    if (path === `/api/workspace/studies/${studyId}/notes`) return Response.json({ items: deleted ? [] : [note], nextCursor: null });
    if (path === `/api/workspace/notes/${note.id}`) {
      if (options?.method === 'DELETE') { deleted = true; return new Response(null, { status: 204 }); }
      const body = JSON.parse(String(options?.body)); note = { ...note, content: body.content, revision: note.revision + 1 }; return Response.json(note);
    }
    return original(url, options);
  });
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' }); fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });
  fireEvent.click(await screen.findByTitle('Editar Nota (CAS)'));
  fireEvent.change(screen.getByLabelText('Rascunho da anotação'), { target: { value: '  Nota técnica revista.  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' })); await screen.findByText('Nota técnica revista.');
  await screen.findByText('Revisão da anotação salva com garantia CAS.');
  const patch = calls().find(call => call.options?.method === 'PATCH');
  expect(JSON.parse(String(patch?.options?.body))).toEqual({ expectedRevision: 1, content: 'Nota técnica revista.' });
  fireEvent.click(screen.getByTitle('Eliminar Nota')); expect(deleted).toBe(false);
  fireEvent.click(await screen.findByRole('button', { name: 'Excluir Definitivamente' }));
  await screen.findByText('Nenhuma anotação associada a este estudo ainda.'); expect(deleted).toBe(true);
  await screen.findByText('Anotação eliminada com sucesso.');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('toggles a version-specific favorite using idempotent DELETE and PUT', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let favorite = true;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    const path = new URL(String(url)).pathname;
    if (path === '/api/workspace/favorites') return Response.json({ items: favorite ? [{ studyId, studyVersion: 3 }] : [], nextCursor: null });
    if (path.endsWith('/favorites/3')) { favorite = options?.method === 'PUT'; return favorite ? Response.json({ studyId, studyVersion: 3 }) : new Response(null, { status: 204 }); }
    return original(url, options);
  });
  mount(); fireEvent.click(await screen.findByTitle('Remover favorito'));
  await screen.findByText('Removido dos favoritos.');
  fireEvent.click(await screen.findByTitle('Marcar favorito')); await screen.findByTitle('Remover favorito');
  await screen.findByText('Adicionado aos favoritos.');
  expect(calls().filter(call => call.path.endsWith('/favorites/3')).map(call => call.options?.method)).toEqual(['DELETE', 'PUT']);
});

it('keeps a draft and deletion confirmation after transport failures', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => options?.method === 'POST' || options?.method === 'DELETE'
    ? Response.json({ error: { code: 'UNAVAILABLE', message: 'Falha técnica controlada.' } }, { status: 503 }) : original(url, options));
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' }); fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });
  const draft = await screen.findByPlaceholderText(/Escreva uma nova anotação/); fireEvent.change(draft, { target: { value: 'Rascunho técnico persistente.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar Nota' })); await screen.findByText('Erro ao criar anotação'); expect(draft).toHaveValue('Rascunho técnico persistente.');
  fireEvent.click(screen.getByTitle('Eliminar Nota')); fireEvent.click(await screen.findByRole('button', { name: 'Excluir Definitivamente' }));
  await screen.findByText('Erro ao eliminar anotação'); expect(screen.getByRole('dialog')).toBeInTheDocument();
});

it('allows an explicit retry when study deletion fails and avoids reporting a successful deletion', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => options?.method === 'DELETE'
    ? Response.json({ error: { code: 'UNAVAILABLE', message: 'Falha técnica controlada.' } }, { status: 503 }) : original(url, options));
  const removed = vi.fn(); mount(<HistoryView onStudyDeleted={removed} />); await screen.findByText('GEN 1:1');
  fireEvent.click(screen.getByRole('button', { name: 'Excluir estudo' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Excluir definitivamente' }));
  await screen.findByText('Não foi possível eliminar o estudo. Pode voltar a tentar.'); expect(removed).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

it('shows the access requirement without fetching private data for an anonymous session', async () => {
  authenticated = false; mount();
  expect(screen.getByText('Workspace Protegido')).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

it('reloads the actual concurrent note revision before an explicit CAS retry, keeping the draft', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let current = noteFixture(), conflicted = false;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    const path = new URL(String(url)).pathname;
    if (path.endsWith(`/${studyId}/notes`)) return Response.json({ items: [current], nextCursor: null });
    if (options?.method === 'PATCH') {
      if (!conflicted) { conflicted = true; current = { ...current, revision: 2, content: 'Revisão técnica concorrente.' }; return Response.json({ error: { code: 'WORKSPACE_CONFLICT', message: 'Revisão alterada.' } }, { status: 409 }); }
      const body = JSON.parse(String(options.body)); current = { ...current, revision: 3, content: body.content }; return Response.json(current);
    }
    return original(url, options);
  });
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' }); fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });
  fireEvent.click(await screen.findByTitle('Editar Nota (CAS)')); fireEvent.change(screen.getByLabelText('Rascunho da anotação'), { target: { value: 'Rascunho técnico a conservar.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));
  await screen.findByRole('button', { name: 'Carregar revisão atual' });
  expect(screen.getByRole('button', { name: 'Salvar Revisão' })).toBeDisabled();
  expect(screen.queryByText(/Revisão atual r/)).not.toBeInTheDocument();
  fireEvent.click(await screen.findByRole('button', { name: 'Carregar revisão atual' }));
  await screen.findByText('Revisão atual r2: Revisão técnica concorrente.');
  expect(screen.getByLabelText('Rascunho da anotação')).toHaveValue('Rascunho técnico a conservar.');
  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(calls().filter(call => call.options?.method === 'PATCH').map(call => JSON.parse(String(call.options?.body)).expectedRevision)).toEqual([1, 2]);
});
it('does not enable a CAS retry if the conflicted note disappeared from the current page', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let disappeared = false;
  vi.mocked(fetch).mockImplementation(async (url, options) => disappeared && String(url).includes(`/${studyId}/notes`)
    ? Response.json({ items: [], nextCursor: null }) : original(url, options));
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' }); fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });
  fireEvent.click(await screen.findByTitle('Editar Nota (CAS)')); fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));
  const reload = await screen.findByRole('button', { name: 'Carregar revisão atual' }); disappeared = true; fireEvent.click(reload);
  await screen.findByText('A anotação não está nesta página ou foi eliminada. Consulte as anotações antes de voltar a editar.');
  expect(screen.getByRole('button', { name: 'Salvar Revisão' })).toBeDisabled();
});

it('cancels and dismisses destructive dialogs without sending writes', async () => {
  mount(); await screen.findByText('GEN 1:1');
  fireEvent.click(screen.getByRole('button', { name: 'Excluir estudo' })); fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Excluir estudo' })); fireEvent.click(await screen.findByRole('button', { name: 'Fechar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' }); fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });
  fireEvent.click(await screen.findByTitle('Editar Nota (CAS)')); fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
  fireEvent.click(screen.getByTitle('Editar Nota (CAS)')); fireEvent.click(await screen.findByRole('button', { name: 'Fechar' }));
  fireEvent.click(screen.getByTitle('Eliminar Nota')); fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
  fireEvent.click(screen.getByTitle('Eliminar Nota')); fireEvent.click(await screen.findByRole('button', { name: 'Fechar' }));
  expect(calls().some(call => ['DELETE', 'PATCH', 'POST'].includes(call.options?.method ?? 'GET'))).toBe(false);
});

it('offers explicit retries for failed note and favorite lists', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let failedNotes = true, failedFavorites = false;
  vi.mocked(fetch).mockImplementation(async (url, options) => (String(url).includes('/notes') && failedNotes) || (String(url).includes('/workspace/favorites') && failedFavorites)
    ? Response.json({ error: { code: 'UNAVAILABLE', message: 'Falha de consulta técnica.' } }, { status: 503 }) : original(url, options));
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' }); fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });
  const reloadNotes = await screen.findByRole('button', { name: 'Tentar novamente' }); failedNotes = false; fireEvent.click(reloadNotes);
  await screen.findByText('Nota técnica página 1; fixture controlada.');
  // A fresh query client is used to observe the independently failing favorites read.
  cleanup(); clients.forEach(client => client.clear()); failedFavorites = true; mount();
  fireEvent.click(screen.getByRole('button', { name: /Favoritos/i }));
  const reloadFavorites = await screen.findByRole('button', { name: 'Tentar novamente' }); failedFavorites = false; fireEvent.click(reloadFavorites);
  await screen.findByRole('button', { name: 'Remover' });
});

it('removes the selected version from the favorites view and returns to the studies tab', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let removed = false;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    if (options?.method === 'DELETE' && String(url).includes('/favorites/3')) { removed = true; return new Response(null, { status: 204 }); }
    if (removed && new URL(String(url)).pathname === '/api/workspace/favorites') return Response.json({ items: [], nextCursor: null });
    return original(url, options);
  });
  mount(); fireEvent.click(screen.getByRole('button', { name: /Favoritos/i }));
  fireEvent.click(await screen.findByRole('button', { name: 'Remover' }));
  await screen.findByText('Removido dos favoritos.');
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Remover' })).not.toBeInTheDocument()); expect(removed).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: /Estudos Recentes/i })); await screen.findByRole('button', { name: 'Excluir estudo' });
});
it('keeps ordinary note write failures separate from CAS conflicts and permits an explicit retry', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    if (options?.method === 'PATCH') return Response.json({ error: { code: 'UNAVAILABLE', message: 'Servidor de anotações indisponível.' } }, { status: 503 });
    if (new URL(String(url)).pathname.endsWith('/notes')) return Response.json({ items: [noteFixture()], nextCursor: null });
    return original(url, options);
  });
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });
  fireEvent.click(await screen.findByTitle('Editar Nota (CAS)'));
  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));
  await screen.findByText('Servidor de anotações indisponível.');
  expect(screen.queryByRole('button', { name: 'Carregar revisão atual' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Salvar Revisão' })).toBeEnabled();
});
