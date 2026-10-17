/* =====================================================================
   Seimei · Suivi des pathologies — documentation de la branche
   En-tête, sommaire, recherche, boutons « Copier » et petits effets.
   ===================================================================== */

const PAGES = [
  { id: 'accueil', fichier: 'index.html', titre: 'Accueil', nav: 'Accueil' },
  { id: 'fonctionnement', fichier: 'fonctionnement.html', titre: 'Fonctionnement de la branche', nav: 'Fonctionnement' },
  { id: 'pathologies', fichier: 'pathologies.html', titre: 'Suivi par pathologie', nav: 'Pathologies' },
  { id: 'reeducation', fichier: 'reeducation.html', titre: 'Séances de rééducation', nav: 'Rééducation' },
  { id: 'deroulement', fichier: 'deroulement.html', titre: 'Déroulement d’un suivi', nav: 'Déroulement' },
  { id: 'modeles', fichier: 'modeles.html', titre: 'Modèles Discord', nav: 'Modèles' },
  { id: 'faq', fichier: 'faq.html', titre: 'FAQ et glossaire', nav: 'FAQ' },
];

const ICONES = {
  recherche: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  fermer: '<path d="M6 6l12 12M18 6 6 18"/>',
  haut: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  sommaire: '<path d="M4 6h16M4 12h10M4 18h13"/>',
  copier: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
  ok: '<path d="m5 12 4.5 4.5L19 7"/>',
  fleche: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};

const LIMITE_DISCORD = 2000;
const pageActuelle = PAGES.find((p) => p.id === document.body.dataset.page) || PAGES[0];

function icone(nom) {
  return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nom]}</svg>`;
}

function element(balise, attributs = {}, html = '') {
  const el = document.createElement(balise);
  for (const [cle, valeur] of Object.entries(attributs)) el.setAttribute(cle, valeur);
  if (html) el.innerHTML = html;
  return el;
}

function texteTitre(titre) {
  if (titre.dataset.sommaire) return titre.dataset.sommaire;
  const copie = titre.cloneNode(true);
  copie.querySelectorAll('.emoji, .ancre').forEach((n) => n.remove());
  return copie.textContent.replace(/\s+/g, ' ').trim();
}

/* ---------- En-tête et pied de page ---------- */

function construireEntete() {
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const liens = PAGES.map((p) =>
    `<a href="${p.fichier}"${p.id === pageActuelle.id ? ' aria-current="page"' : ''}>${p.nav}</a>`).join('');

  const entete = element('header', { class: 'entete' }, `
    <a class="marque" href="index.html" aria-label="Seimei, suivi des pathologies : accueil">
      <span class="sceau" aria-hidden="true"><span>生</span><span>命</span></span>
      <span><strong>Seimei</strong><small>Suivi des pathologies</small></span>
    </a>
    <nav class="nav-principale" id="nav-principale" aria-label="Pages de la documentation">${liens}</nav>
    <button class="bouton-recherche" type="button" aria-label="Rechercher dans la documentation">
      ${icone('recherche')}<span>Rechercher</span><kbd>${mac ? '⌘' : 'Ctrl'} K</kbd>
    </button>
    <button class="bouton-menu" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="nav-principale">${icone('menu')}</button>
  `);

  const passer = element('a', { class: 'passer', href: '#contenu' }, 'Aller au contenu');
  const fond = document.querySelector('.fond');
  if (fond) fond.after(passer, entete);
  else document.body.prepend(passer, entete);

  const nav = entete.querySelector('.nav-principale');
  const boutonMenu = entete.querySelector('.bouton-menu');
  const basculerMenu = (ouvert) => {
    nav.classList.toggle('ouvert', ouvert);
    boutonMenu.setAttribute('aria-expanded', String(ouvert));
    boutonMenu.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    boutonMenu.innerHTML = icone(ouvert ? 'fermer' : 'menu');
  };
  boutonMenu.addEventListener('click', () => basculerMenu(!nav.classList.contains('ouvert')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) basculerMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('ouvert')) basculerMenu(false); });
  document.addEventListener('click', (e) => {
    // composedPath() garde le chemin d'origine, même si l'icône cliquée vient d'être remplacée.
    if (nav.classList.contains('ouvert') && !e.composedPath().includes(entete)) basculerMenu(false);
  });

  entete.querySelector('.bouton-recherche').addEventListener('click', ouvrirRecherche);
}

function construirePied() {
  const pied = element('footer', { class: 'pied' }, `
    <span class="kanji" aria-hidden="true">生命</span>
    Seimei · Branche « Suivi des pathologies », en lien avec l’IRS.<br>
    Ce site explique le fonctionnement de la branche : le suivi lui-même se déroule sur le forum Discord.
  `);
  document.body.append(pied);
}

function construireSuitePages() {
  const main = document.querySelector('main');
  const index = PAGES.indexOf(pageActuelle);
  const avant = PAGES[index - 1];
  const apres = PAGES[index + 1];
  if (!main || (!avant && !apres)) return;
  const nav = element('nav', { class: 'suite-pages', 'aria-label': 'Page précédente et suivante' });
  if (avant) nav.append(element('a', { href: avant.fichier }, `<small>← Précédent</small><strong>${avant.titre}</strong>`));
  if (apres) nav.append(element('a', { href: apres.fichier, class: 'apres' }, `<small>Suivant →</small><strong>${apres.titre}</strong>`));
  main.append(nav);
}

/* ---------- Ancres et sommaire ---------- */

function titresDuContenu() {
  return [...document.querySelectorAll('main h2[id], main h3[id]')].filter((t) => !t.closest('[data-hors-sommaire]'));
}

function ajouterAncres() {
  document.querySelectorAll('main h2[id], main h3[id]').forEach((titre) => {
    const ancre = element('a', { class: 'ancre', href: `#${titre.id}`, 'aria-label': `Lien direct vers « ${texteTitre(titre)} »` }, '#');
    titre.append(ancre);
  });
}

function construireSommaire() {
  const mise = document.querySelector('.mise-en-page');
  const titres = titresDuContenu();
  if (!mise) return;
  if (titres.length < 2) { mise.classList.add('sans-sommaire'); return; }

  // Sommaire latéral (grands écrans)
  const aside = element('aside', { class: 'sommaire-page', 'aria-label': 'Sommaire de la page' });
  aside.append(element('div', { class: 'titre' }, `${icone('sommaire')} Sur cette page`));
  const liste = element('ol');
  const liensParId = new Map();
  for (const titre of titres) {
    const li = element('li');
    const a = element('a', { href: `#${titre.id}` });
    a.textContent = texteTitre(titre);
    if (titre.tagName === 'H3') a.classList.add('sous');
    li.append(a);
    liste.append(li);
    liensParId.set(titre.id, a);
  }
  aside.append(liste);
  mise.append(aside);

  // Sommaire repliable (mobiles et tablettes)
  const mobile = element('nav', { class: 'sommaire-mobile', 'aria-label': 'Sommaire de la page' });
  const details = element('details');
  details.append(element('summary', {}, 'Sur cette page'));
  const racine = element('ol');
  let dernierH2 = null;
  for (const titre of titres) {
    const li = element('li');
    const a = element('a', { href: `#${titre.id}` });
    a.textContent = texteTitre(titre);
    li.append(a);
    if (titre.tagName === 'H3' && dernierH2) {
      let sous = dernierH2.querySelector(':scope > ol');
      if (!sous) { sous = element('ol'); dernierH2.append(sous); }
      sous.append(li);
    } else {
      racine.append(li);
      if (titre.tagName === 'H2') dernierH2 = li;
    }
  }
  details.append(racine);
  details.addEventListener('click', (e) => { if (e.target.closest('a')) details.open = false; });
  mobile.append(details);
  const hero = document.querySelector('main .hero-doc');
  if (hero) hero.after(mobile);
  else document.querySelector('main').prepend(mobile);

  // Section en cours de lecture
  let actif = null;
  let enAttente = false;
  const majActif = () => {
    enAttente = false;
    const limite = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hauteur-entete')) + 60;
    let courant = titres[0];
    for (const titre of titres) {
      if (titre.getBoundingClientRect().top - limite <= 0) courant = titre;
      else break;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) courant = titres[titres.length - 1];
    const lien = liensParId.get(courant.id);
    if (lien === actif) return;
    actif?.classList.remove('actif');
    actif = lien;
    actif.classList.add('actif');
    const haut = actif.offsetTop - aside.clientHeight / 2;
    if (actif.offsetTop < aside.scrollTop || actif.offsetTop > aside.scrollTop + aside.clientHeight - 40) aside.scrollTo({ top: haut });
  };
  window.addEventListener('scroll', () => { if (!enAttente) { enAttente = true; requestAnimationFrame(majActif); } }, { passive: true });
  window.addEventListener('resize', majActif);
  majActif();
}

/* Ouvre les sections repliées qui contiennent l'ancre visée. */
function revelerAncre() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const cible = document.getElementById(id);
  if (!cible) return;
  let parent = cible.closest('details');
  let ouvert = false;
  while (parent) {
    if (!parent.open) { parent.open = true; ouvert = true; }
    parent = parent.parentElement.closest('details');
  }
  if (cible.tagName === 'DETAILS' && !cible.open) { cible.open = true; ouvert = true; }
  if (ouvert) requestAnimationFrame(() => cible.scrollIntoView());
}

/* ---------- Recherche dans toute la documentation ---------- */

let dialogue = null;
let index = null;
let chargement = null;

function normaliser(texte) {
  // Chaque unité du texte d'origine donne exactement une unité : les positions restent alignées,
  // même avec des émojis (deux unités chacun).
  let sortie = '';
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    const n = c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    sortie += n.length === 1 ? n : c;
  }
  return sortie;
}

function decouperSections(doc, page) {
  const main = doc.querySelector('main');
  if (!main) return [];
  const sections = [];
  let section = { page, id: '', titre: page.titre, morceaux: [] };
  sections.push(section);
  const parcours = doc.createTreeWalker(main, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeType === Node.ELEMENT_NODE && /^(SCRIPT|STYLE|TEMPLATE)$/.test(n.tagName)
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  let titreEnCours = null;
  for (let noeud = parcours.nextNode(); noeud; noeud = parcours.nextNode()) {
    if (noeud.nodeType === Node.ELEMENT_NODE) {
      if (/^H[23]$/.test(noeud.tagName) && noeud.id) {
        titreEnCours = noeud;
        section = { page, id: noeud.id, titre: texteTitre(noeud), morceaux: [] };
        sections.push(section);
      }
      continue;
    }
    if (titreEnCours && titreEnCours.contains(noeud)) continue;
    const texte = noeud.textContent.replace(/\s+/g, ' ').trim();
    if (texte) section.morceaux.push(texte);
  }
  return sections
    .map((s) => {
      const texte = s.morceaux.join(' ');
      return { page: s.page, id: s.id, titre: s.titre, texte, titreN: normaliser(s.titre), texteN: normaliser(texte) };
    })
    .filter((s) => s.texte || s.id);
}

function chargerIndex() {
  if (chargement) return chargement;
  const lecteur = new DOMParser();
  chargement = Promise.all(PAGES.map(async (page) => {
    try {
      const reponse = await fetch(page.fichier);
      if (!reponse.ok) throw new Error(reponse.statusText);
      return decouperSections(lecteur.parseFromString(await reponse.text(), 'text/html'), page);
    } catch {
      if (page.id !== pageActuelle.id) return [];
      // Page ouverte sans serveur : on indexe au moins la page affichée, sans les ajouts du script.
      const doc = lecteur.parseFromString(document.documentElement.outerHTML, 'text/html');
      doc.querySelectorAll('.ancre, .sommaire-mobile, .suite-pages, .modele-tete small, .copier').forEach((n) => n.remove());
      return decouperSections(doc, page);
    }
  })).then((parPage) => { index = parPage.flat(); return index; });
  return chargement;
}

function occurrences(texte, terme) {
  let total = 0;
  for (let i = texte.indexOf(terme); i !== -1 && total < 20; i = texte.indexOf(terme, i + terme.length)) total++;
  return total;
}

function chercher(requete) {
  const termes = normaliser(requete).split(/[\s'’,.;:!?()«»"-]+/).filter((t) => t.length > 1 || /\d/.test(t));
  if (!termes.length || !index) return { termes, resultats: [] };
  const resultats = [];
  for (const s of index) {
    let score = 0;
    let complet = true;
    for (const t of termes) {
      const dansTitre = occurrences(s.titreN, t);
      const dansTexte = occurrences(s.texteN, t);
      if (!dansTitre && !dansTexte) { complet = false; break; }
      score += dansTitre * 12 + Math.min(dansTexte, 8);
      if (s.titreN.startsWith(t)) score += 6;
    }
    if (complet) resultats.push({ s, score: score + (s.id ? 0 : -2) });
  }
  resultats.sort((a, b) => b.score - a.score);
  return { termes, resultats: resultats.slice(0, 40).map((r) => r.s) };
}

function surligner(texte, texteN, termes, debut = 0, fin = texte.length) {
  const fragment = document.createDocumentFragment();
  const zones = [];
  for (const t of termes) {
    for (let i = texteN.indexOf(t, debut); i !== -1 && i < fin; i = texteN.indexOf(t, i + t.length)) zones.push([i, Math.min(i + t.length, fin)]);
  }
  zones.sort((a, b) => a[0] - b[0]);
  let position = debut;
  for (const [a, b] of zones) {
    if (a < position) continue;
    fragment.append(texte.slice(position, a));
    const mark = document.createElement('mark');
    mark.textContent = texte.slice(a, b);
    fragment.append(mark);
    position = b;
  }
  fragment.append(texte.slice(position, fin));
  return fragment;
}

function extrait(s, termes) {
  const span = document.createElement('span');
  if (!s.texte) return span;
  let premier = -1;
  for (const t of termes) {
    const i = s.texteN.indexOf(t);
    if (i !== -1 && (premier === -1 || i < premier)) premier = i;
  }
  if (premier === -1) premier = 0;
  let debut = Math.max(0, premier - 60);
  let fin = Math.min(s.texte.length, premier + 150);
  if (debut > 0) { const espace = s.texte.indexOf(' ', debut); if (espace !== -1 && espace < premier) debut = espace + 1; }
  if (fin < s.texte.length) { const espace = s.texte.lastIndexOf(' ', fin); if (espace > premier) fin = espace; }
  if (debut > 0) span.append('… ');
  span.append(surligner(s.texte, s.texteN, termes, debut, fin));
  if (fin < s.texte.length) span.append(' …');
  return span;
}

function construireRecherche() {
  dialogue = element('dialog', { class: 'recherche', 'aria-label': 'Rechercher dans la documentation' }, `
    <div class="recherche-boite">
      <div class="recherche-champ">
        ${icone('recherche')}
        <input type="search" placeholder="Rechercher : amputation, rapport IRS, clôture…" aria-label="Rechercher" autocomplete="off" spellcheck="false">
        <button type="button" data-fermer>Échap</button>
      </div>
      <div class="resultats" role="listbox" aria-label="Résultats"></div>
    </div>
  `);
  document.body.append(dialogue);

  const champ = dialogue.querySelector('input');
  const zone = dialogue.querySelector('.resultats');
  let choisi = -1;

  const choisir = (n) => {
    const liens = [...zone.querySelectorAll('a')];
    if (!liens.length) return;
    choisi = (n + liens.length) % liens.length;
    liens.forEach((a, i) => { a.classList.toggle('choisi', i === choisi); a.setAttribute('aria-selected', String(i === choisi)); });
    liens[choisi].scrollIntoView({ block: 'nearest' });
  };

  const afficher = () => {
    const requete = champ.value.trim();
    zone.replaceChildren();
    choisi = -1;
    if (!requete) {
      const aide = element('div', { class: 'vide' });
      aide.textContent = 'Tape un mot : une pathologie, une étiquette, un modèle, une étape du suivi…';
      zone.append(aide);
      return;
    }
    if (!index) {
      zone.append(element('div', { class: 'vide' }, 'Chargement de la documentation…'));
      return;
    }
    const { termes, resultats } = chercher(requete);
    if (!resultats.length) {
      const vide = element('div', { class: 'vide' });
      vide.textContent = `Aucun résultat pour « ${requete} ».`;
      zone.append(vide);
      return;
    }
    for (const s of resultats) {
      const a = element('a', { href: s.id ? `${s.page.fichier}#${s.id}` : s.page.fichier, role: 'option' });
      const page = element('small');
      page.textContent = s.page.titre;
      const titre = element('strong');
      titre.append(surligner(s.titre, s.titreN, termes));
      a.append(page, titre, extrait(s, termes));
      zone.append(a);
    }
    choisir(0);
  };

  champ.addEventListener('input', afficher);
  champ.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); choisir(choisi + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); choisir(choisi - 1); }
    else if (e.key === 'Enter') {
      const lien = zone.querySelectorAll('a')[choisi];
      if (lien) { e.preventDefault(); lien.click(); }
    }
  });
  zone.addEventListener('click', (e) => { if (e.target.closest('a')) dialogue.close(); });
  dialogue.querySelector('[data-fermer]').addEventListener('click', () => dialogue.close());
  dialogue.addEventListener('click', (e) => { if (e.target === dialogue) dialogue.close(); });

  document.addEventListener('keydown', (e) => {
    const champTexte = e.target.closest?.('input, textarea, [contenteditable="true"]');
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ouvrirRecherche(); }
    else if (e.key === '/' && !champTexte && !dialogue.open) { e.preventDefault(); ouvrirRecherche(); }
  });

  dialogue.afficher = afficher;
}

function ouvrirRecherche() {
  if (!dialogue) return;
  if (!dialogue.open) dialogue.showModal();
  const champ = dialogue.querySelector('input');
  champ.focus();
  champ.select();
  dialogue.afficher();
  if (!index) chargerIndex().then(() => dialogue.afficher());
}

/* ---------- Modèles à copier ---------- */

async function copierTexte(texte) {
  try {
    await navigator.clipboard.writeText(texte);
    return true;
  } catch {
    const zone = element('textarea', { readonly: '', style: 'position:fixed;opacity:0;left:-9999px' });
    zone.value = texte;
    document.body.append(zone);
    zone.select();
    const ok = document.execCommand('copy');
    zone.remove();
    return ok;
  }
}

function preparerModeles() {
  document.querySelectorAll('.modele').forEach((modele) => {
    const pre = modele.querySelector('pre');
    if (!pre) return;
    let tete = modele.querySelector('.modele-tete');
    if (!tete) {
      tete = element('div', { class: 'modele-tete' }, '<span>Modèle</span>');
      modele.prepend(tete);
    }
    const texte = pre.textContent.replace(/^\n+|\s+$/g, '');
    const longueur = [...texte].length;
    const compteur = element('small', { class: longueur > LIMITE_DISCORD ? 'trop-long' : '' });
    compteur.textContent = longueur > LIMITE_DISCORD
      ? `${longueur} caractères · à envoyer en plusieurs messages`
      : `${longueur} / ${LIMITE_DISCORD} caractères`;
    tete.querySelector('span')?.append(compteur);

    const bouton = element('button', { class: 'btn btn-petit copier', type: 'button' }, `${icone('copier')}<span>Copier</span>`);
    let minuterie = null;
    bouton.addEventListener('click', async () => {
      const ok = await copierTexte(texte);
      bouton.classList.toggle('copie', ok);
      bouton.innerHTML = ok ? `${icone('ok')}<span>Copié</span>` : `${icone('copier')}<span>Sélectionne et copie</span>`;
      clearTimeout(minuterie);
      minuterie = setTimeout(() => {
        bouton.classList.remove('copie');
        bouton.innerHTML = `${icone('copier')}<span>Copier</span>`;
      }, 1800);
    });
    tete.append(bouton);
  });
}

/* ---------- Petits effets ---------- */

function boutonHaut() {
  const bouton = element('button', { class: 'haut', type: 'button', 'aria-label': 'Revenir en haut de la page' }, icone('haut'));
  bouton.addEventListener('click', () => window.scrollTo({ top: 0 }));
  document.body.append(bouton);
  const maj = () => bouton.classList.toggle('visible', window.scrollY > 700);
  window.addEventListener('scroll', maj, { passive: true });
  maj();
}

function lumiereCartes() {
  document.addEventListener('pointermove', (e) => {
    const carte = e.target.closest?.('.carte');
    if (!carte) return;
    const r = carte.getBoundingClientRect();
    carte.style.setProperty('--mx', `${e.clientX - r.left}px`);
    carte.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}

/* ---------- Démarrage ---------- */

construireEntete();
construireSommaire();
ajouterAncres();
construireSuitePages();
construirePied();
construireRecherche();
preparerModeles();
boutonHaut();
lumiereCartes();
revelerAncre();
window.addEventListener('hashchange', revelerAncre);
