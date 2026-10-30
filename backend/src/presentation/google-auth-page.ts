export function googleAuthPage(clientId: string, nonce: string): string {
  const attribute = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Entrar · Bíblia</title>
<style>body{font:17px/1.6 system-ui,sans-serif;background:#f4f1e9;color:#242820;margin:0;padding:8vh 24px}main{max-width:540px;margin:auto}h1{font:500 42px/1.15 Georgia,serif;margin:16px 0}p{max-width:48ch}.label{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#53604c}#status{min-height:3em}textarea{box-sizing:border-box;width:100%;min-height:130px;margin-top:12px}button{font:inherit;padding:8px 14px;margin:10px 8px 0 0;cursor:pointer}a{color:#344d31}small{display:block;margin-top:32px;color:#53604c}</style></head>
<body><main><div class="label">Bíblia · Acesso pessoal</div><h1>Entra no teu espaço de estudo.</h1><p>Usa a tua conta Google para acessar os teus estudos, notas e favoritos.</p>
<div id="g_id_onload" data-client_id="${attribute(clientId)}" data-callback="onGoogleCredential" data-nonce="${attribute(nonce)}" data-auto_prompt="false"></div><div class="g_id_signin" data-type="standard" data-size="large" data-theme="outline" data-text="signin_with"></div>
<p id="status" role="status" aria-live="polite">Escolhe a tua conta para continuar.</p><section id="session" hidden><label for="access-token">Token para acesso à API local</label><textarea id="access-token" readonly spellcheck="false"></textarea><button id="copy-token" type="button">Copiar token</button><button id="clear-session" type="button">Limpar sessão neste navegador</button></section>
<small>O token fica apenas nesta página e expira em uma hora. Não o partilhes. Estudos de outros acessos locais não são associados automaticamente.</small><p><a href="/docs/">Documentação da API</a></p></main><script src="/auth/google/client.js"></script><script src="https://accounts.google.com/gsi/client" async></script></body></html>`;
}

// Served as an external, same-origin script; credentials never enter URLs/storage/logs.
export const googleAuthClient = `'use strict';
let activeAccessToken = '';
const status = document.getElementById('status');
const session = document.getElementById('session');
const tokenField = document.getElementById('access-token');
window.onGoogleCredential = async function(response) {
  status.textContent = 'Validando o acesso…';
  try {
    const csrfToken = document.getElementById('g_id_onload').dataset.nonce;
    const exchanged = await fetch('/auth/google', {method:'POST', credentials:'same-origin', cache:'no-store', redirect:'error', headers:{'Content-Type':'application/json'}, body:JSON.stringify({credential:response.credential, csrfToken}), signal:AbortSignal.timeout(15000)});
    if (!exchanged.ok) throw new Error('Authentication failed');
    const access = await exchanged.json();
    const checked = await fetch('/auth/me', {headers:{Authorization:'Bearer '+access.accessToken}, cache:'no-store', redirect:'error', signal:AbortSignal.timeout(15000)});
    if (!checked.ok) throw new Error('Session confirmation failed');
    activeAccessToken = access.accessToken; tokenField.value = activeAccessToken; session.hidden = false;
    status.textContent = 'Entraste com Google. A sessão é válida durante uma hora.';
  } catch {
    activeAccessToken = ''; tokenField.value = ''; session.hidden = true;
    status.textContent = 'Não foi possível entrar. Recarrega a página e tenta novamente.';
  }
};
document.getElementById('copy-token').addEventListener('click', async function() {
  try { await navigator.clipboard.writeText(activeAccessToken); status.textContent = 'Token copiado. Mantém-no privado.'; }
  catch { tokenField.focus(); tokenField.select(); status.textContent = 'Seleciona e copia o token manualmente.'; }
});
document.getElementById('clear-session').addEventListener('click', function() {
  activeAccessToken = ''; tokenField.value = ''; session.hidden = true;
  status.textContent = 'Sessão removida desta página. Recarrega para entrar novamente.';
});`;
