// Écrans hors application : configuration, connexion, attente de validation.

import { auth, CONFIRMATION_ACTIVE } from '../api.js';
import { esc, icone, toast } from '../ui.js';

const fond = '<div class="kanji-fond" aria-hidden="true"><span>生</span><span>命</span></div>';
const sceau = '<div class="sceau" aria-hidden="true"><span>生</span><span>命</span></div>';
const mention = `<p class="mention-secret">${icone('cadenas')} Accès confidentiel · données couvertes par le secret médical</p>`;

function carte(racine, contenu) {
  racine.innerHTML = `<main class="ecran-centre">${fond}<section class="carte-connexion">${contenu}</section></main>`;
  return racine.querySelector('.carte-connexion');
}

export function ecranChargement(racine, message = '') {
  racine.innerHTML = `<main class="ecran-centre"><div class="message-ecran">
    <div class="chargeur" role="status" aria-label="Chargement"></div>
    ${message ? `<p>${esc(message)}</p>` : ''}</div></main>`;
}

export function ecranConfiguration(racine) {
  carte(racine, `
    <div class="message-ecran">
      ${sceau}
      <h2>Base de données à relier</h2>
      <p>Le site n’est pas encore relié à ta base Supabase. Trois étapes :</p>
      <ol class="etapes-config">
        <li>Dans Supabase, exécute le fichier <code>supabase/schema.sql</code> (SQL Editor → Run).</li>
        <li>Copie l’URL du projet et la clé publique (<code>publishable</code> ou <code>anon</code>) dans <code>config.js</code>.</li>
        <li>Enregistre le fichier, puis recharge cette page.</li>
      </ol>
    </div>
    ${mention}`);
}

export function ecranErreur(racine, message, { reessayer, deconnecter } = {}) {
  const c = carte(racine, `
    <div class="message-ecran">
      <div class="grande-icone" aria-hidden="true">⚠️</div>
      <h2>Un souci est survenu</h2>
      <p>${esc(message)}</p>
      <div class="actions-page">
        ${reessayer ? `<button class="btn btn-primaire" data-action="reessayer">${icone('actualiser')} Réessayer</button>` : ''}
        ${deconnecter ? `<button class="btn" data-action="deconnecter">${icone('sortie')} Se déconnecter</button>` : ''}
      </div>
    </div>`);
  c.addEventListener('click', e => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'reessayer') reessayer();
    if (action === 'deconnecter') deconnecter();
  });
}

export function ecranAttente(racine, moi, { desactive = false, actualiser, deconnecter }) {
  const c = carte(racine, `
    <div class="message-ecran">
      <div class="grande-icone" aria-hidden="true">${desactive ? '🔒' : '⏳'}</div>
      <h2>${desactive ? 'Accès désactivé' : 'Demande envoyée'}</h2>
      <p>${desactive
        ? 'Ton accès à la branche a été désactivé. Contacte le responsable de la branche si c’est une erreur.'
        : `Bienvenue ${esc(moi?.nom_rp || '')} ! Le responsable de la branche doit maintenant valider ton accès et te donner un rôle.`}</p>
      <div class="actions-page">
        ${desactive ? '' : `<button class="btn btn-primaire" data-action="actualiser">${icone('actualiser')} Vérifier mon accès</button>`}
        <button class="btn" data-action="deconnecter">${icone('sortie')} Se déconnecter</button>
      </div>
    </div>
    ${mention}`);
  c.addEventListener('click', async e => {
    const bouton = e.target.closest('[data-action]');
    if (!bouton) return;
    bouton.classList.add('charge');
    if (bouton.dataset.action === 'actualiser') await actualiser();
    if (bouton.dataset.action === 'deconnecter') await deconnecter();
    bouton.classList.remove('charge');
  });
}

export function ecranConnexion(racine, { mode = 'connexion' } = {}) {
  const c = carte(racine, `
    <header class="connexion-tete">
      ${sceau}
      <h1>Seimei</h1>
      <p>Suivi des pathologies</p>
    </header>
    <div class="segmente" role="tablist" aria-label="Connexion ou création de compte">
      <button type="button" role="tab" data-mode="connexion">Connexion</button>
      <button type="button" role="tab" data-mode="inscription">Créer un compte</button>
    </div>

    <form class="form-connexion" data-form="connexion" novalidate>
      <label class="champ"><span class="etiquette">Nom Prénom RP</span>
        <input name="nom_rp" required maxlength="80" autocomplete="username" placeholder="ex. Hoki Ren" autocapitalize="words"></label>
      <label class="champ"><span class="etiquette">Code</span>
        <input type="password" name="code" autocomplete="current-password" required placeholder="••••••"></label>
      <button type="submit" class="btn btn-primaire btn-large">Se connecter</button>
      <p class="aide centre">Code oublié ? Le responsable de la branche peut t’en donner un nouveau.</p>
    </form>

    <form class="form-connexion" data-form="inscription" novalidate hidden>
      <p class="aide">Réservé à l’équipe de la branche et aux chercheurs de l’IRS. Le responsable valide chaque compte.</p>
      <label class="champ"><span class="etiquette">Nom Prénom RP <span class="requis">*</span></span>
        <input name="nom_rp" required maxlength="80" autocomplete="username" placeholder="ex. Hoki Ren" autocapitalize="words">
        <span class="aide">Le nom de ton personnage, comme sur Discord. Il te servira pour te connecter.</span></label>
      <label class="champ"><span class="etiquette">Code <span class="requis">*</span></span>
        <input type="password" name="code" autocomplete="new-password" required minlength="6" placeholder="6 caractères minimum"></label>
      <label class="champ"><span class="etiquette">Confirme ton code <span class="requis">*</span></span>
        <input type="password" name="confirmation" autocomplete="new-password" required minlength="6"></label>
      <button type="submit" class="btn btn-primaire btn-large">Créer mon compte</button>
    </form>
    ${mention}`);

  const changerMode = m => {
    c.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mode === m)));
    c.querySelectorAll('[data-form]').forEach(f => { f.hidden = f.dataset.form !== m; });
    c.querySelector(`[data-form="${m}"] input`)?.focus();
  };
  changerMode(mode);

  c.addEventListener('click', e => {
    const onglet = e.target.closest('[data-mode]');
    if (onglet) changerMode(onglet.dataset.mode);
  });

  c.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;
    const d = Object.fromEntries(new FormData(form));
    const nomRp = d.nom_rp.trim().replace(/\s+/g, ' ');
    if (!/\p{L}/u.test(nomRp)) return toast('Écris le nom de ton personnage.', 'erreur');
    if (form.dataset.form === 'inscription' && d.code !== d.confirmation) {
      return toast('Les deux codes ne correspondent pas.', 'erreur');
    }
    const bouton = form.querySelector('[type=submit]');
    bouton.classList.add('charge');
    try {
      if (form.dataset.form === 'connexion') {
        await auth.connexion(nomRp, d.code);
      } else {
        const r = await auth.inscription(nomRp, d.code);
        // Sans session, Supabase attend une confirmation par e-mail, impossible ici.
        if (!r.session) toast(CONFIRMATION_ACTIVE, 'erreur');
      }
      // La suite est gérée par l'écouteur de session (main.js).
    } catch (err) {
      toast(err.message, 'erreur');
    } finally {
      bouton.classList.remove('charge');
    }
  });
}
