// Création et modification d'un dossier : fiche patient (préremplie depuis
// l'annuaire des joueurs) et informations de suivi.

import { api } from '../api.js';
import { etat, peut } from '../etat.js';
import { CATEGORIES, STATUTS, PARCOURS, ORIGINES, CLANS, parcoursConseille, role } from '../constantes.js';
import { listeJoueurs, correspond, infosPersonnage, nomAffiche } from '../annuaire.js';
import { esc, icone, nomComplet, toast, avatarJoueur, badgeClan } from '../ui.js';

const champ = (etiquette, html, classe = '', aide = '') =>
  `<label class="champ ${classe}"><span class="etiquette">${etiquette}</span>${html}${aide ? `<span class="aide">${aide}</span>` : ''}</label>`;
const texte = (nom, v, attributs = '') => `<input name="${nom}" value="${esc(v || '')}" ${attributs}>`;
const zone = (nom, v, lignes = 3, attributs = '') => `<textarea name="${nom}" rows="${lignes}" ${attributs}>${esc(v || '')}</textarea>`;
const requis = '<span class="requis" aria-hidden="true">*</span>';

const CHAMPS_FICHE = ['nom', 'prenom', 'age', 'grade', 'section', 'clan', 'village', 'pathologie', 'origine', 'apparition',
  'symptomes', 'antecedents', 'traitements_essayes', 'suivi_a_realiser', 'joueur', 'souhaits_rp', 'limites', 'disponibilites'];
const MAX_SUGGESTIONS = 8;

export async function rendreFormulaire(vue, id, requete = null) {
  let d = null;
  if (id) {
    d = await api.dossier(id);
    if (!d) return pasAcces(vue, 'Ce dossier est introuvable.');
    if (!peut.modifierDossier(d)) return pasAcces(vue, d.statut === 'cloture'
      ? 'Ce dossier est clôturé : il doit être rouvert avant d’être modifié.'
      : 'Ton rôle ne permet pas de modifier cette fiche.');
  } else if (!peut.creerDossier()) {
    return pasAcces(vue, 'Ton rôle ne permet pas d’ouvrir de dossier.');
  }

  const v = d || { categories: [], statut: 'attente', parcours: 'maladie', etape: 1, consentement_irs: false };
  const retour = d ? `#/dossier/${d.id}` : '#/dossiers';
  const annuaire = peut.voirAnnuaire();
  let choisi = d?.personnage_id || (annuaire && etat.personnage(requete?.get('joueur'))?.id) || null;

  vue.innerHTML = `
    <div class="page">
      <a class="retour" href="${retour}">${icone('retour')} ${d ? esc(nomComplet(d)) : 'Dossiers'}</a>
      <header class="entete-page">
        <div>
          <p class="surtitre">${d ? 'Modifier la fiche' : 'Ouverture d’un dossier'}</p>
          <h1 class="titre-page">${d ? esc(nomComplet(d)) : 'Nouveau dossier'}</h1>
          <p class="sous-titre">${annuaire ? 'Choisis le joueur dans l’annuaire : son identité se remplit toute seule.' : 'La fiche patient, puis les informations de suivi.'}</p>
        </div>
      </header>

      <form class="formulaire" novalidate>
        <section class="section-form">
          <h2><span class="numero">01</span> Patient</h2>
          ${annuaire ? '<div class="choix-joueur" data-choix-joueur></div>' : ''}
          <div class="grille-champs">
            ${champ(`Nom ${requis}`, texte('nom', v.nom, 'required maxlength="80" autocomplete="off"'))}
            ${champ('Prénom', texte('prenom', v.prenom, 'maxlength="80" autocomplete="off"'))}
            ${champ('Grade', texte('grade', v.grade, 'maxlength="80"'))}
            ${champ('Section', texte('section', v.section, 'maxlength="80"'))}
            ${champ('Clan', `<select name="clan"><option value="">Non renseigné</option>${CLANS.map(c =>
              `<option value="${c.id}" ${c.id === v.clan ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select>`)}
            ${champ('Âge', texte('age', v.age, 'maxlength="40"'))}
            ${champ('Village', texte('village', v.village, 'maxlength="120"'), 'large')}
          </div>
          ${annuaire && peut.completerAnnuaire() ? `
            <label class="interrupteur" data-ajout-annuaire hidden><input type="checkbox" name="ajouter_annuaire">
              <span><strong>Ajouter ce joueur à l’annuaire</strong>
              <span class="aide">Pour un joueur absent du serveur Discord, par exemple un Roran.</span></span></label>` : ''}
        </section>

        <section class="section-form">
          <h2><span class="numero">02</span> Pathologie</h2>
          <div class="grille-champs">
            <div class="champ large">
              <span class="etiquette" id="etiquette-categories">Catégorie de suivi ${requis}</span>
              <div class="puces" role="group" aria-labelledby="etiquette-categories">
                ${CATEGORIES.map(c => `<button type="button" class="puce" data-categorie="${c.id}"
                  aria-pressed="${(v.categories || []).includes(c.id)}"><span aria-hidden="true">${c.emoji}</span>${esc(c.label)}</button>`).join('')}
              </div>
              <span class="aide">Plusieurs catégories possibles si le personnage a plusieurs pathologies : elles sont regroupées dans le même dossier.</span>
            </div>
            ${champ(`Pathologie ${requis}`, texte('pathologie', v.pathologie, 'required maxlength="160" placeholder="ex. Rééducation après amputation"'), 'large')}
            ${champ('Origine', texte('origine', v.origine, 'list="origines" maxlength="160" placeholder="génétique, blessure, opération, inconnue…"'))}
            ${champ('Apparition', texte('apparition', v.apparition, 'maxlength="200" placeholder="âge ou date, circonstances"'))}
            ${champ('Symptômes / séquelles', zone('symptomes', v.symptomes, 3), 'large')}
            ${champ('Antécédents familiaux', zone('antecedents', v.antecedents, 2), 'large')}
            ${champ('Traitements déjà essayés', zone('traitements_essayes', v.traitements_essayes, 2), 'large')}
            ${champ('Suivi à réaliser pour la pathologie', zone('suivi_a_realiser', v.suivi_a_realiser, 2), 'large')}
          </div>
          <datalist id="origines">${ORIGINES.map(o => `<option value="${o}">`).join('')}</datalist>
        </section>

        <section class="section-form">
          <h2><span class="numero">03</span> HRP</h2>
          <div class="grille-champs">
            ${champ('Joueur', texte('joueur', v.joueur, 'maxlength="80" placeholder="pseudo Discord du joueur"'))}
            ${champ('Disponibilités', texte('disponibilites', v.disponibilites, 'maxlength="200"'))}
            ${champ('Ce que le joueur souhaite développer en RP', zone('souhaits_rp', v.souhaits_rp, 3), 'large')}
            ${champ('Limites / éléments à éviter', zone('limites', v.limites, 2), 'large',
              'Aucune aggravation, complication ou séquelle majeure ne peut être imposée sans l’accord HRP du joueur.')}
          </div>
        </section>

        ${sectionSuivi(v, d)}

        <div class="barre-actions">
          <span class="aide">${requis} champs obligatoires</span>
          <a class="btn" href="${retour}">Annuler</a>
          <button type="submit" class="btn btn-primaire">${d ? 'Enregistrer' : 'Ouvrir le dossier'}</button>
        </div>
      </form>
    </div>`;

  const page = vue.querySelector('.page');
  const form = page.querySelector('form');
  let parcoursTouche = Boolean(d);

  const categoriesChoisies = () => [...form.querySelectorAll('[data-categorie][aria-pressed="true"]')].map(b => b.dataset.categorie);
  const proposerParcours = () => {
    if (!parcoursTouche && categoriesChoisies().length) form.parcours.value = parcoursConseille(categoriesChoisies());
  };

  /* ----- Choix du joueur dans l'annuaire ----- */
  const zoneChoix = page.querySelector('[data-choix-joueur]');
  const caseAjout = page.querySelector('[data-ajout-annuaire]');

  function remplirDepuis(p) {
    const i = infosPersonnage(p);
    const valeurs = { nom: i.nom, prenom: i.prenom, grade: i.grade, section: i.section, clan: i.clan, joueur: i.pseudo };
    for (const [nom, valeur] of Object.entries(valeurs)) {
      const el = form.elements[nom];
      if (!el || (nom === 'joueur' && !valeur)) continue;
      el.value = valeur || '';
      el.classList.remove('rempli');
      void el.offsetWidth; // relance l'animation
      el.classList.add('rempli');
    }
  }

  function dessinerChoix() {
    if (!zoneChoix) return;
    const p = etat.personnage(choisi);
    if (caseAjout) caseAjout.hidden = Boolean(choisi);
    if (p) {
      const i = infosPersonnage(p);
      zoneChoix.innerHTML = `
        <div class="joueur-choisi">
          ${avatarJoueur(i, 'grand')}
          <div class="jc-texte"><strong>${esc(nomAffiche(i))}</strong>
            <small>${i.discord ? `@${esc(i.pseudo)}` : 'Ajouté à la main'}${i.grade ? ` · ${esc(i.grade)}` : ''}${i.section ? ` · ${esc(i.section)}` : ''}</small></div>
          ${badgeClan(i.clan)}
          <button type="button" class="btn btn-petit" data-action="changer-joueur">Changer</button>
        </div>`;
      return;
    }
    const vide = !etat.personnages.length;
    zoneChoix.innerHTML = `
      <div class="recherche-joueur">
        <label class="champ-icone">${icone('recherche')}
          <input type="search" data-recherche-joueur autocomplete="off" aria-label="Rechercher un joueur dans l’annuaire"
            aria-controls="suggestions-joueurs" placeholder="${vide ? 'L’annuaire est vide' : 'Rechercher un joueur : nom RP, pseudo Discord…'}" ${vide ? 'disabled' : ''}></label>
        <div class="suggestions" id="suggestions-joueurs" role="listbox" aria-label="Joueurs" hidden></div>
      </div>
      <p class="aide">${vide
        ? `L’annuaire des joueurs est vide : relie le serveur Discord ou ajoute des joueurs depuis la page <a href="#/joueurs">Joueurs</a>. Tu peux aussi remplir la fiche à la main.`
        : 'Joueur introuvable ? Remplis la fiche à la main.'}</p>`;
  }

  function proposer(terme) {
    const boite = zoneChoix.querySelector('.suggestions');
    if (!terme.trim()) { boite.hidden = true; return; }
    const trouves = listeJoueurs()
      .filter(j => correspond(j, terme))
      .sort((a, b) => Number(b.i.present) - Number(a.i.present))
      .slice(0, MAX_SUGGESTIONS);
    boite.innerHTML = trouves.length ? trouves.map(({ p, i }) => `
      <button type="button" role="option" class="suggestion" data-joueur="${p.id}">
        ${avatarJoueur(i, 'petit')}
        <span class="sg-texte"><strong>${esc(nomAffiche(i))}</strong>
          <small>${i.discord ? `@${esc(i.pseudo)}` : 'Ajouté à la main'}${i.grade ? ` · ${esc(i.grade)}` : ''}${i.present ? '' : ' · parti du serveur'}</small></span>
        ${badgeClan(i.clan)}
      </button>`).join('')
      : '<p class="aide sans-resultat">Aucun joueur ne correspond.</p>';
    boite.hidden = false;
  }

  zoneChoix?.addEventListener('input', e => {
    if (e.target.matches('[data-recherche-joueur]')) proposer(e.target.value);
  });
  zoneChoix?.addEventListener('keydown', e => {
    const options = [...zoneChoix.querySelectorAll('[data-joueur]')];
    // Entrée dans la recherche choisit le premier joueur (et n'envoie pas le formulaire).
    if (e.key === 'Enter' && e.target.matches('[data-recherche-joueur]')) { e.preventDefault(); options[0]?.click(); return; }
    if (!options.length || !['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const i = options.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); options[Math.min(i + 1, options.length - 1)].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (i <= 0 ? zoneChoix.querySelector('[data-recherche-joueur]') : options[i - 1]).focus(); }
  });
  zoneChoix?.addEventListener('click', e => {
    const option = e.target.closest('[data-joueur]');
    if (option) {
      choisi = option.dataset.joueur;
      remplirDepuis(etat.personnage(choisi));
      dessinerChoix();
      return;
    }
    if (e.target.closest('[data-action="changer-joueur"]')) {
      choisi = null;
      dessinerChoix();
      zoneChoix.querySelector('[data-recherche-joueur]')?.focus();
    }
  });
  dessinerChoix();
  // Arrivée depuis la page Joueurs (« Ouvrir un suivi ») : la fiche est déjà remplie.
  if (!d && choisi) remplirDepuis(etat.personnage(choisi));
  // Annuaire de plus d'une heure : mise à jour depuis Discord en arrière-plan.
  if (annuaire) {
    etat.synchroniserSiBesoin()
      .then(fait => { if (fait && !choisi && zoneChoix?.querySelector('[data-recherche-joueur][disabled]')) dessinerChoix(); })
      .catch(() => {});
  }

  form.parcours?.addEventListener('change', () => { parcoursTouche = true; });
  page.addEventListener('click', e => {
    const puce = e.target.closest('[data-categorie]');
    if (!puce) return;
    puce.setAttribute('aria-pressed', String(puce.getAttribute('aria-pressed') !== 'true'));
    proposerParcours();
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const categories = categoriesChoisies();
    if (!form.reportValidity()) return;
    if (!categories.length) return toast('Choisis au moins une catégorie de suivi.', 'erreur');

    const champs = { categories, consentement_irs: form.consentement_irs.checked };
    for (const nom of CHAMPS_FICHE) champs[nom] = form.elements[nom].value.trim();
    champs.parcours = form.parcours.value;
    champs.plan_suivi = form.plan_suivi.value.trim();
    champs.prochain_rdv = form.prochain_rdv.value || null;
    if (!form.medecin_id.disabled) {
      const medecin = form.medecin_id.value || null;
      if (!d || medecin !== d.medecin_id) champs.medecin_id = medecin;
    }
    if (!d) champs.statut = form.statut.value;
    if (d && champs.parcours !== d.parcours) champs.etape = 1;

    const bouton = form.querySelector('[type=submit]');
    bouton.classList.add('charge');
    try {
      // Joueur absent de l'annuaire (ex. un Roran) : on l'y ajoute au passage.
      if (!choisi && form.ajouter_annuaire?.checked) {
        const p = await api.creerPersonnage({
          nom: champs.nom, prenom: champs.prenom, grade: champs.grade, section: champs.section, clan: champs.clan,
        });
        etat.garderPersonnage(p);
        choisi = p.id;
      }
      if (annuaire && (!d || (choisi || null) !== d.personnage_id)) champs.personnage_id = choisi || null;

      const enregistre = d ? await api.majDossier(d.id, champs) : await api.creerDossier(champs);
      etat.garderDossier(enregistre);
      document.dispatchEvent(new CustomEvent('seimei:maj'));
      location.hash = `#/dossier/${enregistre.id}`;
      toast(d ? 'Fiche enregistrée' : 'Dossier ouvert', 'succes');
    } catch (err) {
      toast(err.message, 'erreur');
    } finally {
      bouton.classList.remove('charge');
    }
  });

  (zoneChoix?.querySelector('[data-recherche-joueur]:not([disabled])') || form.querySelector('[name=nom]')).focus();
}

function sectionSuivi(v, d) {
  const estResponsable = etat.moi.role === 'responsable';
  const medecinActuel = etat.membre(v.medecin_id);

  // Qui peut-on choisir comme médecin référent ?
  let selectMedecin;
  if (estResponsable) {
    selectMedecin = `<select name="medecin_id"><option value="">Non attribué</option>${etat.medecins().map(m =>
      `<option value="${m.id}" ${m.id === v.medecin_id ? 'selected' : ''}>${esc(m.nom_rp)} · ${esc(role(m.role).court)}</option>`).join('')}</select>`;
  } else if (v.medecin_id && v.medecin_id !== etat.moi.id) {
    selectMedecin = `<select name="medecin_id" disabled><option value="${v.medecin_id}">${esc(medecinActuel?.nom_rp || 'Autre médecin')}</option></select>`;
  } else {
    // Un médecin peut se désigner lui-même ; seul le responsable retire ou change un référent.
    const peutLaisserLibre = !d || !v.medecin_id;
    selectMedecin = `<select name="medecin_id">
      <option value="${etat.moi.id}" ${v.medecin_id === etat.moi.id || !d ? 'selected' : ''}>Moi (${esc(etat.moi.nom_rp)})</option>
      ${peutLaisserLibre ? `<option value="" ${d && !v.medecin_id ? 'selected' : ''}>Non attribué</option>` : ''}</select>`;
  }

  return `
    <section class="section-form">
      <h2><span class="numero">04</span> Suivi</h2>
      <div class="grille-champs">
        ${d ? '' : champ('Statut', `<select name="statut">${STATUTS.filter(s => s.id !== 'cloture').map(s =>
          `<option value="${s.id}" ${s.id === v.statut ? 'selected' : ''}>${s.emoji} ${esc(s.label)}</option>`).join('')}</select>`)}
        ${champ('Médecin référent', selectMedecin)}
        ${champ('Parcours de soin', `<select name="parcours">${Object.entries(PARCOURS).map(([cle, p]) =>
          `<option value="${cle}" ${cle === v.parcours ? 'selected' : ''}>${esc(p.label)} · ${esc(p.detail)}</option>`).join('')}</select>`,
          '', d ? 'Changer de parcours le fait repartir à la première étape.' : 'Proposé automatiquement selon les catégories.')}
        ${champ('Prochain rendez-vous (IRL)', `<input type="date" name="prochain_rdv" value="${esc(v.prochain_rdv || '')}">`)}
        <div class="champ large">
          <label class="interrupteur"><input type="checkbox" name="consentement_irs" ${v.consentement_irs ? 'checked' : ''}>
            <span><strong>Le patient accepte la transmission à l’IRS</strong>
            <span class="aide">Sans cet accord, aucun prélèvement n’est transmis et les référents IRS ne voient pas le dossier.</span></span></label>
        </div>
        ${champ('Plan de suivi en cours', zone('plan_suivi', v.plan_suivi, 3, 'placeholder="Objectifs, examens prévus, rythme des rendez-vous…"'), 'large')}
      </div>
    </section>`;
}

function pasAcces(vue, message) {
  vue.innerHTML = `<div class="page"><div class="vide"><span class="grande-icone" aria-hidden="true">🔒</span>
    <strong>Accès impossible</strong><p>${esc(message)}</p>
    <a class="btn" href="#/">${icone('retour')} Retour à l’accueil</a></div></div>`;
}
