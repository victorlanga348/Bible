import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from '../App';

// View probes verify application navigation/props, not underlying business integration.
vi.mock('../features/canon/reader-view', () => ({ ReaderView: ({ onSelectPassageForStudy, isFocusMode, onToggleFocusMode }: {
  onSelectPassageForStudy: (reference: string) => void; isFocusMode: boolean; onToggleFocusMode: () => void;
}) => <div><button onClick={() => onSelectPassageForStudy('JHN 3:16')}>Study selection</button><button onClick={onToggleFocusMode}>Focus reader</button><span>{isFocusMode ? 'Reader focused' : 'Reader normal'}</span></div> }));
vi.mock('../features/studies/study-view', () => ({ StudyView: ({ initialReference }: { initialReference: string }) => <div>Study screen: {initialReference}</div> }));
vi.mock('../features/sources/sources-view', () => ({ SourcesView: () => <div>Sources screen</div> }));
vi.mock('../features/workspace/history-view', () => ({ HistoryView: ({ onOpenStudy }: { onOpenStudy: (reference: string) => void }) => <div>Workspace screen<button onClick={() => onOpenStudy('ROM 8:28')}>Open saved study</button></div> }));
vi.mock('../features/assistant/context-panel', () => ({ ContextPanel: () => <div>Assistant panel</div> }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('navigates the real application shell, selected passage, focus and contextual panel', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  render(<App />);
  fireEvent.click(screen.getByText('Study selection'));
  expect(screen.getByText('Study screen: JHN 3:16')).toBeInTheDocument();
  expect(screen.queryByText('Study selection')).not.toBeInTheDocument();
  expect(screen.queryByText('Workspace screen')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Fontes Históricas' }));
  expect(screen.getByText('Sources screen')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  expect(screen.getByText('Workspace screen')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Open saved study'));
  expect(screen.getByText('Study screen: ROM 8:28')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Bíblia' }));
  fireEvent.click(screen.getByText('Focus reader'));
  expect(screen.getByText('Reader focused')).toBeInTheDocument();
  expect(screen.queryByText('Assistant panel')).not.toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.getByText('Reader normal')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Abrir Painel Contextual de IA' }));
  expect(screen.queryByText('Assistant panel')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Abrir Painel Contextual de IA' }));
  expect(screen.getByText('Assistant panel')).toBeInTheDocument();
});
it('starts the study tab with the documented default passage', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Estudo Estruturado' }));
  expect(screen.getByText('Study screen: GEN 1:1-3')).toBeInTheDocument();
});
