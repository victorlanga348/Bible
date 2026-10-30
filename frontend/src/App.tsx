import { useState } from 'react';
import { ThemeProvider } from './shared/hooks/use-theme';
import { ToastProvider } from './shared/ui/toast';
import { SessionProvider } from './shared/hooks/use-session';
import { AppShell, type NavTab } from './shared/ui/shell';
import { ReaderView } from './features/canon/reader-view';
import { StudyView } from './features/studies/study-view';
import { SourcesView } from './features/sources/sources-view';
import { HistoryView } from './features/workspace/history-view';
import { ContextPanel } from './features/assistant/context-panel';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('reader');
  const [activeStudyReference, setActiveStudyReference] = useState<string>('GEN 1:1-3');
  const [isContextOpen, setIsContextOpen] = useState<boolean>(true);

  const handleStudyPassage = (refStr: string) => {
    setActiveStudyReference(refStr);
    setActiveTab('study');
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isContextOpen={isContextOpen}
      onToggleContext={() => setIsContextOpen(!isContextOpen)}
      contextPanel={<ContextPanel />}
    >
      {activeTab === 'reader' && (
        <ReaderView onSelectPassageForStudy={handleStudyPassage} />
      )}
      {activeTab === 'study' && (
        <StudyView initialReference={activeStudyReference} />
      )}
      {activeTab === 'sources' && <SourcesView />}
      {activeTab === 'history' && (
        <HistoryView onOpenStudy={handleStudyPassage} />
      )}
    </AppShell>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;
