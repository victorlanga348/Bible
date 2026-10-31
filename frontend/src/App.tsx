import { useEffect, useRef, useState } from 'react';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { createQueryClient } from './shared/api/query-client';
import { ThemeProvider } from './shared/hooks/use-theme';
import { ToastProvider, useToast } from './shared/ui/toast';
import { useCreateStudy, useReviseStudy, useStudy } from './shared/api/hooks';
import type { StudyViewDto } from './shared/api/contracts';
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
  const [createdStudy, setCreatedStudy] = useState<StudyViewDto | null>(null);
  const [studyTarget, setStudyTarget] = useState<{ id: string; version?: number } | null>(null);
  const [studyPending, setStudyPending] = useState(false);
  const [studyError, setStudyError] = useState<string | null>(null);
  const studyRequest = useRef<AbortController | null>(null);
  const studyGeneration = useRef(0);
  const { token, isAuthenticated } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createStudy = useCreateStudy();
  const reviseStudy = useReviseStudy();
  const storedStudy = useStudy(studyTarget?.id, studyTarget?.version);
  const activeStudy = createdStudy ?? storedStudy.data ?? null;
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [workspaceIntent, setWorkspaceIntent] = useState<'studies' | 'notes'>('studies');

  useEffect(() => () => { studyGeneration.current++; studyRequest.current?.abort(); }, []);

  const handleGenerateStudy = async (reference: string, revise = false) => {
    if (studyRequest.current || !reference.trim()) return;
    if (!isAuthenticated || !token) { toast('Entra na tua conta para criar um estudo.', { type: 'warning' }); return; }
    const previous = activeStudy;
    const generation = ++studyGeneration.current;
    const controller = new AbortController(); studyRequest.current = controller;
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]);
    setStudyError(null); setStudyPending(true); setActiveStudyReference(reference.trim());
    if (!revise) { setCreatedStudy(null); setStudyTarget(null); }
    try {
      const result = revise && previous
        ? await reviseStudy.mutateAsync({ id: previous.id, expectedVersion: previous.version, signal })
        : await createStudy.mutateAsync({ translationId: 'porbr2018', reference: reference.trim(), signal });
      if (generation !== studyGeneration.current) return;
      setStudyTarget(null); setCreatedStudy(result);
      toast(revise ? 'Nova versão guardada.' : `Estudo criado para ${result.reference.normalized}`, { type: 'success' });
    } catch (error) {
      if (generation !== studyGeneration.current) return;
      setStudyError(error instanceof Error ? error.message : 'Não foi possível guardar o estudo. Tenta novamente.');
    } finally {
      if (studyRequest.current === controller) studyRequest.current = null;
      if (generation === studyGeneration.current) setStudyPending(false);
    }
  };
  const handleStudyPassage = (reference: string) => {
    setActiveStudyReference(reference); setActiveTab('study');
    void handleGenerateStudy(reference);
  };
  const handleOpenStudy = (id: string, version: number, reference: string) => {
    studyRequest.current?.abort(); studyRequest.current = null; studyGeneration.current++;
    setStudyPending(false); setStudyError(null); setCreatedStudy(null);
    setStudyTarget({ id, version }); setActiveStudyReference(reference); setActiveTab('study');
  };

  const toggleFocusMode = () => {
    setIsFocusMode((prev) => !prev);
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={tab => { if (tab === 'history') setWorkspaceIntent('studies'); setActiveTab(tab); }}
      isFocusMode={isFocusMode}
      onToggleFocusMode={toggleFocusMode}
      contextPanel={
        <ContextPanel
          key={studyPending ? 'pending' : activeStudy ? `${activeStudy.id}:${activeStudy.version}` : 'none'}
          activeStudyId={studyPending ? undefined : activeStudy?.id}
          activeStudyVersion={activeStudy?.version}
          activeReference={studyPending ? undefined : activeStudy?.reference.normalized}
          onOpenNotes={() => { setWorkspaceIntent('notes'); setActiveTab('history'); }}
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
          key={`${studyTarget?.id ?? createdStudy?.id ?? 'draft'}:${activeStudy?.version ?? 'pending'}:${activeStudyReference}`}
          initialReference={activeStudyReference}
          study={activeStudy}
          isLoading={studyPending || storedStudy.isLoading}
          error={studyError ?? (storedStudy.error instanceof Error ? storedStudy.error.message : null)}
          onGenerate={reference => { void handleGenerateStudy(reference); }}
          onRevise={() => { if (activeStudy) void handleGenerateStudy(activeStudy.reference.normalized, true); }}
          onReload={() => {
            if (activeStudy) {
              void queryClient.invalidateQueries({ queryKey: ['studies', 'detail', activeStudy.id] });
              setCreatedStudy(null); setStudyTarget({ id: activeStudy.id });
            }
            else void storedStudy.refetch();
            setStudyError(null);
          }}
        />
      )}
      {activeTab === 'sources' && <SourcesView />}
      {activeTab === 'history' && (
        <HistoryView key={workspaceIntent} onOpenStudy={handleOpenStudy} initialTab={workspaceIntent} initialStudy={activeStudy ?? undefined}
          onDeleteStudy={id => {
            setCreatedStudy(current => current?.id === id ? null : current);
            setStudyTarget(current => current?.id === id ? null : current);
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
