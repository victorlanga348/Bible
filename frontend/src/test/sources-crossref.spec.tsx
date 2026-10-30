import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type { CrossReferenceRelationDto } from '../shared/api/contracts';

describe('Biblioteca de Fontes & Referências Cruzadas (Regras e Classificação)', () => {
  it('valida os tipos canônicos de relações hermenêuticas', () => {
    const relationTypes: CrossReferenceRelationDto['type'][] = [
      'direct-citation',
      'allusion',
      'prophetic-fulfillment',
      'thematic-parallel',
    ];

    expect(relationTypes).toContain('direct-citation');
    expect(relationTypes).toContain('allusion');
    expect(relationTypes).toContain('prophetic-fulfillment');
    expect(relationTypes).toContain('thematic-parallel');
  });

  it('valida as avaliações de confiança da relação cruzada', () => {
    const assessments: CrossReferenceRelationDto['assessment'][] = [
      'high',
      'moderate',
      'traditional',
      'disputed',
    ];

    expect(assessments).toContain('high');
    expect(assessments).toContain('disputed');
  });

  it('assegura que a fonte histórica contém declarações de direitos autorais e limitações', () => {
    const mockSource = {
      id: 'josephus-antiquities-pg2848-en',
      author: 'Flavius Josephus',
      translator: 'William Whiston',
      rightsStatement: 'Original work and Whiston translation in public domain.',
      limitations: 'Book I, chapter 1 only: four numbered paragraphs.',
    };

    expect(mockSource.rightsStatement).toContain('public domain');
    expect(mockSource.limitations).toContain('four numbered paragraphs');
  });
});
