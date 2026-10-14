// Liste des dossiers (actifs ou archivés) avec recherche, filtres et tri.

import { etat, peut } from '../etat.js';
import { STATUTS, CATEGORIES, PRIORITE_STATUT, statut, categorie, clan, etapesDu } from '../constantes.js';
import { esc, icone, avatar, pastilleStatut, nomComplet, ilYa, echeance, dateCourte, pluriel, versDate, badgeClan } from '../ui.js';
import { estNouveau } from '../vus.js';

// Les filtres sont gardés quand on navigue entre les pages.
const filtres = {
  actifs: { recherche: '', statuts: new Set(), categories: new Set(), medecin: '', tri: 'priorite' },
  archives: { recherche: '', statuts: new Set(), categories: new Set(), medecin: '', tri: 'activite' },
};

const sansAccents = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function rendreDossiers(vue, requete, { archives = false } = {}) {
  const f = filtres[archives ? 'archives' : 'actifs'];

  // Un lien du tableau de bord (ex. ?statut=urgent) remplace les filtres en cours.
  if (requete && [...requete.keys()].length) {
    f.recherche = '';
    f.statuts = new Set(requete.getAll('statut'));
    f.categories = new Set(requete.getAll('categorie'));
    f.medecin = requete.get('medecin') || '';
    history.replaceState(null, '', archives ? '#/archives' : '#/dossiers');
  }

  const optionsMedecin = [
    ['medecin', 'responsable'].includes(etat.moi.role) ? ['moi', 'Mes patients'] : null,
    archives ? null : ['aucun', 'Non attribués'],
    ...etat.medecins().map(m => [m.id, m.nom_rp]),
  ].filter(Boolean);

  vue.innerHTML = `
    <div class="page">
      <header class="entete-page">
        <div>
          <p class="surtitre">${archives ? 'Dossiers clôturés' : 'Branche de suivi'}</p>
          <h1 class="titre-page">${archives ? 'Archives' : 'Dossiers'}</h1>
          <p class="sous-titre">${archives
            ? 'Les dossiers clôturés restent consultables et peuvent être rouverts par le responsable.'
            : 'Un dossier par patient : fiche, parcours de soin, journal et traitements.'}</p>
        </div>
        <div class="actions-page">
          <button type="button" class="btn" data-action="actualiser">${icone('actualiser')} Actualiser</button>
          ${!archives && peut.creerDossier() ? `<a class="btn btn-primaire" href="#/dossiers/nouveau">${icone('plus')} Nouveau dossier</a>` : ''}
        </div>
      </header>

      <section class="filtres" aria-label="Filtres">
        <div class="filtres-ligne">
          <label class="champ-icone">${icone('recherche')}
            <input type="search" data-filtre="recherche" value="${esc(f.recherche)}" aria-label="Rechercher"
              placeholder="Rechercher un patient, une pathologie, un clan, un joueur…"></label>
          <select data-filtre="medecin" aria-label="Médecin référent">
            <option value="">Tous les médecins</option>
            ${optionsMedecin.map(([v, l]) => `<option value="${esc(v)}" ${f.medecin === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}
          </select>
          <select data-filtre="tri" aria-label="Trier par">
            ${[['priorite', 'Les plus urgents d’abord'], ['activite', 'Activité récente'], ['nom', 'Nom (A → Z)'], ['rdv', 'Prochain rendez-vous']]
              .filter(([v]) => !archives || v !== 'rdv')
              .map(([v, l]) => `<option value="${v}" ${f.tri === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        ${archives ? '' : `
        <div class="filtres-groupe"><span class="etiquette">Statut</span>
          <div class="puces">${STATUTS.filter(s => s.id !== 'cloture').map(s => `
            <button type="button" class="puce" style="--c:${s.couleur}" data-statut="${s.id}" aria-pressed="${f.statuts.has(s.id)}">
              <span aria-hidden="true">${s.emoji}</span>${esc(s.label)}</button>`).join('')}</div>
        </div>`}
        <div class="filtres-groupe"><span class="etiquette">Catégorie</span>
          <div class="puces">${CATEGORIES.map(c => `
            <button type="button" class="puce" data-categorie="${c.id}" aria-pressed="${f.categories.has(c.id)}">
              <span aria-hidden="true">${c.emoji}</span>${esc(c.label)}</button>`).join('')}</div>
        </div>
      </section>

      <div class="resume-filtres">
        <span data-resume aria-live="polite"></span>
        <button type="button" class="lien-discret" data-action="reinitialiser" hidden>Effacer les filtres</button>
      </div>
      <div data-resultats></div>
    </div>`;

  const page = vue.querySelector('.page');
  const dessiner = () => dessinerResultats(page, f, archives);

  page.addEventListener('input', e => {
    const champ = e.target.dataset.filtre;
    if (!champ) return;
    f[champ] = e.target.value;
    dessiner();
  });
  page.addEventListener('click', e => {
    const puce = e.target.closest('[data-statut], [data-categorie]');
    if (puce) {
      const groupe = puce.dataset.statut ? f.statuts : f.categories;
      const valeur = puce.dataset.statut || puce.dataset.categorie;
      if (groupe.has(valeur)) groupe.delete(valeur); else groupe.add(valeur);
      puce.setAttribute('aria-pressed', String(groupe.has(valeur)));
      return dessiner();
    }
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'reinitialiser') {
      Object.assign(f, { recherche: '', statuts: new Set(), categories: new Set(), medecin: '' });
      rendreDossiers(vue, null, { archives });
    }
    if (action === 'actualiser') {
      e.target.closest('[data-action]').classList.add('charge');
      document.dispatchEvent(new CustomEvent('seimei:actualiser'));
    }
  });
  dessiner();
}

function dessinerResultats(page, f, archives) {
  const base = etat.dossiers.filter(d => (d.statut === 'cloture') === archives);
  const terme = sansAccents(f.recherche).trim();

  let liste = base.filter(d => {
    if (f.statuts.size && !f.statuts.has(d.statut)) return false;
    if (f.categories.size && !(d.categories || []).some(c => f.categories.has(c))) return false;
    if (f.medecin === 'moi' && d.medecin_id !== etat.moi.id) return false;
    if (f.medecin === 'aucun' && d.medecin_id) return false;
    if (f.medecin && !['moi', 'aucun'].includes(f.medecin) && d.medecin_id !== f.medecin) return false;
    if (terme) {
      const texte = sansAccents([d.nom, d.prenom, d.pathologie, d.joueur, d.village, d.grade, d.section,
        clan(d.clan)?.label, etat.membre(d.medecin_id)?.nom_rp].join(' '));
      if (!terme.split(/\s+/).every(mot => texte.includes(mot))) return false;
    }
    return true;
  });

  const parNom = (a, b) => nomComplet(a).localeCompare(nomComplet(b), 'fr');
  const tris = {
    priorite: (a, b) => PRIORITE_STATUT.indexOf(a.statut) - PRIORITE_STATUT.indexOf(b.statut)
      || versDate(b.derniere_activite) - versDate(a.derniere_activite),
    activite: (a, b) => versDate(b.derniere_activite) - versDate(a.derniere_activite),
    nom: parNom,
    rdv: (a, b) => (a.prochain_rdv || '9999').localeCompare(b.prochain_rdv || '9999') || parNom(a, b),
  };
  liste = liste.sort(tris[f.tri] || tris.priorite);

  const filtre = f.recherche || f.statuts.size || f.categories.size || f.medecin;
  page.querySelector('[data-resume]').textContent = filtre
    ? `${pluriel(liste.length, 'dossier affiché', 'dossiers affichés')} sur ${base.length}`
    : pluriel(base.length, archives ? 'dossier archivé' : 'dossier actif', archives ? 'dossiers archivés' : 'dossiers actifs');
  page.querySelector('[data-action="reinitialiser"]').hidden = !filtre;

  const zone = page.querySelector('[data-resultats]');
  if (!liste.length) {
    zone.innerHTML = `<div class="vide">
      <span class="grande-icone" aria-hidden="true">${archives ? '🗄️' : base.length ? '🔍' : '📂'}</span>
      <strong>${archives ? 'Aucun dossier archivé' : base.length ? 'Aucun dossier ne correspond' : 'Aucun dossier pour l’instant'}</strong>
      <p>${archives ? 'Les dossiers clôturés apparaîtront ici.'
        : base.length ? 'Essaie d’autres filtres ou une autre recherche.'
        : 'Ouvre le premier dossier pour commencer le suivi d’un patient.'}</p>
      ${!archives && !base.length && peut.creerDossier() ? `<a class="btn btn-primaire" href="#/dossiers/nouveau">${icone('plus')} Nouveau dossier</a>` : ''}
    </div>`;
    return;
  }
  zone.innerHTML = `<div class="grille-dossiers">${liste.map((d, i) => carteDossier(d, i, archives)).join('')}</div>`;
}

export function carteDossier(d, i, archives = false) {
  const s = statut(d.statut);
  const medecin = etat.membre(d.medecin_id);
  const etapes = etapesDu(d.parcours);
  const etape = Math.min(d.etape || 1, etapes.length);
  const rdv = d.prochain_rdv ? echeance(d.prochain_rdv) : null;
  const nouveau = estNouveau(d);

  return `
    <a class="carte-dossier ${d.statut === 'urgent' ? 'urgent' : ''}" href="#/dossier/${d.id}" style="--c:${s.couleur};--i:${i}">
      <div class="cd-haut">${pastilleStatut(d.statut)}
        ${nouveau ? '<span class="badge-nouveau">Nouveau</span>'
          : `<span class="cd-activite" title="Dernière activité">${icone('horloge')} ${ilYa(d.derniere_activite)}</span>`}</div>
      <h3 class="cd-nom">${esc(d.nom)} <span>${esc(d.prenom)}</span></h3>
      <p class="cd-patho">${esc(d.pathologie || 'Pathologie non renseignée')}</p>
      <div class="tags">${badgeClan(d.clan)}${(d.categories || []).map(c => `<span class="tag"><span aria-hidden="true">${categorie(c).emoji}</span>${esc(categorie(c).court)}</span>`).join('')}</div>
      ${archives
        ? `<p class="aide">${icone('archive')} Clôturé le ${dateCourte(d.statut_depuis)}${d.motif_cloture ? ` · ${esc(d.motif_cloture)}` : ''}</p>`
        : `<div class="cd-progression">
            <div class="piste-fine" role="img" aria-label="Étape ${etape} sur ${etapes.length}"><span style="width:${Math.round((etape / etapes.length) * 100)}%"></span></div>
            <small>Étape ${etape}/${etapes.length} · ${esc(etapes[etape - 1].titre)}</small>
          </div>`}
      <div class="cd-bas">
        ${avatar(medecin, 'petit')}
        <span class="medecin">${medecin ? esc(medecin.nom_rp) : '<span class="libre">À attribuer</span>'}</span>
        ${rdv && !archives ? `<span class="cd-rdv quand ${rdv.classe}" title="Prochain rendez-vous">${icone('calendrier')} ${rdv.texte}</span>` : ''}
      </div>
    </a>`;
}
