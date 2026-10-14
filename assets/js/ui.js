// Briques d'interface partagées : échappement, icônes, dates, notifications,
// fenêtres, confirmation, infobulles.

import { statut, categorie, role, clan } from './constantes.js';

/* ---------------- Utilitaires ---------------- */

export const $ = (selecteur, racine = document) => racine.querySelector(selecteur);
export const $$ = (selecteur, racine = document) => [...racine.querySelectorAll(selecteur)];

const ENTITES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = valeur => String(valeur ?? '').replace(/[&<>"']/g, c => ENTITES[c]);

// N'accepte que les liens http(s) (évite les liens javascript: dans les champs libres).
export function urlSure(valeur) {
  const texte = String(valeur ?? '').trim();
  return /^https?:\/\/[^\s]+$/i.test(texte) ? texte : '';
}

export const nomComplet = d => [d?.prenom, d?.nom].filter(Boolean).join(' ') || 'Sans nom';

// Titre « Ren Hoki » : le prénom en retrait, le nom en valeur.
export function nomTitre(d) {
  if (d?.prenom && d?.nom) return `<span>${esc(d.prenom)}</span> ${esc(d.nom)}`;
  return esc(d?.prenom || d?.nom || 'Sans nom');
}

export function initiales(nom) {
  const mots = String(nom || '?').trim().split(/\s+/).filter(Boolean);
  return ((mots[0]?.[0] || '?') + (mots.length > 1 ? mots[mots.length - 1][0] : '')).toUpperCase();
}

function teinte(texte) {
  let h = 0;
  for (const c of String(texte)) h = (h * 31 + c.codePointAt(0)) % 360;
  return h;
}

export const pluriel = (n, singulier, pluriel = singulier + 's') => `${n} ${n > 1 ? pluriel : singulier}`;

/* ---------------- Icônes (traits 24 × 24) ---------------- */

const ICONES = {
  tableau: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  dossier: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  cle: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8"/><path d="m17 6 3 3"/><path d="m14.5 8.5 2 2"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  equipe: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  recherche: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
  sortie: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  crayon: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  poubelle: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  retour: '<path d="m15 18-6-6 6-6"/>',
  suivant: '<path d="m9 18 6-6-6-6"/>',
  coche: '<path d="M20 6 9 17l-5-5"/>',
  horloge: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendrier: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  cadenas: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  fiole: '<path d="M10 2v7.53a2 2 0 0 1-.21.9L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.07-10.12a2 2 0 0 1-.21-.9V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
  stetho: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 12 0V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 12 0v-4"/><circle cx="20" cy="10" r="2"/>',
  document: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  activite: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  pilule: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
  fermer: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alerte: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  coeur: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  lien: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  actualiser: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  utilisateur: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  bouclier: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  telecharger: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  points: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
  etoile: '<path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1z"/>',
};

export const icone = (nom, classe = '') =>
  `<svg class="ic ${classe}" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nom] || ''}</svg>`;

/* ---------------- Pastilles ---------------- */

export function pastilleStatut(id, { grand = false, bouton = false, attributs = '' } = {}) {
  const s = statut(id);
  const balise = bouton ? 'button' : 'span';
  return `<${balise} ${bouton ? 'type="button"' : ''} class="pill${grand ? ' grand' : ''}" style="--c:${s.couleur}" ${attributs}>`
    + `<span aria-hidden="true">${s.emoji}</span>${esc(s.label)}</${balise}>`;
}

export const etiquetteCategorie = id => {
  const c = categorie(id);
  return `<span class="tag"><span aria-hidden="true">${c.emoji}</span>${esc(c.label)}</span>`;
};

export const badgeRole = id => `<span class="role" style="--c:${role(id).couleur}">${esc(role(id).court)}</span>`;

export function avatar(membre, taille = '') {
  if (!membre) return `<span class="avatar avatar-vide ${taille}" aria-hidden="true">?</span>`;
  const nom = membre.nom_rp || 'Membre';
  return `<span class="avatar ${taille}" style="--h:${teinte(membre.id || nom)}" aria-hidden="true">${esc(initiales(nom))}</span>`;
}

export function badgeClan(id) {
  const c = clan(id);
  return c ? `<span class="clan" style="--c:${c.couleur}">${esc(c.label)}</span>` : '';
}

/* ---------------- Dates ---------------- */

export function isoLocal(date = new Date()) {
  const z = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${z(date.getMonth() + 1)}-${z(date.getDate())}`;
}
export const aujourdhui = () => isoLocal(new Date());
export function versDate(v) {
  if (typeof v !== 'string') return new Date(v);
  if (v.length === 10) return new Date(v + 'T12:00:00'); // date seule : midi, pour éviter les décalages de fuseau
  return new Date(v.replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1').replace(/([+-]\d\d)$/, '$1:00'));
}

export const dateLongue = v => (v ? versDate(v).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
export const dateCourte = v => (v ? versDate(v).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const dateNumerique = v => (v ? versDate(v).toLocaleDateString('fr-FR') : '');
export const dateHeure = v => (v ? versDate(v).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

// Nombre de jours calendaires entre aujourd'hui et la date (positif = passé).
export function joursDepuis(v) {
  if (!v) return Infinity;
  const debut = versDate(v);
  const a = new Date(debut.getFullYear(), debut.getMonth(), debut.getDate());
  const maintenant = new Date();
  const b = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  return Math.round((b - a) / 86400000);
}

export function ilYa(v) {
  const j = joursDepuis(v);
  if (j <= 0) return 'aujourd’hui';
  if (j === 1) return 'hier';
  if (j < 7) return `il y a ${j} jours`;
  if (j < 30) return `il y a ${Math.floor(j / 7)} sem.`;
  if (j < 365) return `il y a ${Math.floor(j / 30)} mois`;
  return `il y a ${Math.floor(j / 365)} an${j >= 730 ? 's' : ''}`;
}

export function echeance(v) {
  const j = -joursDepuis(v);
  if (j === 0) return { texte: 'aujourd’hui', classe: 'proche' };
  if (j === 1) return { texte: 'demain', classe: 'proche' };
  if (j > 1) return { texte: `dans ${j} jours`, classe: j <= 3 ? 'proche' : '' };
  return { texte: `en retard de ${pluriel(-j, 'jour')}`, classe: 'retard' };
}

/* ---------------- Notifications ---------------- */

export function toast(message, type = 'info') {
  const zone = document.getElementById('toasts');
  if (!zone) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const ic = type === 'succes' ? 'coche' : type === 'erreur' ? 'alerte' : 'coeur';
  el.innerHTML = `${icone(ic)}<span></span>`;
  el.querySelector('span').textContent = message;
  zone.append(el);
  const duree = type === 'erreur' ? 6000 : 3500;
  setTimeout(() => {
    el.classList.add('sortie');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 400);
  }, duree);
}

/* ---------------- Fenêtres ---------------- */

/**
 * Ouvre une fenêtre. `valider(form, donnees)` est appelée à l'envoi :
 * renvoyer false (ou lever une erreur) garde la fenêtre ouverte.
 * Résout avec la valeur renvoyée par `valider`, ou null si annulée.
 */
export function fenetre({ titre, sousTitre = '', corps = '', valider = null, texteValider = 'Enregistrer',
  danger = false, large = false, texteAnnuler = 'Annuler', pied = '', apresOuverture = null }) {
  return new Promise(resolve => {
    const d = document.createElement('dialog');
    d.className = 'modale' + (large ? ' large' : '');
    d.innerHTML = `
      <form class="modale-boite" novalidate>
        <header class="modale-tete">
          <div><h2>${esc(titre)}</h2>${sousTitre ? `<p>${sousTitre}</p>` : ''}</div>
          <button type="button" class="btn btn-fantome btn-icone btn-petit" data-fermer aria-label="Fermer">${icone('fermer')}</button>
        </header>
        <div class="modale-corps">${corps}</div>
        <footer class="modale-pied">
          ${pied}
          <button type="button" class="btn" data-fermer>${esc(texteAnnuler)}</button>
          ${valider ? `<button type="submit" class="btn ${danger ? 'btn-danger' : 'btn-primaire'}">${esc(texteValider)}</button>` : ''}
        </footer>
      </form>`;
    document.body.append(d);
    const form = d.querySelector('form');
    let resultat = null;

    const fermer = () => d.close();
    d.addEventListener('close', () => { d.remove(); resolve(resultat); });
    // Un clic sur le fond ne ferme que les fenêtres sans saisie (rien à perdre).
    let appuiSurFond = false;
    d.addEventListener('pointerdown', e => { appuiSurFond = e.target === d; });
    d.addEventListener('click', e => {
      if (e.target.closest('[data-fermer]')) fermer();
      else if (!valider && appuiSurFond && e.target === d) fermer();
    });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!valider) return fermer();
      if (!form.reportValidity()) return;
      const bouton = form.querySelector('[type=submit]');
      bouton.classList.add('charge');
      try {
        const r = await valider(form, Object.fromEntries(new FormData(form)));
        if (r !== false) {
          resultat = r === undefined ? true : r;
          fermer();
        }
      } catch (err) {
        toast(err.message || String(err), 'erreur');
      } finally {
        bouton.classList.remove('charge');
      }
    });

    d.showModal();
    apresOuverture?.(d, fermer);
    const premier = form.querySelector('.modale-corps input:not([type=hidden]):not([type=radio]):not([type=checkbox]), .modale-corps textarea, .modale-corps select');
    if (premier && !premier.hasAttribute('data-pas-de-focus')) premier.focus();
  });
}

export function confirmer({ titre, message, texteValider = 'Confirmer', danger = false, corps = '' }) {
  return fenetre({
    titre,
    corps: `${message ? `<p style="color:var(--texte-2)">${message}</p>` : ''}${corps}`,
    texteValider,
    danger,
    valider: (_form, donnees) => donnees,
  });
}

/* ---------------- Infobulles des graphiques ---------------- */

let bulle = null;
function montrerBulle(cible) {
  if (!bulle) {
    bulle = document.createElement('div');
    bulle.className = 'infobulle';
    bulle.setAttribute('role', 'tooltip');
    document.body.append(bulle);
  }
  bulle.replaceChildren();
  const fort = document.createElement('strong');
  fort.textContent = cible.dataset.bulleValeur || '';
  bulle.append(fort, document.createTextNode(cible.dataset.bulle || ''));
  const r = cible.getBoundingClientRect();
  bulle.style.left = `${Math.min(Math.max(r.left + r.width / 2, 90), innerWidth - 90)}px`;
  bulle.style.top = `${r.top}px`;
  bulle.hidden = false;
}
const cacherBulle = () => { if (bulle) bulle.hidden = true; };

export function activerInfobulles() {
  const suivre = e => {
    const cible = e.target.closest?.('[data-bulle]');
    if (cible) montrerBulle(cible); else cacherBulle();
  };
  document.addEventListener('pointerover', suivre);
  document.addEventListener('focusin', suivre);
  document.addEventListener('scroll', cacherBulle, true);
}
