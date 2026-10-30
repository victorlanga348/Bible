import { useState, useEffect } from 'react';
import { api, type StudyView as IStudyView } from '../../shared/api/services';
import { useSession } from '../../shared/hooks/use-session';
import { useToast } from '../../shared/ui/toast';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Badge, EpistemicBadge, type EpistemicClassification } from '../../shared/ui/badge';
import { StudyCardSkeleton } from '../../shared/ui/skeleton';
import { Compass, Sparkles, BookOpen, Layers } from 'lucide-react';

interface StudyViewProps {
  initialReference?: string;
}

export function StudyView({ initialReference = 'GEN 1:1-3' }: StudyViewProps) {
  const { token, isAuthenticated } = useSession();
  const { toast } = useToast();
  const [referenceInput, setReferenceInput] = useState<string>(initialReference);
  const [study, setStudy] = useState<IStudyView | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sectionLabels: Record<string, string> = {
    'immediate-context': '1. Contexto Imediato',
    'book-argument': '2. Argumento do Livro',
    'history-culture': '3. História e Cultura',
    'authorship-audience-purpose': '4. Autoria, Destinatários e Propósito',
    'comparison': '5. Comparação Textual',
    'interpretations': '6. Interpretações Comparadas',
  };

  const loadOrGenerateStudy = async (refStr: string) => {
    if (!isAuthenticated || !token) {
      toast('Autenticação necessária.', {
        description: 'Configure o token JWT local do operador na barra lateral.',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Cria ou recupera estudo para a referência informada
      const result = await api.createStudy('porbr2018', refStr.trim(), token);
      setStudy(result);
      toast('Estudo estruturado carregado com sucesso.', { type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Não foi possível carregar o estudo.';
      setError(msg);
      toast('Erro ao processar estudo', { description: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Se já houver token e referência, carrega no primeiro render
  useEffect(() => {
    if (isAuthenticated && token && initialReference && !study) {
      loadOrGenerateStudy(initialReference);
    }
  }, [isAuthenticated, token, initialReference]);

  return (
    <div className="flex flex-col h-full max-w-[min(100%,76ch)] mx-auto px-[1.25rem] py-[1.5rem]">
      {/* Cabeçalho da Seção de Estudo */}
      <div className="pb-[1.5rem] border-b border-[var(--border)] space-y-[1rem]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.75rem]">
          <div>
            <h1 className="font-editorial-heading font-semibold text-[clamp(1.5rem,1.35rem+0.8vw,2.2rem)] text-[var(--foreground)]">
              Estudo Bíblico Estruturado
            </h1>
            <p className="text-[0.8rem] text-[var(--foreground-muted)] font-ui">
              Investigação histórica, literária e epistemológica fundamentada.
            </p>
          </div>

          <div className="flex items-center gap-[0.5rem]">
            <Input
              value={referenceInput}
              onChange={(e) => setReferenceInput(e.target.value)}
              placeholder="Ex: GEN 1:1-3, ROM 8:28"
              className="w-[11rem]"
            />
            <Button
              size="sm"
              loading={loading}
              onClick={() => loadOrGenerateStudy(referenceInput)}
            >
              <Sparkles className="w-[0.9rem] h-[0.9rem]" />
              Gerar Estudo
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo do Estudo */}
      <div className="flex-1 py-[1.5rem]">
        {loading ? (
          <div className="space-y-[1.25rem]">
            <StudyCardSkeleton />
            <StudyCardSkeleton />
            <StudyCardSkeleton />
          </div>
        ) : !isAuthenticated ? (
          <div className="p-[2rem] text-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] space-y-[1rem] my-[2rem]">
            <Compass className="w-[3rem] h-[3rem] mx-auto text-[var(--accent)] opacity-80" />
            <div className="space-y-[0.35rem]">
              <h3 className="font-editorial-heading text-[1.25rem] font-semibold text-[var(--foreground)]">
                Sessão do Operador Necessária
              </h3>
              <p className="text-[0.85rem] text-[var(--foreground-muted)] font-ui max-w-[42ch] mx-auto leading-relaxed">
                Para consultar ou criar estudos estruturados com controle de versão (CAS), insira seu Bearer Token gerado via CLI no terminal.
              </p>
            </div>
            <code className="inline-block p-[0.4rem] rounded bg-[var(--surface-muted)] text-[0.75rem] font-mono select-all">
              npm --prefix backend run auth:token -- local-owner
            </code>
          </div>
        ) : error ? (
          <div className="p-[1.5rem] rounded-[var(--radius-md)] border border-rose-900/30 bg-rose-950/10 text-rose-300 space-y-[0.5rem]">
            <div className="font-semibold text-[0.95rem]">Falha ao Obter Estudo</div>
            <p className="text-[0.85rem] leading-relaxed">{error}</p>
          </div>
        ) : study ? (
          <div className="space-y-[2rem]">
            {/* Metadados da Passagem Estudada */}
            <header className="p-[1.25rem] rounded-[var(--radius-md)] bg-[var(--surface-muted)] border border-[var(--border)] space-y-[0.75rem]">
              <div className="flex flex-wrap items-center justify-between gap-[0.5rem]">
                <div className="flex items-center gap-[0.5rem]">
                  <BookOpen className="w-[1.125rem] h-[1.125rem] text-[var(--accent)]" />
                  <span className="font-editorial-heading text-[1.2rem] font-semibold text-[var(--foreground)]">
                    {study.reference.normalized}
                  </span>
                </div>
                <div className="flex items-center gap-[0.5rem]">
                  <Badge classification="neutral">Versão {study.version}</Badge>
                  <span className="text-[0.75rem] text-[var(--foreground-muted)] font-ui">
                    {new Date(study.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Texto canônico da passagem em destaque */}
              <div className="pt-[0.5rem] border-t border-[var(--border)] text-[0.95rem] font-scripture italic text-[var(--foreground-muted)] leading-relaxed">
                {study.passage.verses.map((v) => (
                  <span key={v.number} className="mr-[0.35rem]">
                    <sup className="font-ui font-semibold text-[0.7rem] mr-[0.15rem]">{v.number}</sup>
                    {v.text}
                  </span>
                ))}
              </div>
            </header>

            {/* As 6 Seções Canônicas de Investigação */}
            <div className="space-y-[1.5rem]">
              <h2 className="flex items-center gap-[0.5rem] text-[0.85rem] uppercase tracking-wider font-semibold text-[var(--foreground-muted)] font-ui">
                <Layers className="w-[1rem] h-[1rem]" />
                Seções de Análise e Evidência
              </h2>

              <div className="grid gap-[1rem]">
                {study.sections.map((sec) => (
                  <section
                    key={sec.kind}
                    className="p-[1.25rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] space-y-[0.65rem] transition-all hover:border-[var(--accent)]/50"
                  >
                    <div className="flex items-center justify-between gap-[0.5rem]">
                      <h3 className="font-ui font-semibold text-[0.95rem] text-[var(--foreground)]">
                        {sectionLabels[sec.kind] || sec.kind}
                      </h3>
                      <Badge
                        classification={sec.status === 'available' ? 'documented-fact' : 'insufficient-evidence'}
                      >
                        {sec.status === 'available' ? 'Evidência Documentada' : 'Evidência Insuficiente'}
                      </Badge>
                    </div>

                    <p className="text-[0.9rem] font-ui leading-relaxed text-[var(--foreground)]">
                      {sec.text}
                    </p>

                    {sec.evidenceIds.length > 0 && (
                      <div className="pt-[0.5rem] text-[0.75rem] text-[var(--foreground-muted)] font-ui flex items-center gap-[0.35rem]">
                        <span className="font-medium">Evidências vinculadas:</span>
                        {sec.evidenceIds.join(', ')}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>

            {/* Diferenciação Epistemológica de Interpretações */}
            {study.interpretations.length > 0 && (
              <div className="space-y-[1rem] pt-[1rem] border-t border-[var(--border)]">
                <h2 className="text-[0.85rem] uppercase tracking-wider font-semibold text-[var(--foreground-muted)] font-ui">
                  Classificação Epistemológica de Interpretações
                </h2>

                <div className="space-y-[0.75rem]">
                  {study.interpretations.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-[1rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] flex items-start gap-[0.75rem]"
                    >
                      <EpistemicBadge classification={item.classification as EpistemicClassification} />
                      <p className="text-[0.875rem] font-ui leading-relaxed text-[var(--foreground)] flex-1">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-[4rem] text-[var(--foreground-muted)] font-ui">
            Nenhum estudo ativo. Digite uma passagem e clique em "Gerar Estudo".
          </div>
        )}
      </div>
    </div>
  );
}
