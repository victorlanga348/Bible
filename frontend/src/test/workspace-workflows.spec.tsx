import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HistoryView } from '../features/workspace/history-view';
import { createQueryClient } from '../shared/api/query-client';
import { ToastProvider } from '../shared/ui/toast';
import { createdAt, noteFixture, reference, secondStudyId, studyFixture, studyId } from './workflow-fixtures';

// Stateful HTTP protocol double, never a substitute for the native PG proof.
let authenticated = true;
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: authenticated, token: authenticated ? 'technical-token' : null }) }));
const clients: ReturnType<typeof createQueryClient>[] = [];
let notes = [noteFixture()];
beforeEach(() => {
  notes = [noteFixture()]; authenticated = true;
  vi.stubGlobal('fetch', vi.fn(async (address: string, options?: RequestInit) => {
    const url = new URL(address), path = url.pathname;
    if (path === '/api/workspace/studies') return Response.json({ items: [studyFixture()], nextCursor: null });
    if (path === '/api/workspace/favorites') return Response.json({ items: [], nextCursor: null });
    if (path.endsWith('/notes') && options?.method === 'POST') {
      const body = JSON.parse(String(options.body)); notes.push(noteFixture({ id: '20000000-0000-4000-8000-000000000002', content: body.content })); return Response.json(notes.at(-1));
    }
    if (path.endsWith('/notes')) return Response.json({ items: notes, nextCursor: null });
    return Response.json({ error: { code: 'NOT_FOUND', message: 'technical route not found' } }, { status: 404 });
  }));
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); });
function mount(onOpenStudy?: (id: string, version: number, reference: string) => void, initialStudy?: ReturnType<typeof studyFixture>, onDeleteStudy?: (id: string) => void) {
  const client = createQueryClient(); clients.push(client);
  client.setDefaultOptions({ ...client.getDefaultOptions(), queries: { ...client.getDefaultOptions().queries, retry: false } });
  return render(<QueryClientProvider client={client}><ToastProvider><HistoryView onOpenStudy={onOpenStudy} initialStudy={initialStudy} onDeleteStudy={onDeleteStudy} /></ToastProvider></QueryClientProvider>);
}
async function openNotes() {
  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: screen.getByRole('option', { name: 'GEN 1:1 (v3)' }).getAttribute('value') } });
  await screen.findByText(notes[0]!.content);
}
it('exposes exactly one selected workspace view to assistive technology', async () => {
  mount(); await screen.findByRole('button', { name: /Estudos Recentes/ });
  const studies = screen.getByRole('button', { name: /Estudos Recentes/ }), notes = screen.getByRole('button', { name: 'Anotações Pessoais' }), favorites = screen.getByRole('button', { name: /^Favoritos/ });
  for (const active of [studies, notes, favorites, studies]) {
    fireEvent.click(active);
    for (const button of [studies, notes, favorites]) expect(button).toHaveAttribute('aria-pressed', String(button === active));
  }
});
it.each(['studies', 'favorites'] as const)('keeps %s pagination bounded while loading and after returning to page one', async kind => {
  const original = vi.mocked(fetch).getMockImplementation()!; let finish!: (response: Response) => void;
  const pending = new Promise<Response>(resolve => { finish = resolve; });
  const pageOne = kind === 'studies' ? studyFixture() : { id: 'technical-first-favorite', studyId, studyVersion: 1, createdAt, reference };
  const pageTwo = kind === 'studies' ? studyFixture({ id: secondStudyId, version: 2 }) : { id: 'technical-second-favorite', studyId: secondStudyId, studyVersion: 2, createdAt, reference };
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    const url = new URL(String(address));
    if (url.pathname === `/api/workspace/${kind}`) return url.searchParams.has('cursor') ? pending : Response.json({ items: [pageOne], nextCursor: `opaque-${kind}-cursor` });
    return original(address, options);
  });
  mount(); if (kind === 'favorites') fireEvent.click(screen.getByRole('button', { name: /^Favoritos/ }));
  const prefix = kind === 'studies' ? 'Estudos' : 'Favoritos';
  const firstLabel = kind === 'studies' ? 'v3' : 'GEN 1:1 (v1)', secondLabel = kind === 'studies' ? 'v2' : 'GEN 1:1 (v2)';
  await screen.findByText(firstLabel); const previous = screen.getByRole('button', { name: `${prefix} anteriores` }), next = screen.getByRole('button', { name: `${prefix} seguintes` });
  expect(previous).toBeDisabled(); expect(next).toBeEnabled(); fireEvent.click(next);
  await waitFor(() => expect(vi.mocked(fetch).mock.calls.some(([address]) => new URL(String(address)).searchParams.get('cursor') === `opaque-${kind}-cursor`)).toBe(true));
  expect(previous).toBeDisabled(); expect(next).toBeDisabled();
  await act(async () => { finish(Response.json({ items: [pageTwo], nextCursor: null })); });
  await screen.findByText(secondLabel); expect(previous).toBeEnabled(); expect(next).toBeDisabled();
  fireEvent.click(previous); await screen.findByText(firstLabel); expect(previous).toBeDisabled(); expect(next).toBeEnabled();
});
it.each([1, 3])('retains the exact selected study version %s without duplicating it or substituting another id', async version => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => new URL(String(address)).pathname === '/api/workspace/studies'
    ? Response.json({ items: [studyFixture(), studyFixture({ id: secondStudyId, version: 1 })], nextCursor: null }) : original(address, options));
  mount(undefined, studyFixture({ version })); await screen.findByRole('button', { name: 'Eliminar estudo GEN 1:1 versão 3' });
  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' })); const selection = screen.getByRole('combobox');
  expect(selection).toHaveValue(`${studyId}:${version}`);
  expect(selection.querySelectorAll(`option[value="${studyId}:${version}"]`)).toHaveLength(1);
  expect(selection.querySelectorAll('option')).toHaveLength(version === 1 ? 4 : 3);
  expect(vi.mocked(fetch).mock.calls.some(([url]) => new URL(String(url)).pathname.endsWith(`/studies/${studyId}/notes`) && new URL(String(url)).searchParams.get('studyVersion') === String(version))).toBe(true);
  expect(vi.mocked(fetch).mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
});
it('keeps whitespace notes unsent and trims only the edges of a deliberate multiline note', async () => {
  mount(); await openNotes(); const draft = screen.getByPlaceholderText(/Escreva uma nova anotação/);
  expect(draft).toHaveValue(''); fireEvent.change(draft, { target: { value: '   ' } });
  expect(screen.getByRole('button', { name: 'Adicionar Nota' })).toBeDisabled();
  expect(fireEvent.submit(draft.closest('form')!)).toBe(false);
  expect(vi.mocked(fetch).mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
  fireEvent.change(draft, { target: { value: '  First technical line\nSecond technical line  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar Nota' })); await screen.findByText('Anotação adicionada ao estudo.');
  expect(draft).toHaveValue(''); const write = vi.mocked(fetch).mock.calls.find(([, options]) => options?.method === 'POST')!;
  expect(JSON.parse(String(write[1]?.body))).toEqual({ studyVersion: 3, content: 'First technical line\nSecond technical line' });
});
it.each(['selected', 'other'] as const)('clears note selection only when the %s study was deleted', async target => {
  let studies = [studyFixture(), studyFixture({ id: secondStudyId, reference: { ...reference, normalized: 'GEN 1:2', fromVerse: 2, toVerse: 2 } })];
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    const path = new URL(String(address)).pathname;
    if (options?.method === 'DELETE') { studies = studies.filter(item => !path.endsWith(item.id)); return new Response(null, { status: 204 }); }
    if (path === '/api/workspace/studies') return Response.json({ items: studies, nextCursor: null });
    return original(address, options);
  });
  const deleted = vi.fn(); mount(undefined, studyFixture(), deleted); await openNotes();
  fireEvent.change(screen.getByPlaceholderText(/Escreva uma nova anotação/), { target: { value: 'Technical draft tied to the selected study' } });
  fireEvent.click(screen.getByRole('button', { name: /Estudos Recentes/ }));
  const ref = target === 'selected' ? 'GEN 1:1' : 'GEN 1:2';
  fireEvent.click(await screen.findByRole('button', { name: `Eliminar estudo ${ref} versão 3` }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument(); fireEvent.click(screen.getByRole('button', { name: 'Eliminar estudo' }));
  await screen.findByText('Estudo e dados associados eliminados.'); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(deleted).toHaveBeenCalledWith(target === 'selected' ? studyId : secondStudyId);
  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  expect(screen.getByRole('combobox')).toHaveValue(target === 'selected' ? '' : `${studyId}:3`);
  if (target === 'other') expect(screen.getByPlaceholderText(/Escreva uma nova anotação/)).toHaveValue('Technical draft tied to the selected study');
  else expect(screen.queryByPlaceholderText(/Escreva uma nova anotação/)).not.toBeInTheDocument();
});

it('reads notes for the selected version and refreshes that cache after creating a note', async () => {
  mount(); await openNotes();
  const read = vi.mocked(fetch).mock.calls.find(([url, options]) => String(url).includes('/notes') && !options?.method);
  expect(new URL(String(read?.[0])).searchParams.get('studyVersion')).toBe('3');
  fireEvent.change(screen.getByPlaceholderText(/Escreva uma nova anotação/), { target: { value: 'Segunda nota técnica.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar Nota' }));
  expect(await screen.findByText('Segunda nota técnica.')).toBeInTheDocument();
});
it('retains a conflicting draft, explicitly reloads the current revision, then sends the new CAS precondition', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  let revisions = 0;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    if (options?.method !== 'PATCH') return original(url, options);
    if (++revisions === 1) {
      notes = [noteFixture({ revision: 2, content: 'Outra edição técnica.' })];
      return Response.json({ error: { code: 'WORKSPACE_CONFLICT', message: 'Outra edição foi guardada.' } }, { status: 409 });
    }
    const body = JSON.parse(String(options.body)); notes = [noteFixture({ revision: 3, content: body.content })]; return Response.json(notes[0]);
  });
  mount(); await openNotes(); fireEvent.click(screen.getByRole('button', { name: /Editar Nota/i }));
  const field = screen.getByPlaceholderText('Conteúdo revisado da anotação...');
  fireEvent.change(field, { target: { value: 'Rascunho técnico a preservar.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));
  const reload = await screen.findByRole('button', { name: 'Carregar revisão atual' });
  expect(field).toHaveValue('Rascunho técnico a preservar.'); expect(revisions).toBe(1);
  fireEvent.click(reload);
  await waitFor(() => expect(field).toHaveValue('Outra edição técnica.'));
  expect(screen.queryByRole('button', { name: 'Carregar revisão atual' })).not.toBeInTheDocument(); expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent.change(field, { target: { value: 'Revisão técnica confirmada.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  const last = vi.mocked(fetch).mock.calls.filter(([, options]) => options?.method === 'PATCH').at(-1);
  expect(JSON.parse(String(last?.[1]?.body))).toEqual({ expectedRevision: 2, content: 'Revisão técnica confirmada.' });
  expect(await screen.findByText('Revisão técnica confirmada.')).toBeInTheDocument();
});
it('does not erase line breaks when a saved personal note is opened for editing', async () => {
  notes = [noteFixture({ content: 'Linha técnica um.\nLinha técnica dois.' })];
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Anotações Pessoais' }));
  await screen.findByRole('option', { name: 'GEN 1:1 (v3)' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: screen.getByRole('option', { name: 'GEN 1:1 (v3)' }).getAttribute('value') } });
  fireEvent.click(await screen.findByRole('button', { name: /Editar Nota/i }));
  expect(screen.getByPlaceholderText('Conteúdo revisado da anotação...')).toHaveValue(notes[0]!.content);
});
it('follows real workspace cursors and permits returning to the preceding page', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    const url = new URL(String(address));
    if (url.pathname !== '/api/workspace/studies') return original(address, options);
    return Response.json(url.searchParams.get('cursor') === 'technical-page-two'
      ? { items: [studyFixture({ id: secondStudyId, version: 2 })], nextCursor: null }
      : { items: [studyFixture()], nextCursor: 'technical-page-two' });
  });
  mount(); const next = await screen.findByRole('button', { name: 'Estudos seguintes' });
  await waitFor(() => expect(next).toBeEnabled()); fireEvent.click(next);
  expect(await screen.findByText('v2')).toBeInTheDocument(); expect(screen.queryByText('v3')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Estudos anteriores' }));
  expect(await screen.findByText('v3')).toBeInTheDocument();
});
it('opens the exact favorite version with its real reference instead of displaying an opaque id', async () => {
  const open = vi.fn(); const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => new URL(String(url)).pathname === '/api/workspace/favorites'
    ? Response.json({ items: [{ id: '30000000-0000-4000-8000-000000000001', studyId, studyVersion: 1, createdAt, reference }], nextCursor: null }) : original(url, options));
  mount(open); fireEvent.click(screen.getByRole('button', { name: /Favoritos/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Abrir favorito GEN 1:1 versão 1' }));
  expect(open).toHaveBeenCalledWith(studyId, 1, 'GEN 1:1');
});
it('requires confirmation before deleting an owned study and removes it from the workspace after success', async () => {
  let deleted = false; const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    const path = new URL(String(url)).pathname;
    if (options?.method === 'DELETE' && path === `/api/workspace/studies/${studyId}`) { deleted = true; return new Response(null, { status: 204 }); }
    if (deleted && path === '/api/workspace/studies') return Response.json({ items: [], nextCursor: null });
    return original(url, options);
  });
  mount(); fireEvent.click(await screen.findByRole('button', { name: 'Eliminar estudo GEN 1:1 versão 3' }));
  expect(deleted).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar estudo' }));
  await waitFor(() => expect(deleted).toBe(true));
  expect(await screen.findByText('Nenhum estudo persistido ainda no workspace.')).toBeInTheDocument();
});
it('opens account guidance without requesting any private workspace data when anonymous', () => {
  authenticated = false; mount(); expect(screen.getByText('Workspace Protegido')).toBeInTheDocument(); expect(fetch).not.toHaveBeenCalled();
});
it('keeps a new-note draft after a failed write without retrying it automatically', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => options?.method === 'POST'
    ? Response.json({ error: { code: 'UNAVAILABLE', message: 'Não foi possível guardar agora.' } }, { status: 503 }) : original(address, options));
  mount(); await openNotes(); const draft = screen.getByRole('textbox', { name: 'Nova anotação' });
  fireEvent.change(draft, { target: { value: 'Rascunho pessoal de teste.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar Nota' }));
  await screen.findByText('Erro ao criar anotação'); expect(draft).toHaveValue('Rascunho pessoal de teste.');
  expect(vi.mocked(fetch).mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1);
});
it('preserves the draft when a conflicting note disappears before explicit reload', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    if (options?.method === 'PATCH') { notes = []; return Response.json({ error: { code: 'WORKSPACE_CONFLICT', message: 'A nota mudou.' } }, { status: 409 }); }
    return original(address, options);
  });
  mount(); await openNotes(); fireEvent.click(screen.getByTitle('Editar nota'));
  const draft = screen.getByRole('textbox', { name: 'Conteúdo da anotação' });
  fireEvent.change(draft, { target: { value: 'Rascunho ainda disponível no editor.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar Revisão' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Carregar revisão atual' }));
  await screen.findByText('Não foi possível carregar a nota atual. O teu rascunho foi conservado.');
  expect(draft).toHaveValue('Rascunho ainda disponível no editor.');
});
it('supports both explicit cancellation and closing the editor and note confirmation, then deletes deliberately', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    if (options?.method === 'DELETE') { notes = []; return new Response(null, { status: 204 }); }
    return original(address, options);
  });
  mount(); await openNotes();
  for (const action of ['Cancelar', 'Fechar']) {
    fireEvent.click(screen.getByTitle('Editar nota')); fireEvent.click(screen.getByRole('button', { name: action }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Eliminar Nota')); fireEvent.click(screen.getByRole('button', { name: action }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  }
  expect(vi.mocked(fetch).mock.calls.some(([, options]) => options?.method === 'DELETE')).toBe(false);
  fireEvent.click(screen.getByTitle('Eliminar Nota')); fireEvent.click(screen.getByRole('button', { name: 'Excluir Definitivamente' }));
  await screen.findByText('Anotação eliminada com sucesso.');
  expect(await screen.findByText('Nenhuma anotação associada a este estudo ainda.')).toBeInTheDocument();
});
it('reports a failed note deletion without dismissing its confirmation or erasing the note', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => options?.method === 'DELETE'
    ? Response.json({ error: { code: 'UNAVAILABLE', message: 'Eliminação temporariamente indisponível.' } }, { status: 503 }) : original(address, options));
  mount(); await openNotes(); fireEvent.click(screen.getByTitle('Eliminar Nota'));
  fireEvent.click(screen.getByRole('button', { name: 'Excluir Definitivamente' }));
  await screen.findByText('Erro ao eliminar anotação'); expect(screen.getByRole('dialog')).toBeInTheDocument(); expect(notes).toHaveLength(1);
});
it('keeps a failed study deletion recoverable and retries only on another confirmation', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let attempts = 0;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    if (options?.method === 'DELETE') return ++attempts === 1
      ? Response.json({ error: { code: 'UNAVAILABLE', message: 'Eliminação ainda não concluída.' } }, { status: 503 }) : new Response(null, { status: 204 });
    if (attempts === 2 && new URL(String(address)).pathname === '/api/workspace/studies') return Response.json({ items: [], nextCursor: null });
    return original(address, options);
  });
  mount(); fireEvent.click(await screen.findByRole('button', { name: 'Eliminar estudo GEN 1:1 versão 3' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' })); expect(attempts).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar estudo GEN 1:1 versão 3' }));
  fireEvent.click(screen.getByRole('button', { name: 'Fechar' })); expect(attempts).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar estudo GEN 1:1 versão 3' }));
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar estudo' }));
  await screen.findByRole('alert'); expect(attempts).toBe(1); expect(screen.getByRole('dialog')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar estudo' }));
  await screen.findByText('Nenhum estudo persistido ainda no workspace.'); expect(attempts).toBe(2);
});
it('adds the selected study version to favorites and removes it through the favorites tab', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!; let favorite = false;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    const path = new URL(String(address)).pathname;
    const item = { id: '30000000-0000-4000-8000-000000000001', studyId, studyVersion: 3, reference, createdAt };
    if (path.endsWith('/favorites/3')) { favorite = options?.method === 'PUT'; return favorite ? Response.json(item) : new Response(null, { status: 204 }); }
    if (path === '/api/workspace/favorites') return Response.json({ items: favorite ? [item] : [], nextCursor: null });
    return original(address, options);
  });
  mount(); fireEvent.click(await screen.findByTitle('Marcar favorito'));
  await screen.findByText('Adicionado aos favoritos.');
  expect(await screen.findByTitle('Remover favorito')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^Favoritos/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Remover' }));
  await screen.findByText('Removido dos favoritos.'); expect(favorite).toBe(false);
  await screen.findByText('Nenhum estudo marcado como favorito.');
  fireEvent.click(screen.getByRole('button', { name: /^Estudos Recentes/ }));
  expect(await screen.findByTitle('Marcar favorito')).toBeInTheDocument();
});
it('reports a favorite write failure without claiming it was saved', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => options?.method === 'PUT'
    ? Response.json({ error: { code: 'UNAVAILABLE', message: 'Favorito não guardado.' } }, { status: 503 }) : original(address, options));
  mount(); fireEvent.click(await screen.findByTitle('Marcar favorito'));
  await screen.findByText('Erro ao atualizar favorito'); expect(screen.queryByText('Adicionado aos favoritos.')).not.toBeInTheDocument();
});
it('uses favorite cursors in both directions without substituting study pagination', async () => {
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (address, options) => {
    const url = new URL(String(address)); if (url.pathname !== '/api/workspace/favorites') return original(address, options);
    const second = url.searchParams.has('cursor');
    return Response.json({ items: [{ id: second ? 'favorite-page-two' : 'favorite-page-one', studyId, studyVersion: second ? 2 : 1, createdAt, reference }], nextCursor: second ? null : 'technical-favorite-cursor' });
  });
  mount(); fireEvent.click(screen.getByRole('button', { name: /^Favoritos/ })); await screen.findByText('GEN 1:1 (v1)');
  fireEvent.click(screen.getByRole('button', { name: 'Favoritos seguintes' })); await screen.findByText('GEN 1:1 (v2)');
  expect(vi.mocked(fetch).mock.calls.some(([address]) => new URL(String(address)).searchParams.get('cursor') === 'technical-favorite-cursor')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Favoritos anteriores' })); await screen.findByText('GEN 1:1 (v1)');
});
