import { useEffect, useRef, useState } from 'react';
import { request } from '../api/http-client';
import { useSession } from '../hooks/use-session';
import { Button } from '../ui/button';
import { loadGoogleIdentity } from './google-identity';

export function GoogleSignIn({ onAccess }: { onAccess: () => void }) {
  const { setSession } = useSession();
  const target = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'verifying' | 'error'>('loading');
  useEffect(() => {
    const element = target.current;
    let active = true, exchanging = false;
    const controller = new AbortController();
    const signal = () => AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]);
    async function prepare() {
      try {
        const bootstrap = await request<{ clientId: string; nonce: string }>('/auth/google/bootstrap', {
          credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: signal(),
        });
        if (!/^[0-9]+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(bootstrap.clientId)
          || !/^[A-Za-z0-9_-]{43}$/.test(bootstrap.nonce)) throw new Error('Invalid bootstrap');
        const google = await loadGoogleIdentity();
        if (!active || !element) return;
        google.initialize({ client_id: bootstrap.clientId, nonce: bootstrap.nonce, auto_select: false,
          callback: response => {
            if (!active || exchanging) return;
            exchanging = true; setPhase('verifying');
            void (async () => {
              try {
                const access = await request<{ accessToken: string; tokenType: string; expiresIn: number }>('/auth/google', {
                  method: 'POST', credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: signal(),
                  body: { credential: response.credential, csrfToken: bootstrap.nonce },
                });
                if (!active) return;
                if (typeof access.accessToken !== 'string' || access.tokenType !== 'Bearer' || access.expiresIn !== 3600) throw new Error('Invalid exchange');
                if (await setSession(access.accessToken) && active) onAccess();
              } catch { if (active) setPhase('error'); }
              finally { exchanging = false; }
            })();
          },
        });
        google.renderButton(element, { type: 'standard', theme: 'outline', size: 'large', text: 'continue_with' });
        setPhase('ready');
      } catch { if (active) setPhase('error'); }
    }
    void prepare();
    return () => { active = false; controller.abort(); element?.replaceChildren(); };
  }, [attempt, onAccess, setSession]);

  return <div className="space-y-[0.75rem]">
    <div ref={target} hidden={phase !== 'ready'} />
    {(phase === 'loading' || phase === 'verifying') && <p role="status" className="text-[0.85rem] text-[var(--foreground-muted)]">
      {phase === 'loading' ? 'A preparar o acesso Google…' : 'A confirmar o teu acesso…'}
    </p>}
    {phase === 'error' && <>
      <p role="alert" className="text-[0.85rem] text-[var(--foreground-muted)]">Não foi possível entrar com Google. Tenta novamente.</p>
      <Button variant="secondary" onClick={() => { setPhase('loading'); setAttempt(value => value + 1); }}>Tentar novamente</Button>
    </>}
  </div>;
}
