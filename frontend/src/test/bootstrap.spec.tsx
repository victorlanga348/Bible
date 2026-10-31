import { StrictMode, isValidElement } from 'react';
import { expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import App from '../App';

vi.mock('react-dom/client', () => ({ createRoot: vi.fn(() => ({ render: vi.fn() })) }));
vi.mock('../App', () => ({ default: () => null }));
it('mounts the application in StrictMode at the actual root element', async () => {
  const root = document.createElement('div'); root.id = 'root'; document.body.appendChild(root);
  try {
    await import('../main');
    expect(createRoot).toHaveBeenCalledWith(root);
    const element = vi.mocked(createRoot).mock.results[0].value.render.mock.calls[0][0];
    expect(isValidElement(element)).toBe(true); expect(element.type).toBe(StrictMode);
    expect(element.props.children.type).toBe(App);
  } finally { root.remove(); }
});
