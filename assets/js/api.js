// Accès à la base Supabase. Toutes les requêtes du site passent par ici.

import { createClient } from '../vendor/supabase.js';
import config from '../../config.js';

const url = String(config.supabaseUrl || '').trim().replace(/\/+$/, '');
const cle = String(config.supabaseKey || '').trim();

export const estConfigure = /^https:\/\/[^\s]+$/i.test(url) && cle.length > 20;
export const connexionDiscord = Boolean(config.connexionDiscord);
export const sb = estConfigure ? createClient(url, cle) : null;

// Messages d'erreur compréhensibles.
export function traduireErreur(erreur) {
  const m = erreur?.message || String(erreur || 'Erreur inconnue');
  const code = erreur?.code;
  if (code === '42501' || /row-level security|permission denied/i.test(m)) return 'Action non autorisée avec ton rôle.';
  if (code === 'PGRST116') return 'Élément introuvable, ou tu n’y as pas accès.';
  if (code === 'P0001') return m; // règles de la branche (message déjà en français)
  if (code === '23514') return 'Une valeur saisie n’est pas acceptée.';
  if (/Failed to fetch|NetworkError|Load failed|fetch failed/i.test(m)) return 'Impossible de joindre la base de données. Vérifie ta connexion.';
  if (/Invalid login credentials/i.test(m)) return 'E-mail ou mot de passe incorrect.';
  if (/Email not confirmed/i.test(m)) return 'Adresse e-mail pas encore confirmée : clique sur le lien reçu par e-mail.';
  if (/already registered|already been registered|already exists/i.test(m)) return 'Un compte existe déjà avec cette adresse e-mail.';
  if (/Password should be|password.*(at least|characters)/i.test(m)) return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (/rate limit|too many|security purposes/i.test(m)) return 'Trop de tentatives. Réessaie dans quelques minutes.';
  if (/Unable to validate email|invalid format|valid email/i.test(m)) return 'Adresse e-mail invalide.';
  if (/Signups not allowed|signup.*disabled/i.test(m)) return 'Les inscriptions sont fermées : demande au responsable de te créer un compte.';
  if (/does not exist|Could not find the (table|function)|schema cache/i.test(m)) return 'La base n’est pas encore installée : exécute supabase/schema.sql dans Supabase.';
  if (/Invalid API key|No API key|JWT/i.test(m)) return 'Clé Supabase invalide : vérifie config.js.';
  if (/same.*password|different from the old/i.test(m)) return 'Le nouveau mot de passe doit être différent de l’ancien.';
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
  rejoindre: (nomRp, pseudo) => req(sb.rpc('rejoindre', { p_nom_rp: nomRp || '', p_pseudo: pseudo || '' })),
  membres: () => req(sb.from('membres').select('*').order('nom_rp')),
  majMembre: (id, champs) => req(sb.from('membres').update(champs).eq('id', id).select().single()),

  // Dossiers
  dossiers: () => req(sb.from('dossiers').select('*').order('derniere_activite', { ascending: false })),
  dossier: id => req(sb.from('dossiers').select('*').eq('id', id).maybeSingle()),
  creerDossier: champs => req(sb.from('dossiers').insert(champs).select().single()),
  majDossier: (id, champs) => req(sb.from('dossiers').update(champs).eq('id', id).select().single()),
  supprimerDossier: id => req(sb.from('dossiers').delete().eq('id', id)),

  // Journal
  entrees: dossierId => req(sb.from('entrees').select('*').eq('dossier_id', dossierId).order('created_at', { ascending: false })),
  toutesEntrees: () => req(sb.from('entrees').select('*').order('created_at', { ascending: true })),
  rapportsIrs: () => req(sb.from('entrees').select('dossier_id,created_at').eq('type', 'rapport_irs')),
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

// Authentification
export const auth = {
  session: async () => (await sb.auth.getSession()).data.session,
  surChangement: rappel => sb.auth.onAuthStateChange(rappel),
  connexion: (email, password) => req(sb.auth.signInWithPassword({ email, password })),
  inscription: (email, password, donnees) => req(sb.auth.signUp({
    email,
    password,
    options: { data: donnees, emailRedirectTo: adresseDuSite() },
  })),
  connexionDiscord: () => req(sb.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: adresseDuSite() } })),
  motDePasseOublie: email => req(sb.auth.resetPasswordForEmail(email, { redirectTo: adresseDuSite() })),
  changerMotDePasse: password => req(sb.auth.updateUser({ password })),
  deconnexion: () => sb.auth.signOut(),
};

export function adresseDuSite() {
  return location.origin + location.pathname;
}
