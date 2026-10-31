import { useState } from 'react';
import {
  useWorkspaceStudies,
  useWorkspaceNotes,
  useCreateNote,
  useReviseNote,
  useDeleteNote,
  useWorkspaceFavorites,
  useToggleFavorite,
  useDeleteStudy,
} from '../../shared/api/hooks';
import { useSession } from '../../shared/hooks/use-session';
import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { Skeleton } from '../../shared/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../shared/ui/dialog';
import {
  Clock,
  BookOpen,
  KeyRound,
  Star,
  FileText,
  Trash2,
  Edit3,
  Plus,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '../../shared/ui/toast';
import type { WorkspaceNoteDto, WorkspaceStudyItemDto } from '../../shared/api/contracts';
import { ApiError } from '../../shared/api/http-client';

interface HistoryViewProps {
  onOpenStudy?: (id: string, version: number, reference: string) => void;
  initialStudy?: WorkspaceStudyItemDto;
  initialTab?: 'studies' | 'notes' | 'favorites';
  onDeleteStudy?: (id: string) => void;
}

export function HistoryView({ onOpenStudy, initialStudy, initialTab = 'studies', onDeleteStudy }: HistoryViewProps) {
  const { isAuthenticated } = useSession();
  const { toast } = useToast();
  const [workspaceTab, setWorkspaceTab] = useState<'studies' | 'notes' | 'favorites'>(initialTab);
  const [studyCursors, setStudyCursors] = useState<(string | null)[]>([null]);
  const [studyPage, setStudyPage] = useState(0);
  const [favoriteCursors, setFavoriteCursors] = useState<(string | null)[]>([null]);
  const [favoritePage, setFavoritePage] = useState(0);

  // Seleção de estudo para exibição de notas
  const [selectedStudy, setSelectedStudy] = useState<WorkspaceStudyItemDto | null>(initialStudy ?? null);
  const selectedStudyId = selectedStudy?.id ?? null;
  const selectedStudyVersion = selectedStudy?.version;
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<WorkspaceNoteDto | null>(null);
  const [editContent, setEditContent] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [studyToDelete, setStudyToDelete] = useState<WorkspaceStudyItemDto | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [revisionConflict, setRevisionConflict] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Queries e Mutações
  const { data: studiesPage, isLoading: loadingStudies, error: studiesError } = useWorkspaceStudies(studyCursors[studyPage]);
  const { data: favoritesPage, isLoading: loadingFavorites, error: favoritesError } = useWorkspaceFavorites(favoriteCursors[favoritePage]);
  const { data: notesPage, isLoading: loadingNotes, error: notesError, refetch: refetchNotes } = useWorkspaceNotes(selectedStudyId || '', selectedStudyVersion);

  const createNoteMutation = useCreateNote();
  const reviseNoteMutation = useReviseNote();
  const deleteNoteMutation = useDeleteNote();
  const toggleFavoriteMutation = useToggleFavorite();
  const deleteStudyMutation = useDeleteStudy();

  const studies = studiesPage?.items || [];
  const favorites = favoritesPage?.items || [];
  const notes = notesPage?.items || [];
  const studyChoices = selectedStudy && !studies.some(item => item.id === selectedStudy.id && item.version === selectedStudy.version)
    ? [selectedStudy, ...studies] : studies;

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudyId || !selectedStudyVersion || !newNoteContent.trim()) return;

    try {
      await createNoteMutation.mutateAsync({
        studyId: selectedStudyId,
        studyVersion: selectedStudyVersion,
        content: newNoteContent.trim(),
      });
      setNewNoteContent('');
      toast('Anotação adicionada ao estudo.', { type: 'success' });
    } catch (err: unknown) {
      toast('Erro ao criar anotação', {
        description: err instanceof Error ? err.message : 'Falha na persistência da nota.',
        type: 'error',
      });
    }
  };

  const handleSaveRevision = async () => {
    if (!editingNote || !editContent.trim()) return;

    setEditError(null); setRevisionConflict(false);
    try {
      await reviseNoteMutation.mutateAsync({
        noteId: editingNote.id,
        expectedRevision: editingNote.revision,
        content: editContent.trim(),
      });
      setEditingNote(null);
      toast('Revisão da anotação guardada.', { type: 'success' });
    } catch (err: unknown) {
      setRevisionConflict(err instanceof ApiError && err.status === 409);
      setEditError(err instanceof Error ? err.message : 'Não foi possível guardar esta revisão. Tenta novamente.');
    }
  };

  const handleReloadNote = async () => {
    const page = await refetchNotes();
    const current = page.data?.items.find(note => note.id === editingNote?.id);
    if (!current) { setEditError('Não foi possível carregar a nota atual. O teu rascunho foi conservado.'); return; }
    setEditingNote(current); setEditContent(current.content); setEditError(null); setRevisionConflict(false);
  };
  const handleDeleteStudy = async () => {
    if (!studyToDelete) return;
    setDeleteError(null);
    try {
      await deleteStudyMutation.mutateAsync(studyToDelete.id);
      if (selectedStudyId === studyToDelete.id) { setSelectedStudy(null); setNewNoteContent(''); }
      onDeleteStudy?.(studyToDelete.id); setStudyToDelete(null);
      toast('Estudo e dados associados eliminados.', { type: 'success' });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Não foi possível concluir a eliminação. Volta a tentar.');
    }
  };

  const handleConfirmDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNoteMutation.mutateAsync(noteToDelete);
      setNoteToDelete(null);
      toast('Anotação eliminada com sucesso.', { type: 'info' });
    } catch (err: unknown) {
      toast('Erro ao eliminar anotação', {
        description: err instanceof Error ? err.message : 'Falha ao remover a nota.',
        type: 'error',
      });
    }
  };

  const handleToggleFavorite = async (studyId: string, version: number, isFav: boolean) => {
    try {
      await toggleFavoriteMutation.mutateAsync({
        studyId,
        studyVersion: version,
        isFavorite: isFav,
      });
      toast(isFav ? 'Removido dos favoritos.' : 'Adicionado aos favoritos.', { type: 'success' });
    } catch (err: unknown) {
      toast('Erro ao atualizar favorito', {
        description: err instanceof Error ? err.message : 'Falha no servidor.',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex flex-col h-full max-w-[min(100%,76ch)] mx-auto px-[1.25rem] py-[1.5rem] space-y-[1.5rem]">
      {/* Cabeçalho */}
      <div className="pb-[1.5rem] border-b border-[var(--border)] space-y-[0.75rem]">
        <div className="space-y-[0.25rem]">
          <h1 className="font-editorial-heading font-semibold text-[clamp(1.5rem,1.35rem+0.8vw,2.2rem)] text-[var(--foreground)]">
            Espaço de Estudo & Workspace
          </h1>
          <p className="text-[0.85rem] text-[var(--foreground-muted)] font-ui">
            Histórico de investigação, anotações atômicas com CAS e favoritos por versão.
          </p>
        </div>

        {/* Abas do Workspace */}
        <div className="flex gap-[0.5rem] pt-[0.5rem]">
          <button
            onClick={() => setWorkspaceTab('studies')}
            className={`flex items-center gap-[0.35rem] px-[0.75rem] py-[0.35rem] rounded-[var(--radius-md)] text-[0.825rem] font-ui font-medium cursor-pointer transition-colors ${
              workspaceTab === 'studies'
                ? 'bg-[var(--surface-muted)] text-[var(--foreground)] font-semibold shadow-xs'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <Clock className="w-[0.9rem] h-[0.9rem]" />
            Estudos Recentes ({studies.length})
          </button>
          <button
            onClick={() => setWorkspaceTab('notes')}
            className={`flex items-center gap-[0.35rem] px-[0.75rem] py-[0.35rem] rounded-[var(--radius-md)] text-[0.825rem] font-ui font-medium cursor-pointer transition-colors ${
              workspaceTab === 'notes'
                ? 'bg-[var(--surface-muted)] text-[var(--foreground)] font-semibold shadow-xs'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <FileText className="w-[0.9rem] h-[0.9rem]" />
            Anotações Pessoais
          </button>
          <button
            onClick={() => setWorkspaceTab('favorites')}
            className={`flex items-center gap-[0.35rem] px-[0.75rem] py-[0.35rem] rounded-[var(--radius-md)] text-[0.825rem] font-ui font-medium cursor-pointer transition-colors ${
              workspaceTab === 'favorites'
                ? 'bg-[var(--surface-muted)] text-[var(--foreground)] font-semibold shadow-xs'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <Star className="w-[0.9rem] h-[0.9rem]" />
            Favoritos ({favorites.length})
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 space-y-[1.25rem]">
        {!isAuthenticated ? (
          <div className="p-[2.5rem] text-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] space-y-[1rem] my-[2rem]">
            <KeyRound className="w-[2.5rem] h-[2.5rem] mx-auto text-[var(--accent)] opacity-80" />
            <div className="space-y-[0.35rem]">
              <h3 className="font-editorial-heading text-[1.2rem] font-semibold text-[var(--foreground)]">
                Workspace Protegido
              </h3>
              <p className="text-[0.85rem] text-[var(--foreground-muted)] font-ui max-w-[42ch] mx-auto leading-relaxed">
                Insira o token JWT de operador na barra lateral para carregar os estudos e anotações gravados no banco de dados.
              </p>
            </div>
          </div>
        ) : workspaceTab === 'studies' ? (
          <div>
            {loadingStudies ? (
              <div className="space-y-[1rem]">
                <Skeleton className="w-full h-[5rem]" />
                <Skeleton className="w-full h-[5rem]" />
              </div>
            ) : studiesError ? (
              <div className="p-[1.5rem] rounded-[var(--radius-md)] border border-rose-900/30 bg-rose-950/10 text-rose-300">
                {studiesError instanceof Error ? studiesError.message : 'Falha ao carregar estudos.'}
              </div>
            ) : studies.length === 0 ? (
              <div className="text-center py-[4rem] text-[var(--foreground-muted)] font-ui space-y-[0.75rem]">
                <Clock className="w-[3rem] h-[3rem] mx-auto opacity-40" />
                <p>Nenhum estudo persistido ainda no workspace.</p>
              </div>
            ) : (
              <div className="space-y-[0.75rem]">
                {studies.map((item) => {
                  const isFav = favorites.some((f) => f.studyId === item.id && f.studyVersion === item.version);
                  return (
                    <article
                      key={item.id}
                      className="p-[1.25rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-[1rem] transition-colors hover:border-[var(--accent)]/60"
                    >
                      <div className="space-y-[0.35rem]">
                        <div className="flex items-center gap-[0.5rem]">
                          <BookOpen className="w-[1rem] h-[1rem] text-[var(--accent)]" />
                          <span className="font-editorial-heading font-semibold text-[1.15rem] text-[var(--foreground)]">
                            {item.reference.normalized}
                          </span>
                          <Badge classification="neutral">v{item.version}</Badge>
                        </div>
                        <p className="text-[0.75rem] text-[var(--foreground-muted)] font-ui">
                          Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-[0.5rem]">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFavorite(item.id, item.version, isFav)}
                          title={isFav ? 'Remover favorito' : 'Marcar favorito'}
                        >
                          <Star className={`w-[1rem] h-[1rem] ${isFav ? 'fill-amber-400 text-amber-400' : 'text-[var(--foreground-muted)]'}`} />
                        </Button>

                        {onOpenStudy && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenStudy(item.id, item.version, item.reference.normalized)}
                          >
                            Abrir
                            <ChevronRight className="w-[0.85rem] h-[0.85rem]" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" aria-label={`Eliminar estudo ${item.reference.normalized} versão ${item.version}`}
                          onClick={() => { setDeleteError(null); setStudyToDelete(item); }}><Trash2 className="w-[0.9rem] h-[0.9rem]" /></Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between gap-[0.75rem]">
              <Button variant="secondary" disabled={studyPage === 0 || loadingStudies} onClick={() => setStudyPage(page => page - 1)}>Estudos anteriores</Button>
              <Button variant="secondary" disabled={!studiesPage?.nextCursor || loadingStudies} onClick={() => {
                if (studiesPage?.nextCursor) { setStudyCursors(values => [...values.slice(0, studyPage + 1), studiesPage.nextCursor]); setStudyPage(page => page + 1); }
              }}>Estudos seguintes</Button>
            </div>
          </div>
        ) : workspaceTab === 'notes' ? (
          <div className="space-y-[1.5rem]">
            {/* Seletor do Estudo Ativo para Vincular Notas */}
            <div className="space-y-[0.5rem]">
              <label htmlFor="note-study-selection" className="text-[0.8rem] font-medium text-[var(--foreground)] font-ui">
                Selecione o Estudo para Consultar ou Criar Notas:
              </label>
              <select
                id="note-study-selection"
                value={selectedStudy ? `${selectedStudy.id}:${selectedStudy.version}` : ''}
                onChange={(e) => {
                  setSelectedStudy(studyChoices.find(item => `${item.id}:${item.version}` === e.target.value) ?? null);
                  setNewNoteContent(''); setEditingNote(null); setNoteToDelete(null);
                }}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-[0.75rem] py-[0.5rem] text-[0.85rem] font-ui text-[var(--foreground)] cursor-pointer"
              >
                <option value="">Selecione um estudo persistido...</option>
                {studyChoices.map((s) => (
                  <option key={`${s.id}:${s.version}`} value={`${s.id}:${s.version}`}>
                    {s.reference.normalized} (v{s.version})
                  </option>
                ))}
              </select>
            </div>

            {selectedStudyId ? (
              <div className="space-y-[1.5rem]">
                {/* Formulário de Criação de Nota */}
                <form onSubmit={handleCreateNote} className="space-y-[0.5rem]">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Escreva uma nova anotação hermenêutica para este estudo..."
                    disabled={createNoteMutation.isPending}
                    rows={3}
                    aria-label="Nova anotação"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-[0.75rem] text-[var(--foreground)] font-ui focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newNoteContent.trim()}
                      loading={createNoteMutation.isPending}
                    >
                      <Plus className="w-[0.9rem] h-[0.9rem]" />
                      Adicionar Nota
                    </Button>
                  </div>
                </form>

                {/* Lista de Notas do Estudo */}
                {notesError ? <p role="alert">{notesError.message}</p> : loadingNotes ? (
                  <div className="space-y-[0.5rem]">
                    <Skeleton className="w-full h-[4rem]" />
                    <Skeleton className="w-full h-[4rem]" />
                  </div>
                ) : notes.length === 0 ? (
                  <div className="p-[2rem] text-center border border-[var(--border)] rounded-[var(--radius-md)] text-[0.85rem] text-[var(--foreground-muted)] font-ui">
                    Nenhuma anotação associada a este estudo ainda.
                  </div>
                ) : (
                  <div className="space-y-[0.75rem]">
                    {notes.map((note) => (
                      <article
                        key={note.id}
                        className="p-[1rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] space-y-[0.5rem]"
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-[0.875rem] font-ui text-[var(--foreground)] leading-relaxed flex-1">
                            {note.content}
                          </p>
                          <div className="flex items-center gap-[0.25rem] shrink-0 ml-[0.5rem]">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingNote(note);
                                setEditContent(note.content);
                                setEditError(null); setRevisionConflict(false);
                              }}
                              title="Editar nota"
                            >
                              <Edit3 className="w-[0.85rem] h-[0.85rem]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setNoteToDelete(note.id)}
                              title="Eliminar Nota"
                              className="hover:text-rose-400"
                            >
                              <Trash2 className="w-[0.85rem] h-[0.85rem]" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[0.7rem] text-[var(--foreground-muted)] pt-[0.25rem] border-t border-[var(--border)]/60">
                          <span>Revisão r{note.revision} · estudo v{note.studyVersion}</span>
                          <span>Atualizado em {new Date(note.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-[2rem] text-center border border-[var(--border)] rounded-[var(--radius-md)] text-[0.85rem] text-[var(--foreground-muted)] font-ui">
                Selecione um estudo acima para visualizar e editar suas notas contextuais.
              </div>
            )}
          </div>
        ) : (
          /* Aba de Favoritos */
          <div className="space-y-[0.75rem]">
            {favoritesError ? <p role="alert">{favoritesError.message}</p> : loadingFavorites ? (
              <Skeleton className="w-full h-[4rem]" />
            ) : favorites.length === 0 ? (
              <div className="p-[3rem] text-center border border-[var(--border)] rounded-[var(--radius-md)] text-[0.85rem] text-[var(--foreground-muted)] font-ui space-y-[0.5rem]">
                <Star className="w-[2rem] h-[2rem] mx-auto opacity-30" />
                <p>Nenhum estudo marcado como favorito.</p>
              </div>
            ) : (
              <div className="space-y-[0.75rem]">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="p-[1rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-[0.5rem]">
                      <Star className="w-[1rem] h-[1rem] fill-amber-400 text-amber-400" />
                      <span className="font-ui font-medium text-[0.9rem] text-[var(--foreground)]">
                        {fav.reference.normalized} (v{fav.studyVersion})
                      </span>
                    </div>
                    {onOpenStudy && <Button variant="outline" size="sm" aria-label={`Abrir favorito ${fav.reference.normalized} versão ${fav.studyVersion}`}
                      onClick={() => onOpenStudy(fav.studyId, fav.studyVersion, fav.reference.normalized)}>Abrir</Button>}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(fav.studyId, fav.studyVersion, true)}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between gap-[0.75rem]">
              <Button variant="secondary" disabled={favoritePage === 0 || loadingFavorites} onClick={() => setFavoritePage(page => page - 1)}>Favoritos anteriores</Button>
              <Button variant="secondary" disabled={!favoritesPage?.nextCursor || loadingFavorites} onClick={() => {
                if (favoritesPage?.nextCursor) { setFavoriteCursors(values => [...values.slice(0, favoritePage + 1), favoritesPage.nextCursor]); setFavoritePage(page => page + 1); }
              }}>Favoritos seguintes</Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edição de Nota com CAS */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent>
          {editingNote && (
            <>
              <DialogHeader>
                <DialogTitle>Editar anotação · revisão {editingNote.revision}</DialogTitle>
                <DialogDescription>
                  A nota guardada só muda quando confirmares uma revisão atual.
                </DialogDescription>
              </DialogHeader>

              <div className="py-[0.5rem]">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Conteúdo revisado da anotação..."
                  aria-label="Conteúdo da anotação"
                  rows={4}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-[0.75rem] text-[var(--foreground)] font-ui focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
                {editError && <p role="alert">{editError}</p>}
                {revisionConflict && <Button variant="secondary" onClick={() => { void handleReloadNote(); }}>Carregar revisão atual</Button>}
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingNote(null)}>
                  Cancelar
                </Button>
                <Button loading={reviseNoteMutation.isPending} onClick={handleSaveRevision}>
                  Salvar Revisão
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Acessível de Confirmação para Eliminar Nota */}
      <Dialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-[0.5rem] text-rose-400">
              <AlertTriangle className="w-[1.25rem] h-[1.25rem]" />
              Confirmar Exclusão de Anotação
            </DialogTitle>
            <DialogDescription>
              A anotação será eliminada. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoteToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={deleteNoteMutation.isPending}
              onClick={handleConfirmDeleteNote}
            >
              Excluir Definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!studyToDelete} onOpenChange={open => { if (!open) setStudyToDelete(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar estudo?</DialogTitle><DialogDescription>
            O estudo, as notas, os favoritos e as conversas associadas serão eliminados. Esta ação não pode ser desfeita.
          </DialogDescription></DialogHeader>
          {deleteError && <p role="alert">{deleteError}</p>}
          <DialogFooter><Button variant="ghost" onClick={() => setStudyToDelete(null)}>Cancelar</Button>
            <Button variant="destructive" loading={deleteStudyMutation.isPending} onClick={() => { void handleDeleteStudy(); }}>Eliminar estudo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
