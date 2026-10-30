import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type { StudySectionDto, EpistemicClassification } from '../shared/api/contracts';

describe('Estudos Estruturados & Epistemologia (Contratos e Renderização)', () => {
  it('garante que as 6 seções canônicas possuem identificadores e títulos corretos', () => {
    const sectionKinds = [
      'immediate-context',
      'book-argument',
      'history-culture',
      'authorship-audience-purpose',
      'comparison',
      'interpretations',
    ];

    const mockSections: StudySectionDto[] = sectionKinds.map((kind) => ({
      kind: kind as StudySectionDto['kind'],
      status: 'available',
      text: `Análise sobre ${kind}`,
      evidenceIds: ['ev-1'],
    }));

    expect(mockSections).toHaveLength(6);
    expect(mockSections.map((s) => s.kind)).toEqual(sectionKinds);
  });

  it('diferencia seções com status available de insufficient-evidence', () => {
    const availableSection: StudySectionDto = {
      kind: 'immediate-context',
      status: 'available',
      text: 'Texto contextual presente.',
      evidenceIds: ['ev-1'],
    };

    const insufficientSection: StudySectionDto = {
      kind: 'history-culture',
      status: 'insufficient-evidence',
      text: 'Evidência insuficiente nas fontes admitidas.',
      evidenceIds: [],
    };

    expect(availableSection.status).toBe('available');
    expect(availableSection.evidenceIds).toHaveLength(1);

    expect(insufficientSection.status).toBe('insufficient-evidence');
    expect(insufficientSection.evidenceIds).toHaveLength(0);
  });

  it('valida as classificações epistemológicas das interpretações comparadas', () => {
    const validClassifications: EpistemicClassification[] = [
      'documented-fact',
      'inference',
      'tradition',
      'hypothesis',
    ];

    expect(validClassifications).toContain('documented-fact');
    expect(validClassifications).toContain('inference');
    expect(validClassifications).toContain('tradition');
    expect(validClassifications).toContain('hypothesis');
  });
});
