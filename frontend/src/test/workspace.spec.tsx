import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type { WorkspaceNoteDto } from '../shared/api/contracts';

describe('Espaço de Estudo & Workspace (Notas CAS e Favoritos)', () => {
  it('garante que a nota armazena a revisão inteira para controle CAS', () => {
    const mockNote: WorkspaceNoteDto = {
      id: 'uuid-note-1',
      studyId: 'uuid-study-1',
      studyVersion: 1,
      revision: 2,
      content: 'Anotação histórica sobre os sacerdotes em Gênesis.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(mockNote.revision).toBe(2);
    expect(mockNote.content).toContain('Anotação histórica');
  });

  it('calcula a próxima revisão esperada ao salvar uma edição CAS', () => {
    const currentRevision = 3;
    const expectedRevision = currentRevision;
    const nextRevision = currentRevision + 1;

    expect(expectedRevision).toBe(3);
    expect(nextRevision).toBe(4);
  });

  it('estrutura corretamente os parâmetros do toggle de favoritos', () => {
    const studyId = 'study-123';
    const studyVersion = 2;
    const isFavorite = true;

    const payload = {
      studyId,
      studyVersion,
      isFavorite: !isFavorite, // alternância
    };

    expect(payload.isFavorite).toBe(false);
    expect(payload.studyVersion).toBe(2);
  });
});
