/* =====================================================================
   Seimei · Suivi des pathologies — documentation de la branche
   Plan du site, en-tête et menus, barre latérale, sommaire, recherche,
   boutons « Copier » et petits effets.
   ===================================================================== */

/* Plan du site : chaque catégorie a sa page d'accueil (dossier/index.html) et ses sous-pages.
   Pour ajouter une page : créer le fichier HTML dans le dossier de la catégorie, puis l'ajouter ici.
   Une page marquée « cache: true » est masquée partout (menus, cartes, recherche) mais son fichier est gardé. */
const PLAN = [
  {
    id: 'branche', titre: 'La branche', nav: 'La branche', emoji: '🏥', couleur: 'var(--or)',
    description: 'Ce qu’est la branche, qui y fait quoi, le dossier médical et les règles qui encadrent chaque suivi.',
    pages: [
      { fichier: 'presentation.html', titre: 'Présentation', emoji: '📖', description: 'La mission de la branche, ses six catégories de suivi et ce qu’elle apporte.' },
      { fichier: 'roles.html', titre: 'Rôles et organisation', emoji: '👥', description: 'Responsable, médecins référents, soignants, référents IRS, et qui fait quoi.' },
      { fichier: 'dossier-medical.html', titre: 'Le dossier médical', emoji: '📁', description: 'Ce que contient le dossier d’un patient, et le secret médical.' },
      { fichier: 'regles.html', titre: 'Règles et garde-fous', emoji: '⚖️', description: 'Les règles qui encadrent chaque suivi et les bonnes pratiques de l’équipe.' },
    ],
  },
  {
    id: 'parchemins', titre: 'Le suivi sur parchemin', nav: 'Parchemin', emoji: '📜', couleur: 'var(--ciel)',
    description: 'Le forum, l’ouverture d’un dossier, les étiquettes, les rendez-vous, l’IRS, les urgences et la clôture.',
    pages: [
      { fichier: 'forum.html', titre: 'Le forum de la branche', emoji: '🗂️', description: 'Un post par patient : ce qu’on y publie et ce qu’on évite.' },
      { fichier: 'ouvrir-un-dossier.html', titre: 'Ouvrir un dossier', emoji: '📝', description: 'Les quatre étapes, qui ouvre le dossier, un patient avec plusieurs pathologies.' },
      { fichier: 'etiquettes.html', titre: 'Les étiquettes', emoji: '🏷️', description: 'Catégories et statuts : qui les pose, quand elles changent, comment filtrer le forum.' },
      { fichier: 'rendez-vous.html', titre: 'Rendez-vous et comptes rendus', emoji: '📋', description: 'Les types de rendez-vous et le compte rendu publié après chacun.' },
      { fichier: 'irs.html', titre: 'Le lien avec l’IRS', emoji: '🔬', description: 'Accord du patient, demande d’analyse, rapport et présentation des résultats.' },
      { fichier: 'urgences-et-pauses.html', titre: 'Urgences et pauses', emoji: '🚨', description: 'Aggravation, urgence vitale, inactivité et mise en pause.' },
      { fichier: 'cloture.html', titre: 'Clôture et réouverture', emoji: '✅', description: 'Quand et comment clôturer un dossier, et comment le rouvrir.' },
      { fichier: 'rythme.html', titre: 'Le rythme des suivis', emoji: '⏳', description: '1 jour = 1 mois pour le patient : durées, séances prescrites et calendrier type.' },
    ],
  },
  {
    id: 'pathologies', titre: 'Soins et pathologies', nav: 'Pathologies', emoji: '🧬', couleur: 'var(--violet)',
    description: 'Les parcours de soin, les examens et les traitements, et une fiche complète pour chaque catégorie de pathologie.',
    pages: [
      { groupe: 'Les soins', fichier: 'parcours.html', titre: 'Les parcours de soin', emoji: '🧭', description: 'Le parcours « maladie » en 7 étapes et le parcours « réadaptation » en 4 étapes.' },
      { groupe: 'Les soins', fichier: 'examens-et-traitements.html', titre: 'Examens et traitements', emoji: '💊', description: 'Les examens possibles, les principes d’un traitement et comment en inventer un crédible.' },
      { groupe: 'Les catégories', fichier: 'genetique.html', titre: 'Maladie génétique', emoji: '🧬', couleur: 'var(--violet)', description: 'Maladie héréditaire, connue ou non : la mission principale de la branche.' },
      { groupe: 'Les catégories', fichier: 'inconnue.html', titre: 'Pathologie inconnue', emoji: '❓', couleur: 'var(--ambre)', description: 'Des symptômes inexpliqués : une véritable enquête médicale.' },
      { groupe: 'Les catégories', fichier: 'post-operatoire.html', titre: 'Post-opératoire', emoji: '🩹', couleur: 'var(--rose)', description: 'La convalescence après une opération lourde.' },
      { groupe: 'Les catégories', fichier: 'reeducation.html', titre: 'Rééducation', emoji: '💪', couleur: 'var(--jade)', description: 'Retrouver une capacité perdue après une blessure grave.' },
      { groupe: 'Les catégories', fichier: 'sequelle-permanente.html', titre: 'Séquelle permanente', emoji: '🦿', couleur: 'var(--or)', description: 'Amputation, blessure définitive : vivre et combattre avec.' },
      { groupe: 'Les catégories', fichier: 'chronique.html', titre: 'Pathologie chronique', emoji: '🔁', couleur: 'var(--ciel)', description: 'Une maladie qui ne guérit pas mais se contrôle.' },
      { groupe: 'Cas particuliers', fichier: 'plusieurs-pathologies.html', titre: 'Plusieurs pathologies', emoji: '🧩', description: 'Cumuler des pathologies dans un même dossier, et changer de catégorie.' },
    ],
  },
  {
    id: 'reeducation', titre: 'Rééducation', nav: 'Rééducation', emoji: '💪', couleur: 'var(--jade)',
    description: 'Les bases d’une séance, la mesure des progrès et dix séances détaillées, prêtes à jouer.',
    pages: [
      { groupe: 'Les bases', fichier: 'principes.html', titre: 'Principes et déroulé d’une séance', emoji: '📐', description: 'Les principes, le nombre de séances prescrites, la trame d’une séance et le matériel.' },
      { groupe: 'Les bases', fichier: 'mesurer.html', titre: 'Mesurer les progrès', emoji: '📏', description: 'Échelle de la douleur, force de 0 à 5, autres mesures et objectifs.' },
      { groupe: 'Les bases', fichier: 'faire-vivre.html', titre: 'Accompagner le patient', emoji: '🤝', description: 'Pendant la séance, exemple de compte rendu de séance et erreurs à éviter.' },
      { groupe: 'Les séances', fichier: 'marche.html', titre: 'Remarcher après une fracture', emoji: '🦵', description: 'Barres parallèles, béquilles, escaliers, puis course et sauts.' },
      { groupe: 'Les séances', fichier: 'dos.html', titre: 'Dos et posture', emoji: '🧍', description: 'Gainage, gestes du quotidien, port du sac de mission.' },
      { groupe: 'Les séances', fichier: 'epaule.html', titre: 'Épaule', emoji: '💪', description: 'Retrouver l’amplitude, la force et la précision des lancers.' },
      { groupe: 'Les séances', fichier: 'main.html', titre: 'Main et signes', emoji: '✋', description: 'Dextérité, pince fine et enchaînement des signes.' },
      { groupe: 'Les séances', fichier: 'amputation.html', titre: 'Amputation et prothèse', emoji: '🦿', description: 'Moignon, douleurs fantômes, thérapie du miroir, prothèse.' },
      { groupe: 'Les séances', fichier: 'brulures.html', titre: 'Brûlures et cicatrices', emoji: '🔥', description: 'Assouplir la peau et retrouver l’amplitude des mouvements.' },
      { groupe: 'Les séances', fichier: 'souffle.html', titre: 'Retrouver son souffle', emoji: '🫁', description: 'Respiration, désencombrement, endurance.' },
      { groupe: 'Les séances', fichier: 'equilibre.html', titre: 'Équilibre et vertiges', emoji: '🌀', description: 'Fixer le regard, équilibre immobile puis en mouvement.' },
      { groupe: 'Les séances', fichier: 'memoire.html', titre: 'Mémoire et attention', emoji: '🧠', description: 'Après un traumatisme crânien : attention, mémoire, double tâche.' },
      { groupe: 'Les séances', cache: true, fichier: 'chakra.html', titre: 'Réadaptation du chakra', emoji: '🌊', description: 'Méditation, contrôle fin, endurance, sans jamais dépasser le niveau d’avant.' },
      { groupe: 'Les séances', fichier: 'retour-en-mission.html', titre: 'Retour en mission', emoji: '⚔️', description: 'Réathlétisation, combat encadré et test de reprise.' },
    ],
  },
  {
    id: 'exemples', titre: 'Exemples de suivis', nav: 'Exemples', emoji: '🗓️', couleur: 'var(--ambre)',
    description: 'Cinq suivis racontés du début à la fin, jour par jour, et les situations particulières.',
    pages: [
      { fichier: 'genetique.html', titre: 'Mei Tanaka · maladie génétique', emoji: '🧬', couleur: 'var(--violet)', description: 'Examens, analyse de l’IRS, deux essais de traitement, puis suivi stable.' },
      { fichier: 'post-operatoire.html', titre: 'Kaito Mizuno · post-opératoire', emoji: '🩹', couleur: 'var(--rose)', description: 'Un dossier ouvert par le chirurgien, une complication, puis la clôture.' },
      { fichier: 'amputation.html', titre: 'Ren Akiyama · amputation', emoji: '🦿', couleur: 'var(--or)', description: 'Trois semaines de rééducation, une prothèse, puis le suivi à long terme.' },
      { fichier: 'chronique.html', titre: 'Sora Ishikawa · asthme', emoji: '🔁', couleur: 'var(--ciel)', description: 'Traitement de fond, plan d’action, équipe formée, pause et reprise.' },
      { fichier: 'inconnue.html', titre: 'Yuki Fujimoto · pathologie inconnue', emoji: '❓', couleur: 'var(--ambre)', description: 'Une enquête, une fausse piste et une cause enfin trouvée.' },
      { fichier: 'situations-particulieres.html', titre: 'Situations particulières', emoji: '🧭', description: 'Arrêt du suivi, refus, absences, rechute, aggravation souhaitée…' },
    ],
  },
  {
    id: 'modeles', titre: 'Modèles de parchemins', nav: 'Modèles', emoji: '📋', couleur: 'var(--sarcelle)',
    description: 'Tous les messages du forum, prêts à copier : de la fiche patient à la réouverture d’un dossier.',
    pages: [
      { fichier: 'ouverture.html', titre: 'Ouvrir un dossier', emoji: '📁', description: 'Titre du post, fiche patient, consignes du forum et message épinglé.' },
      { fichier: 'suivi.html', titre: 'Pendant le suivi', emoji: '🩺', description: 'Prise en charge, comptes rendus, bilan d’étape, essai de traitement, plan d’action.' },
      { fichier: 'irs.html', titre: 'Avec l’IRS', emoji: '🔬', description: 'Demande d’analyse et rapport d’analyse.' },
      { fichier: 'imprevus.html', titre: 'Les imprévus', emoji: '🚨', description: 'Urgence, mise en pause, reprise, changement de médecin référent.' },
      { fichier: 'fin-du-suivi.html', titre: 'La fin du suivi', emoji: '🏁', description: 'Fin de prise en charge, clôture et réouverture.' },
    ],
  },
  {
    id: 'faq', titre: 'FAQ et glossaire', nav: 'FAQ', emoji: '💡', couleur: 'var(--rose)',
    description: 'Les réponses aux questions fréquentes sur les dossiers, les patients et l’IRS, et le vocabulaire de la branche.',
    pages: [
      { fichier: 'dossiers.html', titre: 'Dossiers et prise en charge', emoji: '📁', description: 'Ouvrir et prendre en charge un dossier, comptes rendus, étiquettes, absences…' },
      { fichier: 'patients.html', titre: 'Les patients', emoji: '🙋', description: 'Accès au dossier, refus, guérison, prothèse, secret médical…' },
      { fichier: 'irs.html', titre: 'Travailler avec l’IRS', emoji: '🔬', description: 'Quand demander une analyse, délais, résultats non concluants…' },
      { fichier: 'glossaire.html', titre: 'Glossaire', emoji: '📚', description: 'Le vocabulaire du suivi des pathologies.' },
    ],
  },
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
  chevron: '<path d="m6 9 6 6 6-6"/>',
};

const LIMITE_DISCORD = 2000;

// Racine du site, déduite de l'adresse de ce script (assets/js/doc.js).
const SCRIPT = document.currentScript || document.querySelector('script[src*="doc.js"]');
const RACINE = new URL('../../', SCRIPT.src);

// Toutes les pages dans l'ordre de lecture : accueil, puis chaque catégorie et ses sous-pages.
const ACCUEIL = { chemin: 'index.html', titre: 'Accueil', emoji: '生', categorie: null };
const TOUTES = [ACCUEIL];
for (const cat of PLAN) {
  cat.pages = cat.pages.filter((page) => !page.cache);
  cat.chemin = `${cat.id}/index.html`;
  cat.categorie = cat;
  cat.estCategorie = true;
  TOUTES.push(cat);
  for (const page of cat.pages) {
    page.chemin = `${cat.id}/${page.fichier}`;
    page.categorie = cat;
    TOUTES.push(page);
  }
}

function lien(chemin) {
  return new URL(chemin.replace(/index\.html$/, ''), RACINE).href;
}

function cheminActuel() {
  const racine = decodeURI(RACINE.pathname);
  let chemin = decodeURI(location.pathname);
  chemin = chemin.startsWith(racine) ? chemin.slice(racine.length) : chemin;
  if (chemin === '' || chemin.endsWith('/')) chemin += 'index.html';
  return chemin;
}

const pageActuelle = TOUTES.find((p) => p.chemin === cheminActuel()) || null;
const categorieActuelle = pageActuelle?.categorie || null;

function icone(nom) {
  return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nom]}</svg>`;
}

function element(balise, attributs = {}, html = '') {
  const el = document.createElement(balise);
  for (const [cle, valeur] of Object.entries(attributs)) el.setAttribute(cle, valeur);
  if (html) el.innerHTML = html;
  return el;
}

function echapper(texte) {
  return String(texte).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function texteTitre(titre) {
  if (titre.dataset.sommaire) return titre.dataset.sommaire;
  const copie = titre.cloneNode(true);
  copie.querySelectorAll('.emoji, .ancre').forEach((n) => n.remove());
  return copie.textContent.replace(/\s+/g, ' ').trim();
}

function courant(page) {
  return page === pageActuelle ? ' aria-current="page"' : '';
}

/* Liste des sous-pages d'une catégorie, avec les intertitres de groupe. */
function listeSousPages(cat, classe = '') {
  let html = '';
  let groupe = null;
  for (const page of cat.pages) {
    if (page.groupe && page.groupe !== groupe) {
      groupe = page.groupe;
      html += `<span class="groupe">${echapper(groupe)}</span>`;
    }
    html += `<a href="${lien(page.chemin)}"${courant(page)}${classe}><span class="emoji" aria-hidden="true">${page.emoji}</span>${echapper(page.titre)}</a>`;
  }
  return html;
}

/* ---------- En-tête, menus et pied de page ---------- */

function construireEntete() {
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const categories = PLAN.map((cat) => `
    <div class="nav-item${cat === categorieActuelle ? ' actif' : ''}">
      <a class="nav-lien" href="${lien(cat.chemin)}"${cat === categorieActuelle ? ' aria-current="true"' : ''}>${cat.nav}${icone('chevron')}</a>
      <div class="nav-menu" style="--c: ${cat.couleur}">
        <a class="nav-menu-tete" href="${lien(cat.chemin)}"${courant(cat)}>
          <span class="emoji" aria-hidden="true">${cat.emoji}</span>
          <span><strong>${echapper(cat.titre)}</strong><small>${echapper(cat.description)}</small></span>
        </a>
        <div class="nav-menu-liste">${listeSousPages(cat)}</div>
      </div>
    </div>`).join('');

  const tiroir = PLAN.map((cat) => `
    <details${cat === categorieActuelle ? ' open' : ''} style="--c: ${cat.couleur}">
      <summary><span class="emoji" aria-hidden="true">${cat.emoji}</span>${echapper(cat.titre)}</summary>
      <div class="tiroir-liste">
        <a href="${lien(cat.chemin)}"${courant(cat)}><span class="emoji" aria-hidden="true">🧭</span>Vue d’ensemble</a>
        ${listeSousPages(cat)}
      </div>
    </details>`).join('');

  const entete = element('header', { class: 'entete' }, `
    <a class="marque" href="${lien('index.html')}" aria-label="Seimei, suivi des pathologies : accueil">
      <span class="sceau" aria-hidden="true"><span>生</span><span>命</span></span>
      <span><strong>Seimei</strong><small>Suivi des pathologies</small></span>
    </a>
    <nav class="nav-principale" aria-label="Catégories de la documentation">${categories}</nav>
    <button class="bouton-recherche" type="button" aria-label="Rechercher dans la documentation">
      ${icone('recherche')}<span>Rechercher</span><kbd>${mac ? '⌘' : 'Ctrl'} K</kbd>
    </button>
    <button class="bouton-menu" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="tiroir">${icone('menu')}</button>
    <nav class="tiroir" id="tiroir" aria-label="Toutes les pages">
      <a class="tiroir-accueil" href="${lien('index.html')}"${courant(ACCUEIL)}><span class="emoji" aria-hidden="true">🏠</span>Accueil</a>
      ${tiroir}
    </nav>
  `);

  const passer = element('a', { class: 'passer', href: '#contenu' }, 'Aller au contenu');
  const fond = document.querySelector('.fond');
  if (fond) fond.after(passer, entete);
  else document.body.prepend(passer, entete);

  const panneau = entete.querySelector('.tiroir');
  const boutonMenu = entete.querySelector('.bouton-menu');
  const basculerMenu = (ouvert) => {
    panneau.classList.toggle('ouvert', ouvert);
    document.body.classList.toggle('tiroir-ouvert', ouvert);
    boutonMenu.setAttribute('aria-expanded', String(ouvert));
    boutonMenu.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    boutonMenu.innerHTML = icone(ouvert ? 'fermer' : 'menu');
  };
  boutonMenu.addEventListener('click', () => basculerMenu(!panneau.classList.contains('ouvert')));
  panneau.addEventListener('click', (e) => { if (e.target.closest('a')) basculerMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panneau.classList.contains('ouvert')) basculerMenu(false); });
  document.addEventListener('click', (e) => {
    // composedPath() garde le chemin d'origine, même si l'icône cliquée vient d'être remplacée.
    if (panneau.classList.contains('ouvert') && !e.composedPath().includes(entete)) basculerMenu(false);
  });

  // Menus déroulants : fermés après un clic, et au clavier avec Échap.
  entete.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { item.classList.add('ferme'); item.querySelector('.nav-lien').focus(); }
    });
    item.addEventListener('mouseleave', () => item.classList.remove('ferme'));
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) item.classList.remove('ferme'); });
  });

  entete.querySelector('.bouton-recherche').addEventListener('click', ouvrirRecherche);
}

/* Barre latérale : les sous-pages de la catégorie en cours, puis les autres catégories. */
function construireLaterale() {
  const mise = document.querySelector('.mise-en-page');
  if (!mise || !categorieActuelle) return;
  const cat = categorieActuelle;
  const autres = PLAN.filter((c) => c !== cat).map((c) =>
    `<a href="${lien(c.chemin)}"><span class="emoji" aria-hidden="true">${c.emoji}</span>${echapper(c.titre)}</a>`).join('');
  const aside = element('aside', { class: 'nav-laterale', 'aria-label': `Pages de la catégorie ${cat.titre}`, style: `--c: ${cat.couleur}` }, `
    <a class="laterale-categorie" href="${lien(cat.chemin)}"${courant(cat)}>
      <span class="emoji" aria-hidden="true">${cat.emoji}</span><span>${echapper(cat.titre)}</span>
    </a>
    <div class="laterale-liste">${listeSousPages(cat)}</div>
    <div class="laterale-autres"><span class="groupe">Autres catégories</span>${autres}</div>
  `);
  mise.prepend(aside);
  mise.classList.add('avec-laterale');
}

/* Fil d'Ariane au-dessus de l'en-tête de page. */
function construireFilAriane() {
  const main = document.querySelector('main');
  if (!main || !pageActuelle || pageActuelle === ACCUEIL) return;
  const etapes = [`<a href="${lien('index.html')}">Accueil</a>`];
  const cat = pageActuelle.categorie;
  if (pageActuelle.estCategorie) etapes.push(`<span aria-current="page">${echapper(cat.titre)}</span>`);
  else etapes.push(`<a href="${lien(cat.chemin)}">${echapper(cat.titre)}</a>`, `<span aria-current="page">${echapper(pageActuelle.titre)}</span>`);
  main.prepend(element('nav', { class: 'fil-ariane', 'aria-label': 'Fil d’Ariane' }, etapes.join('<span class="sep" aria-hidden="true">›</span>')));
}

/* Cartes générées depuis le plan : sous-pages d'une catégorie, ou toutes les catégories (accueil). */
function construireCartes() {
  document.querySelectorAll('[data-sous-pages]').forEach((zone) => {
    const cat = PLAN.find((c) => c.id === zone.dataset.sousPages) || categorieActuelle;
    if (!cat) return;
    const groupes = [];
    for (const page of cat.pages) {
      const nom = page.groupe || '';
      if (!groupes.length || groupes[groupes.length - 1].nom !== nom) groupes.push({ nom, pages: [] });
      groupes[groupes.length - 1].pages.push(page);
    }
    const html = groupes.map((g) => `
      ${g.nom ? `<h2 id="${g.nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}">${echapper(g.nom)}</h2>` : ''}
      <div class="grille">
        ${g.pages.map((p) => `
          <a class="carte" href="${lien(p.chemin)}" style="--c: ${p.couleur || cat.couleur}">
            <span class="emoji" aria-hidden="true">${p.emoji}</span>
            <strong class="titre">${echapper(p.titre)}</strong>
            <p>${echapper(p.description)}</p>
            <span class="suite">Lire →</span>
          </a>`).join('')}
      </div>`).join('');
    zone.outerHTML = html;
  });

  document.querySelectorAll('[data-categories]').forEach((zone) => {
    zone.outerHTML = `<div class="grille categories">${PLAN.map((cat) => `
      <div class="carte carte-categorie" style="--c: ${cat.couleur}">
        <a class="carte-categorie-tete" href="${lien(cat.chemin)}">
          <span class="emoji" aria-hidden="true">${cat.emoji}</span>
          <strong class="titre">${echapper(cat.titre)}</strong>
        </a>
        <p>${echapper(cat.description)}</p>
        <div class="carte-categorie-liens">${cat.pages.map((p) => `<a href="${lien(p.chemin)}">${echapper(p.titre)}</a>`).join('')}</div>
        <a class="suite" href="${lien(cat.chemin)}">Voir la catégorie →</a>
      </div>`).join('')}</div>`;
  });
}

function construirePied() {
  const pied = element('footer', { class: 'pied' }, `
    <span class="kanji" aria-hidden="true">生命</span>
    Seimei · Branche « Suivi des pathologies », en lien avec l’IRS.<br>
    Ce site explique le fonctionnement de la branche : le suivi lui-même se déroule sur les parchemins de la branche.
  `);
  document.body.append(pied);
}

function construireSuitePages() {
  const main = document.querySelector('main');
  const index = TOUTES.indexOf(pageActuelle);
  if (!main || index === -1) return;
  const avant = TOUTES[index - 1];
  const apres = TOUTES[index + 1];
  const nom = (p) => (p.estCategorie ? p.titre : p.categorie && p !== ACCUEIL ? p.titre : 'Accueil');
  const nav = element('nav', { class: 'suite-pages', 'aria-label': 'Page précédente et suivante' });
  if (avant) nav.append(element('a', { href: lien(avant.chemin) }, `<small>← Précédent</small><strong>${echapper(nom(avant))}</strong>`));
  if (apres) nav.append(element('a', { href: lien(apres.chemin), class: 'apres' }, `<small>Suivant${apres.estCategorie ? ' · nouvelle catégorie' : ''} →</small><strong>${echapper(nom(apres))}</strong>`));
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
  if (!mise || titres.length < 2) return;
  mise.classList.add('avec-sommaire');
  // Le niveau le plus haut de la page sert de premier niveau du sommaire.
  const niveauHaut = Math.min(...titres.map((t) => Number(t.tagName[1])));
  const estSous = (t) => Number(t.tagName[1]) > niveauHaut;

  // Sommaire latéral (grands écrans)
  const aside = element('aside', { class: 'sommaire-page', 'aria-label': 'Sommaire de la page' });
  aside.append(element('div', { class: 'titre' }, `${icone('sommaire')} Sur cette page`));
  const liste = element('ol');
  const liensParId = new Map();
  for (const titre of titres) {
    const li = element('li');
    const a = element('a', { href: `#${titre.id}` });
    a.textContent = texteTitre(titre);
    if (estSous(titre)) a.classList.add('sous');
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
    if (estSous(titre) && dernierH2) {
      let sous = dernierH2.querySelector(':scope > ol');
      if (!sous) { sous = element('ol'); dernierH2.append(sous); }
      sous.append(li);
    } else {
      racine.append(li);
      dernierH2 = li;
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
  chargement = Promise.all(TOUTES.map(async (page) => {
    try {
      const reponse = await fetch(lien(page.chemin));
      if (!reponse.ok) throw new Error(reponse.statusText);
      return decouperSections(lecteur.parseFromString(await reponse.text(), 'text/html'), page);
    } catch {
      if (page !== pageActuelle) return [];
      // Page ouverte sans serveur : on indexe au moins la page affichée, sans les ajouts du script.
      const doc = lecteur.parseFromString(document.documentElement.outerHTML, 'text/html');
      doc.querySelectorAll('.ancre, .sommaire-mobile, .suite-pages, .fil-ariane, .modele-tete small, .copier').forEach((n) => n.remove());
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
      const a = element('a', { href: lien(s.page.chemin) + (s.id ? `#${s.id}` : ''), role: 'option' });
      const page = element('small');
      const cat = s.page.categorie;
      page.textContent = !cat ? 'Accueil' : s.page.estCategorie ? cat.titre : `${cat.titre} › ${s.page.titre}`;
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
construireCartes();
construireFilAriane();
construireLaterale();
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
