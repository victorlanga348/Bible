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
  const [activeStudyId, setActiveStudyId] = useState<string | null>(null);
  const [isContextOpen, setIsContextOpen] = useState<boolean>(true);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  const handleStudyPassage = useCallback((refStr: string) => {
    setActiveStudyReference(refStr);
    setActiveStudyId(null);
    setActiveTab('study');
  }, []);

  const handleOpenStudy = useCallback((studyItem: unknown) => {
    if (typeof studyItem === 'string') {
      setActiveStudyReference(studyItem);
      setActiveStudyId(null);
    } else if (studyItem && typeof studyItem === 'object' && 'id' in studyItem && 'version' in studyItem) {
      const item = studyItem as { id: string; version: number; reference?: { normalized?: string } };
      if (item.reference?.normalized) {
        setActiveStudyReference(item.reference.normalized);
      }
      setActiveStudyId(item.id);
      setActiveStudy({ id: item.id, version: item.version });
    }
    setActiveTab('study');
  }, []);

  const handleStudyChange = useCallback((s: import('./shared/api/contracts').StudyViewDto | null) => {
    if (s) {
      setActiveStudy({ id: s.id, version: s.version });
      setActiveStudyId(s.id);
    } else {
      setActiveStudy(null);
      setActiveStudyId(null);
    }
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
        />
      }
    >
      {activeTab === 'reader' && (
        <ReaderView
          onSelectPassageForStudy={handleStudyPassage}
          isFocusMode={isFocusMode}
          onToggleFocusMode={toggleFocusMode}
        />
      )}
      {activeTab === 'study' && (
        <StudyView
          initialReference={activeStudyReference}
          activeStudyId={activeStudyId || undefined}
          onStudyChange={handleStudyChange}
        />
      )}
      {activeTab === 'sources' && <SourcesView />}
      {activeTab === 'history' && (
        <HistoryView onOpenStudy={handleOpenStudy} />
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
