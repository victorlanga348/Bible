import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Link2,
  AlertCircle,
  ShieldAlert,
  Send,
  Loader2,
  StopCircle,
  Cpu,
  Layers,
} from 'lucide-react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Badge } from '../../shared/ui/badge';
import { useSession } from '../../shared/hooks/use-session';
import { useToast } from '../../shared/ui/toast';
import { useCreateAiAnalysis } from '../../shared/api/hooks';
import { CrossRefPanel } from '../cross-ref/cross-ref-panel';
import type { AiAnalysisDto } from '../../shared/api/contracts';
import { StudyNotes } from '../workspace/study-notes';
import { ConversationPanel } from './conversation-panel';

interface ContextPanelProps {
  activeStudyId?: string;
  activeStudyVersion?: number;
  activeReference?: string;
  onNavigateToPassage?: (reference: string) => void;
}

export function ContextPanel(props: ContextPanelProps) {
  return <ContextPanelContent key={`${props.activeStudyId}:${props.activeStudyVersion}`} {...props} />;
}

function ContextPanelContent({
  activeStudyId,
  activeStudyVersion = 1,
  activeReference = 'GEN 1:1-3',
  onNavigateToPassage,
}: ContextPanelProps) {
  const [tab, setTab] = useState<'assistant' | 'notes' | 'links'>('assistant');
  const [question, setQuestion] = useState('');
  const [analyses, setAnalyses] = useState<AiAnalysisDto[]>([]);
  const { isAuthenticated, token } = useSession();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  useEffect(() => () => { abortControllerRef.current?.abort(); abortControllerRef.current = null; }, []);

  const createAnalysisMutation = useCreateAiAnalysis();

  const handleSendQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || abortControllerRef.current) return;

    if (!isAuthenticated || !token) {
      toast('Autenticação necessária', {
        description: 'Configure seu token de operador na barra lateral.',
        type: 'warning',
      });
      return;
    }

    if (!activeStudyId) {
      toast('Nenhum estudo ativo', {
        description: 'Selecione ou gere um estudo primeiro para vincular a pergunta da IA.',
        type: 'warning',
      });
      return;
    }

    // Validação estrita do contrato: pergunta de no máximo 500 bytes UTF-8
    const byteLength = new TextEncoder().encode(trimmed).byteLength;
    if (byteLength > 500) {
      toast('Pergunta muito longa', {
        description: `O limite máximo é de 500 bytes UTF-8. A pergunta atual possui ${byteLength} bytes.`,
        type: 'warning',
      });
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);

    try {
      const analysis = await createAnalysisMutation.mutateAsync({
        studyId: activeStudyId,
        studyVersion: activeStudyVersion,
        question: trimmed,
        signal: controller.signal,
      });

      if (controller.signal.aborted || abortControllerRef.current !== controller) return;
      setAnalyses((prev) => [analysis, ...prev]);
      setQuestion('');
      toast('Análise de IA concluída.', { type: 'success' });
    } catch (err: unknown) {
      if (controller.signal.aborted || abortControllerRef.current !== controller) {
        return;
      }
      const msg = err instanceof Error ? err.message : 'Falha na inferência da IA.';
      toast('Erro no assistente de IA', { description: msg, type: 'error' });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setIsGenerating(false);
      }
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
      toast('Inferência cancelada pelo operador.', { type: 'info' });
    }
  };

  return (
    <div className="flex flex-col h-full p-[1.25rem] space-y-[1.25rem]">
      {/* Live Region para Leitores de Tela */}
      <div role="status" aria-label="Estado do assistente" aria-live="polite" className="sr-only">
        {isGenerating
          ? 'Executando busca vetorial e inferência CPU local.'
          : analyses.length > 0
          ? `Última análise: ${analyses[0].status === 'supported' ? 'Evidência documentada' : analyses[0].status === 'restricted' ? 'Fonte restrita' : 'Evidência insuficiente'}.`
          : ''}
      </div>

      {/* Seletor de Abas da Região Direita */}
      <div
        role="tablist"
        aria-label="Painel Contextual"
        onKeyDown={(event) => {
          const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role=tab]'));
          const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
          const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
          if (next >= 0) { event.preventDefault(); tabs[next]?.focus(); tabs[next]?.click(); }
        }}
        className="flex border-b border-[var(--border)] pb-[0.5rem] gap-[0.5rem]"
      >
        <button
          role="tab"
          id="tab-assistant"
          aria-controls="panel-assistant"
          aria-selected={tab === 'assistant'}
          tabIndex={tab === 'assistant' ? 0 : -1}
          onClick={() => setTab('assistant')}
          className={`flex items-center gap-[0.35rem] px-[0.75rem] py-[0.35rem] text-[0.8rem] font-ui font-medium rounded-[var(--radius-sm)] cursor-pointer ${
            tab === 'assistant'
              ? 'bg-[var(--surface-muted)] text-[var(--foreground)] font-semibold'
              : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <Sparkles className="w-[0.85rem] h-[0.85rem] text-[var(--accent)]" />
          Assistente IA
        </button>
        <button
          role="tab"
          id="tab-notes"
          aria-controls="panel-notes"
          aria-selected={tab === 'notes'}
          tabIndex={tab === 'notes' ? 0 : -1}
          onClick={() => setTab('notes')}
          className={`flex items-center gap-[0.35rem] px-[0.75rem] py-[0.35rem] text-[0.8rem] font-ui font-medium rounded-[var(--radius-sm)] cursor-pointer ${
            tab === 'notes'
              ? 'bg-[var(--surface-muted)] text-[var(--foreground)] font-semibold'
              : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <FileText className="w-[0.85rem] h-[0.85rem]" />
          Anotações
        </button>
        <button
          role="tab"
          id="tab-links"
          aria-controls="panel-links"
          aria-selected={tab === 'links'}
          tabIndex={tab === 'links' ? 0 : -1}
          onClick={() => setTab('links')}
          className={`flex items-center gap-[0.35rem] px-[0.75rem] py-[0.35rem] text-[0.8rem] font-ui font-medium rounded-[var(--radius-sm)] cursor-pointer ${
            tab === 'links'
              ? 'bg-[var(--surface-muted)] text-[var(--foreground)] font-semibold'
              : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <Link2 className="w-[0.85rem] h-[0.85rem]" />
          Referências
        </button>
      </div>

      {/* Conteúdo Contextual */}
      <div className="flex-1 overflow-y-auto space-y-[1rem]">
        {tab === 'assistant' && (
          <div
            role="tabpanel"
            id="panel-assistant"
            aria-labelledby="tab-assistant"
            className="space-y-[1.25rem]"
          >
            {/* Aviso Hermenêutico do Modelo Local */}
            <div className="p-[0.75rem] rounded-[var(--radius-md)] bg-[var(--surface-muted)] border border-[var(--border)] text-[0.75rem] font-ui text-[var(--foreground-muted)] space-y-[0.35rem]">
              <div className="flex items-center gap-[0.35rem] font-semibold text-[var(--foreground)]">
                <ShieldAlert className="w-[0.9rem] h-[0.9rem] text-[var(--accent)]" />
                RAG Extrativo Determinístico (Qwen3-1.7B)
              </div>
              <p className="leading-relaxed">
                Inferência local na CPU. O modelo extrai no máximo uma frase inglesa de Flávio Josefo (*Antiguidades dos Judeus*) ou reporta insuficiência de evidência documental.
              </p>
            </div>

            {/* Input de Pergunta com Validação de Bytes */}
            <form onSubmit={handleSendQuestion} className="space-y-[0.5rem]">
              <div className="flex justify-between items-center text-[0.8rem] font-medium text-[var(--foreground)] font-ui">
                <label htmlFor="assistant-question">Pergunta investigativa</label>
                <span className="text-[0.7rem] text-[var(--foreground-muted)] font-mono">
                  {new TextEncoder().encode(question).byteLength}/500B
                </span>
              </div>
              <div className="flex gap-[0.5rem]">
                <Input
                  id="assistant-question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ex: O que Josefo relata sobre este período?"
                  disabled={isGenerating}
                  className="h-[2.25rem] text-[0.825rem]"
                />
                {isGenerating ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelGeneration}
                    aria-label="Cancelar inferência"
                    className="h-[2.25rem] px-[0.75rem]"
                  >
                    <StopCircle className="w-[0.9rem] h-[0.9rem]" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    aria-label="Enviar pergunta"
                    size="sm"
                    disabled={!question.trim()}
                    className="h-[2.25rem] px-[0.75rem]"
                  >
                    <Send className="w-[0.9rem] h-[0.9rem]" />
                  </Button>
                )}
              </div>
            </form>

            {/* Loading Indicator com Feedback */}
            {isGenerating && (
              <div className="p-[1rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-center space-y-[0.5rem]">
                <Loader2 className="w-[1.25rem] h-[1.25rem] animate-spin text-[var(--accent)] mx-auto" />
                <p className="text-[0.8rem] text-[var(--foreground-muted)] font-ui">
                  Executando busca vetorial e inferência CPU local...
                </p>
              </div>
            )}

            {/* Lista de Análises Concluídas */}
            {analyses.length > 0 ? (
              <div className="space-y-[1rem]">
                {analyses.map((item) => (
                  <article
                    key={item.id}
                    className="p-[1rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] space-y-[0.75rem] shadow-xs"
                  >
                    {/* Pergunta */}
                    <div className="font-ui font-medium text-[0.85rem] text-[var(--foreground)] border-b border-[var(--border)]/60 pb-[0.4rem]">
                      "{item.question}"
                    </div>

                    {/* Status da Evidência */}
                    <div className="flex items-center justify-between">
                      <Badge
                        classification={
                          item.status === 'supported'
                            ? 'documented-fact'
                            : 'insufficient-evidence'
                        }
                      >
                        {item.status === 'supported'
                          ? 'Evidência Documentada'
                          : item.status === 'restricted' ? 'Fonte restrita' : 'Evidência Insuficiente'}
                      </Badge>
                      <span className="text-[0.7rem] text-[var(--foreground-muted)] font-ui">
                        {new Date(item.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Trecho Citado */}
                    {item.status === 'supported' && item.evidence.length > 0 ? (
                      <div className="space-y-[0.5rem]">
                        {item.evidence.map(evidence => <div key={`${evidence.excerptId}:${evidence.startOffset}`}>
                          <blockquote className="border-l border-[var(--accent)] pl-[0.75rem] italic text-[0.85rem] font-serif text-[var(--foreground)] leading-relaxed">"{evidence.quote}"</blockquote>
                          <div className="text-[0.725rem] text-[var(--foreground-muted)] font-ui space-y-[0.15rem]">
                            <p><strong>Fonte:</strong> {evidence.attribution} ({evidence.locator})</p>
                            <a className="underline" href={evidence.rightsUrl} target="_blank" rel="noreferrer">{evidence.rightsStatement}</a>
                          </div>
                        </div>)}
                      </div>
                    ) : (
                      <div className="p-[0.65rem] rounded bg-[var(--surface-muted)] text-[0.8rem] text-[var(--foreground-muted)] font-ui leading-relaxed">
                        {item.status === 'restricted' ? 'O acesso à fonte está restrito; o conteúdo não é apresentado.' : 'Não foi encontrada evidência documental nos trechos autorizados de Flávio Josefo para fundamentar a questão formulada.'}
                      </div>
                    )}

                    {item.limitations.map((limitation, index) => <p key={index} className="text-[0.75rem] text-[var(--foreground-muted)]">{limitation}</p>)}

                    {/* Metadados de Proveniência Auditáveis */}
                    <div className="pt-[0.5rem] border-t border-[var(--border)]/60 text-[0.7rem] text-[var(--foreground-muted)] font-ui flex items-center justify-between">
                      <span className="flex items-center gap-[0.25rem]">
                        <Cpu className="w-[0.75rem] h-[0.75rem]" />
                        {item.provenance.promptTokens + item.provenance.completionTokens} tokens
                      </span>
                      <span className="font-mono text-[0.65rem]">
                        {item.provenance.profileId}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-[2.5rem] text-[var(--foreground-muted)] font-ui space-y-[0.5rem]">
                <Sparkles className="w-[2rem] h-[2rem] mx-auto opacity-30 text-[var(--accent)]" />
                <p className="text-[0.8rem]">Nenhuma pergunta realizada para este estudo.</p>
              </div>
            )}
            {isAuthenticated && activeStudyId && <ConversationPanel studyId={activeStudyId} studyVersion={activeStudyVersion} />}
          </div>
        )}

        {tab === 'notes' && (
          <div
            role="tabpanel"
            id="panel-notes"
            aria-labelledby="tab-notes"
            className="space-y-[0.75rem]"
          >
            {isAuthenticated && activeStudyId
              ? <StudyNotes studyId={activeStudyId} studyVersion={activeStudyVersion} />
              : <p className="text-[0.8rem] text-[var(--foreground-muted)]">Entre na conta e abra um estudo para consultar as anotações.</p>}
          </div>
        )}

        {tab === 'links' && (
          <div
            role="tabpanel"
            id="panel-links"
            aria-labelledby="tab-links"
            className="space-y-[0.75rem]"
          >
            <p className="text-[0.8rem] text-[var(--foreground-muted)] font-ui">
              Passagens paralelas e referências cruzadas vinculadas:
            </p>
            <CrossRefPanel
              reference={activeReference}
              onNavigateToPassage={onNavigateToPassage}
            />
          </div>
        )}
      </div>

      {/* Rodapé do Painel */}
      <div className="pt-[0.75rem] border-t border-[var(--border)] text-[0.7rem] text-[var(--foreground-muted)] font-ui flex items-center justify-between">
        <span className="flex items-center gap-[0.25rem]">
          <Layers className="w-[0.75rem] h-[0.75rem]" /> Estudo {activeStudyId ? 'Conectado' : 'Não Selecionado'}
        </span>
        <span className="flex items-center gap-[0.25rem]">
          <AlertCircle className="w-[0.75rem] h-[0.75rem]" /> Qwen3-1.7B CPU
        </span>
      </div>
    </div>
  );
}
