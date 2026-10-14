// Écrans hors application : configuration, connexion, attente de validation, mot de passe.

import { auth, connexionDiscord } from '../api.js';
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
        <li>Copie l’URL du projet et la clé publique <code>anon</code> dans <code>config.js</code>.</li>
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
    <div class="segmente" role="tablist" aria-label="Connexion ou demande d’accès">
      <button type="button" role="tab" data-mode="connexion">Connexion</button>
      <button type="button" role="tab" data-mode="inscription">Demander un accès</button>
    </div>

    <form class="form-connexion" data-form="connexion" novalidate>
      <label class="champ"><span class="etiquette">Adresse e-mail</span>
        <input type="email" name="email" autocomplete="email" required placeholder="nom@exemple.com"></label>
      <label class="champ"><span class="etiquette">Mot de passe</span>
        <input type="password" name="password" autocomplete="current-password" required placeholder="••••••••"></label>
      <button type="submit" class="btn btn-primaire btn-large">Se connecter</button>
      <button type="button" class="lien-discret" data-action="oubli">Mot de passe oublié ?</button>
    </form>

    <form class="form-connexion" data-form="inscription" novalidate hidden>
      <label class="champ"><span class="etiquette">Nom de ton personnage <span class="requis">*</span></span>
        <input name="nom_rp" required maxlength="80" placeholder="ex. Akiyama Ren" autocomplete="nickname"></label>
      <label class="champ"><span class="etiquette">Pseudo Discord</span>
        <input name="pseudo_discord" maxlength="80" placeholder="ex. ren.akiyama"></label>
      <label class="champ"><span class="etiquette">Adresse e-mail <span class="requis">*</span></span>
        <input type="email" name="email" autocomplete="email" required placeholder="nom@exemple.com"></label>
      <label class="champ"><span class="etiquette">Mot de passe <span class="requis">*</span></span>
        <input type="password" name="password" autocomplete="new-password" required minlength="6" placeholder="6 caractères minimum"></label>
      <button type="submit" class="btn btn-primaire btn-large">Envoyer ma demande</button>
      <p class="aide" style="text-align:center">Le responsable de la branche validera ton accès.</p>
    </form>

    ${connexionDiscord ? `
      <div class="separateur" style="margin-top:18px">ou</div>
      <button type="button" class="btn btn-large" style="margin-top:14px" data-action="discord">${icone('message')} Continuer avec Discord</button>` : ''}
    ${mention}`);

  const changerMode = m => {
    c.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mode === m)));
    c.querySelectorAll('[data-form]').forEach(f => { f.hidden = f.dataset.form !== m; });
    c.querySelector(`[data-form="${m}"] input`)?.focus();
  };
  changerMode(mode);

  c.addEventListener('click', async e => {
    const onglet = e.target.closest('[data-mode]');
    if (onglet) return changerMode(onglet.dataset.mode);
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'oubli') {
      const email = c.querySelector('[data-form="connexion"] [name=email]').value.trim();
      if (!email) return toast('Saisis d’abord ton adresse e-mail.', 'erreur');
      try {
        await auth.motDePasseOublie(email);
        toast('Si un compte existe, un e-mail pour choisir un nouveau mot de passe vient d’être envoyé.', 'succes');
      } catch (err) { toast(err.message, 'erreur'); }
    }
    if (action === 'discord') {
      try { await auth.connexionDiscord(); } catch (err) { toast(err.message, 'erreur'); }
    }
  });

  c.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;
    const d = Object.fromEntries(new FormData(form));
    const bouton = form.querySelector('[type=submit]');
    bouton.classList.add('charge');
    try {
      if (form.dataset.form === 'connexion') {
        await auth.connexion(d.email.trim(), d.password);
        // La suite est gérée par l'écouteur de session (main.js).
      } else {
        const r = await auth.inscription(d.email.trim(), d.password, {
          nom_rp: d.nom_rp.trim(),
          pseudo_discord: d.pseudo_discord.trim(),
        });
        if (!r.session) {
          carte(racine, `
            <div class="message-ecran">
              <div class="grande-icone" aria-hidden="true">✉️</div>
              <h2>Confirme ton e-mail</h2>
              <p>Un lien de confirmation vient d’être envoyé à <strong>${esc(d.email)}</strong>. Clique dessus, puis connecte-toi.</p>
              <button class="btn btn-primaire" data-retour>Retour à la connexion</button>
            </div>`).querySelector('[data-retour]').addEventListener('click', () => ecranConnexion(racine));
        }
      }
    } catch (err) {
      toast(err.message, 'erreur');
    } finally {
      bouton.classList.remove('charge');
    }
  });
}

export function ecranNouveauMotDePasse(racine, { termine }) {
  const c = carte(racine, `
    <header class="connexion-tete">
      ${sceau}
      <h1>Seimei</h1>
      <p>Nouveau mot de passe</p>
    </header>
    <form class="form-connexion" novalidate>
      <label class="champ"><span class="etiquette">Nouveau mot de passe</span>
        <input type="password" name="password" autocomplete="new-password" required minlength="6" placeholder="6 caractères minimum"></label>
      <label class="champ"><span class="etiquette">Confirmation</span>
        <input type="password" name="confirmation" autocomplete="new-password" required minlength="6"></label>
      <button type="submit" class="btn btn-primaire btn-large">Enregistrer</button>
    </form>
    ${mention}`);
  c.querySelector('input').focus();
  c.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;
    const { password, confirmation } = Object.fromEntries(new FormData(form));
    if (password !== confirmation) return toast('Les deux mots de passe ne correspondent pas.', 'erreur');
    const bouton = form.querySelector('[type=submit]');
    bouton.classList.add('charge');
    try {
      await auth.changerMotDePasse(password);
      toast('Mot de passe enregistré.', 'succes');
      termine();
    } catch (err) {
      toast(err.message, 'erreur');
    } finally {
      bouton.classList.remove('charge');
    }
  });
}
