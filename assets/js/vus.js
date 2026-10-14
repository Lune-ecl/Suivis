// Repères « Nouveau » : on retient, dans ce navigateur, la dernière activité vue
// pour chaque dossier. Un dossier dont l'activité est plus récente est « nouveau ».

import { etat } from './etat.js';
import { versDate } from './ui.js';

let vus = null;
const cle = () => `seimei:vus:${etat.moi?.id}`;

function enregistrer() {
  try { localStorage.setItem(cle(), JSON.stringify(vus)); } catch { /* stockage indisponible */ }
}

// À l'ouverture de session. La toute première fois, tout l'existant est considéré comme vu.
export function chargerVus() {
  try { vus = JSON.parse(localStorage.getItem(cle()) || 'null'); } catch { vus = null; }
  if (!vus || typeof vus !== 'object') {
    vus = Object.fromEntries(etat.dossiers.map(d => [d.id, d.derniere_activite]));
    enregistrer();
  }
}

export function marquerVu(dossier) {
  if (!vus || !dossier) return;
  vus[dossier.id] = dossier.derniere_activite;
  enregistrer();
}

export function estNouveau(dossier) {
  if (!vus || !dossier) return false;
  const vu = vus[dossier.id];
  return !vu || versDate(dossier.derniere_activite) > versDate(vu);
}
