// Référentiels de la branche « Suivi des pathologies » (repris du projet de branche).

export const CATEGORIES = [
  { id: 'genetique', emoji: '🧬', label: 'Maladie génétique', court: 'Génétique' },
  { id: 'inconnue', emoji: '❓', label: 'Pathologie inconnue', court: 'Inconnue' },
  { id: 'post_op', emoji: '🩹', label: 'Post-opératoire', court: 'Post-op' },
  { id: 'reeducation', emoji: '💪', label: 'Rééducation', court: 'Rééducation' },
  { id: 'sequelle', emoji: '🦿', label: 'Séquelle permanente', court: 'Séquelle' },
  { id: 'chronique', emoji: '🔁', label: 'Pathologie chronique', court: 'Chronique' },
];

export const STATUTS = [
  { id: 'attente', emoji: '🟡', label: 'En attente', couleur: '#fbbf24',
    description: 'Dossier ouvert, en attente de prise en charge.' },
  { id: 'examens', emoji: '🩺', label: 'Examens en cours', couleur: '#60a5fa',
    description: 'Examens et prélèvements en cours.' },
  { id: 'analyse_irs', emoji: '🔬', label: 'Analyse IRS en cours', couleur: '#a78bfa',
    description: 'Prélèvements transmis à l’IRS, analyse en cours.' },
  { id: 'traitement', emoji: '💊', label: 'Traitement / rééducation en cours', couleur: '#2dd4bf',
    description: 'Un traitement ou un programme est en cours d’essai.' },
  { id: 'stable', emoji: '🟢', label: 'Suivi stable', couleur: '#4ade80',
    description: 'Traitement efficace, contrôles réguliers.' },
  { id: 'urgent', emoji: '🔴', label: 'Urgent', couleur: '#fb7185',
    description: 'Aggravation : rendez-vous d’urgence à organiser.' },
  { id: 'pause', emoji: '⏸️', label: 'En pause', couleur: '#94a3b8',
    description: 'Suivi suspendu ou sans activité depuis trois semaines.' },
  { id: 'cloture', emoji: '✅', label: 'Dossier clôturé', couleur: '#cbd5e1',
    description: 'Guérison, stabilisation définitive ou demande du patient.' },
];

// Ordre de priorité pour le tri « les plus urgents d'abord ».
export const PRIORITE_STATUT = ['urgent', 'attente', 'analyse_irs', 'examens', 'traitement', 'stable', 'pause', 'cloture'];

export const ROLES = {
  responsable: { label: 'Responsable de la branche', groupe: 'Responsables de la branche', court: 'Responsable', couleur: '#e9c46a' },
  medecin: { label: 'Médecin référent', groupe: 'Médecins référents', court: 'Médecin', couleur: '#34d399' },
  soignant: { label: 'Personnel soignant', groupe: 'Personnel soignant et de rééducation', court: 'Soignant', couleur: '#60a5fa' },
  irs: { label: 'Référent IRS', groupe: 'Référents IRS', court: 'IRS', couleur: '#a78bfa' },
  en_attente: { label: 'En attente de validation', groupe: 'En attente', court: 'En attente', couleur: '#94a3b8' },
};
export const ORDRE_ROLES = ['responsable', 'medecin', 'soignant', 'irs'];
export const ROLES_EQUIPE = ['responsable', 'medecin', 'soignant', 'irs'];

// Clans du serveur. « Shirogane / Chikatsume » est un seul clan.
export const CLANS = [
  { id: 'hoki', label: 'Hoki', couleur: '#fb923c' },
  { id: 'sabaku', label: 'Sabaku', couleur: '#facc15' },
  { id: 'hakumei', label: 'Hakumei', couleur: '#a5b4fc' },
  { id: 'roran', label: 'Roran', couleur: '#f472b6' },
  { id: 'shirogane', label: 'Shirogane / Chikatsume', couleur: '#e2e8f0' },
  { id: 'sans_clan', label: 'Sans clan', couleur: '#94a3b8' },
];

export const TYPES_RDV = [
  'Premier rendez-vous', 'Examens', 'Résultats', 'Essai de traitement',
  'Contrôle', 'Bilan d’étape', 'Rééducation', 'Urgence',
];

export const MOTIFS_CLOTURE = [
  'Patient guéri ou entièrement rétabli',
  'État définitivement stabilisé, plus de surveillance nécessaire',
  'Demande du patient',
];

export const TYPES_TRAITEMENT = {
  traitement: { label: 'Traitement', emoji: '💊' },
  reeducation: { label: 'Rééducation', emoji: '💪' },
  prothese: { label: 'Prothèse', emoji: '🦿' },
  autre: { label: 'Autre', emoji: '🩺' },
};
export const ETATS_TRAITEMENT = {
  essai: { label: 'En essai', couleur: '#2dd4bf' },
  maintenu: { label: 'Maintenu', couleur: '#4ade80' },
  arrete: { label: 'Arrêté', couleur: '#94a3b8' },
};
export const RESULTATS_TRAITEMENT = {
  a_evaluer: { label: 'À évaluer', emoji: '⏳' },
  efficace: { label: 'Efficace', emoji: '✅' },
  partiel: { label: 'Partiellement efficace', emoji: '🌗' },
  inefficace: { label: 'Inefficace', emoji: '❌' },
  effets: { label: 'Effets indésirables', emoji: '⚠️' },
};

// Délais (en jours IRL) qui déclenchent les rappels du tableau de bord.
export const DELAIS = {
  inactivite: 21, // « un dossier sans activité pendant trois semaines passe En pause »
  essai: 14, // « essai d'un traitement : au moins une à deux semaines IRL »
  controle: 30, // « suivi stable : un contrôle par mois IRL »
};

export const PARCOURS = {
  maladie: {
    label: 'Parcours maladie',
    detail: 'Maladies génétiques, pathologies inconnues ou chroniques',
    etapes: [
      {
        titre: 'Premier rendez-vous',
        resume: 'Rencontrer le patient, lui attribuer son médecin référent et ouvrir son dossier. Cette consultation pose la base du suivi et détermine les premiers examens.',
        points: ['Symptômes', 'Fréquence et intensité', 'Âge d’apparition', 'Évolution au fil du temps',
          'Antécédents familiaux', 'Traitements déjà essayés', 'Facteurs aggravants ou atténuants'],
      },
      {
        titre: 'Examens et prélèvements',
        resume: 'Réunir assez d’éléments pour comprendre l’origine de la maladie et ses conséquences sur l’organisme.',
        points: ['Prélèvements sanguins', 'Analyses médicales', 'Examen au Kaiseki Kenshin', 'Tout autre examen jugé nécessaire'],
        statut: 'examens',
      },
      {
        titre: 'Collaboration avec l’IRS',
        resume: 'Avec l’accord du patient, les prélèvements et résultats sont transmis à l’IRS pour une étude approfondie.',
        points: ['Parties de l’organisme touchées', 'Effets de la maladie', 'Évolution potentielle',
          'Risques à court et long terme', 'Anomalies dans les prélèvements', 'Pistes de traitement'],
        statut: 'analyse_irs',
        irs: true,
      },
      {
        titre: 'Présentation des résultats',
        resume: 'Le médecin référent explique ce que l’on sait de la pathologie et présente les options. Le patient reste libre d’accepter ou de refuser chaque piste.',
        points: ['Réduire les symptômes', 'Ralentir l’évolution de la maladie', 'Limiter ses conséquences'],
      },
      {
        titre: 'Essai d’un traitement',
        resume: 'Le traitement est introduit progressivement et maintenu assez longtemps pour en observer les effets. Un seul nouveau traitement à la fois.',
        points: ['Amélioration ou aggravation des symptômes', 'Effets secondaires', 'Réaction générale de l’organisme', 'Efficacité dans le temps'],
        statut: 'traitement',
        rythme: 'Au moins une à deux semaines IRL avant l’analyse de contrôle.',
      },
      {
        titre: 'Analyses de contrôle',
        resume: 'Nouvelles analyses comparées aux précédentes pour juger objectivement le traitement. Sans amélioration, une autre piste est testée.',
        points: ['Comparer aux analyses précédentes', 'Décider : poursuivre, ajuster ou changer de piste'],
        statut: 'examens',
      },
      {
        titre: 'Suivi à long terme',
        resume: 'Traitement stable et efficace : contrôle environ deux fois par an, plus souvent si besoin. Au moindre changement, le traitement est réévalué.',
        points: ['La maladie reste stable', 'Le traitement reste efficace', 'Aucune réaction indésirable',
          'Pas d’accoutumance au traitement', 'Aucune nouvelle complication'],
        statut: 'stable',
        rythme: 'Environ un contrôle par mois IRL.',
      },
    ],
  },
  readaptation: {
    label: 'Parcours réadaptation',
    detail: 'Post-opératoire, rééducation et séquelles',
    etapes: [
      {
        titre: 'Bilan initial',
        resume: 'Évaluer précisément les conséquences de l’opération ou de la blessure, puis fixer avec le patient des objectifs de récupération concrets.',
        points: ['Capacités perdues ou diminuées', 'Douleurs', 'État de la cicatrisation', 'Besoins au quotidien',
          'Objectifs de récupération'],
      },
      {
        titre: 'Programme personnalisé',
        resume: 'Mettre en place un programme adapté à la situation du patient.',
        points: ['Rendez-vous médicaux réguliers', 'Séances de rééducation', 'Exercices de récupération',
          'Surveillance de la cicatrisation', 'Suivi de la douleur', 'Adaptation à une prothèse si nécessaire'],
        statut: 'traitement',
        rythme: 'Environ une séance RP par semaine.',
      },
      {
        titre: 'Bilans d’étape',
        resume: 'Mesurer les progrès par rapport aux objectifs, puis ajuster : intensifier, modifier les soins ou ralentir le rythme.',
        points: ['Progrès par rapport aux objectifs', 'Ajustement du programme'],
        statut: 'traitement',
      },
      {
        titre: 'Fin de prise en charge',
        resume: 'État stable : le médecin valide la fin de la prise en charge et donne son avis sur la reprise des activités. Si des séquelles subsistent, le patient passe en suivi à long terme.',
        points: ['Avis sur la reprise de l’entraînement et des missions', 'Séquelles permanentes : suivi à long terme'],
      },
    ],
  },
};

export const ORIGINES = ['Génétique', 'Blessure', 'Opération', 'Inconnue'];

// ---------------------------------------------------------------------
const index = liste => Object.fromEntries(liste.map(x => [x.id, x]));
export const CATEGORIE = index(CATEGORIES);
export const STATUT = index(STATUTS);

export const statut = id => STATUT[id] || STATUT.attente;
export const categorie = id => CATEGORIE[id] || { id, emoji: '•', label: id, court: id };
export const role = id => ROLES[id] || ROLES.en_attente;
export const clan = id => CLANS.find(c => c.id === id) || null;

// Parcours proposé selon les catégories du dossier.
export function parcoursConseille(categories = []) {
  const maladie = categories.some(c => ['genetique', 'inconnue', 'chronique'].includes(c));
  const readaptation = categories.some(c => ['post_op', 'reeducation', 'sequelle'].includes(c));
  return readaptation && !maladie ? 'readaptation' : 'maladie';
}

export const etapesDu = parcours => (PARCOURS[parcours] || PARCOURS.maladie).etapes;
