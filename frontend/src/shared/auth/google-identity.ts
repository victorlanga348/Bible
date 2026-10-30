export interface GoogleIdentity {
  initialize(options: { client_id: string; nonce: string; auto_select: false; callback: (response: { credential: string }) => void }): void;
  renderButton(element: HTMLElement, options: { type: 'standard'; theme: 'outline'; size: 'large'; text: 'continue_with' }): void;
}
declare global { interface Window { google?: { accounts?: { id?: GoogleIdentity } } } }

let loading: Promise<GoogleIdentity> | null = null;
export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  const ready = window.google?.accounts?.id;
  if (ready) return Promise.resolve(ready);
  if (loading) return loading;
  const promise = new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    const fail = () => {
      clearTimeout(timer); script.remove();
      reject(new Error('Google indisponível. Tenta novamente.'));
    };
    const timer = setTimeout(fail, 15000);
    script.addEventListener('error', fail, { once: true });
    script.addEventListener('load', () => {
      const identity = window.google?.accounts?.id;
      if (!identity) { fail(); return; }
      clearTimeout(timer); resolve(identity);
    }, { once: true });
    document.head.appendChild(script);
  });
  loading = promise;
  const release = () => { if (loading === promise) loading = null; };
  void promise.then(release, release);
  return promise;
}
