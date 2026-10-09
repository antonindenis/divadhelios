// Worker Cloudflare : sert les fichiers du site et gère la connexion GitHub de l'admin (/api/auth, /api/callback)
// Anciennes pages de l'ancien site, redirigées vers les sections du nouveau
const REDIRECTIONS = {
  '/interventions': '/#faire',
  '/equipe': '/#fondateur',
  '/references': '/#clients',
  '/about': '/mentions-legales.html',
  '/j/legal-guarantee': '/',
  '/j/withdrawal': '/'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Anciennes adresses de l'ancien site (Jimdo) : redirection permanente vers la bonne section
    const cle = url.pathname.replace(/\/+$/, '').toLowerCase() || '/';
    const cible = REDIRECTIONS[cle];
    if (url.hostname.startsWith('www.') || cible) {
      const dest = new URL(cible || (url.pathname + url.search), url);
      dest.hostname = url.hostname.replace(/^www\./, '');
      return Response.redirect(dest.toString(), 301);
    }
    if (url.pathname === '/api/auth') return auth(url, env);
    if (url.pathname === '/api/callback') return callback(url, request, env);
    const res = await env.ASSETS.fetch(request);
    const h = new Headers(res.headers);
    h.set('X-Content-Type-Options', 'nosniff');
    h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    h.set('X-Frame-Options', 'SAMEORIGIN');
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  }
};

function auth(url, env) {
  const state = crypto.randomUUID();
  const gh = new URL('https://github.com/login/oauth/authorize');
  gh.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  gh.searchParams.set('scope', 'repo,user');
  gh.searchParams.set('state', state);
  return new Response(null, { status: 302, headers: { Location: gh.toString(), 'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; Path=/api; SameSite=Lax; Max-Age=600` } });
}

async function callback(url, request, env) {
  const code = url.searchParams.get('code'), state = url.searchParams.get('state');
  const cookie = (request.headers.get('Cookie') || '').match(/oauth_state=([^;]+)/);
  if (!code || !state || !cookie || cookie[1] !== state) return page('error', { message: 'Connexion refusée (état invalide). Relancez la connexion.' });
  const r = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'divadhelios-admin' },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code })
  });
  const data = await r.json();
  if (!data.access_token) return page('error', { message: data.error_description || 'GitHub n\'a pas fourni de jeton.' });
  return page('success', { token: data.access_token, provider: 'github' });
}

// Réponse attendue par Decap CMS : un message envoyé à la fenêtre qui a ouvert la connexion
function page(status, content) {
  const msg = `authorization:github:${status}:${JSON.stringify(content)}`;
  const safe = JSON.stringify(msg).replace(/</g, '\\u003c');
  const body = `<!doctype html><html><body><script>
(function(){var m=${safe};
function recv(e){window.opener.postMessage(m,e.origin);window.removeEventListener('message',recv,false);}
window.addEventListener('message',recv,false);window.opener.postMessage('authorizing:github','*');})();
</script></body></html>`;
  return new Response(body, { headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Set-Cookie': 'oauth_state=; HttpOnly; Secure; Path=/api; Max-Age=0' } });
}
