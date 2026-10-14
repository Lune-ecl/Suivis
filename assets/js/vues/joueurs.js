// Annuaire des joueurs : lu sur le serveur Discord (pseudo = nom RP ; rôles =
// grade, section et clan), complété à la main (par exemple les Roran).

import { api } from '../api.js';
import { etat, peut } from '../etat.js';
import { CLANS, clan as infoClan } from '../constantes.js';
import { listeJoueurs, correspond, nomAffiche, infosPersonnage, nettoyerRole, couleurRole } from '../annuaire.js';
import { esc, icone, avatarJoueur, badgeClan, ilYa, pluriel, toast, fenetre, confirmer } from '../ui.js';

const PAR_PAGE = 120;
const filtres = { recherche: '', clan: '', partis: false, tout: false };

export function rendreJoueurs(vue) {
  if (!peut.voirAnnuaire()) {
    vue.innerHTML = `<div class="page"><div class="vide"><span class="grande-icone" aria-hidden="true">🔒</span>
      <strong>Accès impossible</strong><p>L’annuaire des joueurs est réservé à l’équipe de la branche.</p></div></div>`;
    return;
  }
  dessinerPage(vue);

  // L'annuaire se met à jour tout seul s'il date de plus d'une heure.
  etat.synchroniserSiBesoin()
    .then(fait => { if (fait && vue.isConnected && location.hash === '#/joueurs' && !document.querySelector('dialog[open]')) dessinerPage(vue); })
    .catch(() => { /* l'erreur s'affiche si on relance à la main */ });
}

function dessinerPage(vue) {
  const d = etat.discord;
  const relie = Boolean(d?.relie);
  const joueurs = listeJoueurs();
  const presents = joueurs.filter(j => j.i.present);
  const rolesAClasser = relie && peut.gererDiscord() && etat.discordRoles.length && !etat.discordRoles.some(r => r.usage);

  vue.innerHTML = `
    <div class="page">
      <header class="entete-page">
        <div>
          <p class="surtitre">${relie ? `${icone('discord')} ${esc(d.serveur_nom)}` : 'Annuaire'}</p>
          <h1 class="titre-page">Joueurs</h1>
          <p class="sous-titre">${pluriel(presents.length, 'joueur', 'joueurs')}${relie
            ? ` · ${d.derniere_synchro ? `mis à jour ${ilYa(d.derniere_synchro)}` : 'jamais mis à jour'}`
            : ''}</p>
        </div>
        <div class="actions-page">
          ${relie && peut.synchroniser() ? `<button type="button" class="btn" data-action="synchroniser">${icone('actualiser')} Mettre à jour</button>` : ''}
          ${relie && peut.gererDiscord() ? `<button type="button" class="btn" data-action="discord">${icone('discord')} Discord</button>` : ''}
          ${peut.completerAnnuaire() ? `<button type="button" class="btn btn-primaire" data-action="ajouter">${icone('plus')} Ajouter un joueur</button>` : ''}
        </div>
      </header>

      ${relie ? '' : encartDiscord()}
      ${rolesAClasser ? `<div class="bandeau">${icone('discord')} Indique quels rôles du serveur correspondent à un grade, une section ou un clan.
        <button type="button" class="btn btn-petit btn-primaire" data-action="discord">Classer les rôles</button></div>` : ''}

      <section class="filtres" aria-label="Filtres">
        <div class="filtres-ligne">
          <label class="champ-icone">${icone('recherche')}
            <input type="search" data-filtre="recherche" value="${esc(filtres.recherche)}" aria-label="Rechercher un joueur"
              placeholder="Rechercher un nom RP, un pseudo Discord, un grade…"></label>
          <label class="case"><input type="checkbox" data-filtre="partis" ${filtres.partis ? 'checked' : ''}> Joueurs partis du serveur</label>
        </div>
        <div class="filtres-groupe"><span class="etiquette">Clan</span>
          <div class="puces">
            <button type="button" class="puce" data-clan="" aria-pressed="${!filtres.clan}">Tous</button>
            ${CLANS.map(c => `<button type="button" class="puce" style="--c:${c.couleur}" data-clan="${c.id}" aria-pressed="${filtres.clan === c.id}">
              ${esc(c.label)} <span class="aide">${presents.filter(j => j.i.clan === c.id).length}</span></button>`).join('')}
          </div>
        </div>
      </section>

      <div class="resume-filtres"><span data-resume aria-live="polite"></span></div>
      <div data-resultats></div>
    </div>`;

  const page = vue.querySelector('.page');
  const dessiner = () => dessinerResultats(page, joueurs);
  page.addEventListener('input', e => {
    const champ = e.target.dataset.filtre;
    if (!champ) return;
    filtres[champ] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    filtres.tout = false;
    dessiner();
  });
  page.addEventListener('click', async e => {
    const puce = e.target.closest('[data-clan]');
    if (puce) {
      filtres.clan = puce.dataset.clan;
      filtres.tout = false;
      page.querySelectorAll('[data-clan]').forEach(b => b.setAttribute('aria-pressed', String(b === puce)));
      return dessiner();
    }
    const bouton = e.target.closest('[data-action]');
    if (!bouton) return;
    try {
      switch (bouton.dataset.action) {
        case 'synchroniser': await synchroniser(bouton); break;
        case 'discord': await reglagesDiscord(); break;
        case 'ajouter': await ficheJoueur(null); break;
        case 'modifier': await ficheJoueur(etat.personnage(bouton.dataset.id)); break;
        case 'plus': filtres.tout = true; return dessiner();
        default: return;
      }
      dessinerPage(vue);
    } catch (err) {
      toast(err.message, 'erreur');
    }
  });
  page.querySelector('[data-form="jeton"]')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;
    const bouton = form.querySelector('[type=submit]');
    bouton.classList.add('charge');
    try {
      if (await relier(form.jeton.value)) dessinerPage(vue);
    } catch (err) {
      toast(err.message, 'erreur');
    } finally {
      bouton.classList.remove('charge');
    }
  });
  dessiner();
}

function encartDiscord() {
  if (!peut.gererDiscord()) {
    return `<div class="bandeau">${icone('discord')} Le serveur Discord n’est pas encore relié : le responsable de la branche peut le faire depuis cette page.
      ${peut.completerAnnuaire() ? 'En attendant, tu peux ajouter des joueurs à la main.' : ''}</div>`;
  }
  return `
    <section class="panneau encart-discord">
      <div class="panneau-titre"><h2>${icone('discord')} Relier le serveur Discord</h2></div>
      <p class="texte-guide">Le site lit sur ton serveur le pseudo de chaque joueur (son nom RP) et ses rôles (grade, section, clan).
        Il lui faut un bot, à créer une seule fois :</p>
      <ol class="etapes-discord">
        <li>Sur <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer">discord.com/developers/applications</a>,
          clique sur <strong>New Application</strong> et donne-lui un nom (par exemple « Seimei »).</li>
        <li>Onglet <strong>Bot</strong> : active <strong>Server Members Intent</strong> et enregistre, puis clique sur <strong>Reset Token</strong> et copie le token.</li>
        <li>Onglet <strong>OAuth2</strong> → <strong>URL Generator</strong> : coche <strong>bot</strong>, ouvre le lien généré en bas de la page et ajoute le bot à ton serveur.</li>
        <li>Colle le token ici :</li>
      </ol>
      <form class="form-jeton" data-form="jeton" novalidate>
        <input type="password" name="jeton" required minlength="50" placeholder="Token du bot" autocomplete="off" spellcheck="false" aria-label="Token du bot Discord">
        <button type="submit" class="btn btn-primaire">${icone('discord')} Relier</button>
      </form>
      <p class="aide">${icone('cadenas')} Le token reste dans la base de données : il n’est jamais réaffiché, même pour toi.
        Le bot ne fait que lire la liste des membres et des rôles.</p>
    </section>`;
}

function dessinerResultats(page, joueurs) {
  const base = joueurs.filter(j => filtres.partis || j.i.present);
  const liste = base.filter(j => (!filtres.clan || j.i.clan === filtres.clan) && correspond(j, filtres.recherche));
  const filtre = filtres.recherche || filtres.clan;
  page.querySelector('[data-resume]').textContent = filtre
    ? `${pluriel(liste.length, 'joueur affiché', 'joueurs affichés')} sur ${base.length}`
    : pluriel(base.length, 'joueur', 'joueurs');

  const zone = page.querySelector('[data-resultats]');
  if (!liste.length) {
    zone.innerHTML = `<div class="vide"><span class="grande-icone" aria-hidden="true">${base.length ? '🔍' : '🎭'}</span>
      <strong>${base.length ? 'Aucun joueur ne correspond' : 'L’annuaire est vide'}</strong>
      <p>${base.length ? 'Essaie une autre recherche ou un autre clan.'
        : etat.discord?.relie ? 'Clique sur « Mettre à jour » pour lire les joueurs du serveur Discord.'
        : 'Relie le serveur Discord, ou ajoute des joueurs à la main.'}</p></div>`;
    return;
  }
  const visibles = filtres.tout ? liste : liste.slice(0, PAR_PAGE);
  zone.innerHTML = `<div class="grille-joueurs">${visibles.map(carteJoueur).join('')}</div>
    ${visibles.length < liste.length ? `<div class="actions-page centre"><button type="button" class="btn" data-action="plus">Afficher les ${liste.length - visibles.length} autres</button></div>` : ''}`;
}

function carteJoueur({ p, i }, n) {
  const dossiers = etat.dossiers.filter(d => d.personnage_id === p.id);
  const actif = dossiers.find(d => d.statut !== 'cloture');
  const c = infoClan(i.clan);
  return `
    <article class="carte-joueur ${i.present ? '' : 'parti'}" style="--c:${c?.couleur || '#64748b'};--i:${Math.min(n, 20)}">
      <div class="cj-tete">${avatarJoueur(i, 'grand')}
        <div class="cj-nom"><strong>${esc(i.nom || 'Sans nom')} <span>${esc(i.prenom)}</span></strong>
          <small>${i.discord ? `@${esc(i.pseudo)}` : 'Ajouté à la main'}${i.present ? '' : ' · a quitté le serveur'}</small></div>
      </div>
      <div class="cj-infos">
        ${badgeClan(i.clan)}
        ${i.grade ? `<span class="tag">${esc(i.grade)}</span>` : ''}
        ${i.section ? `<span class="tag">${esc(i.section)}</span>` : ''}
        ${!i.clan && !i.grade && !i.section ? '<span class="aide">Grade, section et clan non renseignés</span>' : ''}
      </div>
      <div class="cj-bas">
        ${actif ? `<a class="btn btn-petit" href="#/dossier/${actif.id}">${icone('dossier')} Voir le dossier</a>`
          : peut.creerDossier() ? `<a class="btn btn-petit btn-primaire" href="#/dossiers/nouveau?joueur=${p.id}">${icone('plus')} Ouvrir un suivi</a>` : ''}
        ${dossiers.length > (actif ? 1 : 0) ? `<span class="aide">${pluriel(dossiers.length, 'dossier', 'dossiers')}</span>` : ''}
        ${peut.completerAnnuaire() ? `<button type="button" class="btn btn-petit btn-fantome btn-icone" data-action="modifier" data-id="${p.id}"
          title="Modifier" aria-label="Modifier ${esc(nomAffiche(i))}">${icone('crayon')}</button>` : ''}
      </div>
    </article>`;
}

/* ---------------- Discord ---------------- */

async function synchroniser(bouton) {
  bouton.classList.add('charge');
  try {
    const r = await api.discordSynchroniser();
    await etat.chargerAnnuaire();
    toast(`Annuaire à jour : ${pluriel(r.membres, 'joueur', 'joueurs')} sur le serveur`, 'succes');
  } finally {
    bouton.classList.remove('charge');
  }
}

// Relie le bot ; si le bot est sur plusieurs serveurs, on demande lequel.
async function relier(jeton, serveur = null) {
  let r = await api.discordRelier(jeton, serveur);
  if (r?.choisir) {
    const choix = await fenetre({
      titre: 'Quel serveur ?',
      sousTitre: 'Le bot est sur plusieurs serveurs Discord.',
      corps: `<div class="choix-statuts">${r.choisir.map((s, n) => `
        <label class="choix-statut"><input type="radio" name="serveur" value="${esc(s.id)}" ${n ? '' : 'checked'}>
          <span class="emoji" aria-hidden="true">${icone('discord')}</span><span><strong>${esc(s.nom)}</strong></span></label>`).join('')}</div>`,
      texteValider: 'Relier ce serveur',
      valider: (_f, x) => x.serveur,
    });
    if (!choix) return false;
    r = await api.discordRelier(jeton, choix);
  }
  toast(`Serveur « ${r.serveur} » relié. Lecture des joueurs…`, 'succes');
  await etat.chargerAnnuaire();
  const s = await api.discordSynchroniser();
  await etat.chargerAnnuaire();
  toast(`Annuaire à jour : ${pluriel(s.membres, 'joueur', 'joueurs')} sur le serveur`, 'succes');
  return true;
}

const USAGES = [
  ['', '—'],
  ['grade', 'Grade'],
  ['section', 'Section'],
  ...CLANS.filter(c => c.id !== 'sans_clan').map(c => [`clan:${c.id}`, `Clan ${c.label}`]),
];
const valeurUsage = r => (r.usage === 'clan' ? `clan:${r.clan}` : r.usage || '');

async function reglagesDiscord() {
  const d = etat.discord;
  let groupe = 'tous';
  const ligneRole = r => {
    const n = etat.personnages.filter(p => p.present && p.roles?.includes(r.id)).length;
    return `
      <div class="ligne-role" data-groupe="${r.usage || 'aucun'}">
        <span class="pastille-role" style="--c:${couleurRole(r.couleur)}" aria-hidden="true"></span>
        <span class="ligne-role-nom">${esc(nettoyerRole(r.nom))}<small>${pluriel(n, 'joueur', 'joueurs')}</small></span>
        <select data-usage="${esc(r.id)}" aria-label="Ce qu’indique le rôle ${esc(r.nom)}">
          ${USAGES.map(([v, l]) => `<option value="${v}" ${v === valeurUsage(r) ? 'selected' : ''}>${esc(l)}</option>`).join('')}
        </select>
      </div>`;
  };

  await fenetre({
    titre: 'Serveur Discord',
    sousTitre: `${esc(d.serveur_nom)} · bot « ${esc(d.bot_nom)} »`,
    large: true,
    texteAnnuler: 'Fermer',
    corps: `
      <section class="pile">
        <h3 class="titre-guide">Rôles du serveur</h3>
        <p class="aide">Choisis ce qu’indique chaque rôle. Pour un joueur, le site retient son rôle de grade, de section et de clan le plus haut placé sur Discord.
          Sans rôle de clan, un joueur est « Sans clan ». Les changements sont enregistrés tout de suite.</p>
        <div class="puces" role="group" aria-label="Afficher">
          ${[['tous', 'Tous'], ['grade', 'Grades'], ['section', 'Sections'], ['clan', 'Clans'], ['aucun', 'Non utilisés']]
            .map(([v, l]) => `<button type="button" class="puce" data-groupe-filtre="${v}" aria-pressed="${v === 'tous'}">${l}</button>`).join('')}
        </div>
        <div class="liste-roles">${etat.discordRoles.length ? etat.discordRoles.map(ligneRole).join('')
          : '<p class="aide">Aucun rôle pour l’instant : clique sur « Mettre à jour » sur la page Joueurs.</p>'}</div>
      </section>
      <section class="pile separe">
        <h3 class="titre-guide">Token du bot</h3>
        <div class="form-jeton">
          <input type="password" data-nouveau-jeton placeholder="Nouveau token du bot" autocomplete="off" spellcheck="false" aria-label="Nouveau token du bot">
          <button type="button" class="btn" data-changer-jeton>Changer le token</button>
        </div>
        <p class="aide">À faire si tu as régénéré le token sur Discord. <button type="button" class="lien-discret danger" data-delier>Délier le serveur</button></p>
      </section>`,
    apresOuverture: (dlg, fermer) => {
      dlg.addEventListener('change', async e => {
        const select = e.target.closest('[data-usage]');
        if (!select) return;
        const [usage, clan] = select.value.split(':');
        try {
          const maj = await api.majDiscordRole(select.dataset.usage, { usage: usage || null, clan: clan || null });
          etat.discordRoles = etat.discordRoles.map(r => (r.id === maj.id ? maj : r));
          select.closest('.ligne-role').dataset.groupe = maj.usage || 'aucun';
          appliquerGroupe();
        } catch (err) {
          toast(err.message, 'erreur');
        }
      });
      const appliquerGroupe = () => dlg.querySelectorAll('.ligne-role').forEach(l => { l.hidden = groupe !== 'tous' && l.dataset.groupe !== groupe; });
      dlg.addEventListener('click', async e => {
        const filtre = e.target.closest('[data-groupe-filtre]');
        if (filtre) {
          groupe = filtre.dataset.groupeFiltre;
          dlg.querySelectorAll('[data-groupe-filtre]').forEach(b => b.setAttribute('aria-pressed', String(b === filtre)));
          appliquerGroupe();
        }
        if (e.target.closest('[data-delier]')) {
          const ok = await confirmer({
            titre: 'Délier le serveur Discord ?',
            message: 'Le token du bot est effacé et l’annuaire n’est plus mis à jour. Les joueurs déjà lus restent dans l’annuaire.',
            texteValider: 'Délier',
            danger: true,
          });
          if (!ok) return;
          try {
            await api.discordDelier();
            await etat.chargerAnnuaire();
            fermer();
            toast('Serveur Discord délié', 'succes');
          } catch (err) {
            toast(err.message, 'erreur');
          }
        }
      });
      // (pas de formulaire imbriqué : la fenêtre en est déjà un)
      const champJeton = dlg.querySelector('[data-nouveau-jeton]');
      const boutonJeton = dlg.querySelector('[data-changer-jeton]');
      const changerJeton = async () => {
        if (!champJeton.value.trim()) return champJeton.focus();
        boutonJeton.classList.add('charge');
        try {
          if (await relier(champJeton.value)) fermer();
        } catch (err) {
          toast(err.message, 'erreur');
        } finally {
          boutonJeton.classList.remove('charge');
        }
      };
      boutonJeton.addEventListener('click', changerJeton);
      champJeton.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); changerJeton(); } });
    },
  });
}

/* ---------------- Fiche d'un joueur ---------------- */

async function ficheJoueur(p) {
  const discord = Boolean(p?.discord_id);
  // Ce que dit Discord, sans les corrections de l'équipe.
  const auto = discord ? infosPersonnage({ ...p, nom: '', prenom: '', grade: '', section: '', clan: '' }) : null;
  const v = p || {};
  const champ = (etiquette, nom, valeur, attributs = '') =>
    `<label class="champ"><span class="etiquette">${etiquette}</span><input name="${nom}" value="${esc(valeur || '')}" ${attributs}></label>`;
  const ph = x => (x ? `placeholder="${esc(x)}"` : '');

  const r = await fenetre({
    titre: p ? nomAffiche(infosPersonnage(p)) : 'Ajouter un joueur',
    sousTitre: discord
      ? `@${esc(p.discord_pseudo)} · pseudo sur le serveur : « ${esc(p.nom_discord)} »`
      : p ? 'Ajouté à la main' : 'Un joueur absent du serveur Discord, par exemple un Roran.',
    corps: `
      <div class="grille-champs">
        ${champ(`Nom${discord ? '' : ' <span class="requis">*</span>'}`, 'nom', v.nom, `maxlength="80" ${discord ? ph(auto.nom) : ''} autocomplete="off"`)}
        ${champ('Prénom', 'prenom', v.prenom, `maxlength="80" ${discord ? ph(auto.prenom) : ''} autocomplete="off"`)}
        ${champ('Grade', 'grade', v.grade, `maxlength="80" ${discord ? ph(auto.grade) : ''}`)}
        ${champ('Section', 'section', v.section, `maxlength="80" ${discord ? ph(auto.section) : ''}`)}
        <label class="champ large"><span class="etiquette">Clan</span>
          <select name="clan">
            <option value="">${discord ? `Selon Discord (${esc(auto.infoClan?.label || 'non renseigné')})` : 'Non renseigné'}</option>
            ${CLANS.map(c => `<option value="${c.id}" ${c.id === v.clan ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}
          </select></label>
        <label class="champ large"><span class="etiquette">Notes</span>
          <textarea name="notes" rows="2" maxlength="1000" placeholder="Précision utile à l’équipe">${esc(v.notes || '')}</textarea></label>
      </div>
      ${discord ? '<p class="aide">Les champs laissés vides reprennent ce que dit Discord.</p>' : ''}`,
    pied: p && !discord ? `<button type="button" class="btn btn-fantome gauche" data-supprimer>${icone('poubelle')} Supprimer</button>` : '',
    texteValider: p ? 'Enregistrer' : 'Ajouter',
    apresOuverture: (dlg, fermer) => {
      dlg.querySelector('[data-supprimer]')?.addEventListener('click', async () => {
        const ok = await confirmer({
          titre: 'Retirer ce joueur de l’annuaire ?',
          message: 'Ses dossiers sont conservés.',
          texteValider: 'Retirer',
          danger: true,
        });
        if (!ok) return;
        try {
          await api.supprimerPersonnage(p.id);
          etat.oublierPersonnage(p.id);
          fermer();
          toast('Joueur retiré de l’annuaire', 'succes');
        } catch (err) {
          toast(err.message, 'erreur');
        }
      });
    },
    valider: async (_f, x) => {
      const champs = Object.fromEntries(['nom', 'prenom', 'grade', 'section', 'clan', 'notes'].map(k => [k, (x[k] || '').trim()]));
      if (!discord && !champs.nom && !champs.prenom) {
        toast('Indique au moins le nom du joueur.', 'erreur');
        return false;
      }
      const enregistre = p ? await api.majPersonnage(p.id, champs) : await api.creerPersonnage(champs);
      etat.garderPersonnage(enregistre);
      return enregistre;
    },
  });
  if (r) toast(p ? 'Fiche du joueur enregistrée' : `${nomAffiche(infosPersonnage(r))} ajouté à l’annuaire`, 'succes');
}
