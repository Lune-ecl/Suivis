// Textes au format des modèles du forum Discord, et lecture d'une fiche patient collée.

import { CATEGORIES, categorie, statut } from './constantes.js';
import { dateNumerique } from './ui.js';

const valeur = v => (v !== undefined && v !== null && String(v).trim()) || '—';

export const titrePost = d =>
  `${[d.nom, d.prenom].filter(Boolean).join(' ') || 'Nom Prénom'} | ${d.pathologie || 'Pathologie'}`;

export const etiquettesDiscord = d => [
  ...(d.categories || []).map(c => `${categorie(c).emoji} ${categorie(c).label}`),
  `${statut(d.statut).emoji} ${statut(d.statut).label}`,
].join(' · ');

const categoriesTexte = d => (d.categories || []).map(c => `${categorie(c).emoji} ${categorie(c).label}`).join(', ');

export function texteFiche(d) {
  return [
    '📁 FICHE PATIENT',
    '',
    '— IDENTITÉ —',
    `Nom : ${valeur(d.nom)}`,
    `Prénom : ${valeur(d.prenom)}`,
    `Âge : ${valeur(d.age)}`,
    `Grade : ${valeur(d.grade)}`,
    `Village / Clan : ${valeur(d.village)}`,
    '',
    '— PATHOLOGIE —',
    `Catégorie de suivi : ${valeur(categoriesTexte(d))}`,
    `Pathologie : ${valeur(d.pathologie)}`,
    `Origine : ${valeur(d.origine)}`,
    `Apparition : ${valeur(d.apparition)}`,
    `Symptômes / séquelles : ${valeur(d.symptomes)}`,
    `Antécédents familiaux : ${valeur(d.antecedents)}`,
    `Traitements déjà essayés : ${valeur(d.traitements_essayes)}`,
    `Suivi à réaliser pour la pathologie : ${valeur(d.suivi_a_realiser)}`,
    '',
    '— HRP —',
    `Joueur : ${valeur(d.joueur)}`,
    `Ce que je souhaite développer en RP : ${valeur(d.souhaits_rp)}`,
    `Limites / éléments à éviter : ${valeur(d.limites)}`,
    `Disponibilités : ${valeur(d.disponibilites)}`,
  ].join('\n');
}

export function texteProchainRdv(c) {
  const morceaux = [c.prochain_rdv ? dateNumerique(c.prochain_rdv) : '', c.prochain_precision || ''].filter(Boolean);
  return morceaux.join(' — ') || 'À définir';
}

export function texteCompteRendu(c) {
  return [
    `📋 COMPTE RENDU — Rendez-vous n°${c.numero || '…'}`,
    '',
    `Date : ${valeur(dateNumerique(c.date))}`,
    `Médecin : ${valeur(c.medecin)}`,
    `Type de rendez-vous : ${valeur(c.type_rdv)}`,
    `Lien du RP : ${valeur(c.lien_rp)}`,
    `Résumé : ${valeur(c.resume)}`,
    `Observations et résultats : ${valeur(c.observations)}`,
    `Traitement ou programme en cours : ${valeur(c.traitement)}`,
    `Décision et suite du suivi : ${valeur(c.decision)}`,
    `Prochain rendez-vous : ${texteProchainRdv(c)}`,
  ].join('\n');
}

export function texteRapport(c) {
  return [
    '🔬 RAPPORT D’ANALYSE — IRS',
    '',
    `Chercheur(s) : ${valeur(c.chercheurs)}`,
    `Prélèvements analysés : ${valeur(c.prelevements)}`,
    `Parties de l’organisme touchées : ${valeur(c.parties)}`,
    `Effets de la pathologie : ${valeur(c.effets)}`,
    `Évolution potentielle : ${valeur(c.evolution)}`,
    `Risques à court et long terme : ${valeur(c.risques)}`,
    `Anomalies relevées : ${valeur(c.anomalies)}`,
    `Pistes de traitement : ${valeur(c.pistes)}`,
  ].join('\n');
}

/* ---------------- Lecture d'une fiche patient collée depuis Discord ---------------- */

const normaliser = s => s
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[’']/g, ' ')
  .replace(/\s*\/\s*/g, ' / ')
  .replace(/\s+/g, ' ')
  .trim();

const LIBELLES = {
  'nom': 'nom',
  'prenom': 'prenom',
  'age': 'age',
  'grade': 'grade',
  'village / clan': 'village',
  'village': 'village',
  'clan': 'village',
  'categorie de suivi': 'categories',
  'categorie': 'categories',
  'categories': 'categories',
  'pathologie': 'pathologie',
  'origine': 'origine',
  'apparition': 'apparition',
  'symptomes / sequelles': 'symptomes',
  'symptomes': 'symptomes',
  'sequelles': 'symptomes',
  'antecedents familiaux': 'antecedents',
  'antecedents': 'antecedents',
  'traitements deja essayes': 'traitements_essayes',
  'traitements essayes': 'traitements_essayes',
  'suivi a realiser pour la pathologie': 'suivi_a_realiser',
  'suivi a realiser': 'suivi_a_realiser',
  'joueur': 'joueur',
  'ce que je souhaite developper en rp': 'souhaits_rp',
  'limites / elements a eviter': 'limites',
  'limites': 'limites',
  'disponibilites': 'disponibilites',
};

// Indications du modèle laissées telles quelles : ce ne sont pas des réponses.
const INDICATIONS = new Set([
  '(genetique, blessure, operation, inconnue...)',
  '(genetique, blessure, operation, inconnue…)',
  '(age ou date, circonstances)',
].map(normaliser));

const MOTS_CATEGORIES = [
  ['genetique', /genetiq|🧬/],
  ['inconnue', /inconnu|❓/],
  ['post_op', /post.?op|operatoire|🩹/],
  ['reeducation', /reeduc|💪/],
  ['sequelle', /sequelle|amput|🦿/],
  ['chronique', /chroniq|🔁/],
];

export function lireCategories(texte) {
  const t = normaliser(texte);
  return MOTS_CATEGORIES.filter(([, motif]) => motif.test(t) || motif.test(texte)).map(([id]) => id);
}

export function lireFiche(texte) {
  const champs = {};
  let courant = null;

  for (const brute of String(texte || '').replace(/\r/g, '').split('\n')) {
    const ligne = brute.replace(/^\s*(?:>\s*)+/, '').replace(/^\s*[-•·]\s+/, '').replace(/\*\*|__|`/g, '').trim();

    const m = ligne.match(/^([^:：]{1,60}?)\s*[:：]\s*(.*)$/);
    const cle = m && LIBELLES[normaliser(m[1].replace(/\(.*?\)/g, ''))];
    if (cle) {
      courant = cle;
      champs[cle] = m[2];
      continue;
    }

    // Titres de section (« — IDENTITÉ — », « 📁 FICHE PATIENT ») et blocs de code : fin du champ en cours.
    if (/^[—–-]{1,3}\s*.+\s*[—–-]{1,3}$/.test(ligne) || /^\W*fiche patient\W*$/i.test(ligne)
        || (ligne === '' && brute.includes('`'))) {
      courant = null;
      continue;
    }

    // Titre de post « Nom Prénom | Pathologie »
    const titre = ligne.match(/^([^|]{2,60})\|\s*(.+)$/);
    if (!courant && titre) {
      const [nom, ...prenom] = titre[1].trim().split(/\s+/);
      champs.nom ??= nom;
      champs.prenom ??= prenom.join(' ');
      champs.pathologie ??= titre[2].trim();
      continue;
    }

    if (courant) champs[courant] += '\n' + ligne;
  }

  const resultat = {};
  for (const [cle, v] of Object.entries(champs)) {
    const propre = String(v).replace(/\n{3,}/g, '\n\n').trim();
    if (!propre || propre === '—' || propre === '-' || INDICATIONS.has(normaliser(propre))) continue;
    resultat[cle] = propre;
  }
  if (resultat.categories !== undefined) {
    resultat.categories = lireCategories(resultat.categories);
    if (!resultat.categories.length) delete resultat.categories;
  }
  return resultat;
}

export const NOMS_CATEGORIES = CATEGORIES.map(c => c.label);
