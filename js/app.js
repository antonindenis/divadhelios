/* Construit la page d'accueil à partir de content/site.json (aucun texte n'est écrit dans index.html) */
(async function () {
  let site;
  try { site = await loadSite(); } catch (e) { document.getElementById('app').innerHTML = '<p style="padding:8rem 1.5rem">Le contenu n\'a pas pu être chargé. Merci de réessayer.</p>'; return; }
  chrome(site, true);
  const k = contacts(site), tel = s => 'tel:' + s.replace(/[^\d+]/g, '');
  const bandeau = id => site.bandeaux.filter(b => b.apres === id).map(b =>
    `<div class="pb${b.alignement === 'droite' ? ' r' : ''}${b.decale ? ' sh' : ''}"><img src="${esc(b.image)}" alt="" loading="lazy" style="--d:${esc(b.position_pc)};--m:${esc(b.position_mobile)}"><p>${esc(b.texte)}</p></div>`).join('');
  const hero = site.hero, fd = site.fondateur, sf = site.savoir_faire, fo = site.formations, rc = site.recommandations, rf = site.references, ct = site.contact, fm = ct.formulaire;
  const phrases = site.marquee.map(esc).join('<i>✦</i>') + '<i>✦</i>';
  const html = `
<section id="top"><div class="rays" aria-hidden="true"><svg viewBox="-100 -100 200 200" id="rays"></svg></div>
  <div class="wrap"><span class="k">${esc(hero.kicker)}</span>
    <h1>${esc(hero.titre_1)}<span><em>${esc(hero.titre_em)}</em> ${esc(hero.titre_2)}</span></h1>
    <p class="lead">${esc(hero.texte)}</p>
    <a class="btn f" href="${esc(hero.bouton_1.lien)}">${esc(hero.bouton_1.label)}</a><a class="btn" href="${esc(hero.bouton_2.lien)}">${esc(hero.bouton_2.label)}</a></div>
  <div class="cities">${esc(hero.villes)}</div></section>
<div class="band" aria-hidden="true"><div>${phrases}${phrases}</div></div>
<section id="fondateur"><div class="wrap fond">
  <div class="arch"><img src="${esc(fd.photo)}" alt="${esc(fd.photo_alt)}"></div>
  <div>${kicker(fd)}<h2>${h2(fd)}</h2>${fd.sous_titre ? `<p class="sub">${esc(fd.sous_titre)}</p>` : ''}<p>${esc(fd.paragraphe_1)}</p><p class="mut">${esc(fd.paragraphe_2)}</p>
    <div class="discs">${fd.stats.map(s => { const in_ = `<b>${esc(s.valeur)}</b><span>${esc(s.libelle)}</span>`; return s.lien ? `<a class="disc" href="${esc(s.lien)}" target="_blank" rel="noopener" aria-label="${esc(s.libelle)} (s'ouvre dans un nouvel onglet)">${in_}</a>` : `<div class="disc">${in_}</div>`; }).join('')}</div></div></div></section>
${bandeau('fondateur')}
<section id="faire" class="dk"><div class="wrap">${kicker(sf)}<h2>${h2(sf)}</h2>
  ${sf.items.map((it, i) => `<div class="row"><small>${String(i + 1).padStart(2, '0')}</small><h3>${esc(it.titre)}</h3><p>${esc(it.texte)}</p></div>`).join('')}</div></section>
${bandeau('faire')}
<section id="formations"><div class="wrap">${kicker(fo)}<h2>${h2(fo)}</h2><p>${esc(fo.intro)}</p>
  <div class="th">${fo.themes.map(t => `<div><h3>${esc(t.titre)}</h3><p>${esc(t.texte)}</p></div>`).join('')}</div></div></section>
${bandeau('formations')}
<section id="reco" class="dk"><div class="wrap">${kicker(rc)}<h2>${h2(rc)}</h2>
  <div class="rail" id="rail" tabindex="0" aria-label="Recommandations LinkedIn">${rc.items.map(r => `<figure class="q" style="margin:0"><blockquote>${esc(r.citation)}</blockquote><cite><b>${esc(r.prenom)}</b>${esc(r.fonction)}</cite></figure>`).join('')}</div>
  <div class="ctl"><button type="button" id="pv" aria-label="Précédent">←</button><span id="ct">01 / ${rc.items.length}</span><button type="button" id="nx" aria-label="Suivant">→</button></div>
  <a class="more" href="${esc(rc.lien_url)}" target="_blank" rel="noopener">${esc(rc.lien_texte)}</a></div></section>
${bandeau('reco')}
<section id="clients"><div class="wrap">${kicker(rf)}<h2>${h2(rf)}</h2><ul class="wall">${rf.noms.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div></section>
<section id="contact"><div class="wrap"><span class="k" style="color:var(--on)">${esc(ct.label)}</span><h2>${h2(ct)}</h2><p>${esc(ct.texte)}</p>
  <a class="btn f" href="${esc(tel(k.telFr))}">${esc(ct.tel_fr_label)} · ${esc(k.telFr)}</a><a class="btn" href="${esc(tel(k.telMa))}">${esc(ct.tel_ma_label)} · ${esc(k.telMa)}</a>
  <form class="cf" id="cf" novalidate>
    <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" style="display:none">
    <label>${esc(fm.nom)}<input type="text" name="name" autocomplete="name" required></label>
    <label>${esc(fm.email)}<input type="email" name="email" autocomplete="email" required></label>
    <label class="w">${esc(fm.message)}<textarea name="message" rows="5" required></textarea></label>
    <p class="mini w">${esc(fm.mention)} <a href="/confidentialite.html">${esc(fm.lien_confidentialite)}</a></p>
    <button class="btn f" type="submit">${esc(fm.bouton)}</button><p class="st w" id="cfs" role="status" aria-live="polite"></p>
  </form>
  <div class="soc">${ct.reseaux.map(r => `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a>`).join('')}</div></div></section>`;
  document.getElementById('app').innerHTML = html;

  /* soleil du haut de page */
  let g = '';
  for (let i = 0; i < 36; i++) { const a = i * 10 * Math.PI / 180, r1 = 44 + (i % 3) * 6, r2 = r1 + 22 + (i % 2) * 18;
    g += `<line x1="${(Math.cos(a) * r1).toFixed(1)}" y1="${(Math.sin(a) * r1).toFixed(1)}" x2="${(Math.cos(a) * r2).toFixed(1)}" y2="${(Math.sin(a) * r2).toFixed(1)}"/>`; }
  document.getElementById('rays').innerHTML = g;

  /* défilement des recommandations */
  const rail = document.getElementById('rail'), cnt = document.getElementById('ct'), n = rc.items.length;
  const step = () => rail.querySelector('.q').getBoundingClientRect().width + 26;
  const upd = () => { const i = Math.min(n, Math.round(rail.scrollLeft / step()) + 1); cnt.textContent = String(i).padStart(2, '0') + ' / ' + n; };
  document.getElementById('nx').onclick = () => rail.scrollBy({ left: step() * 2, behavior: 'smooth' });
  document.getElementById('pv').onclick = () => rail.scrollBy({ left: -step() * 2, behavior: 'smooth' });
  rail.addEventListener('scroll', upd, { passive: true });

  /* formulaire de contact (Web3Forms) */
  const f = document.getElementById('cf'), st = document.getElementById('cfs');
  f.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(f);
    if (d.get('botcheck')) return;
    if (!d.get('name').trim() || !/^\S+@\S+\.\S+$/.test(d.get('email')) || !d.get('message').trim()) { st.textContent = 'Merci de renseigner votre nom, un email valide et votre message.'; return; }
    if (ct.cle_web3forms.indexOf('REMPLACER') === 0) { st.textContent = 'Formulaire non configuré : la clé Web3Forms est à renseigner dans l\'admin.'; return; }
    st.textContent = 'Envoi en cours…';
    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: ct.cle_web3forms, subject: 'Nouveau message depuis divadhelios.com', from_name: "Site Diva d'Hélios", name: d.get('name'), email: d.get('email'), message: d.get('message') }) })
      .then(r => r.json()).then(j => { if (j.success) { f.reset(); st.textContent = 'Merci, votre message est bien parti. Vous aurez une réponse très vite.'; } else { st.textContent = 'Une erreur est survenue. Vous pouvez aussi nous appeler.'; } })
      .catch(() => { st.textContent = 'Une erreur est survenue. Vous pouvez aussi nous appeler.'; });
  });
  if (location.hash) { const el = document.querySelector(location.hash); if (el) el.scrollIntoView(); }
})();
