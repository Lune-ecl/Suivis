// Annuaire des joueurs : ce que l'on sait d'un joueur à partir de Discord
// (pseudo sur le serveur = nom RP, rôles = grade, section et clan),
// complété ou corrigé par l'équipe.

import { etat } from './etat.js';
import { CLANS, clan as infoClan } from './constantes.js';

const NOMS_CLANS = ['hoki', 'sabaku', 'hakumei', 'roran', 'shirogane', 'chikatsume'];

// Minuscules sans accents, espaces simples : pour comparer et rechercher.
export const normaliser = t => String(t || '').normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/\s+/g, ' ').trim();

// « [Jōnin] Sabaku Kaito | Médecin » → { nom: 'Sabaku', prenom: 'Kaito' }.
// Le nom de famille vient en premier, sauf si un nom de clan est plus loin (« Mei Hakumei »).
export function decouperNomRp(brut) {
  let texte = String(brut || '').normalize('NFC');
  const sansCrochets = texte.replace(/[[({【「『«][^\])}】」』»]*[\])}】」』»]/g, ' ');
  if (/\p{L}/u.test(sansCrochets)) texte = sansCrochets;
  const morceau = texte.split(/\s*[|•·／/]\s*|\s+[-–—]\s+/).find(m => /\p{L}/u.test(m)) || texte;
  const mots = morceau.replace(/[^\p{L}\p{M}\s'’-]/gu, ' ').split(/\s+/).filter(Boolean);
  if (mots.length < 2) return { nom: mots[0] || '', prenom: '' };
  const i = mots.findIndex(m => NOMS_CLANS.includes(normaliser(m)));
  if (i > 0) {
    const reste = mots.filter((_, j) => j !== i);
    return { nom: mots[i], prenom: reste.join(' ') };
  }
  const reste = mots.slice(1);
  if (reste.length > 1 && normaliser(reste[0]) === 'no') reste.shift(); // « Sabaku no Gaara »
  return { nom: mots[0], prenom: reste.join(' ') };
}

// « 『Jōnin』 » → « Jōnin », « 🩺 Section médicale » → « Section médicale ».
export const nettoyerRole = nom => String(nom || '').replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N})]+$/gu, '').trim() || String(nom || '');

export const couleurRole = n => (n ? `#${Number(n).toString(16).padStart(6, '0')}` : '#94a3b8');

// Informations affichées pour un joueur : correction de l'équipe, sinon Discord.
export function infosPersonnage(p) {
  if (!p) return null;
  const roles = new Map(etat.discordRoles.map(r => [r.id, r]));
  const siens = (p.roles || []).map(id => roles.get(id)).filter(Boolean).sort((a, b) => b.position - a.position);
  const role = usage => siens.find(r => r.usage === usage);
  const auto = decouperNomRp(p.nom_discord);
  const corrige = Boolean(p.nom || p.prenom);
  const clanDiscord = role('clan')?.clan
    || (p.discord_id && etat.discordRoles.some(r => r.usage === 'clan') ? 'sans_clan' : '');
  const clan = p.clan || clanDiscord;
  return {
    nom: corrige ? p.nom : auto.nom,
    prenom: corrige ? p.prenom : auto.prenom,
    grade: p.grade || nettoyerRole(role('grade')?.nom || ''),
    section: p.section || nettoyerRole(role('section')?.nom || ''),
    clan,
    infoClan: infoClan(clan),
    pseudo: p.discord_pseudo || '',
    discord: Boolean(p.discord_id),
    present: p.present !== false,
    avatar: p.avatar || '',
  };
}

export const nomAffiche = i => [i?.nom, i?.prenom].filter(Boolean).join(' ') || 'Sans nom';

// Joueurs triés par nom, avec leurs informations calculées.
export function listeJoueurs() {
  return etat.personnages
    .map(p => ({ p, i: infosPersonnage(p) }))
    .sort((a, b) => nomAffiche(a.i).localeCompare(nomAffiche(b.i), 'fr'));
}

// Recherche sur le nom RP, le pseudo Discord, le grade, la section et le clan.
export function correspond(entree, terme) {
  const mots = normaliser(terme).split(' ').filter(Boolean);
  if (!mots.length) return true;
  const { p, i } = entree;
  const texte = normaliser([nomAffiche(i), p.nom_discord, i.pseudo, i.grade, i.section, i.infoClan?.label].join(' '));
  return mots.every(m => texte.includes(m));
}

// Le joueur de l'annuaire qui porte ce nom RP (pour vérifier une demande d'accès).
export function joueurNomme(nomRp) {
  const cible = normaliser(nomRp);
  if (!cible) return null;
  return listeJoueurs().find(({ p, i }) => normaliser(nomAffiche(i)) === cible || normaliser(p.nom_discord) === cible) || null;
}

export { CLANS };
