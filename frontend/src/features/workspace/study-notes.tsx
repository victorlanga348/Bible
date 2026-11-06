import { useState } from 'react';
import { useCreateNote, useWorkspaceNotes } from '../../shared/api/hooks';
import { Button } from '../../shared/ui/button';
import { useToast } from '../../shared/ui/toast';

export function StudyNotes({ studyId, studyVersion }: { studyId: string; studyVersion: number }) {
  const [draft, setDraft] = useState('');
  const notes = useWorkspaceNotes(studyId, studyVersion);
  const create = useCreateNote();
  const { toast } = useToast();
  const bytes = new TextEncoder().encode(draft.trim()).byteLength;
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!bytes || bytes > 8000 || create.isPending) return;
    try {
      await create.mutateAsync({ studyId, studyVersion, content: draft.trim() });
      setDraft(''); await notes.refetch();
      toast('Anotação guardada.', { type: 'success' });
    } catch (error) {
      toast('Não foi possível guardar a anotação.', { type: 'error', description: error instanceof Error ? error.message : 'Tente novamente.' });
    }
  }
  return <section aria-label={`Anotações do estudo, versão ${studyVersion}`} className="space-y-[1rem] font-ui text-[0.85rem]">
    <p className="text-[var(--foreground-muted)]">Notas pessoais da versão {studyVersion}. Não constituem evidência histórica.</p>
    {notes.isLoading && <p role="status">A carregar anotações…</p>}
    {notes.error && <p role="alert">Não foi possível carregar as anotações. <button onClick={() => void notes.refetch()}>Tentar novamente</button></p>}
    {notes.data?.items?.map(note => <article key={note.id} className="border-b border-[var(--border)] pb-[0.75rem] whitespace-pre-wrap break-words"><p>{note.content}</p><span className="text-[var(--foreground-muted)] text-[0.75rem]">Revisão {note.revision}</span></article>)}
    {!notes.isLoading && !notes.error && notes.data?.items?.length === 0 && <p>Ainda não há anotações nesta versão.</p>}
    <form onSubmit={event => void save(event)} className="space-y-[0.5rem]">
      <label htmlFor="context-note">Nova anotação</label>
      <textarea id="context-note" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Escreva uma anotação sobre este estudo" className="w-full min-h-[6rem] p-[0.75rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]" aria-describedby="context-note-limit" />
      <p id="context-note-limit" className="text-[0.75rem] text-[var(--foreground-muted)]">{bytes}/8000 bytes</p>
      <Button type="submit" size="sm" disabled={!bytes || bytes > 8000} loading={create.isPending}>Salvar anotação</Button>
    </form>
  </section>;
}
