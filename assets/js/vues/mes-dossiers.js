// Accueil d'un joueur : ses dossiers et l'ouverture d'une demande de suivi.

import { etat } from '../etat.js';
import { esc, icone } from '../ui.js';
import { estNouveau } from '../vus.js';
import { carteDossier } from './dossiers.js';

export function rendreMesDossiers(vue) {
  const { moi } = etat;
  const mes = etat.dossiers.filter(d => d.patient_id === moi.id);
  const enCours = mes.filter(d => d.statut !== 'cloture');
  const clotures = mes.filter(d => d.statut === 'cloture');
  const nouveaux = mes.filter(estNouveau).length;

  const sousTitre = !mes.length
    ? 'Ouvre une demande de suivi pour ton personnage : un médecin de la branche la prendra en charge.'
    : nouveaux === 1 ? 'Du nouveau dans un de tes dossiers depuis ta dernière visite.'
    : nouveaux > 1 ? `Du nouveau dans ${nouveaux} de tes dossiers depuis ta dernière visite.`
    : 'Retrouve ici le suivi médical de tes personnages.';

  vue.innerHTML = `
    <div class="page">
      <header class="entete-page">
        <div>
          <p class="surtitre">Mon suivi médical</p>
          <h1 class="titre-page">Bonjour, ${esc(moi.nom_rp)}</h1>
          <p class="sous-titre">${esc(sousTitre)}</p>
        </div>
        <div class="actions-page">
          <a class="btn btn-primaire" href="#/dossiers/nouveau">${icone('plus')} Nouvelle demande de suivi</a>
        </div>
      </header>

      ${mes.length ? `
        <section class="pile">
          <h2 class="titre-section">Dossiers en cours <span class="nombre">${enCours.length}</span></h2>
          ${enCours.length ? `<div class="grille-dossiers">${enCours.map((d, i) => carteDossier(d, i)).join('')}</div>`
            : '<p class="aide">Aucun dossier en cours.</p>'}
        </section>
        ${clotures.length ? `
          <section class="pile">
            <h2 class="titre-section">Dossiers clôturés <span class="nombre">${clotures.length}</span></h2>
            <div class="grille-dossiers">${clotures.map((d, i) => carteDossier(d, i, true)).join('')}</div>
          </section>` : ''}`
      : `
        <section class="panneau">
          <div class="panneau-titre"><h2>${icone('coeur')} Comment ça marche ?</h2></div>
          <ol class="liste-etapes">
            <li><span class="num">1</span><div><strong>Ouvre une demande de suivi</strong>
              <p>Remplis la fiche patient de ton personnage : identité, pathologie et ce que tu souhaites développer en RP.</p></div></li>
            <li><span class="num">2</span><div><strong>Un médecin prend en charge ton dossier</strong>
              <p>Il devient ton médecin référent et organise avec toi le premier rendez-vous RP.</p></div></li>
            <li><span class="num">3</span><div><strong>Suis ton dossier ici</strong>
              <p>Comptes rendus, résultats d’analyses et traitements y sont consignés, et tu peux échanger avec l’équipe par messages.</p></div></li>
          </ol>
          <a class="btn btn-primaire" href="#/dossiers/nouveau" style="width:fit-content">${icone('plus')} Ouvrir ma première demande</a>
        </section>`}

      <p class="aide ligne-info">${icone('cadenas')} Ton dossier n’est visible que par toi, l’équipe de la branche et, avec ton accord, les chercheurs de l’IRS.
        <a href="#/guide">Comment fonctionne la branche ?</a></p>
    </div>`;
}
