// Guide de la branche : fonctionnement, parcours, statuts et règles (repris du projet de branche).

import { CATEGORIES, STATUTS, PARCOURS, ROLES } from '../constantes.js';
import { esc, icone } from '../ui.js';

const DESCRIPTIONS_CATEGORIES = {
  genetique: 'Maladies génétiques, connues ou encore inconnues : la mission principale de la branche.',
  inconnue: 'Pathologies dont l’origine reste à déterminer.',
  post_op: 'Convalescence qui suit une opération lourde.',
  reeducation: 'Après une blessure grave ou une perte de mobilité.',
  sequelle: 'Amputation ou blessure aux conséquences définitives.',
  chronique: 'Pathologies qui ne guérissent pas mais doivent être surveillées régulièrement.',
};

const EQUIPE = [
  ['responsable', 'Supervise l’ensemble des dossiers, attribue les patients aux médecins, valide les décisions importantes (changement majeur de traitement, clôture d’un dossier) et assure le lien avec la direction de la Seimei et avec l’IRS.'],
  ['medecin', 'Suit son patient du premier rendez-vous jusqu’à la fin de sa prise en charge. Interlocuteur principal du patient, il organise ses rendez-vous et tient son dossier à jour : le patient n’a pas à tout réexpliquer à chaque consultation.'],
  ['soignant', 'Assiste les médecins lors des examens et encadre les séances de rééducation et les exercices des patients.'],
  ['irs', 'Chercheurs de l’IRS chargés de recevoir les prélèvements, de mener les analyses et de transmettre leurs conclusions à la branche.'],
];

const SECTIONS = [
  ['branche', 'La branche'],
  ['equipe', 'L’équipe'],
  ['dossier', 'Le dossier'],
  ['parcours', 'Parcours de soin'],
  ['statuts', 'Statuts'],
  ['site', 'Utiliser le site'],
  ['regles', 'Règles'],
];

export function rendreGuide(vue) {
  const liste = elements => `<ul class="liste-guide">${elements.map(t => `<li>${icone('coche')}<span>${t}</span></li>`).join('')}</ul>`;
  const parcours = cle => {
    const p = PARCOURS[cle];
    return `
      <div class="panneau">
        <h3 class="titre-guide">${esc(p.label)}</h3>
        <p class="aide" style="margin-bottom:14px">${esc(p.detail)}</p>
        <ol class="liste-etapes">${p.etapes.map((e, i) => `
          <li><span class="num">${i + 1}</span><div><strong>${esc(e.titre)}</strong><p>${esc(e.resume)}</p></div></li>`).join('')}
        </ol>
      </div>`;
  };

  vue.innerHTML = `
    <div class="page guide">
      <header class="entete-page">
        <div>
          <p class="surtitre">Projet de branche · en lien avec l’IRS</p>
          <h1 class="titre-page">Suivi des pathologies</h1>
          <p class="sous-titre">Le fonctionnement de la branche, ses parcours de soin et ses règles.</p>
        </div>
      </header>

      <nav class="puces sommaire" aria-label="Sommaire">
        ${SECTIONS.map(([id, titre]) => `<button type="button" class="puce" data-aller="${id}">${esc(titre)}</button>`).join('')}
      </nav>

      <section class="hero" id="guide-branche" style="--c:#34d399">
        <p class="surtitre">${icone('coeur')} La branche</p>
        <h2 class="titre-guide grand">Accompagner chaque patient dans la durée</h2>
        <p class="texte-guide">Plutôt que d’intervenir seulement lorsqu’une urgence survient, la branche suit à long terme les patients atteints de pathologies particulières.
          Chaque patient dispose d’un <strong>dossier médical complet</strong>, d’un <strong>médecin référent</strong>, d’<strong>examens réguliers</strong>
          et d’un <strong>traitement adapté</strong> à l’évolution de son état. La Seimei assure le suivi médical, l’IRS apporte son expertise scientifique.</p>
        <div class="grille-categories">${CATEGORIES.map(c => `
          <div class="categorie-guide"><span class="emoji" aria-hidden="true">${c.emoji}</span>
            <div><strong>${esc(c.label)}</strong><p>${esc(DESCRIPTIONS_CATEGORIES[c.id])}</p></div></div>`).join('')}
        </div>
      </section>

      <section class="pile" id="guide-equipe">
        <h2 class="titre-section">L’équipe</h2>
        <div class="grille-guide">${EQUIPE.map(([r, texte]) => `
          <div class="panneau">
            <h3 class="titre-guide"><span class="role" style="--c:${ROLES[r].couleur}">${esc(ROLES[r].groupe)}</span></h3>
            <p class="texte-guide">${esc(texte)}</p>
          </div>`).join('')}
        </div>
      </section>

      <section class="pile" id="guide-dossier">
        <h2 class="titre-section">Le dossier médical</h2>
        <div class="grille-guide">
          <div class="panneau">
            <h3 class="titre-guide">Ce qu’il regroupe</h3>
            ${liste([
              'L’identité et les informations générales du patient',
              'La description de sa pathologie ou de ses séquelles',
              'Ses antécédents médicaux et familiaux',
              'Le compte rendu de chaque rendez-vous',
              'Les résultats des examens et analyses, de la Seimei comme de l’IRS',
              'L’historique des traitements essayés et de leurs effets, qu’ils aient fonctionné ou non',
              'Le plan de suivi en cours',
            ])}
          </div>
          <div class="panneau">
            <h3 class="titre-guide">${icone('cadenas')} Secret médical</h3>
            <p class="texte-guide">Le dossier est soumis au secret médical. Seuls le patient, les membres de la branche et les chercheurs de l’IRS concernés y ont accès.
              <strong>Aucun prélèvement n’est transmis à l’IRS sans l’accord du patient.</strong></p>
            <h3 class="titre-guide" style="margin-top:18px">🚨 Aggravation et urgences</h3>
            <p class="texte-guide">Si l’état d’un patient se dégrade entre deux rendez-vous, un rendez-vous d’urgence est organisé et le traitement est réévalué, avec si besoin un nouveau cycle d’examens.
              En cas d’urgence vitale, le patient est d’abord pris en charge par les soins d’urgence de la Seimei, puis son dossier est transmis à son médecin référent.</p>
            <h3 class="titre-guide" style="margin-top:18px">📌 Clôture</h3>
            <p class="texte-guide">Un dossier est clôturé quand le patient est guéri ou rétabli, quand son état est définitivement stabilisé, ou à sa demande.
              Il est alors archivé, et peut être rouvert à tout moment si la situation l’exige.</p>
          </div>
        </div>
      </section>

      <section class="pile" id="guide-parcours">
        <h2 class="titre-section">Les parcours de soin</h2>
        <div class="grille-guide">${parcours('maladie')}${parcours('readaptation')}</div>
      </section>

      <section class="pile" id="guide-statuts">
        <h2 class="titre-section">Les statuts d’un dossier</h2>
        <div class="panneau"><div class="grille-statuts">${STATUTS.map(s => `
          <div class="statut-guide"><span class="pill" style="--c:${s.couleur}"><span aria-hidden="true">${s.emoji}</span>${esc(s.label)}</span>
            <p>${esc(s.description)}</p></div>`).join('')}
        </div></div>
      </section>

      <section class="pile" id="guide-site">
        <h2 class="titre-section">Utiliser le site</h2>
        <div class="grille-guide">
          <div class="panneau">
            <h3 class="titre-guide">🔐 Accès au site</h3>
            ${liste([
              'Le site est réservé à l’équipe de la branche et aux chercheurs de l’IRS : <strong>les joueurs n’y ont pas accès</strong>.',
              'Chacun se connecte avec le <strong>nom de son personnage</strong> et un <strong>code</strong> choisi à l’inscription.',
              'Le responsable valide chaque nouveau compte et lui donne son rôle.',
              'Code oublié : le responsable en choisit un nouveau depuis la page Équipe.',
            ])}
          </div>
          <div class="panneau">
            <h3 class="titre-guide">🎭 Annuaire des joueurs</h3>
            ${liste([
              'La page <strong>Joueurs</strong> reprend les membres du serveur Discord : leur pseudo sur le serveur donne leur nom RP, leurs rôles donnent leur grade, leur section et leur clan.',
              'Elle se met à jour toute seule, ou avec le bouton « Mettre à jour ».',
              'Les joueurs absents du serveur, par exemple les <strong>Roran</strong>, s’ajoutent à la main.',
              'Une information fausse sur Discord se corrige dans la fiche du joueur, sans toucher au serveur.',
            ])}
          </div>
          <div class="panneau">
            <h3 class="titre-guide">🩺 Équipe de la branche</h3>
            ${liste([
              'Ouvre un dossier en choisissant le joueur dans l’annuaire : son nom, son prénom, son grade, sa section et son clan sont remplis automatiquement.',
              'Prends en charge les dossiers sans médecin depuis le tableau de bord.',
              'Après chaque rendez-vous RP, publie un <strong>compte rendu</strong> dans le dossier.',
              'Fais avancer le parcours, mets à jour le statut et le prochain rendez-vous, et consigne chaque traitement essayé.',
              'Les <strong>notes</strong> du journal servent à l’organisation entre membres de l’équipe.',
            ])}
          </div>
          <div class="panneau">
            <h3 class="titre-guide">🔬 IRS</h3>
            ${liste([
              'Tu vois les dossiers dont le patient a donné son accord.',
              'Les dossiers « Analyse IRS en cours » attendent ton analyse.',
              'Publie ton <strong>rapport d’analyse</strong> directement dans le dossier : le médecin référent organise ensuite la présentation des résultats.',
            ])}
          </div>
          <div class="panneau">
            <h3 class="titre-guide">⏳ Rythme des suivis</h3>
            <p class="texte-guide" style="margin-bottom:10px">Les durées évoquées en RP sont converties en temps IRL, à titre indicatif :</p>
            ${liste([
              '<strong>Essai d’un traitement</strong> : au moins une à deux semaines IRL avant l’analyse de contrôle.',
              '<strong>Rééducation</strong> : environ une séance RP par semaine.',
              '<strong>Suivi stable</strong> : un contrôle par mois IRL, plus souvent si besoin.',
            ])}
          </div>
        </div>
      </section>

      <section class="pile" id="guide-regles">
        <h2 class="titre-section">Règles et garde-fous</h2>
        <div class="grille-guide">${[
          ['Le joueur garde la main sur sa pathologie', 'Aucune aggravation, complication ou séquelle majeure ne peut lui être imposée sans son accord HRP.'],
          ['Cohérence avec la fiche personnage', 'La pathologie suivie doit figurer sur la fiche validée du personnage, ou être validée par le staff. Tout changement important (guérison complète, prothèse, perte ou récupération d’une capacité) doit être validé par le staff avant d’être appliqué.'],
          ['Aucun avantage de puissance', 'Le suivi sert à soigner, stabiliser ou soulager, jamais à offrir un bonus au personnage.'],
          ['Pas de métagaming', 'Le contenu des dossiers reste couvert par le secret médical en RP : un personnage ne peut pas utiliser une information qu’il n’a pas apprise en jeu.'],
          ['Qui écrit dans un dossier', 'Seuls l’équipe de la branche et les chercheurs de l’IRS concernés y publient.'],
          ['Inactivité', 'Un dossier sans activité pendant trois semaines passe « En pause » et peut être repris à tout moment. Si un médecin référent devient inactif, le responsable confie ses dossiers à un autre médecin.'],
        ].map(([titre, texte]) => `
          <div class="panneau regle"><h3 class="titre-guide">${esc(titre)}</h3><p class="texte-guide">${esc(texte)}</p></div>`).join('')}
        </div>
      </section>

    </div>`;

  vue.querySelector('.sommaire').addEventListener('click', e => {
    const cible = e.target.closest('[data-aller]');
    if (cible) document.getElementById(`guide-${cible.dataset.aller}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
