import { useEffect, useRef, useState } from 'react';
import { useAppendConversationTurn, useConversation, useCreateConversation, useDeleteConversation, useStudyConversations } from '../../shared/api/hooks';
import { useCursorPages } from '../../shared/hooks/use-cursor-pages';
import { CursorControls } from '../../shared/ui/cursor-controls';
import { Button } from '../../shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import { useToast } from '../../shared/ui/toast';
import { ApiError } from '../../shared/api/http-client';

export function ConversationPanel({ studyId, studyVersion }: { studyId: string; studyVersion: number }) {
  const pages = useCursorPages();
  const list = useStudyConversations(studyId, pages.cursor);
  const [selected, setSelected] = useState<string>();
  const detail = useConversation(selected);
  const create = useCreateConversation();
  const append = useAppendConversationTurn();
  const remove = useDeleteConversation();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pending = useRef<AbortController | null>(null);
  const { toast } = useToast();
  useEffect(() => () => { pending.current?.abort(); pending.current = null; }, []);
  const bytes = new TextEncoder().encode(draft.trim()).byteLength;

  function cancel() {
    pending.current?.abort(); pending.current = null; setBusy(false);
  }
  function select(id: string) {
    cancel(); setSelected(id); setDraft(''); setConflict(false); setError('');
  }
  async function run(kind: 'create' | 'append') {
    if (pending.current || (kind === 'append' && (!detail.data || !bytes || bytes > 500 || conflict || detail.data.revision >= 20))) return;
    const controller = new AbortController(); pending.current = controller; setBusy(true); setError('');
    try {
      const result = kind === 'create'
        ? await create.mutateAsync({ studyId, studyVersion, signal: controller.signal })
        : await append.mutateAsync({ conversationId: detail.data!.id, expectedRevision: detail.data!.revision, question: draft.trim(), signal: controller.signal });
      if (controller.signal.aborted || pending.current !== controller) return;
      setSelected(result.id); setDraft(''); setConflict(false);
      toast(kind === 'create' ? 'Conversa criada.' : 'Turno guardado.', { type: 'success' });
    } catch (failure) {
      if (controller.signal.aborted || pending.current !== controller) return;
      if (failure instanceof ApiError && failure.status === 409) setConflict(true);
      setError(failure instanceof Error ? failure.message : 'Não foi possível concluir a operação. Tente novamente.');
    } finally {
      if (pending.current === controller) { pending.current = null; setBusy(false); }
    }
  }
  async function reload() {
    const result = await detail.refetch();
    if (!result.isError) { setConflict(false); setError(''); }
  }
  async function deleteSelected() {
    if (!selected || remove.isPending) return;
    try {
      await remove.mutateAsync(selected); setSelected(undefined); setConfirmDelete(false); setDraft('');
      toast('Conversa eliminada.', { type: 'success' });
    } catch { setError('Não foi possível eliminar a conversa. Tente novamente.'); }
  }
  return <section aria-label="Conversas guardadas" className="space-y-[0.75rem] border-t border-[var(--border)] pt-[1rem] font-ui text-[0.8rem]">
    <h3 className="font-semibold">Conversas guardadas</h3>
    <p className="text-[var(--foreground-muted)]">Retome perguntas do estudo. Uma conversa conserva a versão em que foi criada.</p>
    <Button size="sm" variant="outline" onClick={() => void run('create')} disabled={busy || remove.isPending}>Nova conversa</Button>
    {list.isLoading && <p role="status">A carregar conversas…</p>}
    {list.error && <p role="alert">Não foi possível listar as conversas. <Button size="sm" onClick={() => void list.refetch()}>Recarregar conversas</Button></p>}
    {list.data?.items.map((item, index) => <div key={item.id}><Button variant="ghost" size="sm" aria-pressed={selected === item.id} disabled={remove.isPending} onClick={() => select(item.id)}>Abrir conversa {index + 1} (v{item.studyVersion}, {item.revision} turnos)</Button></div>)}
    {list.data?.items.length === 0 && <p>Ainda não há conversas guardadas.</p>}
    <CursorControls pages={pages} nextCursor={list.data?.nextCursor} busy={list.isFetching || remove.isPending} />
    {selected && <div className="space-y-[0.75rem]">
      {detail.isLoading && <p role="status">A carregar a conversa…</p>}
      {detail.error && <p role="alert">Não foi possível abrir a conversa. <Button size="sm" onClick={() => void reload()}>Carregar conversa atual</Button></p>}
      {detail.data && <>
        <p>Conversa da versão {detail.data.studyVersion} · {detail.data.revision}/20 turnos</p>
        {detail.data.turns.map(turn => <article key={turn.number} className="border-b border-[var(--border)] py-[0.75rem] space-y-[0.5rem] break-words">
          <p className="font-medium">{turn.question}</p>
          {turn.responseStatus === 'unavailable' || !turn.analysis ? <p>Resposta indisponível. O registo da pergunta foi preservado.</p> : <>
            <p>{turn.analysis.status === 'supported' ? 'Evidência documentada' : turn.analysis.status === 'restricted' ? 'Fonte restrita' : 'Evidência insuficiente'}</p>
            {turn.analysis.evidence.map(evidence => <div key={`${evidence.excerptId}:${evidence.startOffset}`}><blockquote className="font-serif italic">{evidence.quote}</blockquote><p>{evidence.attribution} · {evidence.locator}</p><a href={evidence.rightsUrl} target="_blank" rel="noreferrer">{evidence.rightsStatement}</a></div>)}
            {turn.analysis.limitations.map((limitation, index) => <p key={index}>{limitation}</p>)}
          </>}
        </article>)}
        {detail.data.revision >= 20 ? <p role="status">Limite de 20 turnos atingido. Crie uma nova conversa para continuar.</p> : <form onSubmit={event => { event.preventDefault(); void run('append'); }} className="space-y-[0.5rem]">
          <label htmlFor="conversation-question">Pergunta na conversa</label>
          <textarea id="conversation-question" value={draft} onChange={event => setDraft(event.target.value)} disabled={busy || remove.isPending} aria-describedby="conversation-question-limit" className="w-full min-h-[4rem] p-[0.5rem] border border-[var(--border)] bg-[var(--surface)] rounded-[var(--radius-sm)]" />
          <p id="conversation-question-limit">{bytes}/500 bytes UTF-8</p>
          <Button type="submit" size="sm" disabled={!bytes || bytes > 500 || conflict || busy || remove.isPending}>Enviar na conversa</Button>
        </form>}
        <Button size="sm" variant="ghost" disabled={busy || remove.isPending} onClick={() => setConfirmDelete(true)}>Eliminar conversa</Button>
      </>}
    </div>}
    {busy && <Button size="sm" variant="outline" onClick={() => { cancel(); toast('Pedido cancelado. Recarregue as conversas para consultar o que ficou guardado.', { type: 'info' }); }}>Cancelar resposta da conversa</Button>}
    {error && <p role="alert">{error}</p>}
    {conflict && <div role="alert"><p>A conversa foi alterada. A pergunta foi preservada; carregue a revisão atual antes de voltar a enviar.</p><Button size="sm" onClick={() => void reload()}>Carregar conversa atual</Button></div>}
    <Dialog open={confirmDelete} onOpenChange={open => { if (!remove.isPending) setConfirmDelete(open); }}>
      <DialogContent><DialogHeader><DialogTitle>Eliminar conversa</DialogTitle><DialogDescription>A conversa, os turnos e as análises desses turnos serão eliminados definitivamente. Outras análises independentes permanecem guardadas.</DialogDescription></DialogHeader><DialogFooter><Button variant="ghost" disabled={remove.isPending} onClick={() => setConfirmDelete(false)}>Cancelar</Button><Button variant="destructive" loading={remove.isPending} onClick={() => void deleteSelected()}>Confirmar eliminação da conversa</Button></DialogFooter></DialogContent>
    </Dialog>
  </section>;
}
