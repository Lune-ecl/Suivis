// Point d'entrée : session, structure de l'application et navigation.

import { estConfigure, auth, api } from './api.js';
import { etat } from './etat.js';
import { esc, icone, avatar, badgeRole, toast, activerInfobulles, activerLumiere } from './ui.js';
import { chargerVus } from './vus.js';
import * as ecrans from './vues/connexion.js';
import { rendreTableau } from './vues/tableau.js';
import { rendreDossiers } from './vues/dossiers.js';
import { rendreDossier } from './vues/dossier.js';
import { rendreFormulaire } from './vues/formulaire.js';
import { rendreEquipe, ouvrirProfil } from './vues/equipe.js';
import { rendreGuide } from './vues/guide.js';

const racine = document.getElementById('app');

let utilisateur = null; // id de la personne dont la session est ouverte
let dernierChargement = 0;

demarrer();

function demarrer() {
  activerInfobulles();
  activerLumiere();
  if (!estConfigure) return ecrans.ecranConfiguration(racine);
  auth.surChangement((evenement, session) => {
    // Différé : on ne rappelle jamais Supabase depuis l'intérieur de l'écouteur.
    setTimeout(() => surSession(evenement, session), 0);
  });
}

function surSession(evenement, session) {
  etat.session = session;
  if (!session) {
    utilisateur = null;
    etat.vider();
    return ecrans.ecranConnexion(racine);
  }
  if (session.user.id === utilisateur) return; // simple renouvellement de session
  utilisateur = session.user.id;
  ouvrirSession(session);
}

async function ouvrirSession(session) {
  ecrans.ecranChargement(racine, 'Ouverture des dossiers…');
  try {
    let moi = await api.moi(session.user.id);
    if (!moi) moi = await api.rejoindre(session.user.user_metadata?.nom_rp || '');
    if (session.user.id !== utilisateur) return;
    etat.moi = moi;
    if (!moi.actif || moi.role === 'en_attente') {
      return ecrans.ecranAttente(racine, moi, {
        desactive: !moi.actif,
        actualiser: () => ouvrirSession(etat.session),
        deconnecter,
      });
    }
    await etat.chargerTout();
    dernierChargement = Date.now();
    chargerVus();
    monterApplication();
  } catch (err) {
    // « Réessayer » recharge la page : on profite ainsi d'une mise à jour du site entre-temps.
    ecrans.ecranErreur(racine, err.message, { reessayer: () => location.reload(), deconnecter });
  }
}

async function deconnecter() {
  await auth.deconnexion();
  // Au cas où l'événement de déconnexion n'arriverait pas (réseau coupé).
  if (utilisateur) { utilisateur = null; etat.vider(); ecrans.ecranConnexion(racine); }
}

/* ---------------- Structure de l'application ---------------- */

function navigation() {
  return `
    <span class="nav-section">Suivi</span>
    <a href="#/" data-nav="tableau">${icone('tableau')}<span class="libelle-long">Tableau de bord</span><span class="libelle-court" aria-hidden="true">Accueil</span></a>
    <a href="#/dossiers" data-nav="dossiers">${icone('dossier')}<span>Dossiers</span><span class="compteur" data-compteur="urgents" hidden></span></a>
    <a href="#/archives" data-nav="archives">${icone('archive')}<span>Archives</span></a>
    <span class="nav-section">Branche</span>
    <a href="#/equipe" data-nav="equipe">${icone('equipe')}<span>Équipe</span><span class="compteur doux" data-compteur="demandes" hidden></span></a>
    <a href="#/guide" data-nav="guide">${icone('bouclier')}<span>Guide</span></a>`;
}

function monterApplication() {
  const { moi } = etat;
  racine.innerHTML = `
    <div class="app">
      <aside class="barre">
        <a class="marque" href="#/" aria-label="Seimei, accueil">
          <span class="sceau" aria-hidden="true"><span>生</span><span>命</span></span>
          <span><strong>Seimei</strong><small>Suivi des pathologies</small></span>
        </a>
        <nav class="nav" aria-label="Navigation principale">${navigation()}</nav>
        <div class="carte-utilisateur">
          <button type="button" class="bouton-profil" data-action="profil" title="Mon profil">
            ${avatar(moi)}
            <span class="qui"><strong>${esc(moi.nom_rp)}</strong>${badgeRole(moi.role)}</span>
          </button>
          <button type="button" class="btn btn-fantome btn-icone btn-petit" data-action="deconnexion" title="Se déconnecter" aria-label="Se déconnecter">${icone('sortie')}</button>
        </div>
      </aside>
      <div class="colonne-principale">
        <header class="entete-mobile">
          <a class="marque" href="#/"><span class="sceau" aria-hidden="true"><span>生</span><span>命</span></span><strong>Seimei</strong></a>
          <button type="button" class="bouton-profil" data-action="profil" style="flex:none" aria-label="Mon profil">${avatar(moi)}</button>
        </header>
        <main class="contenu" id="vue" tabindex="-1"></main>
      </div>
    </div>`;

  racine.querySelector('.app').addEventListener('click', e => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'profil') ouvrirProfil({ deconnecter });
    if (action === 'deconnexion') deconnecter();
  });
  router();
}

// Met à jour le nom et l'avatar après une modification du profil.
function rafraichirStructure() {
  const { moi } = etat;
  if (!moi) return;
  racine.querySelectorAll('.bouton-profil .avatar').forEach(a => { a.outerHTML = avatar(moi); });
  const qui = racine.querySelector('.carte-utilisateur .qui');
  if (qui) qui.innerHTML = `<strong>${esc(moi.nom_rp)}</strong>${badgeRole(moi.role)}`;
  majCompteurs();
}

function majCompteurs() {
  const compteurs = {
    urgents: etat.dossiers.filter(d => d.statut === 'urgent').length,
    demandes: etat.moi?.role === 'responsable' ? etat.membres.filter(m => m.actif && m.role === 'en_attente').length : 0,
  };
  for (const [nom, n] of Object.entries(compteurs)) {
    const el = racine.querySelector(`[data-compteur="${nom}"]`);
    if (el) { el.textContent = n; el.hidden = !n; }
  }
}
document.addEventListener('seimei:maj', majCompteurs);
document.addEventListener('seimei:profil', rafraichirStructure);

/* ---------------- Navigation ---------------- */

const ROUTES = [
  { motif: /^\/?$/, nav: 'tableau', liste: true, vue: v => rendreTableau(v) },
  { motif: /^\/dossiers$/, nav: 'dossiers', liste: true, vue: (v, _, q) => rendreDossiers(v, q) },
  { motif: /^\/dossiers\/nouveau$/, nav: 'dossiers', vue: v => rendreFormulaire(v, null) },
  { motif: /^\/dossier\/([0-9a-f-]{36})$/, nav: 'dossiers', vue: (v, [id]) => rendreDossier(v, id) },
  { motif: /^\/dossier\/([0-9a-f-]{36})\/modifier$/, nav: 'dossiers', vue: (v, [id]) => rendreFormulaire(v, id) },
  { motif: /^\/archives$/, nav: 'archives', liste: true, vue: (v, _, q) => rendreDossiers(v, q, { archives: true }) },
  { motif: /^\/equipe$/, nav: 'equipe', liste: true, toujoursFrais: true, vue: v => rendreEquipe(v) },
  { motif: /^\/guide$/, nav: 'guide', vue: v => rendreGuide(v) },
];

function lireAdresse() {
  const [chemin, requete = ''] = location.hash.replace(/^#/, '').split('?');
  const route = ROUTES.find(r => r.motif.test(chemin));
  return { route, params: (chemin.match(route?.motif) || []).slice(1), requete: new URLSearchParams(requete) };
}

async function router() {
  const vue = document.getElementById('vue');
  if (!vue || !etat.moi) return;
  const { route, params, requete } = lireAdresse();
  if (!route) { location.hash = '#/'; return; }

  const { nav } = route;
  racine.querySelectorAll('[data-nav]').forEach(a => {
    a.classList.toggle('actif', a.dataset.nav === nav);
    if (a.dataset.nav === nav) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0 });
  await afficher(route, vue, params, requete);
  majCompteurs();

  // Les listes s'affichent tout de suite, puis se mettent à jour en arrière-plan.
  if (route.liste && (route.toujoursFrais || Date.now() - dernierChargement > 8000)) await rafraichirEnFond();
}

async function rafraichirEnFond() {
  const adresse = location.hash; // lue après l'affichage (une vue peut nettoyer l'adresse)
  try {
    await etat.chargerTout();
    dernierChargement = Date.now();
    const { route, params, requete } = lireAdresse();
    const vue = document.getElementById('vue');
    if (vue && route?.liste && location.hash === adresse && !document.querySelector('dialog[open]')) {
      await afficher(route, vue, params, requete, { discret: true });
    }
    majCompteurs();
  } catch { /* on garde l'affichage précédent */ }
}

// Retour sur l'onglet après un moment : les listes et les compteurs se mettent à jour.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && etat.moi && document.getElementById('vue')
      && Date.now() - dernierChargement > 60000) rafraichirEnFond();
});

async function afficher(route, vue, params, requete, { discret = false } = {}) {
  try {
    await route.vue(vue, params, requete);
    if (discret) vue.querySelector('.page')?.style.setProperty('animation', 'none');
  } catch (err) {
    vue.innerHTML = `<div class="page"><div class="vide"><span class="grande-icone" aria-hidden="true">⚠️</span>
      <strong>Impossible d’afficher cette page</strong><p>${esc(err.message)}</p>
      <a class="btn" href="#/">Retour à l’accueil</a></div></div>`;
  }
}

window.addEventListener('hashchange', router);

// Rechargement complet demandé par une vue (bouton « Actualiser »).
document.addEventListener('seimei:actualiser', async () => {
  try {
    await etat.chargerTout();
    dernierChargement = Date.now();
    const vue = document.getElementById('vue');
    const { route, params, requete } = lireAdresse();
    if (vue && route) await afficher(route, vue, params, requete, { discret: true });
    majCompteurs();
    toast('Données à jour', 'succes');
  } catch (err) {
    toast(err.message, 'erreur');
  }
});
