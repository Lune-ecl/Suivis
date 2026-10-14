// État partagé du site et droits de la personne connectée
// (les mêmes règles sont appliquées par la base, voir supabase/schema.sql).

import { api } from './api.js';

export const etat = {
  session: null,
  moi: null,
  membres: [],
  dossiers: [],
  essais: [],
  rapports: [],

  vider() {
    Object.assign(this, { session: null, moi: null, membres: [], dossiers: [], essais: [], rapports: [] });
  },

  async chargerTout() {
    const [membres, dossiers, essais, rapports] = await Promise.all([
      api.membres(), api.dossiers(), api.essaisEnCours(), api.rapportsIrs(),
    ]);
    Object.assign(this, { membres, dossiers, essais, rapports });
    const moi = membres.find(m => m.id === this.moi?.id);
    if (moi) this.moi = moi;
  },

  membre(id) { return this.membres.find(m => m.id === id) || null; },
  dossier(id) { return this.dossiers.find(d => d.id === id) || null; },

  // Remplace (ou ajoute) un dossier dans la liste locale après une modification.
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

  medecins() {
    return this.membres
      .filter(m => m.actif && ['medecin', 'responsable'].includes(m.role))
      .sort((a, b) => a.nom_rp.localeCompare(b.nom_rp, 'fr'));
  },
};

const r = () => etat.moi?.role;
const parmi = (...roles) => roles.includes(r());

export const peut = {
  creerDossier: () => parmi('responsable', 'medecin'),
  modifierDossier: d => parmi('responsable', 'medecin') && d?.statut !== 'cloture',
  changerStatut: d => parmi('responsable', 'medecin') && d?.statut !== 'cloture',
  cloturer: () => parmi('responsable'),
  rouvrir: () => parmi('responsable'),
  attribuer: () => parmi('responsable'),
  prendreEnCharge: d => parmi('medecin', 'responsable') && !d?.medecin_id && d?.statut !== 'cloture',
  compteRendu: d => parmi('responsable', 'medecin', 'soignant') && d?.statut !== 'cloture',
  rapportIrs: d => parmi('responsable', 'irs') && d?.statut !== 'cloture',
  note: d => parmi('responsable', 'medecin', 'soignant', 'irs') && d?.statut !== 'cloture',
  traitements: d => parmi('responsable', 'medecin') && d?.statut !== 'cloture',
  modifierEntree: e => e.type !== 'evenement' && (e.auteur_id === etat.moi?.id || parmi('responsable')),
  supprimerDossier: () => parmi('responsable'),
  gererEquipe: () => parmi('responsable'),
  voirArchives: () => parmi('responsable', 'medecin', 'soignant', 'irs'),
};
