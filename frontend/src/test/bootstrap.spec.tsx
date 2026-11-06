import { act, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Root } from 'react-dom/client';
import { studyFixture } from './workflow-fixtures';
const mounted = vi.hoisted(() => ({ root: undefined as Root | undefined }));
vi.mock('react-dom/client', async importOriginal => {
  const actual = await importOriginal<typeof import('react-dom/client')>();
  return { ...actual, createRoot: (...args: Parameters<typeof actual.createRoot>) => {
    mounted.root = actual.createRoot(...args); return mounted.root;
  } };
});
afterEach(async () => {
  await act(async () => { mounted.root?.unmount(); }); mounted.root = undefined;
  document.getElementById('root')?.remove(); vi.unstubAllGlobals();
});
it('boots the real application entrypoint and renders authentic scripture without granting a session', async () => {
  const node = document.createElement('div'); node.id = 'root'; document.body.append(node);
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
  vi.stubGlobal('fetch', vi.fn(async (url: string) => String(url).endsWith('/books')
    ? Response.json({ books: [{ code: 'GEN', name: 'Gênesis', chapterCount: 50, order: 1 }] })
    : Response.json({ ...studyFixture().passage, chapter: 1, bookCode: 'GEN', previousChapter: null, nextChapter: null })));
  await act(async () => { await import('../main'); });
  expect(await screen.findByRole('heading', { name: 'Gênesis 1' })).toBeInTheDocument();
  expect(screen.getByText('Sem sessão')).toBeInTheDocument();
  expect(screen.getByText(studyFixture().passage.verses[0].text.trim())).toBeInTheDocument();
});
