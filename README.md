# 📜 Suivis

Site pour gérer les suivis des personnes : un casier par personne, des réponses cohérentes générées selon l'avancement, un tableau récapitulatif et un compte rendu hebdomadaire à copier.

## Utilisation

Ouvre simplement `index.html` dans un navigateur, ou active **GitHub Pages** (Settings → Pages → branche, dossier `/`).
Les données sont enregistrées dans le navigateur (localStorage). Pense à **exporter** une sauvegarde JSON depuis *Réglages*.

## Pages

- **Casiers** : une carte par personne (village, stade, progression, absent). Clique pour ouvrir la fiche :
  - coller une narration → elle est enregistrée et un **retour** est rédigé par Claude dans le style de tes exemples, en tenant compte du stade et des retours précédents (modifiable, boutons copier / régénérer) ;
  - sans clé API, la réponse est un message de progression (« 3/7 narrations… ») et le bouton *Copier le prompt* permet de coller la demande dans claude.ai ;
  - ajouter une absence (dates + raison) ; si la personne revient d'absence, la réponse le mentionne ;
  - faire passer au stade suivant, voir l'historique.
- **Tableau** : nombre de narrations (semaine / total), jours de narration, progression, absences et raisons. Tri par colonne, filtres village / stade.
- **Compte rendu** : texte prêt à copier pour la semaine choisie, groupé par village, avec tous les retours de la semaine, les passages possibles, les absents et les personnes sans narration.
- **Réglages** : seuils, unité de comptage, clé API / modèle / exemples de retours pour Claude, message de progression.

## Retours rédigés par Claude

Dans *Réglages*, colle une clé API Anthropic (https://console.anthropic.com). La clé reste dans le navigateur et n'est jamais incluse dans l'export. Chaque retour est un appel facturé sur ton compte API.
Les **exemples de retours** définissent le style ; ajoute ou remplace des exemples pour l'ajuster. Les **consignes supplémentaires** servent à donner des règles de l'univers (techniques, maîtres…).

## Stades (par défaut)

| Stade  | Seuil | Compté en |
|--------|-------|-----------|
| Initié | 7 max | narrations |
| Adepte | 14    | jours de narration |
| Expert | 18    | jours de narration (passage Maître sur décision, pas automatique) |
| Maître | —     | — |

Les narrations comptent pour le stade dans lequel la personne était au moment où elles ont été postées.
