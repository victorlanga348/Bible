import { useState } from 'react';
import { Sparkles, FileText, Link2, AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Badge } from '../../shared/ui/badge';
import { useSession } from '../../shared/hooks/use-session';

export function ContextPanel() {
  const [tab, setTab] = useState<'assistant' | 'notes' | 'links'>('assistant');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    status: 'supported' | 'insufficient-evidence' | null;
    quote?: string;
    attribution?: string;
    message?: string;
  } | null>(null);
  const { isAuthenticated } = useSession();

  const handleAsk = () => {
    if (!question.trim()) return;
    setLoading(true);

    // Simulação determinística do comportamento estrito do backend:
    // O modelo opera em RAG com Qwen3-1.7B e ou extrai 1 frase de Josefo ou relata "insufficient-evidence"
    setTimeout(() => {
      setLoading(false);
      if (question.toLowerCase().includes('criação') || question.toLowerCase().includes('genesis')) {
        setAiResponse({
          status: 'supported',
          quote: 'In the beginning God created the heaven and the earth.',
          attribution: 'Flavius Josephus, Antiquities of the Jews, Book I, ch. 1',
        });
      } else {
        setAiResponse({
          status: 'insufficient-evidence',
          message:
            'Não foi encontrada evidência documental nos quatro parágrafos autorizados de Flávio Josefo para fundamentar esta pergunta.',
        });
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full p-[1.25rem] space-y-[1.25rem]">
      {/* Seletor de Abas da Região Direita */}
      <div className="flex border-b border-[var(--border)] pb-[0.5rem] gap-[0.5rem]">
        <button
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
          <div className="space-y-[1rem]">
            {/* Aviso Hermenêutico do Modelo Local */}
            <div className="p-[0.75rem] rounded-[var(--radius-md)] bg-[var(--surface-muted)] border border-[var(--border)] text-[0.75rem] font-ui text-[var(--foreground-muted)] space-y-[0.25rem]">
              <div className="flex items-center gap-[0.35rem] font-semibold text-[var(--foreground)]">
                <ShieldAlert className="w-[0.85rem] h-[0.85rem] text-[var(--accent)]" />
                RAG Extrativo Local (Qwen3-1.7B)
              </div>
              <p className="leading-relaxed">
                A IA responde exclusivamente com base nos trechos admitidos de Flávio Josefo. Não há alucinação: se não houver documento, reporta insuficiência.
              </p>
            </div>

            {/* Input de Pergunta */}
            <div className="space-y-[0.5rem]">
              <label className="text-[0.8rem] font-medium text-[var(--foreground)] font-ui">
                Investigar Passagem:
              </label>
              <div className="flex gap-[0.5rem]">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Faça uma pergunta sobre o contexto..."
                  disabled={loading}
                />
                <Button size="sm" loading={loading} onClick={handleAsk}>
                  Enviar
                </Button>
              </div>
            </div>

            {/* Resposta do Assistente */}
            {aiResponse && (
              <div className="p-[1rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] space-y-[0.75rem] animate-in fade-in-50">
                <div className="flex items-center justify-between">
                  <Badge
                    classification={
                      aiResponse.status === 'supported' ? 'documented-fact' : 'insufficient-evidence'
                    }
                  >
                    {aiResponse.status === 'supported' ? 'Evidência Documentada' : 'Evidência Insuficiente'}
                  </Badge>
                </div>

                {aiResponse.status === 'supported' ? (
                  <div className="space-y-[0.5rem]">
                    <blockquote className="border-l-2 border-[var(--accent)] pl-[0.75rem] italic text-[0.875rem] font-serif text-[var(--foreground)]">
                      "{aiResponse.quote}"
                    </blockquote>
                    <p className="text-[0.7rem] text-[var(--foreground-muted)] font-ui">
                      Fonte: {aiResponse.attribution}
                    </p>
                  </div>
                ) : (
                  <div className="text-[0.825rem] text-[var(--foreground-muted)] font-ui leading-relaxed">
                    {aiResponse.message}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'notes' && (
          <div className="space-y-[0.75rem]">
            <p className="text-[0.8rem] text-[var(--foreground-muted)] font-ui">
              Anotações associadas ao estudo corrente com garantia de revisão CAS:
            </p>
            <div className="p-[1rem] rounded-[var(--radius-md)] border border-dashed border-[var(--border)] text-center text-[0.8rem] text-[var(--foreground-muted)] font-ui">
              {isAuthenticated ? 'Nenhuma anotação criada nesta sessão.' : 'Configure o token de sessão para gerenciar anotações.'}
            </div>
          </div>
        )}

        {tab === 'links' && (
          <div className="space-y-[0.75rem]">
            <p className="text-[0.8rem] text-[var(--foreground-muted)] font-ui">
              Passagens paralelas e referências cruzadas vinculadas:
            </p>
            <div className="p-[1rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[0.8rem] font-ui space-y-[0.35rem]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)]">Jo 1:1-3</span>
                <Badge classification="inference">Paralelo Teológico</Badge>
              </div>
              <p className="text-[0.75rem] text-[var(--foreground-muted)]">
                Eco explícito ao relato da criação em Gênesis 1:1.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé do Painel */}
      <div className="pt-[0.75rem] border-t border-[var(--border)] text-[0.7rem] text-[var(--foreground-muted)] font-ui flex items-center justify-between">
        <span>Bíblia App v0.1.0</span>
        <span className="flex items-center gap-[0.25rem]">
          <AlertCircle className="w-[0.75rem] h-[0.75rem]" /> RAG Local CPU
        </span>
      </div>
    </div>
  );
}
