// Tableau de bord : chiffres clés, points d'attention, rendez-vous, répartitions.

import { etat } from '../etat.js';
import { STATUTS, CATEGORIES, DELAIS, statut } from '../constantes.js';
import { esc, icone, avatar, pastilleStatut, nomComplet, joursDepuis, ilYa, echeance, dateCourte, pluriel, versDate } from '../ui.js';

const MAX_ALERTES = 8;

export function rendreTableau(vue) {
  const { moi } = etat;
  const actifs = etat.dossiers.filter(d => d.statut !== 'cloture');
  const estMedecin = ['medecin', 'responsable'].includes(moi.role);
  const estIrs = moi.role === 'irs';

  const mes = actifs.filter(d => d.medecin_id === moi.id);
  const urgents = actifs.filter(d => d.statut === 'urgent');
  const libres = actifs.filter(d => !d.medecin_id);
  const irs = actifs.filter(d => d.statut === 'analyse_irs');

  const kpis = [
    { label: estIrs ? 'Dossiers transmis' : 'Dossiers actifs', valeur: actifs.length, icone: 'dossier', c: '#34d399', lien: '#/dossiers',
      note: estIrs ? 'avec l’accord du patient' : `${pluriel(etat.dossiers.length - actifs.length, 'dossier archivé', 'dossiers archivés')}` },
    { label: 'Urgents', valeur: urgents.length, icone: 'alerte', c: '#fb7185', lien: '#/dossiers?statut=urgent',
      note: urgents.length ? 'à voir en priorité' : 'aucune aggravation' },
    !estIrs && { label: 'À attribuer', valeur: libres.length, icone: 'utilisateur', c: '#fbbf24', lien: '#/dossiers?medecin=aucun',
      note: 'sans médecin référent' },
    { label: 'Analyses IRS', valeur: irs.length, icone: 'fiole', c: '#a78bfa', lien: '#/dossiers?statut=analyse_irs',
      note: 'en cours à l’IRS' },
    estMedecin && { label: 'Mes patients', valeur: mes.length, icone: 'stetho', c: '#2dd4bf', lien: '#/dossiers?medecin=moi',
      note: 'dont je suis le référent' },
  ].filter(Boolean);

  const alertes = pointsDAttention(actifs);
  const rdvs = actifs
    .filter(d => d.prochain_rdv && joursDepuis(d.prochain_rdv) <= 0)
    .sort((a, b) => a.prochain_rdv.localeCompare(b.prochain_rdv))
    .slice(0, 6);

  const heure = new Date().getHours();
  const salut = heure < 5 || heure >= 18 ? 'Bonsoir' : 'Bonjour';

  vue.innerHTML = `
    <div class="page">
      <header class="entete-page accueil">
        <div>
          <p class="surtitre">${esc(new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))}</p>
          <h1 class="titre-page">${salut}, ${esc(moi.nom_rp)}</h1>
          <p class="sous-titre">${alertes.length
            ? `${pluriel(alertes.length, 'point demande', 'points demandent')} ton attention.`
            : 'Aucun point d’attention : tous les suivis sont à jour.'}</p>
        </div>
        <div class="actions-page">
          <button type="button" class="btn" data-action="actualiser">${icone('actualiser')} Actualiser</button>
          ${['responsable', 'medecin'].includes(moi.role) ? `<a class="btn btn-primaire" href="#/dossiers/nouveau">${icone('plus')} Nouveau dossier</a>` : ''}
        </div>
      </header>

      <section class="kpis" aria-label="Chiffres clés">
        ${kpis.map((k, i) => `
          <a class="kpi" href="${k.lien}" style="--c:${k.c};--i:${i}">
            <span class="kpi-tete"><span class="kpi-icone">${icone(k.icone)}</span>${esc(k.label)}</span>
            <span class="kpi-valeur">${k.valeur}</span>
            <span class="kpi-note">${esc(k.note)}</span>
          </a>`).join('')}
      </section>

      <div class="colonnes">
        <div class="pile">
          <section class="panneau">
            <div class="panneau-titre"><h2>${icone('alerte')} À traiter</h2>
              ${alertes.length > MAX_ALERTES ? `<span class="aide">${MAX_ALERTES} sur ${alertes.length}</span>` : ''}</div>
            ${alertes.length ? `<div class="alertes">${alertes.slice(0, MAX_ALERTES).map(a => `
              <a class="alerte" href="#/dossier/${a.d.id}" style="--c:${a.c}">
                <span class="alerte-icone" aria-hidden="true">${a.emoji}</span>
                <span style="min-width:0"><span class="alerte-titre">${esc(nomComplet(a.d))}</span>
                  <span class="alerte-detail">${esc(a.detail)}</span></span>
                ${icone('suivant')}
              </a>`).join('')}</div>`
            : `<p class="tout-va-bien">${icone('bouclier')} Rien d’urgent : aucun dossier en retard, inactif ou en attente d’attribution.</p>`}
          </section>

          <section class="panneau">
            <div class="panneau-titre"><h2>${icone('calendrier')} Prochains rendez-vous</h2></div>
            ${rdvs.length ? `<div class="rdvs">${rdvs.map(d => {
              const e = echeance(d.prochain_rdv);
              const date = versDate(d.prochain_rdv);
              const medecin = etat.membre(d.medecin_id);
              return `
                <a class="rdv" href="#/dossier/${d.id}">
                  <span class="rdv-date"><strong>${date.getDate()}</strong><small>${esc(date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''))}</small></span>
                  <span class="rdv-qui"><strong>${esc(nomComplet(d))}</strong>
                    <span>${esc(d.pathologie || '')}${medecin ? ` · ${esc(medecin.nom_rp)}` : ''}</span></span>
                  <span class="quand ${e.classe}">${e.texte}</span>
                </a>`;
            }).join('')}</div>`
            : '<p class="aide">Aucun rendez-vous planifié. La date du prochain rendez-vous se renseigne dans chaque compte rendu.</p>'}
          </section>
        </div>

        <div class="pile">
          <section class="panneau">
            <div class="panneau-titre"><h2>${icone('activite')} Dossiers actifs par statut</h2><span class="aide">${actifs.length} au total</span></div>
            ${barres(STATUTS.filter(s => s.id !== 'cloture').map(s => ({
              emoji: s.emoji, label: s.label, n: actifs.filter(d => d.statut === s.id).length, lien: `#/dossiers?statut=${s.id}`,
            })), actifs.length)}
          </section>

          <section class="panneau">
            <div class="panneau-titre"><h2>${icone('dossier')} Par catégorie de suivi</h2></div>
            ${barres(CATEGORIES.map(c => ({
              emoji: c.emoji, label: c.label, n: actifs.filter(d => d.categories?.includes(c.id)).length, lien: `#/dossiers?categorie=${c.id}`,
            })), actifs.length)}
          </section>

          ${moi.role === 'responsable' ? panneauCharge(actifs) : ''}
          ${estMedecin && moi.role !== 'responsable' ? panneauMesPatients(mes) : ''}
        </div>
      </div>
    </div>`;

  vue.querySelector('[data-action="actualiser"]').addEventListener('click', e => {
    e.currentTarget.classList.add('charge');
    document.dispatchEvent(new CustomEvent('seimei:actualiser'));
  });
}

// Barres horizontales d'une seule couleur ; la valeur est écrite au bout de chaque barre.
function barres(lignes, total) {
  const max = Math.max(1, ...lignes.map(l => l.n));
  return `<div class="barres">${lignes.map(l => {
    const part = total ? Math.round((l.n / total) * 100) : 0;
    return `
      <a class="barre-ligne ${l.n ? '' : 'zero'}" href="${l.lien}"
         data-bulle-valeur="${l.n}" data-bulle="${esc(`${l.n > 1 ? 'dossiers' : 'dossier'} · ${part} % des dossiers actifs`)}">
        <span class="barre-libelle"><span aria-hidden="true">${l.emoji}</span><span>${esc(l.label)}</span></span>
        <span class="barre-piste"><span class="barre-remplie" style="--p:${(l.n / max).toFixed(3)}"></span><span class="barre-valeur">${l.n}</span></span>
      </a>`;
  }).join('')}</div>`;
}

function panneauCharge(actifs) {
  const medecins = etat.medecins();
  if (!medecins.length) return '';
  const lignes = medecins.map(m => ({ m, n: actifs.filter(d => d.medecin_id === m.id).length }))
    .sort((a, b) => b.n - a.n);
  const max = Math.max(1, ...lignes.map(l => l.n));
  return `
    <section class="panneau">
      <div class="panneau-titre"><h2>${icone('stetho')} Charge des médecins référents</h2></div>
      <div class="barres">${lignes.map(({ m, n }) => `
        <a class="barre-ligne ${n ? '' : 'zero'}" href="#/dossiers?medecin=${m.id}"
           data-bulle-valeur="${n}" data-bulle="${esc(` ${n > 1 ? 'dossiers actifs' : 'dossier actif'}`)}">
          <span class="barre-libelle">${avatar(m, 'petit')}<span>${esc(m.nom_rp)}</span></span>
          <span class="barre-piste"><span class="barre-remplie" style="--p:${(n / max).toFixed(3)}"></span><span class="barre-valeur">${n}</span></span>
        </a>`).join('')}</div>
    </section>`;
}

function panneauMesPatients(mes) {
  return `
    <section class="panneau">
      <div class="panneau-titre"><h2>${icone('stetho')} Mes patients</h2><a class="aide" href="#/dossiers?medecin=moi">Tout voir</a></div>
      ${mes.length ? `<div class="mini-liste">${mes.slice(0, 8).map(d => `
        <a class="mini-patient" href="#/dossier/${d.id}"><strong>${esc(nomComplet(d))}</strong>${pastilleStatut(d.statut)}</a>`).join('')}</div>`
      : '<p class="aide">Aucun patient pour l’instant. Les dossiers « À attribuer » peuvent être pris en charge.</p>'}
    </section>`;
}

// Points d'attention, selon les règles de rythme du projet de branche.
function pointsDAttention(actifs) {
  const { moi } = etat;
  const items = [];
  const ajouter = (d, niveau, emoji, c, detail) => items.push({ d, niveau, emoji, c, detail });

  for (const d of actifs) {
    const inactif = joursDepuis(d.derniere_activite);
    if (d.statut === 'urgent') {
      ajouter(d, 0, '🔴', '#fb7185', `Urgent depuis ${ilYa(d.statut_depuis).replace('il y a ', '')} : rendez-vous d’urgence à organiser`);
    }
    if (d.statut === 'analyse_irs') {
      const depuis = versDate(d.statut_depuis);
      const rapportRecu = etat.rapports.some(r => r.dossier_id === d.id && versDate(r.created_at) > depuis);
      if (rapportRecu) ajouter(d, 1, '🔬', '#a78bfa', 'Rapport IRS reçu : résultats à présenter au patient');
      else if (moi.role === 'irs') ajouter(d, 1, '🔬', '#a78bfa', `Analyse attendue depuis ${ilYa(d.statut_depuis).replace('il y a ', '')}`);
    }
    if (!d.medecin_id) {
      ajouter(d, 2, '🟡', '#fbbf24', `Sans médecin référent, ouvert ${ilYa(d.created_at)}`);
    }
    if (d.prochain_rdv && joursDepuis(d.prochain_rdv) > 0) {
      ajouter(d, 3, '📅', '#fb7185', `Rendez-vous du ${dateCourte(d.prochain_rdv)} sans compte rendu`);
    }
    if (!['pause', 'stable'].includes(d.statut) && inactif >= DELAIS.inactivite) {
      ajouter(d, 4, '⏳', '#94a3b8', `Aucune activité depuis ${inactif} jours : passer « En pause » ?`);
    }
    if (d.statut === 'stable' && inactif >= DELAIS.controle) {
      ajouter(d, 5, '🟢', '#4ade80', `Suivi stable sans contrôle depuis ${inactif} jours`);
    }
  }
  for (const t of etat.essais) {
    const d = etat.dossier(t.dossier_id);
    const jours = joursDepuis(t.debut);
    if (d && d.statut !== 'cloture' && jours >= DELAIS.essai) {
      ajouter(d, 3, '💊', '#2dd4bf', `« ${t.nom} » en essai depuis ${jours} jours : analyse de contrôle à prévoir`);
    }
  }

  // Chacun voit ce qui le concerne.
  const filtre = {
    responsable: () => true,
    medecin: a => a.d.medecin_id === moi.id || !a.d.medecin_id || a.niveau === 0,
    soignant: a => a.niveau !== 2,
    irs: a => a.emoji === '🔬',
  }[moi.role] || (() => true);

  return items.filter(filtre).sort((a, b) => a.niveau - b.niveau || statut(a.d.statut).label.localeCompare(statut(b.d.statut).label));
}
