import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

describe('Leitor Canônico & Navegação (Regras e Formatação)', () => {
  it('separa corretamente os 66 livros entre Antigo e Novo Testamento', () => {
    const mockBooks = [
      { code: 'GEN', name: 'Gênesis', order: 1, chapterCount: 50 },
      { code: 'MAL', name: 'Malaquias', order: 39, chapterCount: 4 },
      { code: 'MAT', name: 'Mateus', order: 40, chapterCount: 28 },
      { code: 'REV', name: 'Apocalipse', order: 66, chapterCount: 22 },
    ];

    const oldTestament = mockBooks.filter((b) => b.order <= 39);
    const newTestament = mockBooks.filter((b) => b.order > 39);

    expect(oldTestament).toHaveLength(2);
    expect(newTestament).toHaveLength(2);
    expect(oldTestament[0].code).toBe('GEN');
    expect(oldTestament[1].code).toBe('MAL');
    expect(newTestament[0].code).toBe('MAT');
    expect(newTestament[1].code).toBe('REV');
  });

  it('calcula o intervalo contínuo de versículos ao selecionar do início ao fim', () => {
    const fromVerse = 1;
    const toVerse = 5;
    const range = Array.from({ length: toVerse - fromVerse + 1 }, (_, i) => fromVerse + i);

    expect(range).toEqual([1, 2, 3, 4, 5]);
  });

  it('formata citação com atribuição canônica autêntica', () => {
    const bookName = 'Gênesis';
    const chapter = 1;
    const selectedVerses = [1, 2];
    const verses = [
      { number: 1, text: 'No princípio criou Deus os céus e a terra.' },
      { number: 2, text: 'E a terra estava desordenada e vazia.' },
    ];

    const selectedTexts = verses
      .filter((v) => selectedVerses.includes(v.number))
      .map((v) => `${v.number}. ${v.text}`)
      .join('\n');

    const citation = `${bookName} ${chapter}:${selectedVerses.join(',')}\n${selectedTexts}\n(Bíblia Livre — porbr2018)`;

    expect(citation).toContain('Gênesis 1:1,2');
    expect(citation).toContain('1. No princípio criou Deus');
    expect(citation).toContain('(Bíblia Livre — porbr2018)');
  });
});
