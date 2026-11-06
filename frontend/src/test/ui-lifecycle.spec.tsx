import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ToastProvider, useToast } from '../shared/ui/toast';
import { ThemeProvider, useTheme } from '../shared/hooks/use-theme';
import { useCursorPages } from '../shared/hooks/use-cursor-pages';
import { CursorControls } from '../shared/ui/cursor-controls';
afterEach(cleanup);
it('allows next-page navigation when optional busy and label props are omitted', () => {
  function Pages() { const pages = useCursorPages(); return <><output>{pages.cursor ?? 'first'}</output><CursorControls pages={pages} nextCursor="next" /></>; }
  render(<Pages />); const next = screen.getByRole('button', { name: 'Página seguinte' }); expect(next).toBeEnabled();
  fireEvent.click(next); expect(screen.getByText('next')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Página anterior' })); expect(screen.getByText('first')).toBeInTheDocument();
});
it('lets keyboard and screen-reader users dismiss one notification without losing another', async () => {
  function Notices() {
    const { toast } = useToast();
    return <><button onClick={() => toast('Primeira notificação')}>Primeira</button><button onClick={() => toast('Segunda notificação', { type: 'success', description: 'Operação técnica concluída.' })}>Segunda</button></>;
  }
  render(<ToastProvider><Notices /></ToastProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Primeira' })); fireEvent.click(screen.getByRole('button', { name: 'Segunda' }));
  const controls = screen.getAllByRole('button', { name: 'Fechar notificação' }); expect(controls).toHaveLength(2);
  fireEvent.click(controls[0]);
  await waitFor(() => expect(screen.queryByText('Primeira notificação')).not.toBeInTheDocument());
  expect(screen.getByText('Segunda notificação')).toBeInTheDocument();
});
it('rejects provider hooks used without their corresponding provider', () => {
  expect(() => renderHook(useToast)).toThrow('useToast must be used within ToastProvider');
  expect(() => renderHook(useTheme)).toThrow('useTheme must be used within ThemeProvider');
});
it('keeps the first cursor on previous, preserves cursor history, and resets an independent list', () => {
  const { result } = renderHook(useCursorPages);
  act(() => result.current.previous()); expect(result.current.cursor).toBeNull();
  act(() => result.current.next('opaque-a')); act(() => result.current.next('opaque-b'));
  act(() => result.current.previous()); expect(result.current.cursor).toBe('opaque-a');
  act(() => result.current.reset()); expect(result.current.hasPrevious).toBe(false); expect(result.current.cursor).toBeNull();
});

it('persists an explicitly selected reading theme as well as the toggle action', () => {
  localStorage.setItem('biblia-app-theme', 'dark');
  const { result } = renderHook(useTheme, { wrapper: ThemeProvider });
  act(() => result.current.setTheme('light')); expect(document.documentElement).not.toHaveClass('dark');
  expect(localStorage.getItem('biblia-app-theme')).toBe('light');
  act(() => result.current.setTheme('dark')); expect(document.documentElement).toHaveClass('dark');
});
