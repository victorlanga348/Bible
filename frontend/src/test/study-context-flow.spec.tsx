import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContent } from '../App';
import { createQueryClient } from '../shared/api/query-client';
import { ThemeProvider } from '../shared/hooks/use-theme';
import { ToastProvider } from '../shared/ui/toast';
import { AccountAccessProvider } from '../shared/ui/shell';
import { studyFixture } from './workflow-fixtures';

// Technical transport/session boundaries; actual API/PG is verified separately.
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: true, token: 'technical-token', status: 'authenticated', ownerId: 'technical-owner', version: 1 }) }));
vi.mock('../features/canon/reader-view', () => ({ ReaderView: () => <div>Public reader probe</div> }));
const client = createQueryClient();
afterEach(() => { cleanup(); client.clear(); vi.unstubAllGlobals(); });
it('connects a newly created real-shaped study to the actual assistant after an explicit action', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  vi.stubGlobal('fetch', vi.fn(async () => Response.json(studyFixture({ version: 1 }))));
  render(<QueryClientProvider client={client}><ThemeProvider><ToastProvider><AccountAccessProvider><AppContent /></AccountAccessProvider></ToastProvider></ThemeProvider></QueryClientProvider>);
  expect(screen.getByText('Estudo Não Selecionado')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Estudo Estruturado' }));
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Gerar Estudo' }));
  expect(await screen.findByText(/^Estudo Conectado/)).toBeInTheDocument();
});
