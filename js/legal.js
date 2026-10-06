/* Pages légales : le texte vient de content/site.json (champs mentions_legales et confidentialite) */
(async function () {
  const page = document.body.dataset.page;
  let site;
  try { site = await loadSite(); } catch (e) { return; }
  chrome(site, false);
  const par = p => `<p>${fill(p, site)}</p>`;
  let body;
  if (page === 'mentions') {
    const m = site.mentions_legales;
    body = `<h1>${esc(m.titre)}</h1>${m.paragraphes.map(par).join('')}`;
    document.title = m.titre + ' · Diva d\'Hélios';
  } else {
    const c = site.confidentialite;
    body = `<h1>${esc(c.titre)}</h1>${c.sections.map(s => `<h2>${esc(s.titre)}</h2>${s.paragraphes.map(par).join('')}`).join('')}<p class="mut">${esc(c.maj)}</p>`;
    document.title = c.titre + ' · Diva d\'Hélios';
  }
  document.getElementById('legal').innerHTML = body;
})();
