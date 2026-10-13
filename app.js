/* =========================================================
   Gestion des suivis — tout est stocké dans le navigateur
   (localStorage). Exporter régulièrement depuis Réglages.
   ========================================================= */

const CLE_STOCKAGE = 'suivis-v1';

const STADES_DEFAUT = [
  { nom: 'Initié', cle: 'initie', seuil: 7, unite: 'narrations', surDecision: false },
  { nom: 'Adepte', cle: 'adepte', seuil: 14, unite: 'jours', surDecision: false },
  { nom: 'Expert', cle: 'expert', seuil: 18, unite: 'jours', surDecision: true },
  { nom: 'Maître', cle: 'maitre', seuil: 0, unite: 'jours', surDecision: false },
];

const MODELES_DEFAUT = {
  enCours:
    'Merci pour ta narration {nom} ! 📜\n' +
    'Tu es actuellement {stade} et tu en es à {compte}/{seuil} {unite}. ' +
    'Encore {restant} {unite} avant de pouvoir passer {prochain}. Continue comme ça ! 💪',
  atteint:
    'Bravo {nom} ! 🎉\n' +
    'Avec cette narration tu atteins {compte}/{seuil} {unite} au stade {stade}. ' +
    'Tu remplis les conditions pour passer {prochain}, ton passage va être fait !',
  depasse:
    'Merci pour ta narration {nom} ! 📜\n' +
    'Tu as atteint le maximum au stade {stade} ({compte}/{seuil} {unite}). ' +
    'Ton passage {prochain} doit être fait, pense à le signaler !',
  surDecision:
    'Bravo {nom} ! 🎉\n' +
    'Tu as {compte}/{seuil} {unite} au stade {stade}. ' +
    'Le passage {prochain} n\'est pas automatique : il se fera sur décision. ' +
    'Continue à narrer, ton travail est remarqué !',
  dernier:
    'Merci pour ta narration {nom} ! 📜\n' +
    'Au stade {stade}, tu en es à {total} narrations au total. ' +
    'Merci de continuer à faire vivre {village} !',
  retour:
    'Content de te revoir {nom} après ton absence ({raison}) ! 👋\n',
};

const LIBELLES_MODELES = {
  enCours: 'En cours de progression',
  atteint: 'Seuil atteint (passage possible)',
  depasse: 'Seuil dépassé (passage en retard)',
  surDecision: 'Seuil atteint, passage sur décision (ex. Expert → Maître)',
  dernier: 'Dernier stade (Maître)',
  retour: 'Ajouté au début si la personne revient d\'absence ({raison} disponible)',
};

const EXEMPLES_DEFAUT = `L'entraînement de Senma lui permet de reprendre les bases du Kaiseki Kenshin, appris auprès de Katori. Si la maîtrise de son chakra lui semble aisée dans ce cadre paisible, les difficultés rencontrées lorsque son attention est perturbée lui rappellent à quel point la concentration est essentielle, d'autant plus qu'un hôpital est rarement un lieu silencieux. Il lui serait désormais judicieux de s'entraîner dans des endroits plus animés, afin d'apprendre à rester concentré malgré ce qui l'entoure.

Zennon revient sur ses points faibles, travaillant sa concentration, la circulation de son chakra ainsi que la stabilité de sa sphère lors de ses déplacements. Ses efforts portent leurs fruits, et ses progrès lui permettent désormais de s'atteler à l'apprentissage du Kaiseki Kenshin.

Seiya aborde cette fois-ci son entraînement en travaillant d'abord la circulation de son chakra, qu'il s'efforce de diriger vers ses bras, ses mains puis ses jambes de la manière la plus régulière possible. Il s'exerce par la suite à le modeler, une première fois sous la forme d'une sphère et une seconde sous une forme plus allongée ou plus étendue, en ajustant la quantité de chakra mobilisée. Les pauses qu'il s'accorde lui permettent de retrouver une meilleure stabilité, et il finit même par associer circulation et modelage dans un même exercice. Il devrait désormais apprendre à réaliser cet exercice combiné jusqu'au bout en travaillant le contrôle, la stabilité et l'intensité de son chakra, afin que chaque changement de forme se fasse sans la moindre perte de maîtrise.`;

const IA_DEFAUT = {
  modele: 'claude-opus-5-5',
  exemples: EXEMPLES_DEFAUT,
  consignes: '',
  ajouterProgression: false,
};

// La clé API reste dans ce navigateur : elle n'est jamais incluse dans l'export.
const CLE_API = 'suivis-cle-api';
const lireCleApi = () => { try { return localStorage.getItem(CLE_API) || ''; } catch { return ''; } };
const ecrireCleApi = v => { try { v ? localStorage.setItem(CLE_API, v) : localStorage.removeItem(CLE_API); } catch {} };

/* ---------------- Données ---------------- */

let donnees = charger();

function etatVide() {
  return {
    personnes: [],
    narrations: [],
    absences: [],
    reglages: {
      stades: structuredClone(STADES_DEFAUT),
      modeles: structuredClone(MODELES_DEFAUT),
      ia: structuredClone(IA_DEFAUT),
    },
  };
}

function charger() {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (brut) {
      const d = JSON.parse(brut);
      const base = etatVide();
      return {
        ...base,
        ...d,
        reglages: {
          stades: d.reglages?.stades || base.reglages.stades,
          modeles: { ...base.reglages.modeles, ...(d.reglages?.modeles || {}) },
          ia: { ...base.reglages.ia, ...(d.reglages?.ia || {}) },
        },
      };
    }
  } catch (e) {
    console.error(e);
  }
  return etatVide();
}

function sauver() {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(donnees));
  } catch (e) {
    toast('⚠️ Impossible d\'enregistrer (stockage indisponible)');
  }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------------- Dates ---------------- */

function iso(d) {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
const aujourdhui = () => iso(new Date());
const versDate = s => new Date(s + 'T12:00:00');
const ajouterJours = (s, n) => { const d = versDate(s); d.setDate(d.getDate() + n); return iso(d); };
const fr = s => s ? versDate(s).toLocaleDateString('fr-FR') : '—';
function lundi(s) {
  const d = versDate(s);
  const j = (d.getDay() + 6) % 7; // lundi = 0
  d.setDate(d.getDate() - j);
  return iso(d);
}

/* ---------------- Calculs ---------------- */

const stades = () => donnees.reglages.stades;
const infoStade = nom => stades().find(s => s.nom === nom) || stades()[0];
const indexStade = nom => stades().findIndex(s => s.nom === nom);
const classeStade = nom => 's-' + (infoStade(nom).cle || 'initie');

const narrationsDe = id => donnees.narrations.filter(n => n.personneId === id);
const absencesDe = id => donnees.absences.filter(a => a.personneId === id);

function progression(p) {
  const st = infoStade(p.stade);
  const idx = indexStade(p.stade);
  const prochain = stades()[idx + 1]?.nom || '';
  const narrs = narrationsDe(p.id).filter(n => n.stade === p.stade);
  const jours = new Set(narrs.map(n => n.date)).size;
  const compte = st.unite === 'jours' ? jours : narrs.length;
  const seuil = Number(st.seuil) || 0;
  return {
    stade: st,
    prochain,
    compte,
    jours,
    seuil,
    restant: Math.max(0, seuil - compte),
    pourcent: seuil ? Math.min(100, Math.round((compte / seuil) * 100)) : 100,
    pret: !!seuil && !!prochain && compte >= seuil,
    total: narrationsDe(p.id).length,
  };
}

function absenceEn(p, debut, fin) {
  return absencesDe(p.id).filter(a => a.debut <= fin && (a.fin || a.debut) >= debut);
}

function derniereNarration(p) {
  return narrationsDe(p.id).map(n => n.date).sort().pop() || '';
}

/* ---------------- Génération de réponse ---------------- */

function remplir(modele, vars) {
  return modele.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

function messageProgression(p, narration) {
  const pr = progression(p);
  const m = donnees.reglages.modeles;
  let cle;
  if (!pr.seuil || !pr.prochain) cle = 'dernier';
  else if (pr.compte >= pr.seuil && pr.stade.surDecision) cle = 'surDecision';
  else if (pr.compte > pr.seuil) cle = 'depasse';
  else if (pr.compte === pr.seuil) cle = 'atteint';
  else cle = 'enCours';

  const vars = {
    nom: p.nom,
    village: p.village,
    stade: p.stade,
    compte: pr.compte,
    seuil: pr.seuil,
    restant: pr.restant,
    unite: pr.stade.unite,
    prochain: pr.prochain,
    total: pr.total,
    date: fr(narration.date),
    raison: '',
  };

  let texte = remplir(m[cle], vars);

  // Retour d'absence : absence terminée dans les 7 jours précédents,
  // sans autre narration entre la fin de l'absence et celle-ci.
  const retour = absencesDe(p.id)
    .filter(a => {
      const fin = a.fin || a.debut;
      return fin < narration.date && fin >= ajouterJours(narration.date, -7);
    })
    .sort((a, b) => (a.fin || a.debut).localeCompare(b.fin || b.debut))
    .pop();
  if (retour) {
    const fin = retour.fin || retour.debut;
    const dejaRevenu = narrationsDe(p.id).some(n => n.id !== narration.id && n.date > fin && n.date <= narration.date);
    if (!dejaRevenu) texte = remplir(m.retour, { ...vars, raison: retour.raison || 'absence' }) + texte;
  }
  return texte;
}

/* ---------------- Retour rédigé par Claude ---------------- */

const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.129.0/+esm';

function construirePrompt(p, narration) {
  const ia = donnees.reglages.ia;
  const pr = progression(p);

  const system =
`Tu rédiges les retours de suivi d'un jeu de rôle narratif dans un univers ninja (chakra, villages, techniques, maîtres). Pour chaque narration d'entraînement envoyée par un joueur, tu écris un retour sur son personnage.

Règles :
- En français soutenu et fluide, à la troisième personne, au présent, en nommant le personnage. Ne t'adresse jamais au joueur.
- Un seul paragraphe de 3 à 5 phrases : sans titre, sans liste, sans emoji, sans guillemets autour du texte.
- Résume précisément ce que le personnage a travaillé dans cette narration, en reprenant ses éléments concrets (techniques, lieux, personnes, exercices). Souligne ce qui fonctionne et les difficultés rencontrées.
- Termine par une piste concrète pour la suite, ou indique qu'il peut passer à l'étape suivante si ses progrès le justifient.
- Reste cohérent avec l'avancement du personnage et ses retours précédents : prolonge les pistes déjà données, ne lui reconseille pas ce qu'il a déjà acquis.
- N'invente aucun événement absent de la narration.
- Réponds uniquement avec le texte du retour.

Exemples de retours dont tu reprends le ton, la longueur et la construction :
<exemples>
${ia.exemples.trim()}
</exemples>${ia.consignes.trim() ? `

Consignes supplémentaires :
${ia.consignes.trim()}` : ''}`;

  const precedentes = narrationsDe(p.id)
    .filter(n => n.id !== narration.id)
    .sort((a, b) => a.date.localeCompare(b.date) || a.cree - b.cree)
    .slice(-3);
  const abs = absencesDe(p.id)
    .filter(a => (a.fin || a.debut) >= ajouterJours(narration.date, -14) && a.debut <= narration.date)
    .map(a => `${fr(a.debut)} → ${fr(a.fin)} : ${a.raison || 'sans raison'}`);

  const user =
`<personnage>
Nom : ${p.nom}
Village : ${p.village}
Stade : ${p.stade}${pr.seuil ? ` (${pr.compte}/${pr.seuil} ${pr.stade.unite}${pr.prochain ? `, prochain stade : ${pr.prochain}` : ''})` : ''}
Narrations au total : ${pr.total}${p.notes ? `\nNotes du suivi : ${p.notes}` : ''}${abs.length ? `\nAbsences récentes : ${abs.join(' ; ')}` : ''}
</personnage>

<historique>
${precedentes.map(n => `<narration date="${fr(n.date)}">
${n.texte || '(vide)'}
</narration>
<retour>
${n.reponse || '(aucun)'}
</retour>`).join('\n') || 'Première narration suivie.'}
</historique>

<narration_a_traiter date="${fr(narration.date)}">
${narration.texte}
</narration_a_traiter>

Rédige le retour pour cette narration.`;

  return { system, user };
}

async function genererRetourIA(p, narration) {
  const { default: Anthropic } = await import(SDK_URL);
  const client = new Anthropic({ apiKey: lireCleApi(), dangerouslyAllowBrowser: true });
  const { system, user } = construirePrompt(p, narration);
  const reponse = await client.beta.messages.create({
    model: donnees.reglages.ia.modele || IA_DEFAUT.modele,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system,
    messages: [{ role: 'user', content: user }],
  });
  if (reponse.stop_reason === 'refusal') throw new Error('Claude a refusé de rédiger ce retour.');
  const texte = reponse.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
  if (!texte) throw new Error('Réponse vide.');
  return texte;
}

// Produit la réponse finale : retour rédigé par Claude si une clé est configurée,
// sinon le message de progression.
async function produireReponse(p, n) {
  const progressionTxt = messageProgression(p, n);
  if (!lireCleApi()) return progressionTxt;
  const retour = await genererRetourIA(p, n);
  return donnees.reglages.ia.ajouterProgression ? `${retour}\n\n${progressionTxt}` : retour;
}

/* ---------------- Utilitaires UI ---------------- */

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(msg, duree = 1800) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('visible'), duree);
}

async function copier(texte) {
  try {
    await navigator.clipboard.writeText(texte);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = texte;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  toast('📋 Copié !');
}

const villages = () => [...new Set(donnees.personnes.map(p => p.village).filter(Boolean))].sort((a, b) => a.localeCompare(b));

function optionsFiltre(select, libelleTous, valeurs) {
  const actuel = select.value;
  select.innerHTML = `<option value="">${libelleTous}</option>` +
    valeurs.map(v => `<option${v === actuel ? ' selected' : ''}>${esc(v)}</option>`).join('');
}

function rafraichirFiltres() {
  const v = villages();
  const s = stades().map(x => x.nom);
  optionsFiltre($('#filtre-village'), 'Tous les villages', v);
  optionsFiltre($('#tab-village'), 'Tous les villages', v);
  optionsFiltre($('#filtre-stade'), 'Tous les stades', s);
  optionsFiltre($('#tab-stade'), 'Tous les stades', s);
  $('#liste-villages').innerHTML = v.map(x => `<option value="${esc(x)}">`).join('');
}

function tout() {
  rafraichirFiltres();
  rendreCasiers();
  rendreTableau();
  rendreRapport();
}

/* ---------------- Onglets ---------------- */

document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === b));
  document.querySelectorAll('.page').forEach(x => x.classList.toggle('active', x.id === 'page-' + b.dataset.page));
  if (b.dataset.page === 'reglages') rendreReglages();
}));

/* ---------------- Casiers ---------------- */

function personnesFiltrees(village, stade, recherche = '') {
  const r = recherche.trim().toLowerCase();
  return donnees.personnes
    .filter(p => (!village || p.village === village) && (!stade || p.stade === stade) && (!r || p.nom.toLowerCase().includes(r)))
    .sort((a, b) => a.village.localeCompare(b.village) || a.nom.localeCompare(b.nom));
}

function rendreCasiers() {
  const liste = personnesFiltrees($('#filtre-village').value, $('#filtre-stade').value, $('#recherche').value);
  const auj = aujourdhui();
  $('#casiers').innerHTML = liste.length ? liste.map(p => {
    const pr = progression(p);
    const absent = absenceEn(p, auj, auj).length > 0;
    return `
      <div class="casier ${classeStade(p.stade)}" data-id="${p.id}">
        <h3>${esc(p.nom)}</h3>
        <div class="meta">🏘️ ${esc(p.village)}</div>
        <div>
          <span class="badge">${esc(p.stade)}</span>
          ${pr.pret ? `<span class="badge pret">${pr.stade.surDecision ? 'Éligible' : 'Prêt'} → ${esc(pr.prochain)}</span>` : ''}
          ${absent ? '<span class="badge absent">Absent</span>' : ''}
        </div>
        ${pr.seuil ? `<div class="barre"><div style="width:${pr.pourcent}%"></div></div>
        <div class="meta">${pr.compte}/${pr.seuil} ${esc(pr.stade.unite)}</div>`
        : `<div class="meta">${pr.total} narrations au total</div>`}
        <div class="meta">Dernière narration : ${fr(derniereNarration(p))}</div>
      </div>`;
  }).join('') : '<div class="vide">Aucune personne. Clique sur « + Nouvelle personne » pour créer un casier.</div>';
}

$('#casiers').addEventListener('click', e => {
  const c = e.target.closest('.casier');
  if (c) ouvrirFiche(c.dataset.id);
});
['#recherche', '#filtre-village', '#filtre-stade'].forEach(s => $(s).addEventListener('input', rendreCasiers));

/* ---------------- Formulaire personne ---------------- */

function editerPersonne(id) {
  const dlg = $('#form-personne');
  const f = dlg.querySelector('form');
  const p = donnees.personnes.find(x => x.id === id);
  f.stade.innerHTML = stades().map(s => `<option>${esc(s.nom)}</option>`).join('');
  $('#form-titre').textContent = p ? 'Modifier ' + p.nom : 'Nouvelle personne';
  f.nom.value = p?.nom || '';
  f.village.value = p?.village || '';
  f.stade.value = p?.stade || stades()[0].nom;
  f.notes.value = p?.notes || '';
  dlg.returnValue = '';
  dlg.onclose = () => {
    if (dlg.returnValue !== 'ok') return;
    const valeurs = { nom: f.nom.value.trim(), village: f.village.value.trim(), stade: f.stade.value, notes: f.notes.value.trim() };
    if (!valeurs.nom) return;
    if (p) {
      if (p.stade !== valeurs.stade) p.historique.push({ stade: valeurs.stade, date: aujourdhui() });
      Object.assign(p, valeurs);
    } else {
      donnees.personnes.push({ id: uid(), ...valeurs, historique: [{ stade: valeurs.stade, date: aujourdhui() }] });
    }
    sauver();
    tout();
    if (p && $('#fiche').open) rendreFiche(p.id);
  };
  dlg.showModal();
}

$('#btn-ajout').addEventListener('click', () => editerPersonne(null));

/* ---------------- Fiche d'une personne ---------------- */

let ficheReponse = null; // { narrationId, texte }

function ouvrirFiche(id) {
  ficheReponse = null;
  rendreFiche(id);
  $('#fiche').showModal();
}

function rendreFiche(id) {
  const p = donnees.personnes.find(x => x.id === id);
  if (!p) { $('#fiche').close(); return; }
  const pr = progression(p);
  const narrs = narrationsDe(id).sort((a, b) => b.date.localeCompare(a.date) || b.cree - a.cree);
  const abs = absencesDe(id).sort((a, b) => b.debut.localeCompare(a.debut));
  const auj = aujourdhui();

  $('#fiche').innerHTML = `
    <div class="fiche-contenu ${classeStade(p.stade)}" data-id="${id}">
      <div class="fiche-entete">
        <div>
          <h2>${esc(p.nom)}</h2>
          <div class="meta">🏘️ ${esc(p.village)} · <span class="badge">${esc(p.stade)}</span>
          ${absenceEn(p, auj, auj).length ? '<span class="badge absent">Absent</span>' : ''}</div>
        </div>
        <div class="ligne">
          <button data-act="editer" class="petit">✏️ Modifier</button>
          <button data-act="supprimer" class="petit danger">🗑️</button>
          <button data-act="fermer" class="petit">✖</button>
        </div>
      </div>

      <div class="bloc">
        <h3>Progression</h3>
        ${pr.seuil ? `<div class="barre"><div style="width:${pr.pourcent}%"></div></div>
          <div>${pr.compte}/${pr.seuil} ${esc(pr.stade.unite)} en tant que ${esc(p.stade)}
          ${pr.pret ? ` — <strong>${pr.stade.surDecision ? 'éligible' : 'prêt'} pour ${esc(pr.prochain)}</strong>` : ` — encore ${pr.restant}`}</div>`
          : `<div>Dernier stade atteint.</div>`}
        <div class="meta">${pr.total} narrations au total · ${pr.jours} jour(s) de narration dans ce stade</div>
        ${pr.prochain ? `<div><button data-act="passer" class="petit">⬆️ Passer ${esc(pr.prochain)}</button></div>` : ''}
        ${p.notes ? `<div class="meta">📝 ${esc(p.notes)}</div>` : ''}
      </div>

      <div class="bloc">
        <h3>Poster une narration</h3>
        <div class="ligne"><label>Date <input type="date" id="n-date" value="${auj}"></label></div>
        <textarea id="n-texte" rows="5" placeholder="Colle ici la narration…"></textarea>
        <div><button data-act="narrer" class="primary">Enregistrer et générer la réponse</button></div>
        ${lireCleApi() ? '' : '<div class="aide">Sans clé API Claude (Réglages), la réponse est le message de progression. Tu peux aussi copier le prompt pour le coller dans claude.ai.</div>'}
        ${ficheReponse?.chargement ? '<div class="aide">✍️ Claude rédige le retour…</div>' : ''}
        ${ficheReponse && !ficheReponse.chargement ? `
          <label>Réponse (modifiable)
            <textarea id="n-reponse" rows="7">${esc(ficheReponse.texte)}</textarea></label>
          <div class="ligne">
            <button data-act="copier-reponse" class="primary">📋 Copier la réponse</button>
            ${lireCleApi() ? '<button data-act="regenerer">🔄 Régénérer</button>' : ''}
            <button data-act="copier-prompt">🤖 Copier le prompt</button>
          </div>` : ''}
      </div>

      <div class="bloc">
        <h3>Absences</h3>
        <div class="ligne">
          <label>Du <input type="date" id="a-debut" value="${auj}"></label>
          <label>Au <input type="date" id="a-fin" value="${auj}"></label>
          <label style="flex:1">Raison <input id="a-raison" placeholder="ex. vacances, examens…"></label>
          <button data-act="absence" class="petit">+ Ajouter</button>
        </div>
        <ul class="historique">
          ${abs.map(a => `<li>⛔ ${fr(a.debut)}${a.fin && a.fin !== a.debut ? ' → ' + fr(a.fin) : ''} — ${esc(a.raison || 'sans raison')}
            <button data-act="suppr-absence" data-id="${a.id}" class="petit">✖</button></li>`).join('') || '<li class="extrait">Aucune absence signalée.</li>'}
        </ul>
      </div>

      <div class="bloc">
        <h3>Historique des narrations (${narrs.length})</h3>
        <ul class="historique">
          ${narrs.map(n => `<li>
            <strong>${fr(n.date)}</strong> · ${esc(n.stade)}
            <span class="extrait">— ${esc((n.texte || '').slice(0, 120))}${(n.texte || '').length > 120 ? '…' : ''}</span>
            <div class="ligne">
              ${n.reponse ? `<button data-act="copier-ancienne" data-id="${n.id}" class="petit">📋 Réponse</button>` : ''}
              <button data-act="suppr-narration" data-id="${n.id}" class="petit">✖</button>
            </div></li>`).join('') || '<li class="extrait">Aucune narration.</li>'}
        </ul>
      </div>
    </div>`;
}

$('#fiche').addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const id = $('#fiche .fiche-contenu').dataset.id;
  const p = donnees.personnes.find(x => x.id === id);
  const act = b.dataset.act;

  if (act === 'fermer') return $('#fiche').close();
  if (act === 'editer') return editerPersonne(id);

  if (act === 'supprimer') {
    if (!confirm(`Supprimer ${p.nom} et tout son historique ?`)) return;
    donnees.personnes = donnees.personnes.filter(x => x.id !== id);
    donnees.narrations = donnees.narrations.filter(x => x.personneId !== id);
    donnees.absences = donnees.absences.filter(x => x.personneId !== id);
    sauver(); tout(); $('#fiche').close();
    return;
  }

  if (act === 'passer') {
    const pr = progression(p);
    if (!confirm(`Passer ${p.nom} au stade ${pr.prochain} ?`)) return;
    p.stade = pr.prochain;
    p.historique.push({ stade: p.stade, date: aujourdhui() });
    toast(`⬆️ ${p.nom} est maintenant ${p.stade}`);
  }

  if (act === 'narrer') {
    const texte = $('#n-texte').value.trim();
    const date = $('#n-date').value || aujourdhui();
    if (!texte && !confirm('La narration est vide. Enregistrer quand même ?')) return;
    const n = { id: uid(), personneId: id, date, texte, stade: p.stade, cree: Date.now() };
    donnees.narrations.push(n);
    sauver();
    tout();
    return remplirReponse(p, n);
  }

  if (act === 'regenerer') {
    const n = donnees.narrations.find(x => x.id === ficheReponse?.narrationId);
    if (n) return remplirReponse(p, n);
    return;
  }

  if (act === 'copier-prompt') {
    const n = donnees.narrations.find(x => x.id === ficheReponse?.narrationId);
    if (!n) return;
    const { system, user } = construirePrompt(p, n);
    return copier(`${system}\n\n---\n\n${user}`);
  }

  if (act === 'copier-reponse') {
    const texte = $('#n-reponse').value;
    const n = donnees.narrations.find(x => x.id === ficheReponse?.narrationId);
    if (n) { n.reponse = texte; ficheReponse.texte = texte; sauver(); }
    return copier(texte);
  }

  if (act === 'copier-ancienne') {
    const n = donnees.narrations.find(x => x.id === b.dataset.id);
    return copier(n?.reponse || '');
  }

  if (act === 'suppr-narration') {
    if (!confirm('Supprimer cette narration ?')) return;
    donnees.narrations = donnees.narrations.filter(x => x.id !== b.dataset.id);
    if (ficheReponse?.narrationId === b.dataset.id) ficheReponse = null;
  }

  if (act === 'absence') {
    const debut = $('#a-debut').value || aujourdhui();
    const fin = $('#a-fin').value || debut;
    donnees.absences.push({ id: uid(), personneId: id, debut, fin: fin < debut ? debut : fin, raison: $('#a-raison').value.trim() });
    toast('⛔ Absence ajoutée');
  }

  if (act === 'suppr-absence') {
    donnees.absences = donnees.absences.filter(x => x.id !== b.dataset.id);
  }

  sauver();
  tout();
  rendreFiche(id);
});

async function remplirReponse(p, n) {
  ficheReponse = { narrationId: n.id, texte: '', chargement: true };
  rendreFiche(p.id);
  try {
    n.reponse = await produireReponse(p, n);
    toast('✅ Narration enregistrée');
  } catch (err) {
    console.error(err);
    n.reponse = messageProgression(p, n);
    const raison = err.status === 401 ? 'clé API invalide'
      : err.status === 429 ? 'trop de requêtes, réessaie dans un instant'
      : err.message || String(err);
    toast('⚠️ Retour Claude impossible (' + raison + ') : message de progression utilisé', 5000);
  }
  ficheReponse = { narrationId: n.id, texte: n.reponse };
  sauver();
  tout();
  if ($('#fiche').open && $('#fiche .fiche-contenu')?.dataset.id === p.id) rendreFiche(p.id);
}

// Garde la réponse modifiée en mémoire même sans cliquer « Copier »
$('#fiche').addEventListener('input', e => {
  if (e.target.id !== 'n-reponse' || !ficheReponse) return;
  ficheReponse.texte = e.target.value;
  const n = donnees.narrations.find(x => x.id === ficheReponse.narrationId);
  if (n) { n.reponse = e.target.value; sauver(); }
});

/* ---------------- Tableau ---------------- */

let triTableau = { col: 'village', sens: 1 };

function statsSemaine(p, debut) {
  const fin = ajouterJours(debut, 6);
  const narrs = narrationsDe(p.id).filter(n => n.date >= debut && n.date <= fin);
  return {
    narrations: narrs.length,
    jours: new Set(narrs.map(n => n.date)).size,
    absences: absenceEn(p, debut, fin),
  };
}

function rendreTableau() {
  const debut = lundi($('#tab-semaine').value || aujourdhui());
  const lignes = personnesFiltrees($('#tab-village').value, $('#tab-stade').value).map(p => {
    const pr = progression(p);
    const s = statsSemaine(p, debut);
    return {
      p, pr, s,
      nom: p.nom,
      village: p.village,
      stade: indexStade(p.stade),
      progression: pr.seuil ? pr.compte / pr.seuil : 2,
      semaine: s.narrations,
      jours: s.jours,
      total: pr.total,
      derniere: derniereNarration(p),
      absence: s.absences.length,
    };
  });
  const { col, sens } = triTableau;
  lignes.sort((a, b) => {
    const x = a[col], y = b[col];
    return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sens;
  });

  const colonnes = [
    ['nom', 'Nom'], ['village', 'Village'], ['stade', 'Stade'], ['progression', 'Progression'],
    ['semaine', 'Narr. semaine'], ['jours', 'Jours semaine'], ['total', 'Total narr.'],
    ['derniere', 'Dernière'], ['absence', 'Absence (semaine) / raison'],
  ];
  $('#tableau').innerHTML = `
    <thead><tr>${colonnes.map(([k, l]) => `<th data-col="${k}">${l}${col === k ? (sens > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('')}</tr></thead>
    <tbody>${lignes.map(({ p, pr, s }) => `
      <tr data-id="${p.id}" class="${classeStade(p.stade)}">
        <td><strong>${esc(p.nom)}</strong></td>
        <td>${esc(p.village)}</td>
        <td><span class="badge">${esc(p.stade)}</span></td>
        <td>${pr.seuil ? `${pr.compte}/${pr.seuil} ${esc(pr.stade.unite)}${pr.pret ? ' ✅' : ''}` : '—'}</td>
        <td>${s.narrations}</td>
        <td>${s.jours}</td>
        <td>${pr.total}</td>
        <td>${fr(derniereNarration(p))}</td>
        <td>${s.absences.map(a => `⛔ ${fr(a.debut)}${a.fin !== a.debut ? '→' + fr(a.fin) : ''} : ${esc(a.raison || 'sans raison')}`).join('<br>') || ''}</td>
      </tr>`).join('') || `<tr><td colspan="${colonnes.length}" class="vide">Aucune personne.</td></tr>`}
    </tbody>`;
}

$('#tableau').addEventListener('click', e => {
  const th = e.target.closest('th');
  if (th) {
    const col = th.dataset.col;
    triTableau = { col, sens: triTableau.col === col ? -triTableau.sens : 1 };
    return rendreTableau();
  }
  const tr = e.target.closest('tr[data-id]');
  if (tr) ouvrirFiche(tr.dataset.id);
});
['#tab-semaine', '#tab-village', '#tab-stade'].forEach(s => $(s).addEventListener('input', rendreTableau));

/* ---------------- Compte rendu hebdomadaire ---------------- */

function rendreRapport() {
  const debut = lundi($('#rap-semaine').value || aujourdhui());
  const fin = ajouterJours(debut, 6);
  const L = [];
  L.push(`📋 COMPTE RENDU DES SUIVIS`);
  L.push(`Semaine du ${fr(debut)} au ${fr(fin)}`);
  L.push('');

  const prets = [], inactifs = [], absents = [];
  let totalNarr = 0;

  for (const v of villages()) {
    const gens = personnesFiltrees(v, '');
    L.push(`🏘️ ${v.toUpperCase()} (${gens.length})`);
    for (const st of stades()) {
      for (const p of gens.filter(x => x.stade === st.nom)) {
        const pr = progression(p);
        const s = statsSemaine(p, debut);
        totalNarr += s.narrations;
        const prog = pr.seuil ? ` — ${pr.compte}/${pr.seuil} ${pr.stade.unite}` : ` — ${pr.total} narr. au total`;
        L.push(`• ${p.nom} [${p.stade}]${prog} — ${s.narrations} narration(s) sur ${s.jours} jour(s) cette semaine`);
        for (const a of s.absences) {
          L.push(`   ⛔ Absent ${a.fin !== a.debut ? `du ${fr(a.debut)} au ${fr(a.fin)}` : `le ${fr(a.debut)}`} : ${a.raison || 'sans raison'}`);
        }
        if (pr.pret) prets.push(`${p.nom} (${p.stade} → ${pr.prochain}${pr.stade.surDecision ? ', sur décision' : ''})`);
        if (s.absences.length) absents.push(p.nom);
        else if (!s.narrations) inactifs.push(p.nom);
      }
    }
    L.push('');
  }

  if ($('#rap-retours').checked) {
    const retours = donnees.narrations
      .filter(n => n.date >= debut && n.date <= fin && n.reponse)
      .sort((a, b) => a.date.localeCompare(b.date) || a.cree - b.cree);
    if (retours.length) {
      L.push('📝 RETOURS DE LA SEMAINE');
      L.push('');
      for (const v of villages()) {
        const ids = new Set(personnesFiltrees(v, '').map(p => p.id));
        const duVillage = retours.filter(n => ids.has(n.personneId));
        if (!duVillage.length) continue;
        L.push(`🏘️ ${v.toUpperCase()}`);
        for (const n of duVillage) L.push(n.reponse, '');
      }
    }
  }

  L.push('📊 BILAN');
  L.push(`• ${donnees.personnes.length} personne(s) suivie(s), ${totalNarr} narration(s) cette semaine`);
  L.push(`• Répartition : ${stades().map(s => `${s.nom} ${donnees.personnes.filter(p => p.stade === s.nom).length}`).join(' · ')}`);
  L.push(`• ⭐ Passages possibles : ${prets.join(', ') || 'aucun'}`);
  L.push(`• ⛔ Absents signalés : ${absents.join(', ') || 'aucun'}`);
  L.push(`• 😴 Aucune narration sans absence signalée : ${inactifs.join(', ') || 'aucun'}`);

  $('#rapport').value = L.join('\n');
}

['#rap-semaine', '#rap-retours'].forEach(s => $(s).addEventListener('input', rendreRapport));
$('#btn-rapport-copier').addEventListener('click', () => copier($('#rapport').value));

/* ---------------- Réglages ---------------- */

function rendreReglages() {
  $('#reglages-stades').innerHTML = stades().map((s, i) => `
    <div class="reglage-stade">
      <strong>${esc(s.nom)}</strong>
      ${i < stades().length - 1 ? `
        <label>Seuil <input type="number" min="1" data-stade="${i}" data-champ="seuil" value="${s.seuil}"></label>
        <label>Compté en
          <select data-stade="${i}" data-champ="unite">
            <option value="narrations"${s.unite === 'narrations' ? ' selected' : ''}>narrations</option>
            <option value="jours"${s.unite === 'jours' ? ' selected' : ''}>jours de narration</option>
          </select></label>` : '<span class="aide">Dernier stade, pas de seuil</span><span></span>'}
    </div>`).join('');

  const ia = donnees.reglages.ia;
  $('#reglages-ia').innerHTML = `
    <label class="modele">Clé API
      <input type="password" id="ia-cle" value="${esc(lireCleApi())}" placeholder="sk-ant-…" autocomplete="off"></label>
    <label class="modele">Modèle
      <input data-ia="modele" value="${esc(ia.modele)}"></label>
    <label class="modele">Exemples de retours (le style à imiter, un par paragraphe)
      <textarea rows="10" data-ia="exemples">${esc(ia.exemples)}</textarea></label>
    <label class="modele">Consignes supplémentaires (facultatif : techniques, maîtres, règles de l'univers…)
      <textarea rows="3" data-ia="consignes">${esc(ia.consignes)}</textarea></label>
    <label class="ligne"><input type="checkbox" data-ia="ajouterProgression"${ia.ajouterProgression ? ' checked' : ''}>
      Ajouter le message de progression à la fin du retour</label>`;

  $('#reglages-modeles').innerHTML = Object.keys(MODELES_DEFAUT).map(k => `
    <label class="modele">${LIBELLES_MODELES[k]}
      <textarea rows="3" data-modele="${k}">${esc(donnees.reglages.modeles[k])}</textarea></label>`).join('');
}

$('#page-reglages').addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.stade !== undefined) {
    const s = stades()[t.dataset.stade];
    s[t.dataset.champ] = t.dataset.champ === 'seuil' ? Number(t.value) || 1 : t.value;
  } else if (t.id === 'ia-cle') {
    ecrireCleApi(t.value.trim());
  } else if (t.dataset.ia) {
    donnees.reglages.ia[t.dataset.ia] = t.type === 'checkbox' ? t.checked : t.value;
  } else if (t.dataset.modele) {
    donnees.reglages.modeles[t.dataset.modele] = t.value;
  } else return;
  sauver();
  tout();
  toast('✅ Réglages enregistrés');
});

$('#btn-modeles-defaut').addEventListener('click', () => {
  if (!confirm('Remplacer tes modèles par ceux par défaut ?')) return;
  donnees.reglages.modeles = structuredClone(MODELES_DEFAUT);
  sauver();
  rendreReglages();
});

$('#btn-export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `suivis-${aujourdhui()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

$('#input-import').addEventListener('change', async e => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!Array.isArray(d.personnes)) throw new Error('format');
    if (!confirm('Remplacer toutes les données actuelles par ce fichier ?')) return;
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(d));
    donnees = charger();
    tout();
    rendreReglages();
    toast('✅ Données importées');
  } catch {
    toast('⚠️ Fichier invalide');
  } finally {
    e.target.value = '';
  }
});

$('#btn-reset').addEventListener('click', () => {
  if (!confirm('Effacer TOUTES les données ? (pense à exporter avant)')) return;
  donnees = etatVide();
  sauver();
  tout();
  rendreReglages();
});

/* ---------------- Démarrage ---------------- */

$('#tab-semaine').value = aujourdhui();
$('#rap-semaine').value = aujourdhui();
tout();
