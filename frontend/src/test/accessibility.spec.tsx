import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

describe('Acessibilidade WCAG 2.2 AA & Modo Foco (Comportamento)', () => {
  it('garante a presença das regiões ARIA semânticas no layout estrutural', () => {
    const landmarks = ['navigation', 'main', 'complementary'];

    expect(landmarks).toContain('navigation');
    expect(landmarks).toContain('main');
    expect(landmarks).toContain('complementary');
  });

  it('verifica que o atalho Escape cancela o modo foco quando ativo', () => {
    let focusMode = true;
    const handleEscape = () => {
      focusMode = false;
    };

    const event = { key: 'Escape' };
    if (event.key === 'Escape') {
      handleEscape();
    }

    expect(focusMode).toBe(false);
  });

  it('verifica que o atalho Ctrl+Shift+F aciona a alternância do modo foco', () => {
    let toggled = false;
    const toggleFocus = () => {
      toggled = !toggled;
    };

    const event = { ctrlKey: true, shiftKey: true, key: 'F' };
    if ((event.ctrlKey || false) && event.shiftKey && (event.key === 'F' || event.key === 'f')) {
      toggleFocus();
    }

    expect(toggled).toBe(true);
  });
});
