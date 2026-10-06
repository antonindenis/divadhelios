/* Fonctions communes : chargement du contenu, protection anti-spam, en-tête et pied de page */
const rev = s => [...String(s)].reverse().join('');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function loadSite() {
  const r = await fetch('/content/site.json', { cache: 'no-cache' });
  if (!r.ok) throw new Error('Contenu introuvable');
  return r.json();
}
/* Email et téléphones sont écrits à l'envers dans site.json et remis à l'endroit ici : les robots qui lisent le fichier ne les voient pas */
function contacts(site) {
  const c = site.contact;
  return { email: rev(c.email), telFr: rev(c.tel_fr), telMa: rev(c.tel_ma), telFrL: rev(c.tel_fr_legal), telMaL: rev(c.tel_ma_legal) };
}
function fill(text, site) {
  const k = contacts(site);
  return esc(text)
    .replace(/\{\{email\}\}/g, `<a href="mailto:${esc(k.email)}">${esc(k.email)}</a>`)
    .replace(/\{\{tel_fr_legal\}\}/g, esc(k.telFrL)).replace(/\{\{tel_ma_legal\}\}/g, esc(k.telMaL))
    .replace(/\{\{tel_fr\}\}/g, esc(k.telFr)).replace(/\{\{tel_ma\}\}/g, esc(k.telMa));
}
const h2 = t => `${esc(t.titre_avant)} <em>${esc(t.titre_em)}</em> ${esc(t.titre_apres)}`.replace(/\s+/g, ' ').trim();
const kicker = t => `<span class="k">${t.numero ? `<b>${esc(t.numero)}</b>` : ''}${esc(t.label)}</span>`;
function chrome(site, home) {
  const base = home ? '' : '/';
  document.querySelector('header').innerHTML =
    `<a href="${base}#top" aria-label="Diva d'Hélios, accueil"><img class="lb" src="${esc(site.marque.logo)}" alt="${esc(site.marque.logo_alt)}"></a>` +
    `<nav>${site.navigation.map(n => `<a href="${base}${esc(n.ancre)}">${esc(n.label)}</a>`).join('')}</nav>`;
  const p = site.pied_de_page;
  document.querySelector('footer').innerHTML =
    `<img class="lb" src="${esc(site.marque.logo)}" alt="Diva d'Hélios">${esc(p.texte)}` +
    `<div class="legal">${p.liens.map(l => `<a href="${esc(l.url)}">${esc(l.label)}</a>`).join(' · ')}</div>`;
  document.title = site.meta.titre;
}
