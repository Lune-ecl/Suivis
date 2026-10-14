// Création et modification d'un dossier : fiche patient et informations de suivi.

import { api } from '../api.js';
import { etat, peut } from '../etat.js';
import { CATEGORIES, STATUTS, PARCOURS, ORIGINES, CLANS, parcoursConseille, role } from '../constantes.js';
import { esc, icone, nomComplet, toast } from '../ui.js';

const champ = (etiquette, html, classe = '', aide = '') =>
  `<label class="champ ${classe}"><span class="etiquette">${etiquette}</span>${html}${aide ? `<span class="aide">${aide}</span>` : ''}</label>`;
const texte = (nom, v, attributs = '') => `<input name="${nom}" value="${esc(v || '')}" ${attributs}>`;
const zone = (nom, v, lignes = 3, attributs = '') => `<textarea name="${nom}" rows="${lignes}" ${attributs}>${esc(v || '')}</textarea>`;
const requis = '<span class="requis" aria-hidden="true">*</span>';

const CHAMPS_FICHE = ['prenom', 'nom', 'age', 'grade', 'section', 'clan', 'village', 'pathologie', 'origine', 'apparition',
  'symptomes', 'antecedents', 'traitements_essayes', 'suivi_a_realiser', 'joueur', 'souhaits_rp', 'limites', 'disponibilites'];

export async function rendreFormulaire(vue, id) {
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

  vue.innerHTML = `
    <div class="page">
      <a class="retour" href="${retour}">${icone('retour')} ${d ? esc(nomComplet(d)) : 'Dossiers'}</a>
      <header class="entete-page">
        <div>
          <p class="surtitre">${d ? 'Modifier la fiche' : 'Ouverture d’un dossier'}</p>
          <h1 class="titre-page">${d ? esc(nomComplet(d)) : 'Nouveau dossier'}</h1>
          <p class="sous-titre">La fiche patient, puis les informations de suivi.</p>
        </div>
      </header>

      <form class="formulaire" novalidate>
        <section class="section-form">
          <h2><span class="numero">01</span> Patient</h2>
          <div class="grille-champs">
            ${champ(`Prénom ${requis}`, texte('prenom', v.prenom, 'maxlength="80" autocomplete="off" placeholder="ex. Ren"'))}
            ${champ('Nom', texte('nom', v.nom, 'maxlength="80" autocomplete="off" placeholder="ex. Hoki"'))}
            ${champ('Grade', texte('grade', v.grade, 'maxlength="80"'))}
            ${champ('Section', texte('section', v.section, 'maxlength="80"'))}
            ${champ('Clan', `<select name="clan"><option value="">Non renseigné</option>${CLANS.map(c =>
              `<option value="${c.id}" ${c.id === v.clan ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select>`)}
            ${champ('Âge', texte('age', v.age, 'maxlength="40"'))}
            ${champ('Village', texte('village', v.village, 'maxlength="120"'), 'large')}
          </div>
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
    if (!form.prenom.value.trim() && !form.nom.value.trim()) {
      form.prenom.focus();
      return toast('Indique au moins le prénom du patient.', 'erreur');
    }
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

  form.querySelector('[name=prenom]').focus();
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
