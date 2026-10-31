import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import {
  BookOpen,
  Compass,
  Library,
  Clock,
  Sparkles,
  Sun,
  Moon,
  KeyRound,
  Menu,
  X,
  ChevronRight,
  Minimize2,
} from 'lucide-react';
import { useTheme } from '../hooks/use-theme';
import { useSession } from '../hooks/use-session';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { Input } from './input';
import { GoogleSignIn } from '../auth/google-sign-in';

export type NavTab = 'reader' | 'study' | 'sources' | 'history';

const AccountAccessContext = createContext<(() => void) | null>(null);

function useAccountAccess() {
  const openAccount = useContext(AccountAccessContext);
  if (!openAccount) throw new Error('AppShell requires AccountAccessProvider');
  return openAccount;
}

// Access feedback survives replacement of the private UI/cache generation.
export function AccountAccessProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, status, setSession, clearSession } = useSession();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const closeAuth = useCallback(() => {
    setAuthDialogOpen(false); setTokenInput(''); setAuthError(null);
  }, []);
  const openAuth = useCallback(() => {
    setTokenInput(''); setAuthError(null); setAuthDialogOpen(true);
  }, []);
  const handleSaveToken = async () => {
    setAuthError(null);
    try { if (await setSession(tokenInput)) closeAuth(); }
    catch { setAuthError('Não foi possível confirmar a sessão. Verifica o token e tenta novamente.'); }
  };

  return <AccountAccessContext.Provider value={openAuth}>
    {children}
    <Dialog open={authDialogOpen} onOpenChange={open => { if (open) openAuth(); else closeAuth(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entra no teu espaço de estudo.</DialogTitle>
          <DialogDescription>
            Acede aos teus estudos, notas e favoritos com a tua conta Google. A sessão fica apenas neste navegador enquanto a página estiver aberta.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-[1rem] py-[0.5rem]">
          {authDialogOpen && <GoogleSignIn onAccess={closeAuth} />}
          <details className="border-t border-[var(--border)] pt-[1rem]">
            <summary className="text-[0.8rem] text-[var(--foreground-muted)] cursor-pointer">Usar um token local</summary>
            <form className="space-y-[0.75rem] mt-[0.75rem]" onSubmit={event => { event.preventDefault(); void handleSaveToken(); }}>
              <label htmlFor="local-access-token" className="block text-[0.8rem] font-medium">Token de acesso local</label>
              <Input id="local-access-token" type="password" autoComplete="off" spellCheck={false}
                value={tokenInput} onChange={event => setTokenInput(event.target.value)} />
              {authError && <p role="alert" className="text-[0.8rem] text-[var(--foreground-muted)]">{authError}</p>}
              <Button type="submit" disabled={!tokenInput.trim() || status === 'validating'}>Confirmar acesso local</Button>
            </form>
          </details>
        </div>
        {isAuthenticated && <DialogFooter>
          <Button variant="ghost" onClick={() => { clearSession(); closeAuth(); }}>Sair da conta</Button>
        </DialogFooter>}
      </DialogContent>
    </Dialog>
  </AccountAccessContext.Provider>;
}

interface ShellProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  children: React.ReactNode;
  contextPanel?: React.ReactNode;
  isContextOpen?: boolean;
  onToggleContext?: () => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export function AppShell({
  activeTab,
  onTabChange,
  children,
  contextPanel,
  isContextOpen = true,
  onToggleContext,
  isFocusMode = false,
  onToggleFocusMode,
}: ShellProps) {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, status } = useSession();
  const openAccount = useAccountAccess();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileContextTab, setMobileContextTab] = useState<NavTab | null>(null);
  const mobileContextOpen = mobileContextTab === activeTab;

  // Atalhos de teclado para acessibilidade e navegação fluida
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: sai do modo foco se ativo
      if (e.key === 'Escape' && isFocusMode && onToggleFocusMode) {
        onToggleFocusMode();
      }
      // Ctrl+Shift+F: alternar modo foco
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        onToggleFocusMode?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, onToggleFocusMode]);

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'reader', label: 'Bíblia', icon: <BookOpen className="w-[1.125rem] h-[1.125rem]" /> },
    { id: 'study', label: 'Estudo Estruturado', icon: <Compass className="w-[1.125rem] h-[1.125rem]" /> },
    { id: 'sources', label: 'Fontes Históricas', icon: <Library className="w-[1.125rem] h-[1.125rem]" /> },
    { id: 'history', label: 'Histórico & Workspace', icon: <Clock className="w-[1.125rem] h-[1.125rem]" /> },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)] relative">
      {/* Skip to Main Content Link (Acessibilidade WCAG 2.2) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-[1rem] focus:left-[1rem] z-50 px-[1rem] py-[0.5rem] bg-[var(--accent)] text-[var(--accent-foreground)] rounded-[var(--radius-md)] text-[0.85rem] font-ui shadow-lg outline-none"
      >
        Pular para o conteúdo principal
      </a>

      {/* 1. Região Esquerda — Navegação Desktop (Oculta em Modo Foco) */}
      {!isFocusMode && (
        <aside
          role="navigation"
          aria-label="Navegação Principal"
          className="hidden md:flex flex-col w-[16rem] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-[1rem] justify-between z-20 transition-all duration-200"
        >
          <div className="space-y-[1.5rem]">
            {/* Logo e Identidade */}
            <div className="flex items-center gap-[0.75rem] px-[0.5rem] py-[0.25rem]">
              <div className="flex items-center justify-center w-[2rem] h-[2rem] rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-foreground)] font-serif font-bold text-[1.125rem]">
                Ω
              </div>
              <div>
                <span className="font-editorial-heading font-semibold text-[1.05rem] tracking-tight block leading-tight text-[var(--foreground)]">
                  Bíblia App
                </span>
                <span className="text-[0.7rem] text-[var(--foreground-muted)] tracking-wide uppercase font-medium">
                  Investigação
                </span>
              </div>
            </div>

            {/* Menus de Navegação */}
            <nav className="space-y-[0.35rem]">
              {navItems.map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full flex items-center justify-between px-[0.875rem] py-[0.625rem] rounded-[var(--radius-md)] text-[0.875rem] font-medium font-ui transition-all duration-150 cursor-pointer ${
                      active
                        ? 'bg-[var(--surface-muted)] text-[var(--foreground)] font-semibold shadow-xs'
                        : 'text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]/60 hover:text-[var(--foreground)]'
                    }`}
                  >
                    <div className="flex items-center gap-[0.75rem]">
                      <span className={active ? 'text-[var(--accent)]' : 'text-current'}>{item.icon}</span>
                      {item.label}
                    </div>
                    {active && <ChevronRight className="w-[0.9rem] h-[0.9rem] text-[var(--accent)]" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Rodapé da Sidebar: Sessão & Tema */}
          <div className="space-y-[0.75rem] pt-[1rem] border-t border-[var(--border)]">
            {/* Estado de Sessão */}
            <div className="flex items-center justify-between px-[0.5rem]">
              <div className="flex items-center gap-[0.5rem]">
                <span
                  className={`w-[0.5rem] h-[0.5rem] rounded-full ${
                    isAuthenticated ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span className="text-[0.75rem] text-[var(--foreground-muted)] font-ui">
                  {isAuthenticated ? 'Sessão Ativa' : status === 'validating' ? 'A confirmar acesso…' : 'Sem sessão'}
                </span>
              </div>
              <button
                onClick={openAccount}
                aria-label={isAuthenticated ? 'Gerir conta' : 'Entrar na conta'}
                title={isAuthenticated ? 'Gerir conta' : 'Entrar na conta'}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] p-[0.25rem] rounded-[var(--radius-sm)] hover:bg-[var(--surface-muted)] cursor-pointer"
              >
                <KeyRound className="w-[0.95rem] h-[0.95rem]" />
              </button>
            </div>

            {/* Toggle de Tema */}
            <div className="flex items-center justify-between px-[0.5rem]">
              <span className="text-[0.75rem] text-[var(--foreground-muted)] font-ui">
                {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
              </span>
              <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
                className="p-[0.35rem] rounded-[var(--radius-md)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] cursor-pointer transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-[1rem] h-[1rem]" />
                ) : (
                  <Moon className="w-[1rem] h-[1rem]" />
                )}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Botão Flutuante para Sair do Modo Foco */}
      {isFocusMode && onToggleFocusMode && (
        <button
          onClick={onToggleFocusMode}
          title="Sair do Modo Foco (Esc)"
          className="fixed top-[1rem] right-[1rem] z-50 flex items-center gap-[0.35rem] px-[0.75rem] py-[0.4rem] rounded-[var(--radius-md)] bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] shadow-md text-[0.8rem] font-ui hover:bg-[var(--surface-muted)] cursor-pointer animate-in fade-in-50"
        >
          <Minimize2 className="w-[0.9rem] h-[0.9rem]" />
          <span>Sair do Modo Foco</span>
        </button>
      )}

      {/* 2. Região Central & Superior (Mobile Header + Conteúdo) */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Header Mobile (Oculto em Modo Foco) */}
        {!isFocusMode && (
          <header className="md:hidden flex items-center justify-between px-[1rem] py-[0.75rem] border-b border-[var(--border)] bg-[var(--surface)] z-30">
            <div className="flex items-center gap-[0.5rem]">
              <div className="w-[1.75rem] h-[1.75rem] rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-foreground)] font-serif font-bold text-[0.9rem] flex items-center justify-center">
                Ω
              </div>
              <span className="font-editorial-heading font-semibold text-[1rem]">Bíblia App</span>
            </div>
            <div className="flex items-center gap-[0.5rem]">
              {onToggleContext && (
                <button
                  onClick={() => setMobileContextTab(mobileContextOpen ? null : activeTab)}
                  aria-label={mobileContextOpen ? 'Fechar Painel Contextual de IA' : 'Abrir Painel Contextual de IA'}
                  aria-expanded={mobileContextOpen}
                  aria-controls="study-context-panel"
                  className="p-[0.35rem] rounded-[var(--radius-md)] text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
                >
                  <Sparkles className="w-[1.125rem] h-[1.125rem] text-[var(--accent)]" />
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Fechar Menu' : 'Abrir Menu'}
                className="p-[0.35rem] rounded-[var(--radius-md)] text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
              >
                {mobileMenuOpen ? <X className="w-[1.25rem] h-[1.25rem]" /> : <Menu className="w-[1.25rem] h-[1.25rem]" />}
              </button>
            </div>
          </header>
        )}

        {/* Menu Dropdown Mobile */}
        {mobileMenuOpen && !isFocusMode && (
          <div className="md:hidden border-b border-[var(--border)] bg-[var(--surface)] px-[1rem] py-[0.75rem] space-y-[0.5rem] z-20">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                  setMobileContextTab(null);
                }}
                className={`w-full flex items-center gap-[0.75rem] px-[0.75rem] py-[0.5rem] rounded-[var(--radius-md)] text-[0.875rem] font-ui ${
                  activeTab === item.id
                    ? 'bg-[var(--surface-muted)] text-[var(--foreground)] font-semibold'
                    : 'text-[var(--foreground-muted)]'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <div className="pt-[0.5rem] border-t border-[var(--border)] flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAccount();
                }}
              >
                <KeyRound className="w-[0.85rem] h-[0.85rem]" />
                Conta e acesso
              </Button>
              <button
                onClick={toggleTheme}
                className="p-[0.35rem] rounded-[var(--radius-md)] text-[var(--foreground-muted)]"
              >
                {theme === 'dark' ? <Sun className="w-[1rem] h-[1rem]" /> : <Moon className="w-[1rem] h-[1rem]" />}
              </button>
            </div>
          </div>
        )}

        {/* Área Principal de Conteúdo e Painel Contextual */}
        <div className="flex flex-1 min-w-0 h-full overflow-hidden">
          {/* Palco Central (Leitor / Estudo / Fontes) */}
          <main id="main-content" tabIndex={-1} className={`${mobileContextOpen ? 'hidden lg:block ' : ''}flex-1 min-w-0 h-full overflow-y-auto outline-none`}>
            {children}
          </main>

          {/* 3. Região Direita — Painel Contextual Inteligente (Oculto em Modo Foco) */}
          {contextPanel && (isContextOpen || mobileContextOpen) && !isFocusMode && (
            <aside
              id="study-context-panel"
              role="complementary"
              aria-label="Painel de Investigação e IA"
              className={`${mobileContextOpen ? 'flex w-full' : 'hidden'} ${isContextOpen ? 'lg:flex' : 'lg:hidden'} lg:w-[min(38vw,26rem)] flex-col shrink-0 lg:border-l border-[var(--border)] bg-[var(--surface)] h-full overflow-y-auto z-10 transition-all duration-200`}
            >
              {contextPanel}
            </aside>
          )}
        </div>
      </div>

    </div>
  );
}
