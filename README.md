# Site divadhelios.com : mode d'emploi

Site statique (HTML/CSS/JS, sans framework ni build). Tout le contenu est dans `content/site.json`, modifiable depuis `/admin/` (Decap CMS).
Hébergement : Cloudflare Workers avec assets statiques. Déploiement automatique à chaque `git push`.

## Contenu du dossier
- `index.html`, `mentions-legales.html`, `confidentialite.html` : structure des pages (aucun texte en dur).
- `content/site.json` : tous les textes, listes et chemins de photos.
- `js/` (`common.js`, `app.js`, `legal.js`), `css/` (`style.css`, `fonts.css`), `fonts/` (polices hébergées, aucune requête vers Google), `images/`.
- `admin/index.html` + `admin/config.yml` : l'interface d'administration.
- `worker.js` + `wrangler.toml` : Worker Cloudflare (fichiers + connexion GitHub de l'admin).
- Favicons : `favicon.ico`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png` (D noir sur carré jaune).
- `robots.txt`, `sitemap.xml`, `.assetsignore` (empêche de publier worker.js, wrangler.toml, README).

## Étape 1. GitHub
1. **Décompressez le zip** (ne jamais envoyer le zip tel quel).
2. Créez le dépôt `antonindenis/divadhelios` (sinon changez `repo:` dans `admin/config.yml`).
3. Envoyez-y **le contenu** du dossier : `index.html` doit être à la racine du dépôt, pas dans un sous-dossier. Branche `main`.

## Étape 2. Application OAuth GitHub (connexion à l'admin)
1. github.com/settings/developers → OAuth Apps → New OAuth App.
2. Homepage : `https://divadhelios.com` ; Authorization callback URL : `https://divadhelios.com/api/callback`.
3. Copiez le **Client ID** dans `wrangler.toml` (ligne `GITHUB_CLIENT_ID`), puis committez.
4. Générez un **Client Secret** (à garder pour l'étape 4).

## Étape 3. Cloudflare : déploiement
1. Workers & Pages → Create → **Import a repository** (Workers, pas Pages classique) → choisissez le dépôt.
2. Build command : vide. **Deploy command : `npx wrangler deploy`**. Racine : `/`.
3. Après le premier déploiement, vérifiez que le build a bien utilisé le `wrangler.toml` : le site s'ouvre sur l'adresse `…workers.dev` indiquée.

## Étape 4. Secret de l'admin
Worker → Settings → **« Runtime variables and secrets »** (attention : pas la section « Variables and secrets » tout en haut de la page, qui sert au build) → Add → type **Secret** → nom `GITHUB_CLIENT_SECRET` → collez le Client Secret.

## Étape 5. Formulaire de contact
1. Sur web3forms.com, demandez une clé d'accès avec **antonindenis@gmail.com** (elle arrive par email).
2. Dans l'admin : Contact → « Clé Web3Forms ». (Ou directement dans `content/site.json`, champ `contact.cle_web3forms`.)

## Étape 6. Domaine et emails : respecter cet ordre
1. **Cloudflare** : Add a site `divadhelios.com` (offre Free). Notez les 2 serveurs de noms fournis. Vérifiez les enregistrements DNS importés.
2. **Email Routing** (Cloudflare → Email → Email Routing) : créez `antonin@divadhelios.com` et `contact@divadhelios.com` → destination votre Gmail ; cliquez sur le lien de vérification reçu dans Gmail. Acceptez l'ajout automatique des enregistrements MX et SPF.
3. **Transfert du domaine** : le code (AuthCode) est parti de Jimdo vers votre Gmail. Chez **OVH**, commandez le transfert de `divadhelios.com` avec ce code (ne communiquez jamais le code à un tiers). Un transfert .com dure en général quelques jours et ajoute un an à l'échéance (24/03/2027).
4. **Serveurs DNS** : quand OVH confirme le transfert, remplacez les serveurs DNS par ceux de Cloudflare (OVH → Noms de domaine → divadhelios.com → Serveurs DNS). Attendez que Cloudflare affiche « Active ».
5. **Relier le Worker au domaine** : Worker → Settings → Domains & Routes → Add → **Custom domain** `divadhelios.com`, puis `www.divadhelios.com` (le Worker redirige www vers le domaine nu). Si vous préférez une Route `divadhelios.com/*`, il faut en plus un enregistrement DNS proxifié (nuage orange), par exemple `A @ 192.0.2.1`.
6. **Tester** : le site, `/admin/` (connexion GitHub), un message de test par le formulaire, un email à antonin@ et contact@, la redirection de www.
7. **Résilier Jimdo seulement après** ces tests. Faites la bascule un soir ou un week-end calme : entre la fin du transfert et l'activation d'Email Routing, quelques heures de retard de réception sont possibles.

## Utiliser l'admin
`https://divadhelios.com/admin/` → Se connecter avec GitHub → « Tout le contenu du site » → modifier → Publier. Le site se met à jour en 1 à 2 minutes.
- Email et téléphones sont **écrits à l'envers** (champs signalés) pour échapper aux robots. Ex. : `contact@divadhelios.com` s'écrit `moc.soilehdavid@tcatnoc`.
- Les photos se choisissent ou se téléversent dans les champs « Photo ». Le cadrage des bandeaux se règle en pourcentages (horizontal vertical).
- Les textes sont du texte brut (pas de HTML). Jetons autorisés dans les pages légales : `{{email}}`, `{{tel_fr_legal}}`, `{{tel_ma_legal}}`.

## À faire valider (juridique)
- Autorisation des clients cités en références (surtout ceux venus via une plateforme ou une école).
- Adresse de l'hébergeur (Cloudflare) dans les mentions légales ; liste des prestataires de la politique de confidentialité ; formalités CNDP si des personnes au Maroc sont concernées.
- Accord des auteurs des recommandations affichées.
