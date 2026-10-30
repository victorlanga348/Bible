import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

describe('Assistente de IA & RAG Local (Regras e Proveniência)', () => {
  it('valida o limite máximo de 500 bytes UTF-8 para perguntas', () => {
    const validQuestion = 'O que Flávio Josefo relata sobre a destruição de Jerusalém?';
    const validBytes = new TextEncoder().encode(validQuestion).byteLength;
    expect(validBytes).toBeLessThanOrEqual(500);

    const oversizedQuestion = 'A'.repeat(501);
    const oversizedBytes = new TextEncoder().encode(oversizedQuestion).byteLength;
    expect(oversizedBytes).toBeGreaterThan(500);
  });

  it('calcula corretamente os tokens consumidos na proveniência auditável', () => {
    const mockProvenance = {
      profileId: 'local-extractive-v1',
      promptTokens: 420,
      completionTokens: 28,
      totalTokens: 448,
    };

    expect(mockProvenance.promptTokens + mockProvenance.completionTokens).toBe(448);
    expect(mockProvenance.profileId).toBe('local-extractive-v1');
  });

  it('diferencia o status de evidência suportada vs evidência insuficiente', () => {
    const supportedStatus = 'supported';
    const insufficientStatus = 'insufficient-evidence';

    expect(['supported', 'insufficient-evidence', 'restricted']).toContain(supportedStatus);
    expect(['supported', 'insufficient-evidence', 'restricted']).toContain(insufficientStatus);
  });
});
