import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createQueryClient } from '../shared/api/query-client';
import { ThemeProvider } from '../shared/hooks/use-theme';
import { ToastProvider } from '../shared/ui/toast';
import { AccountAccessProvider } from '../shared/ui/shell';
import { HistoryView } from '../features/workspace/history-view';
import {
  createdAt,
  noteFixture,
  reference,
  secondStudyId,
  studyFixture,
  studyId,
} from './workflow-fixtures';

let authenticated = true;

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

function mount(view: React.ReactNode = <HistoryView />) {
  const client = createQueryClient();
  client.setDefaultOptions({
    ...client.getDefaultOptions(),
    queries: { ...client.getDefaultOptions().queries, retry: false },
  });
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

beforeEach(() => {
  authenticated = true;
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
});

afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.unstubAllGlobals();
});

it('exibe texto exato quando favorito nao possui metadata reference e remove com DELETE correto sem abrir', async () => {
  const onOpenStudy = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
      const parsed = new URL(url);
      const path = parsed.pathname;

      if (path === '/api/workspace/studies') {
        return Response.json({ items: [], nextCursor: null });
      }

      if (path === '/api/workspace/favorites') {
        return Response.json({
          items: [
            {
              id: '30000000-0000-4000-8000-000000000009',
              studyId: secondStudyId,
              studyVersion: 2,
              createdAt,
              reference: undefined,
            },
          ],
          nextCursor: null,
        });
      }

      if (
        path === `/api/workspace/studies/${secondStudyId}/favorites/2` &&
        options?.method === 'DELETE'
      ) {
        return new Response(null, { status: 204 });
      }

      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'technical route not found' } },
        { status: 404 }
      );
    })
  );

  mount(<HistoryView onOpenStudy={onOpenStudy} />);

  fireEvent.click(screen.getByRole('button', { name: /Favoritos/i }));

  expect(await screen.findByText('Referência indisponível')).toBeInTheDocument();
  expect(screen.getByText('(v2)')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Abrir' })).toBeNull();

  const removeButton = screen.getByRole('button', { name: 'Remover' });
  fireEvent.click(removeButton);

  await waitFor(() => {
    expect(
      calls().some(
        (c) =>
          c.options?.method === 'DELETE' &&
          c.path === `/api/workspace/studies/${secondStudyId}/favorites/2`
      )
    ).toBe(true);
  });

  expect(onOpenStudy).not.toHaveBeenCalled();
});

it('apresenta estados vazios legitimos em workspace autenticado sem acoes indevidas nem alertas', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const path = new URL(url).pathname;
      if (path === '/api/workspace/studies' || path === '/api/workspace/favorites') {
        return Response.json({ items: [], nextCursor: null });
      }
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'technical route not found' } },
        { status: 404 }
      );
    })
  );

  mount();

  expect(
    await screen.findByText('Nenhum estudo persistido ainda no workspace.')
  ).toBeInTheDocument();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Excluir estudo' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Abrir' })).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: /Favoritos/i }));
  expect(await screen.findByText('Nenhum estudo marcado como favorito.')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Remover' })).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  expect(
    screen.getByText('Selecione um estudo acima para visualizar e editar suas notas contextuais.')
  ).toBeInTheDocument();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Adicionar Nota' })).toBeNull();
  expect(screen.queryByTitle('Editar Nota (CAS)')).toBeNull();
  expect(screen.queryByTitle('Eliminar Nota')).toBeNull();
});

it('cria nota para o estudo selecionado na versao atual, apara espacos e limpa input sem alerta de conflito', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
      const parsed = new URL(url);
      const path = parsed.pathname;

      if (path === '/api/workspace/studies') {
        return Response.json({
          items: [studyFixture({ id: studyId, version: 3 })],
          nextCursor: null,
        });
      }

      if (path === '/api/workspace/favorites') {
        return Response.json({ items: [], nextCursor: null });
      }

      if (path === `/api/workspace/studies/${studyId}/notes`) {
        if (options?.method === 'POST') {
          const body = JSON.parse(String(options.body));
          return Response.json(
            noteFixture({
              id: '20000000-0000-4000-8000-000000000099',
              studyId,
              studyVersion: body.studyVersion,
              content: body.content,
            }),
            { status: 201 }
          );
        }
        return Response.json({ items: [], nextCursor: null });
      }

      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'technical route not found' } },
        { status: 404 }
      );
    })
  );

  mount();

  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });

  const input = await screen.findByPlaceholderText(/Escreva uma nova anotação/);
  fireEvent.change(input, { target: { value: '   Nota técnica com espaços limpos.   ' } });

  fireEvent.click(screen.getByRole('button', { name: 'Adicionar Nota' }));

  await waitFor(() => {
    expect(input).toHaveValue('');
  });
  await screen.findByText('Anotação adicionada ao estudo.');

  const postCall = calls().find(
    (c) => c.options?.method === 'POST' && c.path === `/api/workspace/studies/${studyId}/notes`
  );
  expect(postCall).toBeDefined();
  expect(JSON.parse(String(postCall?.options?.body))).toEqual({
    studyVersion: 3,
    content: 'Nota técnica com espaços limpos.',
  });

  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.queryByText(/Carregar revisão atual/)).toBeNull();
});

it('ao alternar estudo selecionado descarta rascunho e reinicia cursor preservando id e versao no POST', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
      const parsed = new URL(url);
      const path = parsed.pathname;
      const cursor = parsed.searchParams.get('cursor');

      if (path === '/api/workspace/studies') {
        return Response.json({
          items: [
            studyFixture({ id: studyId, version: 3 }),
            studyFixture({
              id: secondStudyId,
              version: 1,
              reference: { ...reference, normalized: 'GEN 1:2', fromVerse: 2, toVerse: 2 },
            }),
          ],
          nextCursor: null,
        });
      }

      if (path === '/api/workspace/favorites') {
        return Response.json({ items: [], nextCursor: null });
      }

      if (path === `/api/workspace/studies/${studyId}/notes`) {
        if (cursor === 'cursor-notes-2') {
          return Response.json({
            items: [
              noteFixture({
                id: '20000000-0000-4000-8000-000000000002',
                studyId,
                revision: 1,
                content: 'Nota técnica página 2',
              }),
            ],
            nextCursor: null,
          });
        }
        return Response.json({
          items: [
            noteFixture({
              id: '20000000-0000-4000-8000-000000000001',
              studyId,
              revision: 1,
              content: 'Nota técnica página 1',
            }),
          ],
          nextCursor: 'cursor-notes-2',
        });
      }

      if (path === `/api/workspace/studies/${secondStudyId}/notes`) {
        if (options?.method === 'POST') {
          const body = JSON.parse(String(options.body));
          return Response.json(
            noteFixture({
              id: '20000000-0000-4000-8000-000000000003',
              studyId: secondStudyId,
              studyVersion: body.studyVersion,
              content: body.content,
            }),
            { status: 201 }
          );
        }
        return Response.json({ items: [], nextCursor: null });
      }

      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'technical route not found' } },
        { status: 404 }
      );
    })
  );

  mount();

  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });

  expect(await screen.findByText('Nota técnica página 1')).toBeInTheDocument();

  const nextPageBtn = await screen.findByRole('button', { name: 'Página seguinte' });
  fireEvent.click(nextPageBtn);
  expect(await screen.findByText('Nota técnica página 2')).toBeInTheDocument();

  const draftInput = screen.getByPlaceholderText(/Escreva uma nova anotação/);
  fireEvent.change(draftInput, {
    target: { value: 'Rascunho a ser descartado ao mudar de estudo' },
  });
  expect(draftInput).toHaveValue('Rascunho a ser descartado ao mudar de estudo');

  fireEvent.change(screen.getByRole('combobox'), { target: { value: secondStudyId } });

  expect(screen.getByPlaceholderText(/Escreva uma nova anotação/)).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
  expect(
    calls().some(
      (c) =>
        c.path === `/api/workspace/studies/${secondStudyId}/notes` &&
        !c.searchParams.get('cursor')
    )
  ).toBe(true);
  expect(
    await screen.findByText('Nenhuma anotação associada a este estudo ainda.')
  ).toBeInTheDocument();

  const freshInput = screen.getByPlaceholderText(/Escreva uma nova anotação/);
  fireEvent.change(freshInput, {
    target: { value: 'Nova anotação vinculada ao segundo estudo.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar Nota' }));

  await waitFor(() => {
    const postCall = calls().find(
      (c) =>
        c.options?.method === 'POST' &&
        c.path === `/api/workspace/studies/${secondStudyId}/notes`
    );
    expect(postCall).toBeDefined();
    expect(JSON.parse(String(postCall?.options?.body))).toEqual({
      studyVersion: 1,
      content: 'Nova anotação vinculada ao segundo estudo.',
    });
  });
});

it('abrir edicao normal nao exibe conflito, espacos nao disparam escrita e salvar revisao valida limpa conflito', async () => {
  let patchShouldConflict = true;

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
      const parsed = new URL(url);
      const path = parsed.pathname;

      if (path === '/api/workspace/studies') {
        return Response.json({
          items: [studyFixture({ id: studyId, version: 3 })],
          nextCursor: null,
        });
      }

      if (path === '/api/workspace/favorites') {
        return Response.json({ items: [], nextCursor: null });
      }

      if (path === `/api/workspace/studies/${studyId}/notes`) {
        return Response.json({
          items: [
            noteFixture({
              id: '20000000-0000-4000-8000-000000000001',
              studyId,
              revision: 1,
              content: 'Nota técnica inicial para edição.',
            }),
          ],
          nextCursor: null,
        });
      }

      if (
        path === '/api/workspace/notes/20000000-0000-4000-8000-000000000001' &&
        options?.method === 'PATCH'
      ) {
        if (patchShouldConflict) {
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
        const body = JSON.parse(String(options.body));
        return Response.json(
          noteFixture({
            id: '20000000-0000-4000-8000-000000000001',
            studyId,
            revision: 2,
            content: body.content,
          }),
          { status: 200 }
        );
      }

      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'technical route not found' } },
        { status: 404 }
      );
    })
  );

  mount();

  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });

  expect(await screen.findByText('Nota técnica inicial para edição.')).toBeInTheDocument();

  fireEvent.click(screen.getByTitle('Editar Nota (CAS)'));
  await screen.findByText(/Editar Anotação \(Revisão CAS r1\)/);

  expect(screen.queryByRole('button', { name: 'Carregar revisão atual' })).toBeNull();
  expect(screen.queryByText(/A nota foi alterada noutro local/)).toBeNull();
  expect(screen.queryByRole('alert')).toBeNull();

  const editInput = screen.getByLabelText('Rascunho da anotação');
  fireEvent.change(editInput, { target: { value: '    ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));
  expect(calls().some((c) => c.options?.method === 'PATCH')).toBe(false);

  fireEvent.change(editInput, { target: { value: 'Alteração com colisão CAS esperada' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));

  expect(
    await screen.findByText(
      'A nota foi alterada noutro local. O seu rascunho foi preservado. Carregue a revisão atual e compare antes de guardar.'
    )
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Carregar revisão atual' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  fireEvent.click(screen.getByTitle('Editar Nota (CAS)'));
  await screen.findByText(/Editar Anotação \(Revisão CAS r1\)/);

  expect(screen.queryByRole('button', { name: 'Carregar revisão atual' })).toBeNull();
  expect(screen.queryByRole('alert')).toBeNull();

  patchShouldConflict = false;
  fireEvent.change(screen.getByLabelText('Rascunho da anotação'), {
    target: { value: 'Revisão técnica válida e persistida.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  const patchCalls = calls().filter((c) => c.options?.method === 'PATCH');
  expect(patchCalls).toHaveLength(2);
  expect(JSON.parse(String(patchCalls[1].options?.body))).toEqual({
    expectedRevision: 1,
    content: 'Revisão técnica válida e persistida.',
  });
});

it('eliminar estudo selecionado limpa selecao de notas e cursores enquanto eliminar outro estudo preserva selecao ativa', async () => {
  let currentStudies = [
    studyFixture({ id: studyId, version: 3 }),
    studyFixture({
      id: secondStudyId,
      version: 1,
      reference: { ...reference, normalized: 'GEN 1:2', fromVerse: 2, toVerse: 2 },
    }),
  ];

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
      const parsed = new URL(url);
      const path = parsed.pathname;

      if (path === '/api/workspace/studies') {
        return Response.json({ items: currentStudies, nextCursor: null });
      }

      if (path === '/api/workspace/favorites') {
        return Response.json({ items: [], nextCursor: null });
      }

      if (path === `/api/workspace/studies/${secondStudyId}` && options?.method === 'DELETE') {
        currentStudies = currentStudies.filter((s) => s.id !== secondStudyId);
        return new Response(null, { status: 204 });
      }

      if (path === `/api/workspace/studies/${studyId}` && options?.method === 'DELETE') {
        currentStudies = currentStudies.filter((s) => s.id !== studyId);
        return new Response(null, { status: 204 });
      }

      if (path === `/api/workspace/studies/${studyId}/notes`) {
        return Response.json({
          items: [
            noteFixture({
              id: '20000000-0000-4000-8000-000000000001',
              studyId,
              revision: 1,
              content: 'Nota técnica vinculada ao estudo 1.',
            }),
          ],
          nextCursor: null,
        });
      }

      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'technical route not found' } },
        { status: 404 }
      );
    })
  );

  mount();

  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: studyId } });
  expect(await screen.findByText('Nota técnica vinculada ao estudo 1.')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Estudos Recentes/i }));
  const study2Heading = await screen.findByText('GEN 1:2');
  const study2Article = study2Heading.closest('article')!;
  const deleteBtn2 = within(study2Article).getByRole('button', { name: 'Excluir estudo' });
  fireEvent.click(deleteBtn2);

  const confirmDeleteBtn = await screen.findByRole('button', {
    name: 'Excluir definitivamente',
  });
  fireEvent.click(confirmDeleteBtn);

  await waitFor(() => {
    expect(
      calls().some(
        (c) =>
          c.options?.method === 'DELETE' &&
          c.path === `/api/workspace/studies/${secondStudyId}`
      )
    ).toBe(true);
  });

  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  const selectBefore = screen.getByRole('combobox') as HTMLSelectElement;
  expect(selectBefore.value).toBe(studyId);
  expect(screen.getByText('Nota técnica vinculada ao estudo 1.')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Estudos Recentes/i }));
  const study1Heading = await screen.findByText('GEN 1:1');
  const study1Article = study1Heading.closest('article')!;
  const deleteBtn1 = within(study1Article).getByRole('button', { name: 'Excluir estudo' });
  fireEvent.click(deleteBtn1);

  const confirmDeleteBtn1 = await screen.findByRole('button', {
    name: 'Excluir definitivamente',
  });
  fireEvent.click(confirmDeleteBtn1);

  await waitFor(() => {
    expect(
      calls().some(
        (c) =>
          c.options?.method === 'DELETE' &&
          c.path === `/api/workspace/studies/${studyId}`
      )
    ).toBe(true);
  });

  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  const selectAfter = screen.getByRole('combobox') as HTMLSelectElement;
  expect(selectAfter.value).toBe('');
  expect(
    screen.getByText('Selecione um estudo acima para visualizar e editar suas notas contextuais.')
  ).toBeInTheDocument();
  expect(screen.queryByPlaceholderText(/Escreva uma nova anotação/)).toBeNull();
});
