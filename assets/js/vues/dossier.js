// Fiche d'un dossier : en-tête, parcours de soin, journal, fiche patient, traitements.

import { api } from '../api.js';
import { etat, peut } from '../etat.js';
import {
  STATUTS, PARCOURS, TYPES_RDV, MOTIFS_CLOTURE, TYPES_TRAITEMENT, ETATS_TRAITEMENT,
  RESULTATS_TRAITEMENT, DELAIS, statut, categorie, role, etapesDu,
} from '../constantes.js';
import {
  esc, icone, avatar, pastilleStatut, etiquetteCategorie, nomComplet, urlSure, dateLongue, dateCourte,
  dateHeure, dateNumerique, ilYa, echeance, joursDepuis, aujourdhui, pluriel, toast, fenetre, confirmer, versDate, badgeRole,
} from '../ui.js';
import { marquerVu } from '../vus.js';

function texteProchainRdv(c) {
  const morceaux = [c.prochain_rdv ? dateNumerique(c.prochain_rdv) : '', c.prochain_precision || ''].filter(Boolean);
  return morceaux.join(' — ') || 'À définir';
}

let courant = null; // { d, entrees, traitements, onglet, filtre, vue }

const champ = (etiquette, html, classe = '', aide = '') =>
  `<label class="champ ${classe}"><span class="etiquette">${etiquette}</span>${html}${aide ? `<span class="aide">${aide}</span>` : ''}</label>`;
const zone = (nom, valeur = '', lignes = 3, attributs = '') =>
  `<textarea name="${nom}" rows="${lignes}" ${attributs}>${esc(valeur)}</textarea>`;

export async function rendreDossier(vue, id) {
  const memoire = courant?.d?.id === id ? { onglet: courant.onglet, filtre: courant.filtre } : {};
  vue.innerHTML = '<div class="page"><div class="ecran-centre" style="min-height:50vh"><div class="chargeur" role="status" aria-label="Chargement du dossier"></div></div></div>';

  const [d, entrees, traitements] = await Promise.all([api.dossier(id), api.entrees(id), api.traitements(id)]);
  if (!d) {
    etat.oublierDossier(id);
    vue.innerHTML = `<div class="page"><div class="vide"><span class="grande-icone" aria-hidden="true">🔒</span>
      <strong>Dossier introuvable</strong><p>Ce dossier n’existe plus, ou ton rôle ne permet pas de le consulter.</p>
      <a class="btn" href="#/dossiers">${icone('retour')} Retour aux dossiers</a></div></div>`;
    return;
  }
  etat.garderDossier(d);
  courant = { d, entrees, traitements, vue, onglet: memoire.onglet || 'journal', filtre: memoire.filtre || 'tout' };
  dessiner();
}

/* =====================================================================
   Affichage
   ===================================================================== */

function dessiner({ animer = true } = {}) {
  const { d, vue } = courant;
  const nbJournal = courant.entrees.filter(e => e.type !== 'evenement').length;
  vue.innerHTML = `
    <div class="page" ${animer ? '' : 'style="animation:none"'}>
      ${htmlEnTete(d)}
      ${htmlBandeaux(d)}
      ${htmlParcours(d)}
      <section class="pile">
        <div class="onglets" role="tablist" aria-label="Contenu du dossier">
          ${[['journal', 'Journal', nbJournal, 'activite'], ['fiche', 'Fiche patient', null, 'document'], ['traitements', 'Traitements', courant.traitements.length, 'pilule']]
            .map(([id, label, n, ic]) => `<button type="button" role="tab" id="onglet-${id}" data-action="onglet" data-onglet="${id}"
              aria-selected="${courant.onglet === id}" aria-controls="contenu-onglet">${icone(ic)} ${label}${n !== null ? ` <span class="nombre">${n}</span>` : ''}</button>`).join('')}
        </div>
        <div id="contenu-onglet" role="tabpanel" aria-labelledby="onglet-${courant.onglet}" data-onglet-contenu>${htmlOnglet()}</div>
      </section>
    </div>`;
  const page = vue.querySelector('.page');
  page.addEventListener('click', surClic);
  marquerVu(courant.d);
}

function majOnglet() {
  const page = courant.vue.querySelector('.page');
  page.querySelectorAll('[data-onglet]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.onglet === courant.onglet)));
  const contenu = page.querySelector('[data-onglet-contenu]');
  contenu.setAttribute('aria-labelledby', `onglet-${courant.onglet}`);
  contenu.innerHTML = htmlOnglet();
}

function htmlOnglet() {
  if (courant.onglet === 'fiche') return htmlFiche(courant.d);
  if (courant.onglet === 'traitements') return htmlTraitements();
  return htmlJournal();
}

function htmlEnTete(d) {
  const s = statut(d.statut);
  const medecin = etat.membre(d.medecin_id);
  const rdv = d.prochain_rdv ? echeance(d.prochain_rdv) : null;
  const suivi = peut.gererSuivi(d);
  const patient = [d.age, d.grade, d.village].filter(Boolean).join(' · ');
  const joueur = etat.estJoueur ? null : etat.membre(d.patient_id);

  return `
    ${etat.estJoueur
      ? `<a class="retour" href="#/">${icone('retour')} Mes dossiers</a>`
      : `<a class="retour" href="${d.statut === 'cloture' ? '#/archives' : '#/dossiers'}">${icone('retour')} ${d.statut === 'cloture' ? 'Archives' : 'Dossiers'}</a>`}
    <section class="hero" style="--c:${s.couleur}">
      <div class="hero-haut">
        <div style="min-width:0">
          <p class="surtitre">${icone('cadenas')} Dossier médical · confidentiel</p>
          <h1 class="hero-nom">${esc(d.nom)} <span>${esc(d.prenom)}</span></h1>
          <p class="hero-patho">${esc(d.pathologie || 'Pathologie non renseignée')}</p>
          ${patient ? `<p class="hero-identite">${esc(patient)}</p>` : ''}
          ${etat.estJoueur ? '' : `<p class="hero-identite">🎭 ${joueur ? `Compte joueur : ${esc(joueur.nom_rp)}${joueur.pseudo ? ` (${esc(joueur.pseudo)})` : ''}` : 'Aucun compte joueur relié'}</p>`}
          <div class="hero-tags">${(d.categories || []).map(etiquetteCategorie).join('')}</div>
        </div>
        <div class="hero-statut">
          ${pastilleStatut(d.statut, {
            grand: true,
            bouton: peut.changerStatut(d),
            attributs: peut.changerStatut(d) ? 'data-action="statut" title="Changer le statut"' : '',
          })}
          <span class="aide">${icone('horloge')} Activité ${ilYa(d.derniere_activite)}</span>
        </div>
      </div>

      <dl class="hero-meta">
        <div class="meta"><dt>Médecin référent</dt><dd>
          ${avatar(medecin, 'petit')}
          <span class="texte-tronque">${medecin ? esc(medecin.nom_rp) : '<span style="color:#fcd34d">Non attribué</span>'}</span>
          ${peut.attribuer() && d.statut !== 'cloture' ? `<button type="button" class="btn btn-fantome btn-petit btn-icone lien-action" data-action="attribuer" title="Attribuer" aria-label="Attribuer un médecin référent">${icone('crayon')}</button>`
            : peut.prendreEnCharge(d) ? `<button type="button" class="btn btn-petit lien-action" data-action="prendre">Prendre en charge</button>` : ''}
        </dd></div>
        <div class="meta"><dt>Prochain rendez-vous</dt><dd>
          ${rdv ? `${icone('calendrier')}<span class="texte-tronque">${dateCourte(d.prochain_rdv)}</span><span class="quand ${rdv.classe}">${rdv.texte}</span>` : '<span class="texte-tronque" style="color:var(--texte-3)">Non planifié</span>'}
          ${suivi ? `<button type="button" class="btn btn-fantome btn-petit btn-icone lien-action" data-action="rdv" title="Planifier" aria-label="Planifier le prochain rendez-vous">${icone('crayon')}</button>` : ''}
        </dd></div>
        <div class="meta"><dt>Accord pour l’IRS</dt><dd>
          <span class="texte-tronque">${d.consentement_irs ? '🔬 Transmission autorisée' : '🔒 Non transmis'}</span>
          ${peut.modifierAccord(d) ? `<button type="button" class="btn btn-fantome btn-petit btn-icone lien-action" data-action="consentement" title="Modifier l’accord" aria-label="Modifier l’accord IRS">${icone('crayon')}</button>` : ''}
        </dd></div>
      </dl>

      <div class="hero-actions">
        ${peut.compteRendu(d) ? `<button type="button" class="btn btn-primaire" data-action="compte-rendu">${icone('document')} Compte rendu</button>` : ''}
        ${peut.rapportIrs(d) ? `<button type="button" class="btn" data-action="rapport">${icone('fiole')} Rapport IRS</button>` : ''}
        ${peut.message(d) ? `<button type="button" class="btn ${etat.estJoueur ? 'btn-primaire' : ''}" data-action="message">${icone('message')} ${etat.estJoueur ? 'Écrire un message' : 'Message'}</button>` : ''}
        ${peut.modifierDossier(d) ? `<a class="btn" href="#/dossier/${d.id}/modifier">${icone('crayon')} ${etat.estJoueur ? 'Modifier ma fiche' : 'Modifier la fiche'}</a>` : ''}
        ${d.statut === 'cloture' && peut.rouvrir() ? `<button type="button" class="btn" data-action="rouvrir">${icone('actualiser')} Rouvrir le dossier</button>` : ''}
        ${peut.supprimerDossier() ? `<button type="button" class="btn btn-fantome btn-icone" data-action="supprimer" title="Supprimer le dossier" aria-label="Supprimer le dossier">${icone('poubelle')}</button>` : ''}
      </div>
    </section>`;
}

function htmlBandeaux(d) {
  const b = [];
  const inactif = joursDepuis(d.derniere_activite);
  if (d.statut === 'cloture') {
    b.push(`<div class="bandeau">✅ Dossier clôturé le ${dateLongue(d.statut_depuis)}${d.motif_cloture ? ` · ${esc(d.motif_cloture)}` : ''}. Il reste consultable${peut.rouvrir() ? ' et peut être rouvert' : ''}.</div>`);
  }
  if (d.statut === 'urgent') {
    b.push('<div class="bandeau alerte-rouge">🔴 Aggravation signalée : organiser un rendez-vous d’urgence, puis réévaluer le traitement ou le programme.</div>');
  }
  if (etat.moi.role === 'irs') {
    b.push(`<div class="bandeau info-violet">🔬 Tu vois ce dossier car le patient a autorisé la transmission à l’IRS.${d.statut === 'analyse_irs' ? ' Publie ton rapport d’analyse ici une fois l’analyse terminée.' : ''}</div>`);
  }
  if (!d.medecin_id && d.statut !== 'cloture') {
    b.push(etat.estJoueur
      ? '<div class="bandeau">🟡 Ta demande a bien été reçue : un médecin de la branche va prendre en charge ton dossier et organiser le premier rendez-vous.</div>'
      : `<div class="bandeau">🟡 Aucun médecin référent pour l’instant.${peut.prendreEnCharge(d) ? ` <button type="button" class="btn btn-petit btn-primaire" data-action="prendre">Prendre en charge</button>` : ''}</div>`);
  }
  if (!etat.estJoueur && !['pause', 'stable', 'cloture'].includes(d.statut) && inactif >= DELAIS.inactivite) {
    b.push(`<div class="bandeau">⏳ Aucune activité depuis ${inactif} jours : selon les règles de la branche, le dossier peut passer « En pause ».${peut.changerStatut(d) ? ` <button type="button" class="btn btn-petit" data-action="pause">Mettre en pause</button>` : ''}</div>`);
  }
  return b.join('');
}

function htmlParcours(d) {
  const p = PARCOURS[d.parcours] || PARCOURS.maladie;
  const n = p.etapes.length;
  const courante = Math.min(Math.max(d.etape || 1, 1), n);
  const e = p.etapes[courante - 1];
  const cliquable = peut.gererSuivi(d);

  return `
    <section class="panneau">
      <div class="parcours-tete">
        <div>
          <div class="panneau-titre" style="margin:0"><h2>${icone('activite')} ${esc(p.label)}</h2></div>
          <p class="aide">${esc(p.detail)} · étape ${courante} sur ${n}</p>
        </div>
        ${cliquable ? '<span class="aide">Clique sur une étape pour faire avancer le parcours</span>' : ''}
      </div>
      <ol class="etapes" style="--n:${n}">
        ${p.etapes.map((etape, i) => {
          const num = i + 1;
          const classe = num < courante ? 'faite' : num === courante ? 'courante' : '';
          const contenu = num < courante ? icone('coche') : num;
          const rond = cliquable && num !== courante
            ? `<button type="button" class="etape-rond" data-action="etape" data-etape="${num}" aria-label="Aller à l’étape ${num} : ${esc(etape.titre)}">${contenu}</button>`
            : `<span class="etape-rond" ${num === courante ? 'aria-current="step"' : ''}>${contenu}</span>`;
          return `<li class="etape ${classe}">${rond}<span class="etape-titre">${esc(etape.titre)}</span></li>`;
        }).join('')}
      </ol>
      <div class="guide-etape">
        <h3>${icone('etoile')} Étape ${courante} · ${esc(e.titre)}</h3>
        <p>${esc(e.resume)}</p>
        <ul class="points">${e.points.map(pt => `<li>${icone('coche')}<span>${esc(pt)}</span></li>`).join('')}</ul>
        ${e.rythme ? `<span class="rythme">${icone('horloge')} ${esc(e.rythme)}</span>` : ''}
        ${e.irs && !d.consentement_irs ? '<div class="bandeau info-violet">🔒 L’accord du patient est nécessaire avant toute transmission à l’IRS.</div>' : ''}
        ${d.plan_suivi ? `<div><p class="etiquette" style="margin-bottom:4px">Plan de suivi en cours</p><p style="white-space:pre-wrap">${esc(d.plan_suivi)}</p></div>` : ''}
      </div>
    </section>`;
}

/* ---------------- Journal ---------------- */

function htmlJournal() {
  const { entrees, filtre } = courant;
  const filtres = [
    ['tout', 'Tout'], ['compte_rendu', '📋 Comptes rendus'], ['rapport_irs', '🔬 Rapports IRS'],
    ['note', '💬 Messages'], ['evenement', '🧭 Historique'],
  ];
  const liste = filtre === 'tout' ? entrees : entrees.filter(e => e.type === filtre);
  return `
    <div class="pile">
      <div class="journal-filtres">${filtres.map(([v, l]) => {
        const n = v === 'tout' ? entrees.length : entrees.filter(e => e.type === v).length;
        return `<button type="button" class="puce" data-action="filtre-journal" data-filtre="${v}" aria-pressed="${filtre === v}">${l} <span class="aide">${n}</span></button>`;
      }).join('')}</div>
      ${liste.length ? `<div class="journal">${liste.map(htmlEntree).join('')}</div>` : `
        <div class="vide"><span class="grande-icone" aria-hidden="true">📭</span><strong>Rien pour l’instant</strong>
          <p>Les comptes rendus, rapports de l’IRS et messages du dossier apparaîtront ici.</p></div>`}
    </div>`;
}

function texteEvenement(c) {
  switch (c.champ) {
    case 'ouverture': return '📂 Dossier ouvert';
    case 'statut': return `${statut(c.de).emoji} → ${statut(c.vers).emoji} Statut : <strong>${esc(statut(c.vers).label)}</strong>${c.vers === 'cloture' && c.motif ? ` · ${esc(c.motif)}` : ''}`;
    case 'medecin': return c.vers ? `🩺 Médecin référent : <strong>${esc(etat.membre(c.vers)?.nom_rp || 'un membre')}</strong>` : '🩺 Dossier désattribué';
    case 'etape': return `🧭 Parcours : étape ${esc(c.vers)} · <strong>${esc(etapesDu(c.parcours)[c.vers - 1]?.titre || '')}</strong>`;
    case 'consentement': return c.vers ? '🔬 Accord du patient pour l’IRS enregistré' : '🔒 Accord pour l’IRS retiré';
    case 'joueur': return c.vers ? `🎭 Dossier relié au compte de <strong>${esc(etat.membre(c.vers)?.nom_rp || 'un joueur')}</strong>` : '🎭 Compte joueur détaché';
    default: return 'Modification du dossier';
  }
}

function htmlEntree(e, i) {
  const auteur = etat.membre(e.auteur_id);
  const c = e.contenu || {};

  if (e.type === 'evenement') {
    return `<article class="entree evenement" style="--i:${i}"><div class="evenement-ligne">${texteEvenement(c)}
      <span class="quand-evt">· ${auteur ? `${esc(auteur.nom_rp)} · ` : ''}${dateHeure(e.created_at)}</span></div></article>`;
  }

  const actions = `<div class="entree-actions">
    ${peut.modifierEntree(e) ? `
      <button type="button" class="btn btn-fantome btn-petit btn-icone" data-action="modifier-entree" data-id="${e.id}" title="Modifier" aria-label="Modifier">${icone('crayon')}</button>
      <button type="button" class="btn btn-fantome btn-petit btn-icone" data-action="supprimer-entree" data-id="${e.id}" title="Supprimer" aria-label="Supprimer">${icone('poubelle')}</button>` : ''}
  </div>`;
  const modifie = e.updated_at && versDate(e.updated_at) - versDate(e.created_at) > 60000 ? ' · modifié' : '';
  const dl = champs => `<dl class="entree-champs">${champs
    .filter(([, v]) => v && String(v).trim())
    .map(([l, v, cl]) => `<div class="${cl || ''}"><dt>${l}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;

  if (e.type === 'compte_rendu') {
    const lien = urlSure(c.lien_rp);
    return `
      <article class="entree" style="--c:#34d399;--i:${i}"><div class="entree-carte">
        <div class="entree-tete"><div>
          <div class="entree-titre">📋 Compte rendu — Rendez-vous n°${esc(c.numero)}</div>
          <div class="entree-sous">${esc(c.type_rdv || 'Rendez-vous')} · ${dateLongue(c.date)} · ${esc(c.medecin || auteur?.nom_rp || '')}${modifie}
            ${lien ? ` · <a href="${esc(lien)}" target="_blank" rel="noopener noreferrer">Voir la scène RP</a>` : ''}</div>
        </div>${actions}</div>
        ${dl([
          ['Résumé', c.resume, 'large'],
          ['Observations et résultats', c.observations],
          ['Traitement ou programme en cours', c.traitement],
          ['Décision et suite du suivi', c.decision, 'large'],
          ['Prochain rendez-vous', c.prochain_rdv || c.prochain_precision ? texteProchainRdv(c) : ''],
        ])}
      </div></article>`;
  }

  if (e.type === 'rapport_irs') {
    return `
      <article class="entree" style="--c:#a78bfa;--i:${i}"><div class="entree-carte">
        <div class="entree-tete"><div>
          <div class="entree-titre">🔬 Rapport d’analyse — IRS</div>
          <div class="entree-sous">${esc(c.chercheurs || auteur?.nom_rp || '')} · ${dateLongue(e.created_at)}${modifie}</div>
        </div>${actions}</div>
        ${dl([
          ['Prélèvements analysés', c.prelevements, 'large'],
          ['Parties de l’organisme touchées', c.parties],
          ['Effets de la pathologie', c.effets],
          ['Évolution potentielle', c.evolution],
          ['Risques à court et long terme', c.risques],
          ['Anomalies relevées', c.anomalies],
          ['Pistes de traitement', c.pistes, 'large'],
        ])}
      </div></article>`;
  }

  const duJoueur = auteur?.role === 'patient';
  return `
    <article class="entree note ${duJoueur ? 'du-joueur' : ''}" style="--c:${duJoueur ? '#f9a8d4' : '#94a3b8'};--i:${i}"><div class="entree-carte">
      <div class="entree-tete">
        <div class="entree-sous">${avatar(auteur, 'petit')} <strong style="color:var(--texte)">${esc(auteur?.nom_rp || 'Membre')}</strong>
          ${auteur ? badgeRole(auteur.role) : ''} · ${dateHeure(e.created_at)}${modifie}</div>
        ${actions}
      </div>
      <p class="note-texte">${esc(c.texte)}</p>
    </div></article>`;
}

/* ---------------- Fiche patient ---------------- */

function htmlFiche(d) {
  const createur = etat.membre(d.cree_par);
  const joueur = etat.membre(d.patient_id);
  const sections = [
    ['Identité', [['Nom', d.nom], ['Prénom', d.prenom], ['Âge', d.age], ['Grade', d.grade], ['Village / Clan', d.village]]],
    ['Pathologie', [
      ['Catégorie de suivi', (d.categories || []).map(c => `${categorie(c).emoji} ${categorie(c).label}`).join(', ')],
      ['Pathologie', d.pathologie], ['Origine', d.origine], ['Apparition', d.apparition],
      ['Symptômes / séquelles', d.symptomes], ['Antécédents familiaux', d.antecedents],
      ['Traitements déjà essayés', d.traitements_essayes], ['Suivi à réaliser pour la pathologie', d.suivi_a_realiser],
    ]],
    ['HRP', [
      ['Joueur', d.joueur], ['Ce que je souhaite développer en RP', d.souhaits_rp],
      ['Limites / éléments à éviter', d.limites], ['Disponibilités', d.disponibilites],
    ]],
    ['Suivi', [
      ['Plan de suivi en cours', d.plan_suivi],
      ['Parcours', (PARCOURS[d.parcours] || PARCOURS.maladie).label],
      ['Compte joueur relié', joueur ? `${joueur.nom_rp}${joueur.pseudo ? ` (${joueur.pseudo})` : ''}` : ''],
      ['Dossier ouvert', `${dateLongue(d.created_at)}${createur ? ` par ${createur.nom_rp}` : ''}`],
    ]],
  ];
  return `
    <div class="pile">
      ${peut.modifierDossier(d) ? `<div class="actions-page"><a class="btn" href="#/dossier/${d.id}/modifier">${icone('crayon')} Modifier</a></div>` : ''}
      <div class="fiche">${sections.map(([titre, lignes]) => `
        <section class="panneau fiche-section"><h3>${titre}</h3><dl>${lignes.map(([l, v]) => {
          const vide = !v || (typeof v === 'string' && !v.trim());
          return `<div><dt>${l}</dt><dd class="${vide ? 'vide-champ' : ''}">${vide ? 'Non renseigné' : esc(v)}</dd></div>`;
        }).join('')}</dl></section>`).join('')}
      </div>
    </div>`;
}

/* ---------------- Traitements ---------------- */

function htmlTraitements() {
  const { d, traitements } = courant;
  return `
    <div class="pile">
      <div class="panneau-titre" style="margin:0">
        <p class="aide">Historique des traitements et programmes essayés, qu’ils aient fonctionné ou non. Un seul nouveau traitement est testé à la fois.</p>
        ${peut.traitements(d) ? `<button type="button" class="btn btn-primaire btn-petit" data-action="ajouter-traitement">${icone('plus')} Ajouter</button>` : ''}
      </div>
      ${traitements.length ? `<div class="traitements">${traitements.map(t => {
        const type = TYPES_TRAITEMENT[t.type] || TYPES_TRAITEMENT.autre;
        const et = ETATS_TRAITEMENT[t.etat] || ETATS_TRAITEMENT.essai;
        const res = RESULTATS_TRAITEMENT[t.resultat] || RESULTATS_TRAITEMENT.a_evaluer;
        const jours = joursDepuis(t.debut);
        const periode = t.fin ? `du ${dateCourte(t.debut)} au ${dateCourte(t.fin)}`
          : jours <= 0 ? `commencé ${jours < 0 ? `le ${dateCourte(t.debut)}` : 'aujourd’hui'}`
          : `depuis le ${dateCourte(t.debut)} (${pluriel(jours, 'jour')})`;
        return `
          <article class="traitement" style="--c:${et.couleur}">
            <span class="traitement-icone" aria-hidden="true">${type.emoji}</span>
            <div style="min-width:0">
              <h4>${esc(t.nom)}</h4>
              <p class="periode">${type.label} · ${periode}</p>
              <div class="tags"><span class="pill" style="--c:${et.couleur}">${et.label}</span><span class="tag">${res.emoji} ${res.label}</span></div>
              ${t.observations ? `<p class="observations">${esc(t.observations)}</p>` : ''}
              ${t.etat === 'essai' && jours >= DELAIS.essai ? `<p class="aide" style="margin-top:8px">⏳ Plus de ${DELAIS.essai} jours d’essai : analyse de contrôle à prévoir.</p>` : ''}
            </div>
            ${peut.traitements(d) ? `<div class="entree-actions">
              <button type="button" class="btn btn-fantome btn-petit btn-icone" data-action="modifier-traitement" data-id="${t.id}" title="Modifier" aria-label="Modifier">${icone('crayon')}</button>
              <button type="button" class="btn btn-fantome btn-petit btn-icone" data-action="supprimer-traitement" data-id="${t.id}" title="Supprimer" aria-label="Supprimer">${icone('poubelle')}</button>
            </div>` : ''}
          </article>`;
      }).join('')}</div>` : `
        <div class="vide"><span class="grande-icone" aria-hidden="true">💊</span><strong>Aucun traitement enregistré</strong>
          <p>Ajoute chaque traitement ou programme essayé pour garder la trace de ce qui a fonctionné.</p></div>`}
    </div>`;
}

/* =====================================================================
   Actions
   ===================================================================== */

async function surClic(e) {
  const bouton = e.target.closest('[data-action]');
  if (!bouton) return;
  const action = bouton.dataset.action;
  const id = bouton.dataset.id;
  const actions = {
    onglet: () => { courant.onglet = bouton.dataset.onglet; majOnglet(); },
    'filtre-journal': () => { courant.filtre = bouton.dataset.filtre; majOnglet(); },
    statut: changerStatut,
    pause: mettreEnPause,
    rouvrir,
    etape: () => changerEtape(Number(bouton.dataset.etape)),
    prendre: prendreEnCharge,
    attribuer,
    rdv: planifierRdv,
    consentement: modifierAccord,
    'compte-rendu': () => composerCompteRendu(),
    rapport: () => composerRapport(),
    message: () => composerMessage(),
    supprimer: supprimerDossier,
    'modifier-entree': () => modifierEntree(id),
    'supprimer-entree': () => supprimerEntree(id),
    'ajouter-traitement': () => composerTraitement(),
    'modifier-traitement': () => composerTraitement(courant.traitements.find(t => t.id === id)),
    'supprimer-traitement': () => supprimerTraitement(id),
  };
  try {
    await actions[action]?.();
  } catch (err) {
    toast(err.message || String(err), 'erreur');
  }
}

// Recharge depuis la base puis redessine sans animation.
async function recharger({ dossier = true, entrees = true, traitements = false } = {}) {
  const id = courant.d.id;
  const [d, en, tr] = await Promise.all([
    dossier ? api.dossier(id) : null,
    entrees ? api.entrees(id) : null,
    traitements ? api.traitements(id) : null,
  ]);
  if (courant?.d?.id !== id) return;
  if (d) { courant.d = d; etat.garderDossier(d); }
  if (en) courant.entrees = en;
  if (tr) courant.traitements = tr;
  if (courant.vue.isConnected && location.hash.startsWith(`#/dossier/${id}`)) dessiner({ animer: false });
  document.dispatchEvent(new CustomEvent('seimei:maj'));
}

async function appliquerDossier(maj, message) {
  courant.d = maj;
  etat.garderDossier(maj);
  await recharger({ dossier: false, entrees: true });
  if (message) toast(message, 'succes');
}

const nomStatut = d => `${statut(d.statut).emoji} ${statut(d.statut).label}`;

/* ---------------- Statut, parcours, attribution ---------------- */

async function changerStatut() {
  const { d } = courant;
  const options = STATUTS.filter(s => s.id !== 'cloture' || peut.cloturer());
  const corps = `
    <div class="choix-statuts" role="radiogroup" aria-label="Statut du dossier">
      ${options.map(s => `
        <label class="choix-statut" style="--c:${s.couleur}">
          <input type="radio" name="statut" value="${s.id}" ${s.id === d.statut ? 'checked' : ''}>
          <span class="emoji" aria-hidden="true">${s.emoji}</span>
          <span><strong>${esc(s.label)}</strong><small>${esc(s.description)}</small></span>
        </label>`).join('')}
    </div>
    <div data-bloc="irs" hidden>
      <label class="interrupteur"><input type="checkbox" name="accord">
        <span><strong>Le patient a donné son accord</strong>
        <span class="aide">Aucun prélèvement n’est transmis à l’IRS sans l’accord du patient. Les référents IRS pourront consulter ce dossier.</span></span></label>
    </div>
    <div data-bloc="cloture" hidden>
      ${champ('Motif de clôture', `<select name="motif">${MOTIFS_CLOTURE.map(m => `<option>${esc(m)}</option>`).join('')}</select>`, '', 'Le dossier sera archivé ; il pourra être rouvert si la situation l’exige.')}
    </div>`;

  const maj = await fenetre({
    titre: 'Changer le statut',
    sousTitre: esc(nomComplet(d)),
    corps,
    large: true,
    texteValider: 'Appliquer',
    apresOuverture: dlg => {
      const actualiser = () => {
        const v = dlg.querySelector('[name=statut]:checked')?.value;
        dlg.querySelector('[data-bloc="irs"]').hidden = v !== 'analyse_irs' || d.consentement_irs;
        dlg.querySelector('[data-bloc="cloture"]').hidden = v !== 'cloture';
      };
      dlg.addEventListener('change', actualiser);
      actualiser();
      dlg.querySelector('[name=statut]:checked')?.focus();
    },
    valider: async (_form, x) => {
      if (!x.statut || x.statut === d.statut) return true;
      const champs = { statut: x.statut };
      if (x.statut === 'analyse_irs' && !d.consentement_irs) {
        if (!x.accord) { toast('Coche l’accord du patient pour transmettre son dossier à l’IRS.', 'erreur'); return false; }
        champs.consentement_irs = true;
      }
      if (x.statut === 'cloture') Object.assign(champs, { motif_cloture: x.motif, prochain_rdv: null });
      return api.majDossier(d.id, champs);
    },
  });
  if (maj && maj !== true) await appliquerDossier(maj, `Statut mis à jour : ${nomStatut(maj)}`);
}

async function mettreEnPause() {
  const ok = await confirmer({
    titre: 'Mettre le dossier en pause ?',
    message: 'Le dossier passera « En pause ». Il pourra être repris à tout moment.',
    texteValider: 'Mettre en pause',
  });
  if (!ok) return;
  await appliquerDossier(await api.majDossier(courant.d.id, { statut: 'pause' }), 'Dossier mis en pause');
}

async function rouvrir() {
  const { d } = courant;
  const maj = await fenetre({
    titre: 'Rouvrir le dossier',
    sousTitre: esc(nomComplet(d)),
    corps: champ('Nouveau statut', `<select name="statut">${STATUTS.filter(s => s.id !== 'cloture')
      .map(s => `<option value="${s.id}" ${s.id === 'examens' ? 'selected' : ''}>${s.emoji} ${esc(s.label)}</option>`).join('')}</select>`,
      '', 'Le dossier quittera les archives et reviendra dans la liste des dossiers actifs.'),
    texteValider: 'Rouvrir',
    valider: (_f, x) => api.majDossier(d.id, { statut: x.statut, motif_cloture: '' }),
  });
  if (maj) await appliquerDossier(maj, `Dossier rouvert : ${nomStatut(maj)}`);
}

async function changerEtape(num) {
  const { d } = courant;
  const etape = etapesDu(d.parcours)[num - 1];
  if (!etape) return;
  const propose = etape.statut && etape.statut !== d.statut ? etape.statut : null;
  const accordRequis = propose === 'analyse_irs' && !d.consentement_irs;

  const maj = await fenetre({
    titre: `Étape ${num} · ${etape.titre}`,
    sousTitre: esc(nomComplet(d)),
    corps: `
      <p style="color:var(--texte-2)">${esc(etape.resume)}</p>
      ${propose ? `<label class="case"><input type="checkbox" name="statut" value="${propose}" checked>
        Passer aussi le statut à ${statut(propose).emoji} ${esc(statut(propose).label)}</label>` : ''}
      ${accordRequis ? `<label class="interrupteur"><input type="checkbox" name="accord">
        <span><strong>Le patient a donné son accord pour l’IRS</strong>
        <span class="aide">Nécessaire pour transmettre ses prélèvements et lui donner accès au dossier.</span></span></label>` : ''}`,
    texteValider: num > d.etape ? 'Avancer le parcours' : 'Revenir à cette étape',
    valider: (_f, x) => {
      const champs = { etape: num };
      if (x.accord) champs.consentement_irs = true;
      if (x.statut) {
        if (x.statut === 'analyse_irs' && !d.consentement_irs && !x.accord) {
          toast('Coche l’accord du patient, ou décoche le changement de statut.', 'erreur');
          return false;
        }
        champs.statut = x.statut;
      }
      return api.majDossier(d.id, champs);
    },
  });
  if (maj) await appliquerDossier(maj, maj.statut !== d.statut ? `Parcours mis à jour · ${nomStatut(maj)}` : 'Parcours mis à jour');
}

async function prendreEnCharge() {
  const { d } = courant;
  const ok = await confirmer({
    titre: 'Prendre en charge ce patient ?',
    message: `Tu deviendras le médecin référent de ${esc(nomComplet(d))}, du premier rendez-vous jusqu’à la fin de sa prise en charge.`,
    texteValider: 'Devenir médecin référent',
  });
  if (!ok) return;
  const maj = await api.majDossier(d.id, { medecin_id: etat.moi.id });
  await appliquerDossier(maj, 'Tu es le médecin référent : présente-toi dans le post du patient puis organise le premier rendez-vous.');
}

async function attribuer() {
  const { d } = courant;
  const maj = await fenetre({
    titre: 'Médecin référent',
    sousTitre: esc(nomComplet(d)),
    corps: champ('Attribuer le dossier à', `<select name="medecin">
        <option value="">Non attribué</option>
        ${etat.medecins().map(m => `<option value="${m.id}" ${m.id === d.medecin_id ? 'selected' : ''}>${esc(m.nom_rp)} · ${esc(role(m.role).court)}</option>`).join('')}
      </select>`, '', 'Le médecin référent est l’interlocuteur principal du patient et tient son dossier à jour.'),
    texteValider: 'Attribuer',
    valider: (_f, x) => ((x.medecin || null) === d.medecin_id ? true : api.majDossier(d.id, { medecin_id: x.medecin || null })),
  });
  if (maj && maj !== true) await appliquerDossier(maj, 'Médecin référent mis à jour');
}

async function planifierRdv() {
  const { d } = courant;
  const maj = await fenetre({
    titre: 'Prochain rendez-vous',
    sousTitre: esc(nomComplet(d)),
    corps: champ('Date (IRL)', `<input type="date" name="date" value="${esc(d.prochain_rdv || '')}">`, '',
      'Laisse vide s’il n’y a pas de rendez-vous prévu. Cette date alimente le tableau de bord.'),
    texteValider: 'Enregistrer',
    valider: (_f, x) => api.majDossier(d.id, { prochain_rdv: x.date || null }),
  });
  if (maj) await appliquerDossier(maj, 'Prochain rendez-vous enregistré');
}

async function modifierAccord() {
  const { d } = courant;
  const donner = !d.consentement_irs;
  const ok = await confirmer({
    titre: donner ? 'Enregistrer l’accord du patient' : 'Retirer l’accord du patient',
    message: donner
      ? 'Le patient accepte que ses prélèvements et ses résultats soient transmis à l’IRS. Les référents IRS pourront consulter ce dossier.'
      : 'Les référents IRS n’auront plus accès à ce dossier.',
    texteValider: donner ? 'Le patient est d’accord' : 'Retirer l’accord',
    danger: !donner,
  });
  if (!ok) return;
  await appliquerDossier(await api.majDossier(d.id, { consentement_irs: donner }), donner ? 'Accord pour l’IRS enregistré' : 'Accord pour l’IRS retiré');
}

async function supprimerDossier() {
  const { d } = courant;
  const ok = await fenetre({
    titre: 'Supprimer définitivement ?',
    sousTitre: esc(nomComplet(d)),
    corps: `<p style="color:var(--texte-2)">Le dossier, son journal et ses traitements seront effacés. Pour simplement archiver un dossier terminé, utilise plutôt le statut « Dossier clôturé ».</p>
      ${champ(`Pour confirmer, tape le nom du patient : <strong>${esc(d.nom)}</strong>`, '<input name="confirmation" autocomplete="off">')}`,
    texteValider: 'Supprimer définitivement',
    danger: true,
    valider: async (_f, x) => {
      if (x.confirmation.trim().toLowerCase() !== d.nom.trim().toLowerCase()) {
        toast('Le nom saisi ne correspond pas.', 'erreur');
        return false;
      }
      await api.supprimerDossier(d.id);
      return true;
    },
  });
  if (!ok) return;
  etat.oublierDossier(d.id);
  document.dispatchEvent(new CustomEvent('seimei:maj'));
  location.hash = '#/dossiers';
  toast('Dossier supprimé', 'succes');
}

/* ---------------- Journal : comptes rendus, rapports, notes ---------------- */

async function composerCompteRendu(entree = null) {
  const { d, entrees, traitements } = courant;
  const c = entree?.contenu || {};
  const nbCr = entrees.filter(e => e.type === 'compte_rendu').length;
  const numero = c.numero || 1 + Math.max(0, ...entrees.filter(e => e.type === 'compte_rendu').map(e => Number(e.contenu?.numero) || 0));
  const enCours = traitements.filter(t => t.etat !== 'arrete')
    .map(t => `${t.nom} (${(ETATS_TRAITEMENT[t.etat]?.label || '').toLowerCase()})`).join(', ');
  const typeDefaut = c.type_rdv || (nbCr === 0 ? 'Premier rendez-vous' : d.statut === 'urgent' ? 'Urgence' : 'Contrôle');
  const avecStatut = !entree && peut.changerStatut(d);

  const corps = `
    <div class="grille-champs">
      ${champ('Date du rendez-vous', `<input type="date" name="date" required value="${esc(c.date || aujourdhui())}">`)}
      ${champ('Type de rendez-vous', `<select name="type_rdv">${TYPES_RDV.map(t => `<option ${t === typeDefaut ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`)}
      ${champ('Médecin', `<input name="medecin" required maxlength="120" value="${esc(c.medecin || etat.moi.nom_rp)}">`)}
      ${champ('Lien de la scène RP (facultatif)', `<input type="url" name="lien_rp" placeholder="https://…" value="${esc(c.lien_rp || '')}">`)}
      ${champ('Résumé', zone('resume', c.resume, 3, 'required placeholder="Ce qui s’est passé pendant le rendez-vous"'), 'large')}
      ${champ('Observations et résultats', zone('observations', c.observations, 3), 'large')}
      ${champ('Traitement ou programme en cours', zone('traitement', c.traitement ?? enCours, 2), 'large')}
      ${champ('Décision et suite du suivi', zone('decision', c.decision, 3), 'large')}
      ${champ('Prochain rendez-vous (IRL)', `<input type="date" name="prochain_rdv" value="${esc(c.prochain_rdv || '')}">`)}
      ${champ('Précision', `<input name="prochain_precision" maxlength="160" placeholder="ex. après deux semaines d’essai" value="${esc(c.prochain_precision || '')}">`)}
      ${avecStatut ? champ('Statut du dossier après ce rendez-vous', `<select name="nouveau_statut">
          <option value="">Ne pas changer (${statut(d.statut).emoji} ${esc(statut(d.statut).label)})</option>
          ${STATUTS.filter(s => !['cloture', d.statut].includes(s.id)).map(s => `<option value="${s.id}">${s.emoji} ${esc(s.label)}</option>`).join('')}
        </select>`, 'large') : ''}
    </div>`;

  const r = await fenetre({
    titre: entree ? `Modifier le compte rendu n°${numero}` : `Compte rendu n°${numero}`,
    sousTitre: esc(nomComplet(d)),
    corps,
    large: true,
    texteValider: entree ? 'Enregistrer' : 'Publier le compte rendu',
    valider: async (_f, x) => {
      const contenu = {
        numero,
        date: x.date,
        type_rdv: x.type_rdv,
        medecin: x.medecin.trim(),
        lien_rp: x.lien_rp.trim(),
        resume: x.resume.trim(),
        observations: x.observations.trim(),
        traitement: x.traitement.trim(),
        decision: x.decision.trim(),
        prochain_rdv: x.prochain_rdv || null,
        prochain_precision: x.prochain_precision.trim(),
      };
      if (contenu.lien_rp && !urlSure(contenu.lien_rp)) {
        toast('Le lien de la scène RP doit commencer par https://', 'erreur');
        return false;
      }
      const enregistree = entree
        ? await api.majEntree(entree.id, contenu)
        : await api.creerEntree({ dossier_id: d.id, type: 'compte_rendu', contenu });

      // Le dossier suit : prochain rendez-vous et, si demandé, nouveau statut.
      const champs = {};
      if (peut.modifierDossier(d)) {
        if (!entree || (x.prochain_rdv || null) !== (c.prochain_rdv || null)) champs.prochain_rdv = x.prochain_rdv || null;
        if (x.nouveau_statut) champs.statut = x.nouveau_statut;
      }
      let dossier = null;
      if (Object.keys(champs).length) {
        try {
          dossier = await api.majDossier(d.id, champs);
        } catch (err) {
          toast(`Compte rendu enregistré, mais le dossier n’a pas pu être mis à jour : ${err.message}`, 'erreur');
        }
      }
      return { enregistree, dossier };
    },
  });
  if (!r) return;
  if (r.dossier) { courant.d = r.dossier; etat.garderDossier(r.dossier); }
  courant.onglet = 'journal';
  await recharger({ dossier: !r.dossier, entrees: true });
  toast(entree ? 'Compte rendu modifié' : 'Compte rendu publié dans le journal', 'succes');
}

async function composerRapport(entree = null) {
  const { d } = courant;
  const c = entree?.contenu || {};
  const champs = [
    ['prelevements', 'Prélèvements analysés'], ['parties', 'Parties de l’organisme touchées'],
    ['effets', 'Effets de la pathologie'], ['evolution', 'Évolution potentielle'],
    ['risques', 'Risques à court et long terme'], ['anomalies', 'Anomalies relevées'],
    ['pistes', 'Pistes de traitement'],
  ];
  const r = await fenetre({
    titre: entree ? 'Modifier le rapport IRS' : 'Rapport d’analyse — IRS',
    sousTitre: esc(nomComplet(d)),
    large: true,
    corps: `
      <div class="grille-champs">
        ${champ('Chercheur(s)', `<input name="chercheurs" required maxlength="160" value="${esc(c.chercheurs || etat.moi.nom_rp)}">`, 'large')}
        ${champs.map(([nom, label]) => champ(label, zone(nom, c[nom], nom === 'prelevements' || nom === 'pistes' ? 3 : 2), 'large')).join('')}
      </div>
      ${entree ? '' : '<p class="aide">Une fois le rapport publié, le médecin référent organise la présentation des résultats au patient.</p>'}`,
    texteValider: entree ? 'Enregistrer' : 'Publier le rapport',
    valider: async (_f, x) => {
      const contenu = Object.fromEntries(['chercheurs', ...champs.map(([n]) => n)].map(n => [n, (x[n] || '').trim()]));
      return entree ? api.majEntree(entree.id, contenu) : api.creerEntree({ dossier_id: d.id, type: 'rapport_irs', contenu });
    },
  });
  if (!r) return;
  courant.onglet = 'journal';
  await recharger({ entrees: true });
  toast(entree ? 'Rapport modifié' : 'Rapport publié dans le journal', 'succes');
}

async function composerMessage(entree = null) {
  const { d } = courant;
  const r = await fenetre({
    titre: entree ? 'Modifier le message' : 'Nouveau message',
    sousTitre: etat.estJoueur ? 'Visible par toi et l’équipe qui suit ton dossier.' : `${esc(nomComplet(d))} · visible par le joueur et l’équipe.`,
    corps: champ('Message', zone('texte', entree?.contenu?.texte || '', 5, `required maxlength="4000" placeholder="${etat.estJoueur
      ? 'Une question, une précision sur ta pathologie, tes disponibilités…'
      : 'Organisation HRP : disponibilités, rappel, précision…'}"`)),
    texteValider: entree ? 'Enregistrer' : 'Envoyer',
    valider: (_f, x) => (entree
      ? api.majEntree(entree.id, { texte: x.texte.trim() })
      : api.creerEntree({ dossier_id: d.id, type: 'note', contenu: { texte: x.texte.trim() } })),
  });
  if (!r) return;
  courant.onglet = 'journal';
  courant.filtre = 'tout';
  await recharger({ entrees: true });
  toast(entree ? 'Message modifié' : 'Message envoyé', 'succes');
}

function modifierEntree(id) {
  const e = courant.entrees.find(x => x.id === id);
  if (!e) return;
  if (e.type === 'compte_rendu') return composerCompteRendu(e);
  if (e.type === 'rapport_irs') return composerRapport(e);
  return composerMessage(e);
}

async function supprimerEntree(id) {
  const e = courant.entrees.find(x => x.id === id);
  if (!e) return;
  const nom = { compte_rendu: 'ce compte rendu', rapport_irs: 'ce rapport IRS', note: 'ce message' }[e.type];
  const ok = await confirmer({ titre: `Supprimer ${nom} ?`, message: 'Il disparaîtra du journal du dossier.', texteValider: 'Supprimer', danger: true });
  if (!ok) return;
  await api.supprimerEntree(id);
  await recharger({ entrees: true });
  toast('Supprimé du journal', 'succes');
}

/* ---------------- Traitements ---------------- */

async function composerTraitement(t = null) {
  const { d, traitements } = courant;
  const autreEssai = traitements.find(x => x.etat === 'essai' && x.id !== t?.id);
  const options = (liste, actuel) => Object.entries(liste)
    .map(([v, o]) => `<option value="${v}" ${v === actuel ? 'selected' : ''}>${o.emoji ? `${o.emoji} ` : ''}${esc(o.label)}</option>`).join('');

  const r = await fenetre({
    titre: t ? 'Modifier le traitement' : 'Nouveau traitement',
    sousTitre: esc(nomComplet(d)),
    large: true,
    corps: `
      ${autreEssai && !t ? `<div class="bandeau">⚠️ « ${esc(autreEssai.nom)} » est déjà en essai. Un seul nouveau traitement est testé à la fois, afin de savoir précisément ce qui agit.</div>` : ''}
      <div class="grille-champs">
        ${champ('Nom du traitement ou du programme', `<input name="nom" required maxlength="160" value="${esc(t?.nom || '')}" placeholder="ex. Séances de rééducation du bras gauche">`, 'large')}
        ${champ('Type', `<select name="type">${options(TYPES_TRAITEMENT, t?.type || (d.parcours === 'readaptation' ? 'reeducation' : 'traitement'))}</select>`)}
        ${champ('État', `<select name="etat">${options(ETATS_TRAITEMENT, t?.etat || 'essai')}</select>`)}
        ${champ('Début', `<input type="date" name="debut" required value="${esc(t?.debut || aujourdhui())}">`)}
        ${champ('Fin', `<input type="date" name="fin" value="${esc(t?.fin || '')}">`, '', 'Laisse vide s’il est toujours en cours.')}
        ${champ('Résultat', `<select name="resultat">${options(RESULTATS_TRAITEMENT, t?.resultat || 'a_evaluer')}</select>`, 'large')}
        ${champ('Observations', zone('observations', t?.observations || '', 3, 'placeholder="Effets observés, effets secondaires, réaction de l’organisme…"'), 'large')}
      </div>`,
    texteValider: t ? 'Enregistrer' : 'Ajouter',
    valider: (_f, x) => {
      if (x.fin && x.fin < x.debut) {
        toast('La date de fin doit être après la date de début.', 'erreur');
        return false;
      }
      const champs = {
        nom: x.nom.trim(),
        type: x.type,
        etat: x.etat,
        debut: x.debut,
        fin: x.fin || (x.etat === 'arrete' ? aujourdhui() : null),
        resultat: x.resultat,
        observations: x.observations.trim(),
      };
      return t ? api.majTraitement(t.id, champs) : api.creerTraitement({ dossier_id: d.id, ...champs });
    },
  });
  if (!r) return;
  courant.onglet = 'traitements';
  await recharger({ entrees: false, traitements: true });
  etat.essais = etat.essais.filter(e => e.id !== r.id);
  if (r.etat === 'essai') etat.essais.push({ id: r.id, dossier_id: r.dossier_id, nom: r.nom, debut: r.debut });
  toast(t ? 'Traitement mis à jour' : 'Traitement ajouté', 'succes');
}

async function supprimerTraitement(id) {
  const t = courant.traitements.find(x => x.id === id);
  if (!t) return;
  const ok = await confirmer({
    titre: 'Supprimer ce traitement ?',
    message: `« ${esc(t.nom)} » sera retiré de l’historique. Pour garder la trace d’un traitement inefficace, mets plutôt son état sur « Arrêté ».`,
    texteValider: 'Supprimer',
    danger: true,
  });
  if (!ok) return;
  await api.supprimerTraitement(id);
  etat.essais = etat.essais.filter(e => e.id !== id);
  await recharger({ entrees: false, traitements: true });
  toast('Traitement supprimé', 'succes');
}
