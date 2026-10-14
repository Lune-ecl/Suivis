// Équipe de la branche : demandes d'accès, rôles, codes, réattribution, profil, sauvegarde.

import { api, auth } from '../api.js';
import { etat, peut } from '../etat.js';
import { ROLES, ORDRE_ROLES, role } from '../constantes.js';
import { esc, icone, avatar, badgeRole, dateCourte, pluriel, toast, fenetre, confirmer, aujourdhui } from '../ui.js';

const ROLES_ATTRIBUABLES = ['medecin', 'soignant', 'irs', 'responsable'];

export function rendreEquipe(vue) {
  const gerer = peut.gererEquipe();
  const moi = etat.moi;
  const membres = [...etat.membres].sort((a, b) => a.nom_rp.localeCompare(b.nom_rp, 'fr'));
  const demandes = membres.filter(m => m.actif && m.role === 'en_attente');
  const actifs = membres.filter(m => m.actif && m.role !== 'en_attente');
  const inactifs = membres.filter(m => !m.actif);
  const charge = id => etat.dossiers.filter(d => d.medecin_id === id && d.statut !== 'cloture').length;

  const carte = (m, i, type = '') => {
    const n = charge(m.id);
    const estMoi = m.id === moi.id;
    return `
      <article class="carte-membre ${type}" style="--i:${i}">
        <div class="membre-tete">${avatar(m, 'grand')}
          <div><strong>${esc(m.nom_rp)}${estMoi ? ' <span class="aide">(toi)</span>' : ''}</strong>
            <small>${m.pseudo ? esc(m.pseudo) : 'Pseudo Discord non renseigné'}</small>
            ${badgeRole(m.role)}</div>
        </div>
        ${type === 'attente' ? `<p class="aide">Demande envoyée le ${dateCourte(m.created_at)}</p>`
          : ['medecin', 'responsable'].includes(m.role) ? `<div class="membre-chiffres"><span><strong>${n}</strong>${n > 1 ? 'patients suivis' : 'patient suivi'}</span></div>` : ''}
        ${gerer ? actionsMembre(m, type, n, estMoi) : ''}
      </article>`;
  };

  vue.innerHTML = `
    <div class="page">
      <header class="entete-page">
        <div>
          <p class="surtitre">Branche · Suivi des pathologies</p>
          <h1 class="titre-page">Équipe</h1>
          <p class="sous-titre">${pluriel(actifs.length, 'membre actif', 'membres actifs')}${gerer && demandes.length ? ` · ${pluriel(demandes.length, 'demande', 'demandes')} en attente` : ''}</p>
        </div>
        <div class="actions-page">
          <button type="button" class="btn" data-action="actualiser">${icone('actualiser')} Actualiser</button>
          <button type="button" class="btn" data-action="profil">${icone('utilisateur')} Mon profil</button>
          ${gerer ? `<button type="button" class="btn" data-action="exporter">${icone('telecharger')} Sauvegarder les données</button>` : ''}
        </div>
      </header>

      ${gerer && demandes.length ? `
        <section class="pile">
          <h2 class="titre-section">Demandes d’accès <span class="nombre">${demandes.length}</span></h2>
          <div class="grille-membres">${demandes.map((m, i) => carte(m, i, 'attente')).join('')}</div>
        </section>` : ''}

      ${ORDRE_ROLES.map(r => {
        const liste = actifs.filter(m => m.role === r);
        if (!liste.length) return '';
        return `
          <section class="pile">
            <h2 class="titre-section">${esc(liste.length > 1 || r === 'soignant' ? ROLES[r].groupe : ROLES[r].label)} <span class="nombre">${liste.length}</span></h2>
            <div class="grille-membres">${liste.map((m, i) => carte(m, i)).join('')}</div>
          </section>`;
      }).join('')}

      ${gerer && inactifs.length ? `
        <section class="pile">
          <h2 class="titre-section">Comptes désactivés <span class="nombre">${inactifs.length}</span></h2>
          <div class="grille-membres">${inactifs.map((m, i) => carte(m, i, 'inactif')).join('')}</div>
        </section>` : ''}

      <section class="panneau">
        <div class="panneau-titre"><h2>${icone('bouclier')} Comptes et accès</h2></div>
        <p class="aide">Le site est réservé à l’équipe de la branche et aux chercheurs de l’IRS : les joueurs n’y ont pas accès.
          Chacun crée son compte avec le <strong>prénom et le nom de son personnage</strong> et un <strong>code</strong>, puis
          ${gerer ? 'tu valides la demande ici en choisissant un rôle' : 'le responsable valide la demande'}.
          Les médecins, soignants et le responsable voient tous les dossiers ; les référents IRS ne voient que ceux dont le patient a donné son accord.
          ${gerer ? 'Si quelqu’un oublie son code, choisis-en un nouveau avec le bouton « Code ».' : 'Code oublié ? Le responsable peut t’en donner un nouveau.'}</p>
      </section>
    </div>`;

  vue.querySelector('.page').addEventListener('click', async e => {
    const bouton = e.target.closest('[data-action]');
    if (!bouton) return;
    const id = bouton.dataset.id;
    try {
      switch (bouton.dataset.action) {
        case 'actualiser':
          bouton.classList.add('charge');
          document.dispatchEvent(new CustomEvent('seimei:actualiser'));
          return;
        case 'profil': await ouvrirProfil({}); break;
        case 'exporter': await exporter(bouton); break;
        case 'valider': await changerRole(id, bouton.closest('.carte-membre').querySelector('select').value, true); break;
        case 'refuser': await supprimerCompte(id, true); break;
        case 'supprimer': await supprimerCompte(id, false); break;
        case 'desactiver': await changerAcces(id, false); break;
        case 'reactiver': await changerAcces(id, true); break;
        case 'reattribuer': await reattribuer(id); break;
        case 'code': await nouveauCode(id); break;
        default: return;
      }
      rendreEquipe(vue);
    } catch (err) {
      toast(err.message, 'erreur');
    }
  });
  vue.querySelector('.page').addEventListener('change', async e => {
    const select = e.target.closest('[data-changer-role]');
    if (!select) return;
    try {
      await changerRole(select.dataset.changerRole, select.value);
      rendreEquipe(vue);
    } catch (err) {
      toast(err.message, 'erreur');
      rendreEquipe(vue);
    }
  });
}

function actionsMembre(m, type, charge, estMoi) {
  if (type === 'attente') {
    return `<div class="membre-actions">
      <select aria-label="Rôle à donner">${ROLES_ATTRIBUABLES.map(r => `<option value="${r}">${esc(role(r).label)}</option>`).join('')}</select>
      <button type="button" class="btn btn-primaire btn-petit" data-action="valider" data-id="${m.id}">Valider</button>
      <button type="button" class="btn btn-petit btn-danger" data-action="refuser" data-id="${m.id}">Refuser</button>
    </div>`;
  }
  if (type === 'inactif') {
    return `<div class="membre-actions">
      <button type="button" class="btn btn-petit" data-action="reactiver" data-id="${m.id}">Réactiver</button>
      <button type="button" class="btn btn-petit btn-fantome" data-action="supprimer" data-id="${m.id}">Supprimer le compte</button>
    </div>`;
  }
  return `<div class="membre-actions">
    <select data-changer-role="${m.id}" aria-label="Rôle de ${esc(m.nom_rp)}">${ROLES_ATTRIBUABLES.map(r =>
      `<option value="${r}" ${r === m.role ? 'selected' : ''}>${esc(role(r).court)}</option>`).join('')}</select>
    ${charge ? `<button type="button" class="btn btn-petit" data-action="reattribuer" data-id="${m.id}" title="Confier ses dossiers à un autre médecin">Réattribuer</button>` : ''}
    <button type="button" class="btn btn-petit" data-action="code" data-id="${m.id}" title="Choisir un nouveau code de connexion">${icone('cle')} Code</button>
    ${estMoi ? '' : `<button type="button" class="btn btn-petit btn-fantome" data-action="desactiver" data-id="${m.id}">Désactiver</button>`}
  </div>`;
}

async function changerRole(id, nouveauRole, validation = false) {
  const m = etat.membre(id);
  if (!m || m.role === nouveauRole) return;
  if (m.id === etat.moi.id && nouveauRole !== 'responsable') {
    const ok = await confirmer({
      titre: 'Changer ton propre rôle ?',
      message: 'Tu ne pourras plus gérer l’équipe ni clôturer de dossiers.',
      texteValider: 'Changer mon rôle',
      danger: true,
    });
    if (!ok) return;
  }
  etat.garderMembre(await api.majMembre(id, { role: nouveauRole }));
  document.dispatchEvent(new CustomEvent('seimei:maj'));
  toast(validation ? `${m.nom_rp} a rejoint la branche (${role(nouveauRole).court})` : `${m.nom_rp} : ${role(nouveauRole).label}`, 'succes');
}

async function changerAcces(id, actif) {
  const m = etat.membre(id);
  if (!m) return;
  if (!actif) {
    const ok = await confirmer({
      titre: `Désactiver ${m.nom_rp} ?`,
      message: 'Ce membre n’aura plus accès aux dossiers. Ses dossiers restent attribués : pense à les réattribuer.',
      texteValider: 'Désactiver',
      danger: true,
    });
    if (!ok) return;
  }
  etat.garderMembre(await api.majMembre(id, { actif }));
  document.dispatchEvent(new CustomEvent('seimei:maj'));
  toast(actif ? `${m.nom_rp} est réactivé` : `${m.nom_rp} n’a plus accès aux dossiers`, 'succes');
}

async function supprimerCompte(id, demande) {
  const m = etat.membre(id);
  if (!m) return;
  const ok = await confirmer({
    titre: demande ? 'Refuser la demande ?' : `Supprimer le compte de ${m.nom_rp} ?`,
    message: demande
      ? 'Le compte est supprimé et n’a aucun accès aux dossiers. Ce nom RP pourra de nouveau servir à créer un compte.'
      : 'Le compte est supprimé définitivement. Ses comptes rendus et ses notes restent dans les dossiers, sans nom d’auteur.',
    texteValider: demande ? 'Refuser' : 'Supprimer le compte',
    danger: true,
  });
  if (!ok) return;
  await api.supprimerCompte(id);
  etat.oublierMembre(id);
  document.dispatchEvent(new CustomEvent('seimei:maj'));
  toast(demande ? `Demande de ${m.nom_rp} refusée` : `Compte de ${m.nom_rp} supprimé`, 'succes');
}

async function nouveauCode(id) {
  const m = etat.membre(id);
  if (!m) return;
  const propose = Array.from(crypto.getRandomValues(new Uint32Array(2)), n => n.toString(36)).join('').slice(0, 8);
  const code = await fenetre({
    titre: 'Nouveau code de connexion',
    sousTitre: esc(m.nom_rp),
    corps: `<label class="champ"><span class="etiquette">Nouveau code</span>
        <input name="code" required minlength="6" maxlength="72" value="${propose}" autocomplete="off" spellcheck="false"></label>
      <p class="aide">Transmets-le à ${esc(m.nom_rp)} en message privé. Il pourra le changer ensuite depuis son profil.</p>`,
    texteValider: 'Enregistrer le code',
    valider: async (_f, x) => {
      await api.reinitialiserCode(id, x.code);
      return x.code;
    },
  });
  if (code) toast(`Nouveau code de ${m.nom_rp} enregistré`, 'succes');
}

async function reattribuer(id) {
  const m = etat.membre(id);
  const dossiers = etat.dossiers.filter(d => d.medecin_id === id && d.statut !== 'cloture');
  const autres = etat.medecins().filter(x => x.id !== id);
  if (!autres.length) return toast('Aucun autre médecin disponible pour reprendre ces dossiers.', 'erreur');
  const cible = await fenetre({
    titre: 'Réattribuer les dossiers',
    sousTitre: `${pluriel(dossiers.length, 'dossier actif', 'dossiers actifs')} de ${esc(m.nom_rp)}`,
    corps: `<label class="champ"><span class="etiquette">Nouveau médecin référent</span>
      <select name="cible">${autres.map(x => `<option value="${x.id}">${esc(x.nom_rp)}</option>`).join('')}</select></label>
      <p class="aide">Si un médecin référent devient inactif, le responsable confie ses dossiers à un autre médecin.</p>`,
    texteValider: 'Réattribuer',
    valider: (_f, x) => x.cible,
  });
  if (!cible) return;
  for (const d of dossiers) etat.garderDossier(await api.majDossier(d.id, { medecin_id: cible }));
  toast(`${pluriel(dossiers.length, 'dossier confié', 'dossiers confiés')} à ${etat.membre(cible)?.nom_rp}`, 'succes');
}

async function exporter(bouton) {
  bouton.classList.add('charge');
  try {
    const [membres, dossiers, entrees, traitements] = await Promise.all([
      api.membres(), api.dossiers(), api.toutesEntrees(), api.tousTraitements(),
    ]);
    const donnees = { exporte_le: new Date().toISOString(), membres, dossiers, entrees, traitements };
    const lien = document.createElement('a');
    lien.href = URL.createObjectURL(new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' }));
    lien.download = `seimei-sauvegarde-${aujourdhui()}.json`;
    lien.click();
    setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
    toast('Sauvegarde téléchargée. Garde-la en lieu sûr : elle contient des données confidentielles.', 'succes');
  } finally {
    bouton.classList.remove('charge');
  }
}

/* ---------------- Profil de la personne connectée ---------------- */

export async function ouvrirProfil({ deconnecter } = {}) {
  const moi = etat.moi;
  const r = await fenetre({
    titre: 'Mon profil',
    sousTitre: esc(role(moi.role).label),
    corps: `
      <div class="grille-champs">
        <label class="champ large"><span class="etiquette">Prénom Nom RP</span>
          <input value="${esc(moi.nom_rp)}" readonly aria-readonly="true" data-pas-de-focus>
          <span class="aide">Il te sert à te connecter : il ne peut pas être changé.</span></label>
        <label class="champ large"><span class="etiquette">Pseudo Discord</span>
          <input name="pseudo" maxlength="80" value="${esc(moi.pseudo)}" placeholder="ex. ren.hoki"></label>
        <label class="champ"><span class="etiquette">Nouveau code</span>
          <input type="password" name="code" minlength="6" autocomplete="new-password" placeholder="Laisse vide pour le garder"></label>
        <label class="champ"><span class="etiquette">Confirmation</span>
          <input type="password" name="confirmation" minlength="6" autocomplete="new-password"></label>
      </div>`,
    pied: deconnecter ? `<button type="button" class="btn btn-fantome gauche" data-deconnecter>${icone('sortie')} Se déconnecter</button>` : '',
    apresOuverture: (dlg, fermer) => {
      dlg.querySelector('[data-deconnecter]')?.addEventListener('click', () => { fermer(); deconnecter(); });
    },
    valider: async (_f, x) => {
      if (x.code && x.code !== x.confirmation) {
        toast('Les deux codes ne correspondent pas.', 'erreur');
        return false;
      }
      const pseudo = x.pseudo.trim();
      if (pseudo !== moi.pseudo) etat.garderMembre(await api.majMembre(moi.id, { pseudo }));
      if (x.code) await auth.changerCode(x.code);
      return true;
    },
  });
  if (r) {
    toast('Profil enregistré', 'succes');
    document.dispatchEvent(new CustomEvent('seimei:profil'));
  }
  return r;
}
