import { useState } from 'react';
import { useSession } from '../../shared/hooks/use-session';
import { useToast } from '../../shared/ui/toast';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Badge, EpistemicBadge, type EpistemicClassification } from '../../shared/ui/badge';
import { StudyCardSkeleton } from '../../shared/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../shared/ui/dialog';
import {
  Compass,
  Sparkles,
  BookOpen,
  Layers,
  History,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import type { StudyEvidenceDto, StudyViewDto } from '../../shared/api/contracts';

interface StudyViewProps {
  initialReference?: string;
  study?: StudyViewDto | null;
  isLoading?: boolean;
  error?: string | null;
  onGenerate: (reference: string) => void;
  onRevise?: () => void;
  onReload?: () => void;
}

export function StudyView({ initialReference = 'GEN 1:1-3', study, isLoading = false, error, onGenerate, onRevise, onReload }: StudyViewProps) {
  const { isAuthenticated } = useSession();
  const { toast } = useToast();
  const [referenceInput, setReferenceInput] = useState<string>(initialReference);
  const [selectedEvidence, setSelectedEvidence] = useState<StudyEvidenceDto | null>(null);

  const sectionLabels: Record<string, string> = {
    'immediate-context': '1. Contexto Imediato',
    'book-argument': '2. Argumento do Livro',
    'history-culture': '3. História e Cultura',
    'authorship-audience-purpose': '4. Autoria, Destinatários e Propósito',
    'comparison': '5. Comparação Textual',
    'interpretations': '6. Interpretações Comparadas',
  };

  const openEvidenceModal = (evidenceId: string) => {
    if (!study) return;
    const ev = study.evidence.find((e) => e.excerptId === evidenceId);
    if (ev) {
      setSelectedEvidence(ev);
    } else {
      toast('Evidência não encontrada no estudo atual.', { type: 'warning' });
    }
  };

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
              aria-label="Passagem do estudo"
              onChange={(e) => setReferenceInput(e.target.value)}
              placeholder="Ex: GEN 1:1-3, ROM 8:28"
              className="w-[12rem] h-[2.25rem] text-[0.825rem]"
            />
            <Button
              size="sm"
              loading={isLoading}
              disabled={!isAuthenticated || !referenceInput.trim()}
              onClick={() => onGenerate(referenceInput)}
              className="h-[2.25rem]"
            >
              <Sparkles className="w-[0.9rem] h-[0.9rem]" />
              Gerar Estudo
            </Button>
          </div>
        </div>
      </div>

      {error && <div role="alert" className="py-[1rem] text-[var(--foreground)] space-y-[0.5rem]">
        <p>{error}</p>
        {onReload && <Button variant="secondary" onClick={onReload}>Consultar versão atual</Button>}
      </div>}

      {/* Conteúdo do Estudo */}
      <div className="flex-1 py-[1.5rem]">
        {isLoading ? (
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
                Entra no teu espaço de estudo
              </h3>
              <p className="text-[0.85rem] text-[var(--foreground-muted)] font-ui max-w-[42ch] mx-auto leading-relaxed">
                Entra na tua conta para criar, guardar e consultar os teus estudos.
              </p>
            </div>
          </div>
        ) : study ? (
          <div className="space-y-[2.5rem]">
            {/* Metadados da Passagem Estudada */}
            <header className="p-[1.25rem] rounded-[var(--radius-md)] bg-[var(--surface-muted)] border border-[var(--border)] space-y-[0.75rem]">
              <div className="flex flex-wrap items-center justify-between gap-[0.5rem]">
                <div className="flex items-center gap-[0.5rem]">
                  <BookOpen className="w-[1.125rem] h-[1.125rem] text-[var(--accent)]" />
                  <span className="font-editorial-heading text-[1.25rem] font-semibold text-[var(--foreground)]">
                    {study.reference.normalized}
                  </span>
                </div>
                <div className="flex items-center gap-[0.5rem]">
                  <Badge classification="neutral" className="gap-[0.25rem]">
                    <History className="w-[0.75rem] h-[0.75rem]" />
                    Versão {study.version}
                  </Badge>
                  {onRevise && <Button size="sm" variant="secondary" onClick={onRevise}>Criar nova versão</Button>}
                  <span className="text-[0.75rem] text-[var(--foreground-muted)] font-ui">
                    {new Date(study.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Versículos do Estudo */}
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
            <div className="space-y-[1.25rem]">
              <h2 className="flex items-center gap-[0.5rem] text-[0.85rem] uppercase tracking-wider font-semibold text-[var(--foreground-muted)] font-ui">
                <Layers className="w-[1rem] h-[1rem]" />
                Seções de Análise e Evidência
              </h2>

              <div className="grid gap-[1rem]">
                {study.sections.map((sec) => (
                  <section
                    key={sec.kind}
                    className="p-[1.25rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] space-y-[0.75rem] transition-all hover:border-[var(--accent)]/50"
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
                      <div className="pt-[0.5rem] border-t border-[var(--border)]/60 text-[0.75rem] text-[var(--foreground-muted)] font-ui flex items-center gap-[0.5rem] flex-wrap">
                        <span className="font-medium">Fontes documentadas:</span>
                        {sec.evidenceIds.map((evId) => (
                          <button
                            key={evId}
                            onClick={() => openEvidenceModal(evId)}
                            className="inline-flex items-center gap-[0.25rem] px-[0.45rem] py-[0.15rem] rounded-[var(--radius-sm)] bg-[var(--surface-muted)] text-[var(--accent)] hover:underline cursor-pointer"
                          >
                            <FileCheck2 className="w-[0.75rem] h-[0.75rem]" />
                            {evId}
                          </button>
                        ))}
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

            {/* Limitações Hermenêuticas e Metodológicas */}
            {study.limitations.length > 0 && (
              <div className="p-[1rem] rounded-[var(--radius-md)] border border-amber-900/30 bg-amber-950/10 text-[0.8rem] text-amber-200/90 space-y-[0.35rem]">
                <div className="flex items-center gap-[0.35rem] font-medium text-amber-300">
                  <AlertCircle className="w-[0.95rem] h-[0.95rem]" />
                  Limitações do Estudo
                </div>
                <ul className="list-disc list-inside space-y-[0.2rem] pl-[0.25rem]">
                  {study.limitations.map((lim, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {lim}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-[4rem] text-[var(--foreground-muted)] font-ui">
            Nenhum estudo ativo. Digite uma passagem e clique em "Gerar Estudo".
          </div>
        )}
      </div>

      {/* Modal de Detalhe de Evidência Histórica Documentada */}
      <Dialog open={!!selectedEvidence} onOpenChange={(open) => !open && setSelectedEvidence(null)}>
        <DialogContent>
          {selectedEvidence && (
            <>
              <DialogHeader>
                <DialogTitle>Evidência Histórica Documentada</DialogTitle>
                <DialogDescription>
                  Trecho extraído e auditado criptograficamente das fontes homologadas.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-[1rem] py-[0.5rem] font-ui text-[0.85rem]">
                <div className="p-[0.75rem] rounded-[var(--radius-md)] bg-[var(--surface-muted)] border border-[var(--border)] space-y-[0.35rem]">
                  <div className="text-[0.75rem] text-[var(--foreground-muted)]">Localizador na Obra:</div>
                  <div className="font-semibold text-[var(--foreground)]">{selectedEvidence.locator}</div>
                  <div className="text-[0.75rem] text-[var(--foreground-muted)] font-mono">
                    SHA-256: {selectedEvidence.textSha256.substring(0, 24)}...
                  </div>
                </div>

                {selectedEvidence.quote && (
                  <blockquote className="border-l-2 border-[var(--accent)] pl-[0.85rem] italic text-[0.9rem] font-serif text-[var(--foreground)] leading-relaxed">
                    "{selectedEvidence.quote}"
                  </blockquote>
                )}

                <div className="text-[0.8rem] text-[var(--foreground-muted)] space-y-[0.25rem]">
                  <p>
                    <strong>Atribuição:</strong> {selectedEvidence.attribution}
                  </p>
                  <p>
                    <strong>Direitos:</strong> {selectedEvidence.rightsStatement}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-[0.5rem] border-t border-[var(--border)]">
                  <Badge classification="documented-fact" className="gap-[0.25rem]">
                    <ShieldCheck className="w-[0.8rem] h-[0.8rem]" />
                    Status: {selectedEvidence.availability}
                  </Badge>
                  <a
                    href={selectedEvidence.rightsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-[0.25rem] text-[var(--accent)] hover:underline text-[0.75rem]"
                  >
                    Ver Licença <ExternalLink className="w-[0.75rem] h-[0.75rem]" />
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
