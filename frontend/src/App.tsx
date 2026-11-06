import { useCallback, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from './shared/api/query-client';
import { ThemeProvider } from './shared/hooks/use-theme';
import { ToastProvider } from './shared/ui/toast';
import { SessionProvider, useSession } from './shared/hooks/use-session';
import { AccountAccessProvider, AppShell, type NavTab } from './shared/ui/shell';
import { ReaderView } from './features/canon/reader-view';
import { StudyView } from './features/studies/study-view';
import { SourcesView } from './features/sources/sources-view';
import { HistoryView } from './features/workspace/history-view';
import { ContextPanel } from './features/assistant/context-panel';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('reader');
  const [activeStudyReference, setActiveStudyReference] = useState<string>('GEN 1:1-3');
  const [activeStudy, setActiveStudy] = useState<{ id: string; version: number } | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<{ id: string; version: number } | null>(null);
  const [readerTarget, setReaderTarget] = useState<string>();
  const [isContextOpen, setIsContextOpen] = useState(() => !window.matchMedia('(max-width: 1023px)').matches);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  const handleStudyPassage = useCallback((refStr: string) => {
    setActiveStudyReference(refStr);
    setActiveStudy(null);
    setSelectedStudy(null);
    setActiveTab('study');
  }, []);

  const handleOpenStudy = useCallback((studyItem: import('./shared/api/contracts').WorkspaceStudyItemDto | string) => {
    if (typeof studyItem === 'string') {
      setActiveStudyReference(studyItem);
      setActiveStudy(null);
      setSelectedStudy(null);
    } else {
      setActiveStudyReference(studyItem.reference.normalized);
      setSelectedStudy({ id: studyItem.id, version: studyItem.version });
      setActiveStudy(null);
    }
    setActiveTab('study');
  }, []);

  const handleStudyChange = useCallback((s: import('./shared/api/contracts').StudyViewDto | null) => {
    if (!s) { setActiveStudy(null); return; }
    setActiveStudy({ id: s.id, version: s.version });
    setSelectedStudy({ id: s.id, version: s.version });
    if (s.reference?.normalized) {
      setActiveStudyReference(s.reference.normalized);
    }
  }, []);

  const handleNavigatePassage = useCallback((refStr: string) => {
    setReaderTarget(refStr);
    if (window.matchMedia('(max-width: 1023px)').matches) setIsContextOpen(false);
    setActiveTab('reader');
  }, []);

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, []);

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isContextOpen={isContextOpen}
      onToggleContext={() => setIsContextOpen(!isContextOpen)}
      isFocusMode={isFocusMode}
      onToggleFocusMode={toggleFocusMode}
      contextPanel={
        <ContextPanel
          activeStudyId={activeStudy?.id}
          activeStudyVersion={activeStudy?.version}
          activeReference={activeStudyReference}
          onNavigateToPassage={handleNavigatePassage}
        />
      }
    >
      {activeTab === 'reader' && (
        <ReaderView
          targetReference={readerTarget}
          onSelectPassageForStudy={handleStudyPassage}
          isFocusMode={isFocusMode}
          onToggleFocusMode={toggleFocusMode}
        />
      )}
      {activeTab === 'study' && (
        <StudyView
          key={selectedStudy?.id ?? activeStudyReference}
          initialReference={activeStudyReference}
          activeStudyId={selectedStudy?.id}
          activeStudyVersion={selectedStudy?.version}
          onStudyChange={handleStudyChange}
        />
      )}
      {activeTab === 'sources' && <SourcesView />}
      {activeTab === 'history' && (
        <HistoryView onOpenStudy={handleOpenStudy} onStudyDeleted={id => {
          if (selectedStudy?.id === id) { setActiveStudy(null); setSelectedStudy(null); }
        }} />
      )}
    </AppShell>
  );
}

function SessionGeneration() {
  const [client] = useState(createQueryClient);
  useEffect(() => () => { void client.cancelQueries(); client.clear(); }, [client]);
  return <QueryClientProvider client={client}>
    <ToastProvider><AppContent /></ToastProvider>
  </QueryClientProvider>;
}

function SessionContent() {
  const { version } = useSession();
  return <SessionGeneration key={version} />;
}

export function App() {
  return (
    <ThemeProvider>
      <SessionProvider><AccountAccessProvider><SessionContent /></AccountAccessProvider></SessionProvider>
    </ThemeProvider>
  );
}

export default App;
