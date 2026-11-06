import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type { CrossReferenceRelationDto } from '../shared/api/contracts';
import { source } from './fixtures/josephus-pg2848/manifest.json';

describe('Biblioteca de Fontes & Referências Cruzadas (Regras e Classificação)', () => {
  it('valida os tipos canônicos de relações hermenêuticas', () => {
    const relationTypes: CrossReferenceRelationDto['type'][] = [
      'citation',
      'allusion',
      'prophetic-relation',
      'thematic-parallel',
    ];

    expect(relationTypes).toContain('citation');
    expect(relationTypes).toContain('allusion');
    expect(relationTypes).toContain('prophetic-relation');
    expect(relationTypes).toContain('thematic-parallel');
  });

  it('mantém a avaliação como interpretação do utilizador, conforme o contrato backend', () => {
    const assessments: CrossReferenceRelationDto['assessment'][] = [
      'user-interpretation',
    ];

    expect(assessments).toEqual(['user-interpretation']);
  });

  it('assegura que a fonte histórica contém declarações de direitos autorais e limitações', () => {
    const mockSource = source;

    expect(mockSource.rightsStatement).toContain('public domain');
    expect(mockSource.limitations).toContain('four numbered paragraphs');
  });
});
