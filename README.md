# 📜 Suivis

Site pour gérer les suivis des personnes : un casier par personne, des réponses cohérentes générées selon l'avancement, un tableau récapitulatif et un compte rendu hebdomadaire à copier.

## Utilisation

Ouvre simplement `index.html` dans un navigateur, ou active **GitHub Pages** (Settings → Pages → branche, dossier `/`).
Les données sont enregistrées dans le navigateur (localStorage). Pense à **exporter** une sauvegarde JSON depuis *Réglages*.

## Pages

- **Casiers** : une carte par personne (village, stade, progression, absent). Clique pour ouvrir la fiche :
  - coller une narration → elle est enregistrée et un **retour** est rédigé par Claude dans le style de tes exemples, adapté à l'avancement et aux retours précédents (modifiable, boutons copier / régénérer) ;
  - le retour ne révèle **jamais** le stade, le nombre de narrations ni la progression : le joueur ne sait pas où il en est ;
  - sans clé API, le bouton *Copier le prompt* permet de coller la demande dans claude.ai, puis de coller le retour obtenu dans la case Réponse ;
  - ajouter une absence (dates + raison) ; si la personne revient d'absence, la réponse le mentionne ;
  - faire passer au stade suivant, voir l'historique.
- **Tableau** : nombre de narrations (semaine / total), jours de narration, progression, absences et raisons. Tri par colonne, filtres village / stade.
- **Compte rendu** : texte prêt à copier pour la semaine choisie, groupé par village. Deux parties qu'on peut cocher séparément : le *suivi interne* (stades, progression, absences, passages possibles — pour toi seulement) et les *retours* de la semaine (sans aucune information de progression).
- **Réglages** : seuils, unité de comptage, clé API / modèle / exemples de retours pour Claude.

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
