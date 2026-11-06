import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from '../App';
import type { StudyViewDto, WorkspaceStudyItemDto } from '../shared/api/contracts';
import { secondStudyId, studyFixture, studyId } from './workflow-fixtures';

// View probes verify application navigation/props, not underlying business integration.
vi.mock('../features/canon/reader-view', () => ({ ReaderView: ({ onSelectPassageForStudy, isFocusMode, onToggleFocusMode, targetReference }: {
  onSelectPassageForStudy: (reference: string) => void; isFocusMode: boolean; onToggleFocusMode: () => void; targetReference?: string;
}) => <div><p data-testid="reader-target">{targetReference}</p><button onClick={() => onSelectPassageForStudy('JHN 3:16')}>Study selection</button><button onClick={onToggleFocusMode}>Focus reader</button><span>{isFocusMode ? 'Reader focused' : 'Reader normal'}</span></div> }));
vi.mock('../features/studies/study-view', () => ({ StudyView: ({ initialReference, activeStudyId, onStudyChange }: { initialReference: string; activeStudyId?: string; onStudyChange: (study: StudyViewDto | null) => void }) => <div>Study screen: {initialReference}<p data-testid="selected-study">{activeStudyId ?? 'none'}</p><button onClick={() => onStudyChange(studyFixture())}>Report saved study</button><button onClick={() => onStudyChange(null)}>Clear loaded study</button></div> }));
vi.mock('../features/sources/sources-view', () => ({ SourcesView: () => <div>Sources screen</div> }));
vi.mock('../features/workspace/history-view', () => ({ HistoryView: ({ onOpenStudy, onStudyDeleted }: { onOpenStudy: (study: WorkspaceStudyItemDto | string) => void; onStudyDeleted: (id: string) => void }) => <div>Workspace screen<button onClick={() => onOpenStudy('ROM 8:28')}>Open saved study</button><button onClick={() => onOpenStudy(studyFixture())}>Open saved identity</button><button onClick={() => onOpenStudy(studyFixture({ id: secondStudyId }))}>Open other identity</button><button onClick={() => onStudyDeleted(secondStudyId)}>Delete other identity</button><button onClick={() => onStudyDeleted(studyId)}>Delete saved identity</button></div> }));
vi.mock('../features/assistant/context-panel', () => ({ ContextPanel: ({ onNavigateToPassage, activeStudyId, activeReference }: { onNavigateToPassage: (reference: string) => void; activeStudyId?: string; activeReference: string }) => <div>Assistant panel<p data-testid="assistant-identity">{activeStudyId ?? 'none'}</p><p data-testid="assistant-reference">{activeReference}</p><button onClick={() => onNavigateToPassage('JHN 3:16')}>Open cross reference</button></div> }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('passes the selected cross reference to the reader instead of merely switching tabs', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  render(<App />); fireEvent.click(screen.getByText('Open cross reference'));
  expect(screen.getByTestId('reader-target')).toHaveTextContent('JHN 3:16');
  expect(screen.getByText('Assistant panel')).toBeInTheDocument();
});
it('closes the mobile contextual drawer when navigating to a related passage', () => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query === '(max-width: 1023px)' })));
  render(<App />); fireEvent.click(screen.getByRole('button', { name: 'Abrir Painel Contextual de IA' }));
  fireEvent.click(screen.getByText('Open cross reference'));
  expect(screen.getByTestId('reader-target')).toHaveTextContent('JHN 3:16');
  expect(screen.queryByText('Assistant panel')).not.toBeInTheDocument();
});
it('navigates the real application shell, selected passage, focus and contextual panel', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  render(<App />);
  expect(screen.queryByText(/Study screen:/)).not.toBeInTheDocument();
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
it('clears prior identity when reopening by reference and when switching to another saved study', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  fireEvent.click(screen.getByText('Open saved identity'));
  expect(screen.getByText('Study screen: GEN 1:1')).toBeInTheDocument();
  expect(screen.getByTestId('selected-study')).toHaveTextContent(studyId);
  fireEvent.click(screen.getByText('Report saved study'));
  expect(screen.getByTestId('assistant-identity')).toHaveTextContent(studyId);
  fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  fireEvent.click(screen.getByText('Open other identity'));
  expect(screen.getByTestId('selected-study')).toHaveTextContent(secondStudyId);
  expect(screen.getByTestId('assistant-identity')).toHaveTextContent('none');
  fireEvent.click(screen.getByText('Report saved study'));
  fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  fireEvent.click(screen.getByText('Open saved study'));
  expect(screen.getByTestId('selected-study')).toHaveTextContent('none');
  expect(screen.getByTestId('assistant-identity')).toHaveTextContent('none');
});
it('updates the assistant reference from the loaded study and preserves it when another study is deleted', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  render(<App />); fireEvent.click(screen.getByText('Study selection'));
  fireEvent.click(screen.getByText('Report saved study'));
  expect(screen.getByTestId('assistant-reference')).toHaveTextContent(/^GEN 1:1$/);
  expect(screen.getByTestId('assistant-identity')).toHaveTextContent(studyId);
  fireEvent.click(screen.getByRole('button', { name: 'Histórico & Workspace' }));
  fireEvent.click(screen.getByText('Delete other identity'));
  expect(screen.getByTestId('assistant-identity')).toHaveTextContent(studyId);
  fireEvent.click(screen.getByText('Delete saved identity'));
  expect(screen.getByTestId('assistant-identity')).toHaveTextContent('none');
  fireEvent.click(screen.getByRole('button', { name: 'Estudo Estruturado' }));
  expect(screen.getByTestId('selected-study')).toHaveTextContent('none');
});
