// Accès à la base Supabase. Toutes les requêtes du site passent par ici.

import { createClient } from '../vendor/supabase.js';
import config from '../../config.js';

// L'adresse est parfois copiée avec /rest/v1/ à la fin : on garde seulement celle du projet.
const url = String(config.supabaseUrl || '').trim().replace(/\/+$/, '').replace(/\/(rest|auth)\/v1$/i, '');
const cle = String(config.supabaseKey || '').trim();

export const estConfigure = /^https:\/\/[^\s]+$/i.test(url) && cle.length > 20;
export const sb = estConfigure ? createClient(url, cle) : null;

export const CONFIRMATION_ACTIVE = 'Dans Supabase, désactive « Confirm email » (Authentication → Sign In / Providers → Email), puis recommence.';

// Messages d'erreur compréhensibles.
export function traduireErreur(erreur) {
  const m = erreur?.message || String(erreur || 'Erreur inconnue');
  const code = erreur?.code;
  if (code === '42501' || /row-level security|permission denied/i.test(m)) return 'Action non autorisée avec ton rôle.';
  if (code === 'PGRST116') return 'Élément introuvable, ou tu n’y as pas accès.';
  if (code === 'P0001') return m; // règles de la branche (message déjà en français)
  if (code === '23514') return 'Une valeur saisie n’est pas acceptée.';
  if (/Failed to fetch|NetworkError|Load failed|fetch failed/i.test(m)) return 'Impossible de joindre la base de données. Vérifie ta connexion.';
  if (/Invalid login credentials/i.test(m)) return 'Prénom, nom RP ou code incorrect.';
  if (/Email not confirmed|Email address .* is invalid|email_address_invalid|Error sending confirmation/i.test(m)) return CONFIRMATION_ACTIVE;
  if (/already registered|already been registered|already exists/i.test(m)) return 'Ce prénom et ce nom RP ont déjà un compte. Connecte-toi, ou demande au responsable de réinitialiser ton code.';
  if (/Password should be|password.*(at least|characters)/i.test(m)) return 'Le code doit contenir au moins 6 caractères.';
  if (/rate limit|too many|security purposes/i.test(m)) return 'Trop de tentatives. Réessaie dans quelques minutes.';
  if (/Unable to validate email|invalid format|valid email/i.test(m)) return 'Ce nom RP ne peut pas servir d’identifiant : utilise des lettres.';
  if (/Signups not allowed|signup.*disabled/i.test(m)) return 'Les inscriptions sont fermées dans Supabase (Authentication → Sign In / Providers → Allow new users to sign up).';
  if (/Email logins are disabled|provider is not enabled/i.test(m)) return 'Dans Supabase, active la connexion « Email » (Authentication → Sign In / Providers).';
  if (/does not exist|Could not find the (table|function)|schema cache/i.test(m)) {
    // On indique ce qui manque, pour savoir si la base est absente ou seulement pas à jour.
    const manque = m.match(/(?:relation|table|function)\s+["']?(?:public\.)?(\w+)/i)?.[1];
    return `La base n’est pas installée ou pas à jour : exécute supabase/schema.sql dans Supabase (SQL Editor → Run), puis clique sur Réessayer.${manque ? ` Élément manquant : ${manque}.` : ''}`;
  }
  if (/Invalid API key|No API key|JWT/i.test(m)) return 'Clé Supabase invalide : vérifie config.js.';
  if (/same.*password|different from the old/i.test(m)) return 'Le nouveau code doit être différent de l’ancien.';
  return m;
}

async function req(requete) {
  const { data, error } = await requete;
  if (error) {
    const e = new Error(traduireErreur(error));
    e.code = error.code;
    throw e;
  }
  return data;
}

export const api = {
  // Compte et membres
  moi: id => req(sb.from('membres').select('*').eq('id', id).maybeSingle()),
  rejoindre: nomRp => req(sb.rpc('rejoindre', { p_nom_rp: nomRp || '' })),
  membres: () => req(sb.from('membres').select('*').order('nom_rp')),
  majMembre: (id, champs) => req(sb.from('membres').update(champs).eq('id', id).select().single()),
  reinitialiserCode: (id, code) => req(sb.rpc('reinitialiser_code', { p_membre: id, p_code: code })),
  supprimerCompte: id => req(sb.rpc('supprimer_compte', { p_membre: id })),

  // Dossiers
  dossiers: () => req(sb.from('dossiers').select('*').order('derniere_activite', { ascending: false })),
  dossier: id => req(sb.from('dossiers').select('*').eq('id', id).maybeSingle()),
  creerDossier: champs => req(sb.from('dossiers').insert(champs).select().single()),
  majDossier: (id, champs) => req(sb.from('dossiers').update(champs).eq('id', id).select().single()),
  supprimerDossier: id => req(sb.from('dossiers').delete().eq('id', id)),

  // Journal
  entrees: dossierId => req(sb.from('entrees').select('*').eq('dossier_id', dossierId).order('created_at', { ascending: false })),
  toutesEntrees: () => req(sb.from('entrees').select('*').order('created_at', { ascending: true })),
  // Résumé du journal (sans les événements) : rapports reçus, derniers messages.
  resumeJournal: () => req(sb.from('entrees').select('dossier_id,auteur_id,type,created_at').neq('type', 'evenement')
    .order('created_at', { ascending: false })),
  creerEntree: champs => req(sb.from('entrees').insert(champs).select().single()),
  majEntree: (id, contenu) => req(sb.from('entrees').update({ contenu }).eq('id', id).select().single()),
  supprimerEntree: id => req(sb.from('entrees').delete().eq('id', id)),

  // Traitements
  traitements: dossierId => req(sb.from('traitements').select('*').eq('dossier_id', dossierId).order('debut', { ascending: false })),
  tousTraitements: () => req(sb.from('traitements').select('*').order('debut', { ascending: true })),
  essaisEnCours: () => req(sb.from('traitements').select('id,dossier_id,nom,debut').eq('etat', 'essai')),
  creerTraitement: champs => req(sb.from('traitements').insert(champs).select().single()),
  majTraitement: (id, champs) => req(sb.from('traitements').update(champs).eq('id', id).select().single()),
  supprimerTraitement: id => req(sb.from('traitements').delete().eq('id', id)),
};

// Connexion avec le prénom et le nom RP, et un code : Supabase demande une adresse
// e-mail, on en déduit donc une du nom RP (« Ren Hoki » → ren.hoki@seimei.invalid).
// Aucun e-mail n'y est jamais envoyé. Un ancien compte se connecte avec son e-mail.
const DOMAINE = 'seimei.invalid';
export function adresseDuNomRp(nomRp) {
  const texte = String(nomRp || '').trim();
  if (texte.includes('@')) return texte;
  const simple = texte.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let local = simple.replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
  if (!local) local = 'u' + [...new TextEncoder().encode(simple)].map(o => o.toString(16).padStart(2, '0')).join('');
  return `${local.slice(0, 60).replace(/\.+$/, '')}@${DOMAINE}`;
}

export const auth = {
  session: async () => (await sb.auth.getSession()).data.session,
  surChangement: rappel => sb.auth.onAuthStateChange(rappel),
  connexion: (nomRp, code) => req(sb.auth.signInWithPassword({ email: adresseDuNomRp(nomRp), password: code })),
  inscription: (nomRp, code) => req(sb.auth.signUp({
    email: adresseDuNomRp(nomRp),
    password: code,
    options: { data: { nom_rp: nomRp.trim() } },
  })),
  changerCode: code => req(sb.auth.updateUser({ password: code })),
  deconnexion: () => sb.auth.signOut(),
};
