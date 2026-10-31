import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Button } from '../shared/ui/button';
import { EpistemicBadge, Badge } from '../shared/ui/badge';
import { Input } from '../shared/ui/input';
import { ApiError } from '../shared/api/client';
import { ThemeProvider, useTheme } from '../shared/hooks/use-theme';
import { ToastProvider, useToast } from '../shared/ui/toast';

function ThemeProbe() {
  const { setTheme } = useTheme(); return <button onClick={() => setTheme('light')}>Escolher tema claro</button>;
}
function ToastProbe() {
  const { toast } = useToast();
  return <><button onClick={() => toast('Primeiro aviso')}>Primeiro</button>
    <button onClick={() => toast('Segundo aviso', { type: 'success', description: 'Descrição preservada.' })}>Segundo</button></>;
}

describe('Design System Primitives', () => {
  it('requires providers for the theme and toast public APIs', () => {
    expect(() => render(<ThemeProbe />)).toThrow('useTheme must be used within ThemeProvider');
    expect(() => render(<ToastProbe />)).toThrow('useToast must be used within ToastProvider');
  });
  it('persists an explicitly chosen theme through the provider API', () => {
    localStorage.clear(); vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    try {
      render(<ThemeProvider><ThemeProbe /></ThemeProvider>);
      expect(document.documentElement).toHaveClass('dark');
      fireEvent.click(screen.getByRole('button', { name: 'Escolher tema claro' }));
      expect(document.documentElement).not.toHaveClass('dark'); expect(localStorage.getItem('biblia-app-theme')).toBe('light');
    } finally { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); }
  });
  it('dismisses only the selected notification and preserves the remaining description', async () => {
    render(<ToastProvider><ToastProbe /></ToastProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Primeiro' })); fireEvent.click(screen.getByRole('button', { name: 'Segundo' }));
    const first = await screen.findByText('Primeiro aviso');
    fireEvent.click(within(first.closest('li')!).getByRole('button'));
    await waitFor(() => expect(screen.queryByText('Primeiro aviso')).not.toBeInTheDocument());
    expect(screen.getByText('Segundo aviso')).toBeInTheDocument(); expect(screen.getByText('Descrição preservada.')).toBeInTheDocument();
  });
  describe('Button', () => {
    it('renders text with primary variant by default', () => {
      render(<Button>Estudar</Button>);
      const btn = screen.getByRole('button', { name: /estudar/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveClass('bg-[var(--accent)]');
    });

    it('handles disabled and loading states', () => {
      render(<Button loading>Processando</Button>);
      const btn = screen.getByRole('button', { name: /processando/i });
      expect(btn).toBeDisabled();
      expect(btn.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('EpistemicBadge', () => {
    it('renders documented fact badge correctly', () => {
      render(<EpistemicBadge classification="documented-fact" />);
      expect(screen.getByText('Fato Documentado')).toBeInTheDocument();
    });

    it('renders insufficient evidence badge correctly', () => {
      render(<EpistemicBadge classification="insufficient-evidence" />);
      expect(screen.getByText('Evidência Insuficiente')).toBeInTheDocument();
    });

    it('renders hypothesis badge correctly', () => {
      render(<Badge classification="hypothesis">Hipótese Textual</Badge>);
      expect(screen.getByText('Hipótese Textual')).toBeInTheDocument();
    });
  });

  describe('Input', () => {
    it('renders input with placeholder and accessible error', () => {
      render(<Input placeholder="Buscar passagem..." error="Referência não encontrada" />);
      expect(screen.getByPlaceholderText('Buscar passagem...')).toBeInTheDocument();
      expect(screen.getByText('Referência não encontrada')).toBeInTheDocument();
    });
  });

  describe('ApiError', () => {
    it('constructs with correct status, code, and message', () => {
      const err = new ApiError(404, { code: 'NOT_FOUND', message: 'Recurso não encontrado.' });
      expect(err.status).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
      expect(err.message).toBe('Recurso não encontrado.');
    });
  });
});
