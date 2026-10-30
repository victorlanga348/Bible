import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../shared/ui/button';
import { EpistemicBadge, Badge } from '../shared/ui/badge';
import { Input } from '../shared/ui/input';
import { ApiError } from '../shared/api/client';

describe('Design System Primitives', () => {
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
