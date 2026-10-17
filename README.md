# 生命 Seimei · Suivi des pathologies

Documentation de la branche **Suivi des pathologies** de la Seimei, en lien avec l'IRS.
Le suivi des patients se fait entièrement sur le **forum Discord** de la branche ; ce site explique comment tout cela fonctionne.

👉 **En ligne : https://lune-ecl.github.io/Suivis/**

## Les pages

| Page | Contenu |
|---|---|
| [Accueil](index.html) | La branche en bref, les six catégories, les deux parcours, un suivi en un coup d'œil, par où commencer |
| [Fonctionnement](fonctionnement.html) | Rôles, dossier médical et secret médical, forum, ouverture d'un dossier, étiquettes, rendez-vous, examens, traitements, IRS, urgences, pause, clôture, rythme, règles |
| [Pathologies](pathologies.html) | Les parcours « maladie » (7 étapes) et « réadaptation » (4 étapes), puis une fiche complète par catégorie : génétique, inconnue, post-opératoire, rééducation, séquelle permanente, chronique |
| [Rééducation](reeducation.html) | Principes, structure d'une séance, échelles de mesure et onze séances détaillées (marche, épaule, amputation, main et signes, dos, souffle, équilibre, mémoire, chakra, brûlures, retour en mission) |
| [Déroulement](deroulement.html) | Le cycle de vie d'un dossier et cinq suivis racontés semaine par semaine, avec les étiquettes et des extraits de comptes rendus |
| [Modèles](modeles.html) | Tous les messages du forum à copier : fiche patient, prise en charge, comptes rendus, bilans, IRS, urgence, pause, clôture, réouverture… |
| [FAQ](faq.html) | Questions des joueurs, de l'équipe et de l'IRS, et glossaire |

Sur chaque page : un sommaire qui suit la lecture, une **recherche dans toute la documentation** (bouton « Rechercher » ou <kbd>Ctrl</kbd> + <kbd>K</kbd>) et des boutons **Copier** sur les modèles, avec le nombre de caractères (limite Discord : 2 000).

## Modifier la documentation

Le site est fait de simples fichiers HTML, sans outil à installer :

- le texte se trouve dans les fichiers `*.html` à la racine ;
- l'apparence dans `assets/css/doc.css` ;
- l'en-tête, le sommaire, la recherche et les boutons « Copier » sont ajoutés par `assets/js/doc.js`. Pour ajouter une page, crée le fichier HTML sur le modèle des autres et ajoute-la à la liste `PAGES` en haut de ce script.

Chaque titre de section qui porte un `id` apparaît dans le sommaire et dans la recherche. Après une modification de `doc.css` ou `doc.js`, augmente le numéro `?v=` des liens dans les pages pour que les navigateurs chargent la nouvelle version.

GitHub Pages publie automatiquement la branche `main` : les changements sont en ligne une à deux minutes après leur fusion.

## Autres fichiers

| Fichier | Rôle |
|---|---|
| `narrations/` | L'ancien outil de suivi des narrations, toujours utilisable à l'adresse `…/Suivis/narrations/` |

L'ancienne application connectée à Supabase a été retirée : tout se passe désormais sur Discord. Le projet Supabase n'est plus utilisé par le site ; il peut être conservé ou supprimé depuis le tableau de bord de Supabase.
