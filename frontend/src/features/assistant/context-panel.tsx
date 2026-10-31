import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Link2, Loader2, Send, Sparkles, StopCircle } from 'lucide-react';
import { useAppendConversationTurn, useConversation, useCreateConversation, useDeleteConversation, useWorkspaceConversations } from '../../shared/api/hooks';
import { useSession } from '../../shared/hooks/use-session';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { useToast } from '../../shared/ui/toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import { CrossRefPanel } from '../cross-ref/cross-ref-panel';
import { AnalysisResult } from './analysis-result';

interface ContextPanelProps {
  activeStudyId?: string;
  activeStudyVersion?: number;
  activeReference?: string;
  onOpenNotes?: () => void;
}

export function ContextPanel(props: ContextPanelProps) {
  return <StudyContextPanel key={`${props.activeStudyId ?? 'none'}:${props.activeStudyVersion ?? 1}`} {...props} />;
}

function StudyContextPanel({ activeStudyId, activeStudyVersion = 1, activeReference, onOpenNotes }: ContextPanelProps) {
  const { isAuthenticated } = useSession();
  const { toast } = useToast();
  const [tab, setTab] = useState<'assistant' | 'notes' | 'links'>('assistant');
  const [question, setQuestion] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [page, setPage] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const running = useRef<AbortController | null>(null);
  const history = useWorkspaceConversations(activeStudyId, cursors[page]);
  const choices = (history.data?.items ?? []).filter(item => item.studyVersion === activeStudyVersion);
  const conversationId = selectedId ?? choices[0]?.id;
  const conversationQuery = useConversation(conversationId);
  const conversation = conversationQuery.data && conversationQuery.data.studyId === activeStudyId && conversationQuery.data.studyVersion === activeStudyVersion ? conversationQuery.data : null;
  const createConversation = useCreateConversation();
  const append = useAppendConversationTurn();
  const remove = useDeleteConversation();
  const loading = history.isLoading || conversationQuery.isLoading;
  const release = useCallback(() => { const controller = running.current; running.current = null; controller?.abort(); }, []);
  useEffect(() => release, [release]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || running.current || loading || (conversation?.revision ?? 0) >= 20) return;
    if (!isAuthenticated || !activeStudyId) { toast('Seleciona um estudo na tua conta antes de perguntar.', { type: 'warning' }); return; }
    if (new TextEncoder().encode(trimmed).byteLength > 500) { setError('A pergunta pode ter até 500 bytes UTF-8. Encurta-a e tenta novamente.'); return; }
    const controller = new AbortController(); running.current = controller;
    setPending(true); setError(null); setNotice(null);
    try {
      const current = conversation ?? await createConversation.mutateAsync({ studyId: activeStudyId, studyVersion: activeStudyVersion, signal: controller.signal });
      if (controller.signal.aborted || running.current !== controller) return;
      setSelectedId(current.id);
      await append.mutateAsync({ conversationId: current.id, expectedRevision: current.revision, question: trimmed, signal: controller.signal });
      if (controller.signal.aborted || running.current !== controller) return;
      setQuestion(''); toast('Resposta guardada na conversa.', { type: 'success' });
    } catch (failure) {
      if (controller.signal.aborted || running.current !== controller) return;
      if (failure instanceof Error && failure.name === 'AbortError') { setNotice('Pedido interrompido. Atualiza a conversa para confirmar o que ficou guardado.'); return; }
      setError(failure instanceof Error ? failure.message : 'Não foi possível obter a resposta. Tenta novamente.');
      toast('Erro no assistente de IA', { type: 'error' });
    } finally {
      if (running.current === controller) { running.current = null; setPending(false); }
    }
  };
  const handleNewConversation = async () => {
    if (running.current || !activeStudyId || !isAuthenticated) return;
    const controller = new AbortController(); running.current = controller;
    setPending(true); setError(null); setNotice(null);
    try {
      const created = await createConversation.mutateAsync({ studyId: activeStudyId, studyVersion: activeStudyVersion, signal: controller.signal });
      if (controller.signal.aborted || running.current !== controller) return;
      setSelectedId(created.id); setQuestion('');
    } catch (failure) {
      if (!controller.signal.aborted && running.current === controller) setError(failure instanceof Error ? failure.message : 'Não foi possível criar a conversa.');
    } finally { if (running.current === controller) { running.current = null; setPending(false); } }
  };
  const handleCancel = () => {
    if (!running.current) return;
    release(); setPending(false);
    setNotice('Pedido interrompido. Atualiza a conversa para confirmar o que ficou guardado.');
  };
  const handleDelete = async () => {
    if (!conversationId) return;
    setError(null);
    try { await remove.mutateAsync(conversationId); setSelectedId(null); setConfirmDelete(false); setQuestion(''); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível eliminar a conversa.'); }
  };
  const refresh = async () => { await Promise.all([history.refetch(), ...(conversationId ? [conversationQuery.refetch()] : [])]); setNotice(null); };

  return <div className="flex flex-col h-full p-[1.25rem] gap-[1.25rem]">
    <div className="flex border-b border-[var(--border)] pb-[0.5rem] gap-[0.5rem] text-[0.8rem]">
      <Button size="sm" variant="ghost" aria-pressed={tab === 'assistant'} onClick={() => setTab('assistant')}><Sparkles className="w-[0.85rem] h-[0.85rem]" />Assistente IA</Button>
      <Button size="sm" variant="ghost" aria-pressed={tab === 'notes'} onClick={() => setTab('notes')}><FileText className="w-[0.85rem] h-[0.85rem]" />Anotações</Button>
      <Button size="sm" variant="ghost" aria-pressed={tab === 'links'} onClick={() => setTab('links')}><Link2 className="w-[0.85rem] h-[0.85rem]" />Referências</Button>
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto space-y-[1rem]">
      {tab === 'assistant' && <div className="space-y-[1rem]">
        <p className="text-[0.75rem] leading-relaxed text-[var(--foreground-muted)]">Assistência local com fontes admitidas. O perfil atual seleciona até uma frase inglesa da fonte ou declara evidência insuficiente.</p>
        {!activeStudyId && <p className="text-[0.85rem]">Seleciona ou cria um estudo para ligar as tuas perguntas a uma passagem guardada.</p>}
        {activeStudyId && <div className="space-y-[0.5rem]">
          <label htmlFor="study-conversation" className="block text-[0.8rem]">Conversas guardadas · versão {activeStudyVersion}</label>
          <select id="study-conversation" aria-label="Conversa guardada" value={conversationId ?? ''} disabled={pending || loading}
            onChange={event => { setSelectedId(event.target.value || null); setQuestion(''); setError(null); setNotice(null); }}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-[0.5rem] text-[0.8rem]">
            <option value="">Nenhuma conversa selecionada</option>
            {conversationId && !choices.some(item => item.id === conversationId) && <option value={conversationId}>Conversa atual</option>}
            {choices.map(item => <option value={item.id} key={item.id}>{new Date(item.createdAt).toLocaleString('pt-BR')} · {item.revision}/20 turnos</option>)}
          </select>
          <div className="flex flex-wrap gap-[0.5rem]">
            <Button size="sm" variant="secondary" disabled={pending} onClick={() => { void handleNewConversation(); }}>Nova conversa</Button>
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => { void refresh(); }}>Atualizar conversa</Button>
            {conversationId && <Button size="sm" variant="ghost" disabled={pending} onClick={() => setConfirmDelete(true)}>Eliminar conversa</Button>}
          </div>
          {(page > 0 || history.data?.nextCursor) && <div className="flex justify-between gap-[0.5rem]">
            <Button size="sm" variant="ghost" disabled={page === 0 || pending} onClick={() => { setPage(value => value - 1); setSelectedId(null); }}>Conversas anteriores</Button>
            <Button size="sm" variant="ghost" disabled={!history.data?.nextCursor || pending} onClick={() => {
              if (history.data?.nextCursor) { setCursors(values => [...values.slice(0, page + 1), history.data.nextCursor]); setPage(value => value + 1); setSelectedId(null); }
            }}>Conversas seguintes</Button>
          </div>}
        </div>}
        {(error || history.error || conversationQuery.error) && <p role="alert" className="text-[0.825rem]">{error ?? history.error?.message ?? conversationQuery.error?.message}</p>}
        {notice && <p role="status" className="text-[0.825rem]">{notice}</p>}
        {conversation && <p className="text-[0.75rem] text-[var(--foreground-muted)]">{conversation.revision}/20 turnos</p>}
        {conversation && conversation.revision >= 20 && <p className="text-[0.825rem]">Esta conversa atingiu 20 turnos. Inicia uma nova conversa para continuar.</p>}
        <form onSubmit={event => { void handleSend(event); }} className="space-y-[0.5rem]">
          <label htmlFor="assistant-question" className="flex justify-between text-[0.8rem]">Pergunta investigativa<span>{new TextEncoder().encode(question.trim()).byteLength}/500B</span></label>
          <div className="flex gap-[0.5rem]">
            <Input id="assistant-question" value={question} onChange={event => setQuestion(event.target.value)} placeholder="Ex: O que Josefo relata sobre este período?" disabled={pending || !activeStudyId || !isAuthenticated} />
            {pending ? <Button type="button" variant="destructive" aria-label="Cancelar pedido" onClick={event => { event.preventDefault(); handleCancel(); }}><StopCircle className="w-[1rem] h-[1rem]" /></Button>
              : <Button type="submit" aria-label="Enviar pergunta" disabled={!question.trim() || !activeStudyId || !isAuthenticated || loading || (conversation?.revision ?? 0) >= 20}><Send className="w-[1rem] h-[1rem]" /></Button>}
          </div>
        </form>
        {(loading || pending) && <p role="status" className="flex items-center gap-[0.5rem] text-[0.8rem]"><Loader2 className="w-[1rem] h-[1rem] animate-spin" />{pending ? 'A processar o pedido. Podes cancelar.' : 'A carregar a conversa…'}</p>}
        {conversation?.turns.map(turn => turn.responseStatus === 'available' && turn.analysis
          ? <AnalysisResult analysis={turn.analysis} key={turn.number} />
          : <article key={turn.number} className="space-y-[0.5rem] text-[0.85rem]"><h3>"{turn.question}"</h3><p>Esta resposta já não está disponível.</p></article>)}
        {!loading && !pending && !conversation?.turns.length && <p className="text-[0.8rem] text-[var(--foreground-muted)]">Ainda não há perguntas nesta conversa.</p>}
      </div>}
      {tab === 'notes' && <div className="space-y-[0.75rem]"><p className="text-[0.85rem]">As tuas notas pessoais ficam ligadas à versão do estudo e não são evidência histórica validada.</p>
        <Button variant="secondary" disabled={!activeStudyId || !onOpenNotes} onClick={onOpenNotes}>Abrir anotações deste estudo</Button></div>}
      {tab === 'links' && (activeStudyId && activeReference ? <CrossRefPanel reference={activeReference} /> : <p className="text-[0.85rem]">Seleciona um estudo para consultar referências cruzadas reais.</p>)}
    </div>
    <p className="pt-[0.75rem] border-t border-[var(--border)] text-[0.75rem] text-[var(--foreground-muted)]">Estudo {activeStudyId ? 'Conectado' : 'Não Selecionado'}{activeReference ? ` · ${activeReference}` : ''}</p>
    <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}><DialogContent>
      <DialogHeader><DialogTitle>Eliminar conversa?</DialogTitle><DialogDescription>A conversa e as respostas associadas serão eliminadas. Esta ação não pode ser desfeita.</DialogDescription></DialogHeader>
      {error && <p role="alert">{error}</p>}
      <DialogFooter><Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
        <Button variant="destructive" aria-label="Confirmar eliminação da conversa" loading={remove.isPending} onClick={() => { void handleDelete(); }}>Eliminar conversa</Button>
      </DialogFooter>
    </DialogContent></Dialog>
  </div>;
}
