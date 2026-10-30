import { useState, useEffect } from 'react';
import { api, type Book, type ChapterPassage } from '../../shared/api/services';
import { VerseSkeleton } from '../../shared/ui/skeleton';
import { Button } from '../../shared/ui/button';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, Copy, Check } from 'lucide-react';
import { useToast } from '../../shared/ui/toast';

interface ReaderViewProps {
  onSelectPassageForStudy?: (reference: string) => void;
}

export function ReaderView({ onSelectPassageForStudy }: ReaderViewProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>('GEN');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [passage, setPassage] = useState<ChapterPassage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const { toast } = useToast();

  // 1. Carrega livros da Bíblia Livre (porbr2018)
  useEffect(() => {
    let active = true;
    api
      .books('porbr2018')
      .then((res) => {
        if (active) {
          setBooks(res.books);
          if (res.books.length > 0 && !selectedBook) {
            setSelectedBook(res.books[0].code);
          }
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Não foi possível carregar o catálogo de livros.');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // 2. Carrega o texto canônico do capítulo selecionado
  useEffect(() => {
    if (!selectedBook) return;
    let active = true;
    setLoading(true);
    setError(null);
    setSelectedVerses([]);

    api
      .passage('porbr2018', selectedBook, selectedChapter)
      .then((res) => {
        if (active) {
          setPassage(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Erro ao carregar a passagem bíblica.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedBook, selectedChapter]);

  const currentBookObj = books.find((b) => b.code === selectedBook);

  const toggleVerseSelection = (verseNumber: number) => {
    setSelectedVerses((prev) =>
      prev.includes(verseNumber) ? prev.filter((v) => v !== verseNumber) : [...prev, verseNumber].sort((a, b) => a - b)
    );
  };

  const copySelectedText = () => {
    if (!passage || selectedVerses.length === 0) return;
    const selectedTexts = passage.verses
      .filter((v) => selectedVerses.includes(v.number))
      .map((v) => `${v.number}. ${v.text}`)
      .join('\n');
    const citation = `${currentBookObj?.name} ${selectedChapter}:${selectedVerses.join(',')}\n${selectedTexts}\n(Bíblia Livre — porbr2018)`;
    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true);
      toast('Versículos copiados com atribuição canônica.');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full max-w-[min(100%,76ch)] mx-auto px-[1.25rem] py-[1.5rem]">
      {/* Barra de Controle de Leitura */}
      <div className="flex flex-wrap items-center justify-between gap-[0.75rem] pb-[1rem] border-b border-[var(--border)]">
        {/* Seletor de Livro e Capítulo */}
        <div className="flex items-center gap-[0.5rem]">
          <select
            value={selectedBook}
            onChange={(e) => {
              setSelectedBook(e.target.value);
              setSelectedChapter(1);
            }}
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-[0.75rem] py-[0.4rem] text-[0.875rem] font-ui font-medium text-[var(--foreground)] cursor-pointer"
          >
            {books.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>

          {currentBookObj && (
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(Number(e.target.value))}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-[0.75rem] py-[0.4rem] text-[0.875rem] font-ui font-medium text-[var(--foreground)] cursor-pointer"
            >
              {Array.from({ length: currentBookObj.chapterCount }, (_, i) => i + 1).map((ch) => (
                <option key={ch} value={ch}>
                  Capítulo {ch}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Navegação Sequencial de Capítulos */}
        <div className="flex items-center gap-[0.35rem]">
          <Button
            variant="outline"
            size="sm"
            disabled={!passage?.previousChapter}
            onClick={() => {
              if (passage?.previousChapter) {
                setSelectedBook(passage.previousChapter.bookCode);
                setSelectedChapter(passage.previousChapter.chapter);
              }
            }}
            title="Capítulo Anterior"
          >
            <ChevronLeft className="w-[1rem] h-[1rem]" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={!passage?.nextChapter}
            onClick={() => {
              if (passage?.nextChapter) {
                setSelectedBook(passage.nextChapter.bookCode);
                setSelectedChapter(passage.nextChapter.chapter);
              }
            }}
            title="Próximo Capítulo"
          >
            <ChevronRight className="w-[1rem] h-[1rem]" />
          </Button>
        </div>
      </div>

      {/* Barra de Ações Contextuais quando versículos estão selecionados */}
      {selectedVerses.length > 0 && (
        <div className="my-[1rem] p-[0.75rem] rounded-[var(--radius-md)] bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between gap-[0.5rem] animate-in fade-in-50">
          <span className="text-[0.8rem] font-medium text-[var(--foreground)] font-ui">
            {selectedVerses.length} {selectedVerses.length === 1 ? 'versículo selecionado' : 'versículos selecionados'}
          </span>
          <div className="flex items-center gap-[0.5rem]">
            <Button variant="ghost" size="sm" onClick={copySelectedText}>
              {copied ? <Check className="w-[0.9rem] h-[0.9rem] text-emerald-400" /> : <Copy className="w-[0.9rem] h-[0.9rem]" />}
              Copiar
            </Button>
            {onSelectPassageForStudy && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const refStr = `${selectedBook} ${selectedChapter}:${selectedVerses[0]}${
                    selectedVerses.length > 1 ? `-${selectedVerses[selectedVerses.length - 1]}` : ''
                  }`;
                  onSelectPassageForStudy(refStr);
                }}
              >
                <Sparkles className="w-[0.9rem] h-[0.9rem]" />
                Estudar Passagem
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo Bíblico (Tipografia Fluida Editorial) */}
      <div className="flex-1 py-[1.5rem]">
        {loading ? (
          <div className="space-y-[1.25rem]">
            {Array.from({ length: 6 }).map((_, idx) => (
              <VerseSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          <div className="p-[1.5rem] rounded-[var(--radius-md)] border border-rose-900/30 bg-rose-950/10 text-rose-300 space-y-[0.5rem]">
            <div className="font-semibold text-[0.95rem]">Falha de Conectividade com o Backend</div>
            <p className="text-[0.85rem] leading-relaxed">{error}</p>
          </div>
        ) : passage ? (
          <article className="space-y-[1.25rem]">
            {/* Título do Capítulo */}
            <header className="mb-[2rem] text-center space-y-[0.25rem]">
              <h1 className="font-editorial-heading font-semibold text-[clamp(1.75rem,1.5rem+1vw,2.5rem)] text-[var(--foreground)]">
                {currentBookObj?.name} {passage.chapter}
              </h1>
              <p className="text-[0.75rem] uppercase tracking-widest text-[var(--foreground-muted)] font-ui">
                Bíblia Livre (BLIVRE) · Cânone Protestante
              </p>
            </header>

            {/* Versículos com tipografia fluida e numeração discreta */}
            <div className="font-scripture text-[var(--foreground)] leading-relaxed space-y-[0.85rem]">
              {passage.verses.map((v) => {
                const isSelected = selectedVerses.includes(v.number);
                return (
                  <p
                    key={v.number}
                    onClick={() => toggleVerseSelection(v.number)}
                    className={`group relative rounded-[var(--radius-sm)] p-[0.35rem] transition-colors cursor-pointer select-text ${
                      isSelected
                        ? 'bg-[var(--highlight)] text-[#141B1A] font-medium'
                        : 'hover:bg-[var(--surface-muted)]/50'
                    }`}
                  >
                    <sup className="mr-[0.4rem] font-ui font-semibold text-[0.725rem] text-[var(--foreground-muted)] group-hover:text-[var(--accent)] select-none">
                      {v.number}
                    </sup>
                    <span>{v.text}</span>
                  </p>
                );
              })}
            </div>

            {/* Rodapé de Atribuição e Licenciamento Canônico */}
            <footer className="mt-[3rem] pt-[1.5rem] border-t border-[var(--border)] text-[0.75rem] text-[var(--foreground-muted)] font-ui space-y-[0.25rem]">
              <p className="leading-relaxed">{passage.attribution}</p>
              <a
                href={passage.licenseUrl}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-[var(--accent)] text-[0.725rem]"
              >
                Licença CC BY 4.0
              </a>
            </footer>
          </article>
        ) : (
          <div className="text-center py-[4rem] text-[var(--foreground-muted)] font-ui">
            <BookOpen className="w-[2.5rem] h-[2.5rem] mx-auto mb-[0.75rem] opacity-40" />
            Nenhuma passagem selecionada.
          </div>
        )}
      </div>
    </div>
  );
}
