import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../shared/hooks/use-theme';
import { SessionProvider } from '../shared/hooks/use-session';
import { AccountAccessProvider, AppShell } from '../shared/ui/shell';
beforeEach(() => {
  localStorage.clear(); vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const wrap = (view: React.ReactNode) => <ThemeProvider><SessionProvider><AccountAccessProvider>{view}</AccountAccessProvider></SessionProvider></ThemeProvider>;
it('requires account controls to live outside the private application generation', () => {
  expect(() => render(<ThemeProvider><SessionProvider><AppShell activeTab="reader" onTabChange={() => {}}>Public</AppShell></SessionProvider></ThemeProvider>))
    .toThrow('AppShell requires AccountAccessProvider');
});
it('supports desktop/mobile navigation, account entry and both theme states', () => {
  const navigate = vi.fn();
  render(wrap(<AppShell activeTab="reader" onTabChange={navigate}>Technical public content</AppShell>));
  fireEvent.click(screen.getByRole('button', { name: 'Ativar Modo Claro' }));
  expect(screen.getByText('Modo Claro')).toBeInTheDocument();
  expect(document.documentElement).not.toHaveClass('dark');
  fireEvent.click(screen.getByRole('button', { name: 'Ativar Modo Escuro' }));
  expect(screen.getByText('Modo Escuro')).toBeInTheDocument();
  expect(document.documentElement).toHaveClass('dark');
  fireEvent.click(screen.getByRole('button', { name: 'Abrir Menu' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Fontes Históricas' }).at(-1)!);
  expect(navigate).toHaveBeenCalledWith('sources');
  expect(screen.queryByRole('button', { name: 'Fechar Menu' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Abrir Menu' }));
  fireEvent.click(screen.getByRole('button', { name: 'Fechar Menu' }));
  fireEvent.click(screen.getByRole('button', { name: 'Abrir Menu' }));
  fireEvent.click(screen.getByRole('button', { name: 'Conta e acesso' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Fechar Menu' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('honors focus keyboard shortcuts and optional callbacks without intercepting ordinary keys', () => {
  const focus = vi.fn();
  const { rerender } = render(wrap(<AppShell activeTab="reader" onTabChange={() => {}} onToggleFocusMode={focus} contextPanel={<span>Context</span>}>Public</AppShell>));
  fireEvent.keyDown(window, { key: 'F' });
  fireEvent.keyDown(window, { key: 'F', ctrlKey: true });
  fireEvent.keyDown(window, { key: 'x', ctrlKey: true, shiftKey: true });
  fireEvent.keyDown(window, { key: 'Escape' }); expect(focus).not.toHaveBeenCalled();
  fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: true });
  fireEvent.keyDown(window, { key: 'f', metaKey: true, shiftKey: true }); expect(focus).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole('button', { name: 'Abrir Painel Contextual de IA' }));
  expect(screen.getByRole('button', { name: 'Fechar Painel Contextual de IA' })).toHaveAttribute('aria-expanded', 'true');
  rerender(wrap(<AppShell activeTab="study" onTabChange={() => {}} isFocusMode onToggleFocusMode={focus}>Focused</AppShell>));
  fireEvent.keyDown(window, { key: 'Escape' });
  fireEvent.click(screen.getByRole('button', { name: /Sair do Modo Foco/ })); expect(focus).toHaveBeenCalledTimes(4);
  rerender(wrap(<AppShell activeTab="history" onTabChange={() => {}}>No focus callback</AppShell>));
  fireEvent.keyDown(window, { key: 'f', ctrlKey: true, shiftKey: true }); expect(focus).toHaveBeenCalledTimes(4);
});
it('marks only the active desktop destination and provides a keyboard focus target for the skip link', () => {
  const { rerender } = render(wrap(<AppShell activeTab="reader" onTabChange={() => {}}>Public</AppShell>));
  const navigation = screen.getByRole('navigation', { name: 'Navegação Principal' });
  expect(within(navigation).getByRole('button', { name: 'Bíblia' })).toHaveAttribute('aria-current', 'page');
  expect(within(navigation).getByRole('button', { name: 'Fontes Históricas' })).not.toHaveAttribute('aria-current');
  expect(navigation.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  expect(screen.queryByRole('button', { name: /Sair do Modo Foco/ })).not.toBeInTheDocument();
  rerender(wrap(<AppShell activeTab="sources" onTabChange={() => {}}>Sources</AppShell>));
  expect(within(navigation).getByRole('button', { name: 'Fontes Históricas' })).toHaveAttribute('aria-current', 'page');
  expect(within(navigation).getByRole('button', { name: 'Bíblia' })).not.toHaveAttribute('aria-current');
});
it('shows the contextual content by default and removes it when explicitly closed', () => {
  const { rerender } = render(wrap(<AppShell activeTab="reader" onTabChange={() => {}} contextPanel={<p>Contextual content</p>}>Public</AppShell>));
  expect(screen.getByText('Contextual content')).toBeInTheDocument();
  rerender(wrap(<AppShell activeTab="reader" onTabChange={() => {}} contextPanel={<p>Contextual content</p>} isContextOpen={false}>Public</AppShell>));
  expect(screen.queryByText('Contextual content')).not.toBeInTheDocument();
});
it('prevents the browser default only for the complete focus shortcut', () => {
  const focus = vi.fn(); render(wrap(<AppShell activeTab="reader" onTabChange={() => {}} onToggleFocusMode={focus}>Public</AppShell>));
  const shortcut = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, shiftKey: true, cancelable: true });
  expect(window.dispatchEvent(shortcut)).toBe(false); expect(focus).toHaveBeenCalledTimes(1);
  expect(window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, cancelable: true }))).toBe(true);
  expect(focus).toHaveBeenCalledTimes(1);
});
