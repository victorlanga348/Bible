import { useState, useMemo } from 'react';
import { useBooks, usePassage } from '../../shared/api/hooks';
import { VerseSkeleton } from '../../shared/ui/skeleton';
import { Button } from '../../shared/ui/button';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, Copy, Check, Info } from 'lucide-react';
import { useToast } from '../../shared/ui/toast';
import { ReferenceSearch } from './reference-search';
import { ReadingPreferences, type FontSizeOption, type ReaderWidthOption } from './reading-preferences';

interface ReaderViewProps {
  onSelectPassageForStudy?: (reference: string) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export function ReaderView({
  onSelectPassageForStudy,
  isFocusMode = false,
  onToggleFocusMode,
}: ReaderViewProps) {
  const [selectedBook, setSelectedBook] = useState<string>('GEN');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<FontSizeOption>('md');
  const [readerWidth, setReaderWidth] = useState<ReaderWidthOption>('normal');
  const { toast } = useToast();

  // Carrega catálogo canônico real
  const { data: books = [], isLoading: loadingBooks, error: booksError } = useBooks('porbr2018');

  // Carrega versículos do capítulo selecionado
  const {
    data: passage,
    isLoading: loadingPassage,
    error: passageError,
  } = usePassage('porbr2018', selectedBook, selectedChapter);

  // Divisão canônica: Antigo Testamento (1-39) e Novo Testamento (40-66)
  const { oldTestament, newTestament } = useMemo(() => {
    return {
      oldTestament: books.filter((b) => b.order <= 39),
      newTestament: books.filter((b) => b.order > 39),
    };
  }, [books]);

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

  const handlePassageResolved = (bookCode: string, chapter: number, fromVerse?: number, toVerse?: number) => {
    setSelectedBook(bookCode);
    setSelectedChapter(chapter);
    if (fromVerse && toVerse) {
      const range = Array.from({ length: toVerse - fromVerse + 1 }, (_, i) => fromVerse + i);
      setSelectedVerses(range);
    } else if (fromVerse) {
      setSelectedVerses([fromVerse]);
    } else {
      setSelectedVerses([]);
    }
  };

  const fontSizeClasses: Record<FontSizeOption, string> = {
    sm: 'text-[0.95rem] leading-[1.6]',
    md: 'text-[clamp(1.05rem,0.95rem+0.45vw,1.35rem)] leading-[clamp(1.65,1.55+0.25vw,1.9)]',
    lg: 'text-[clamp(1.2rem,1.1rem+0.5vw,1.5rem)] leading-[clamp(1.75,1.65+0.3vw,2.05)]',
    xl: 'text-[clamp(1.35rem,1.25rem+0.6vw,1.75rem)] leading-[clamp(1.85,1.75+0.35vw,2.2)]',
  };

  const readerWidthClasses: Record<ReaderWidthOption, string> = {
    compact: 'max-w-[min(100%,64ch)]',
    normal: 'max-w-[min(100%,76ch)]',
    wide: 'max-w-[min(100%,92ch)]',
  };

  return (
    <div className={`flex flex-col h-full mx-auto px-[1.25rem] py-[1.5rem] ${readerWidthClasses[readerWidth]}`}>
      {/* 1. Barra Superior de Navegação & Pesquisa Rápida */}
      <div className="flex flex-wrap items-center justify-between gap-[0.75rem] pb-[1rem] border-b border-[var(--border)]">
        {/* Seletor Canônico com Agrupamento por Testamento */}
        <div className="flex items-center gap-[0.5rem] flex-wrap">
          <select
            value={selectedBook}
            onChange={(e) => {
              setSelectedBook(e.target.value);
              setSelectedChapter(1);
              setSelectedVerses([]);
            }}
            disabled={loadingBooks}
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-[0.75rem] py-[0.4rem] text-[0.875rem] font-ui font-medium text-[var(--foreground)] cursor-pointer"
          >
            {loadingBooks ? (
              <option>Carregando livros...</option>
            ) : (
              <>
                <optgroup label="Antigo Testamento">
                  {oldTestament.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Novo Testamento">
                  {newTestament.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </optgroup>
              </>
            )}
          </select>

          {currentBookObj && (
            <select
              value={selectedChapter}
              onChange={(e) => {
                setSelectedChapter(Number(e.target.value));
                setSelectedVerses([]);
              }}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-[0.75rem] py-[0.4rem] text-[0.875rem] font-ui font-medium text-[var(--foreground)] cursor-pointer"
            >
              {Array.from({ length: currentBookObj.chapterCount }, (_, i) => i + 1).map((ch) => (
                <option key={ch} value={ch}>
                  Capítulo {ch}
                </option>
              ))}
            </select>
          )}

          {/* Botões Capítulo Anterior / Próximo */}
          <div className="flex items-center gap-[0.25rem]">
            <Button
              variant="outline"
              size="sm"
              disabled={!passage?.previousChapter}
              onClick={() => {
                if (passage?.previousChapter) {
                  setSelectedBook(passage.previousChapter.bookCode);
                  setSelectedChapter(passage.previousChapter.chapter);
                  setSelectedVerses([]);
                }
              }}
              title="Capítulo Anterior"
              className="w-[2rem] h-[2rem] p-0"
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
                  setSelectedVerses([]);
                }
              }}
              title="Próximo Capítulo"
              className="w-[2rem] h-[2rem] p-0"
            >
              <ChevronRight className="w-[1rem] h-[1rem]" />
            </Button>
          </div>
        </div>

        {/* Campo de Resolução Rápida de Referências ("GEN 1:1-3", "Jo 3:16") */}
        <ReferenceSearch onPassageResolved={handlePassageResolved} />
      </div>

      {/* 2. Barra de Preferências de Leitura */}
      <div className="flex flex-wrap items-center justify-between gap-[0.5rem] py-[0.75rem] border-b border-[var(--border)]">
        <span className="text-[0.75rem] text-[var(--foreground-muted)] font-ui">
          Bíblia Livre (BLIVRE) · porbr2018 · Cânone de 66 Livros
        </span>

        {onToggleFocusMode && (
          <ReadingPreferences
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            readerWidth={readerWidth}
            onReaderWidthChange={setReaderWidth}
            isFocusMode={isFocusMode}
            onToggleFocusMode={onToggleFocusMode}
          />
        )}
      </div>

      {/* 3. Barra de Ações ao Selecionar Versículos */}
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

      {/* 4. Corpo do Texto Canônico (Tipografia Fluida e Numeração Discreta) */}
      <div className="flex-1 py-[1.5rem]">
        {loadingPassage ? (
          <div className="space-y-[1.25rem]">
            {Array.from({ length: 6 }).map((_, idx) => (
              <VerseSkeleton key={idx} />
            ))}
          </div>
        ) : passageError || booksError ? (
          <div className="p-[1.5rem] rounded-[var(--radius-md)] border border-rose-900/30 bg-rose-950/10 text-rose-300 space-y-[0.5rem]">
            <div className="font-semibold text-[0.95rem] flex items-center gap-[0.5rem]">
              <Info className="w-[1.125rem] h-[1.125rem]" />
              Erro ao Carregar o Texto Bíblico
            </div>
            <p className="text-[0.85rem] leading-relaxed">
              {passageError instanceof Error ? passageError.message : 'Verifique se o backend NestJS está em execução na porta 3000.'}
            </p>
          </div>
        ) : passage ? (
          <article className="space-y-[1.5rem]">
            {/* Título do Capítulo */}
            <header className="mb-[2.5rem] text-center space-y-[0.35rem]">
              <h1 className="font-editorial-heading font-semibold text-[clamp(1.85rem,1.5rem+1.2vw,2.75rem)] text-[var(--foreground)]">
                {currentBookObj?.name} {passage.chapter}
              </h1>
              <p className="text-[0.75rem] uppercase tracking-widest text-[var(--foreground-muted)] font-ui">
                Texto integral · {passage.verses.length} versículos
              </p>
            </header>

            {/* Versículos */}
            <div className={`font-scripture text-[var(--foreground)] space-y-[0.85rem] ${fontSizeClasses[fontSize]}`}>
              {passage.verses.map((v) => {
                const isSelected = selectedVerses.includes(v.number);
                return (
                  <p
                    key={v.number}
                    onClick={() => toggleVerseSelection(v.number)}
                    className={`group relative rounded-[var(--radius-sm)] p-[0.35rem] transition-colors cursor-pointer select-text ${
                      isSelected
                        ? 'bg-[var(--highlight)] text-[#141B1A] font-medium shadow-xs'
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

            {/* Rodapé Canônico */}
            <footer className="mt-[4rem] pt-[1.5rem] border-t border-[var(--border)] text-[0.75rem] text-[var(--foreground-muted)] font-ui space-y-[0.25rem]">
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
