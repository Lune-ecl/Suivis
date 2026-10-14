// État partagé du site et droits de la personne connectée
// (les mêmes règles sont appliquées par la base, voir supabase/schema.sql).

import { api } from './api.js';

export const etat = {
  session: null,
  moi: null,
  membres: [],
  dossiers: [],
  essais: [],
  journal: [], // résumé : dossier_id, auteur_id, type, created_at (sans les événements)

  vider() {
    Object.assign(this, { session: null, moi: null, membres: [], dossiers: [], essais: [], journal: [] });
  },

  async chargerTout() {
    const [membres, dossiers, essais, journal] = await Promise.all([
      api.membres(), api.dossiers(), api.essaisEnCours(), api.resumeJournal(),
    ]);
    Object.assign(this, { membres, dossiers, essais, journal });
    const moi = membres.find(m => m.id === this.moi?.id);
    if (moi) this.moi = moi;
  },

  get rapports() { return this.journal.filter(e => e.type === 'rapport_irs'); },

  membre(id) { return this.membres.find(m => m.id === id) || null; },
  dossier(id) { return this.dossiers.find(d => d.id === id) || null; },

  // Remplace (ou ajoute) un élément dans la liste locale après une modification.
  garderDossier(dossier) {
    const i = this.dossiers.findIndex(d => d.id === dossier.id);
    if (i >= 0) this.dossiers[i] = dossier; else this.dossiers.unshift(dossier);
  },
  oublierDossier(id) { this.dossiers = this.dossiers.filter(d => d.id !== id); },
  garderMembre(membre) {
    const i = this.membres.findIndex(m => m.id === membre.id);
    if (i >= 0) this.membres[i] = membre; else this.membres.push(membre);
    if (membre.id === this.moi?.id) this.moi = membre;
  },
  oublierMembre(id) { this.membres = this.membres.filter(m => m.id !== id); },

  medecins() {
    return this.membres
      .filter(m => m.actif && ['medecin', 'responsable'].includes(m.role))
      .sort((a, b) => a.nom_rp.localeCompare(b.nom_rp, 'fr'));
  },
};

const r = () => etat.moi?.role;
const parmi = (...roles) => roles.includes(r());
const ouvert = d => d && d.statut !== 'cloture';

export const peut = {
  creerDossier: () => parmi('responsable', 'medecin'),
  // Fiche patient et suivi médical (statut, parcours, rendez-vous, médecin).
  modifierDossier: d => ouvert(d) && parmi('responsable', 'medecin'),
  gererSuivi: d => ouvert(d) && parmi('responsable', 'medecin'),
  changerStatut: d => ouvert(d) && parmi('responsable', 'medecin'),
  modifierAccord: d => ouvert(d) && parmi('responsable', 'medecin'),
  cloturer: () => parmi('responsable'),
  rouvrir: () => parmi('responsable'),
  attribuer: () => parmi('responsable'),
  prendreEnCharge: d => parmi('medecin', 'responsable') && !d?.medecin_id && ouvert(d),
  compteRendu: d => ouvert(d) && parmi('responsable', 'medecin', 'soignant'),
  rapportIrs: d => ouvert(d) && parmi('responsable', 'irs'),
  note: d => ouvert(d) && parmi('responsable', 'medecin', 'soignant', 'irs'),
  traitements: d => ouvert(d) && parmi('responsable', 'medecin'),
  modifierEntree: e => e.type !== 'evenement' && (e.auteur_id === etat.moi?.id || parmi('responsable')),
  supprimerDossier: () => parmi('responsable'),
  gererEquipe: () => parmi('responsable'),
};
