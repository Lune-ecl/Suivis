# 生命 Seimei · Suivi des pathologies

Documentation de la branche **Suivi des pathologies** de la Seimei, en lien avec l'IRS.
Le suivi des patients se fait entièrement sur le **forum Discord** de la branche ; ce site explique comment tout cela fonctionne.

C'est un **guide interne réservé aux médecins de la branche** : les patients n'y ont pas accès, pas plus qu'au forum ou à leur dossier. Il n'y a ni compte ni inscription ; le site est en ligne sur GitHub Pages, donc toute personne qui a le lien peut l'ouvrir : il suffit de ne le partager qu'avec l'équipe.

👉 **En ligne : https://lune-ecl.github.io/Suivis/**

## Organisation

Le site est rangé en sept catégories, chacune avec sa page d'ensemble et ses sous-pages :

| Catégorie | Dossier | Sous-pages |
|---|---|---|
| 🏥 La branche | `branche/` | Présentation, rôles et organisation, dossier médical, règles et garde-fous |
| 💬 Le suivi sur parchemin | `parchemins/` | Forum, ouvrir un dossier, étiquettes, rendez-vous et comptes rendus, IRS, urgences et pauses, clôture, rythme |
| 🧬 Soins et pathologies | `pathologies/` | Parcours de soin, examens et traitements, une fiche par catégorie (génétique, inconnue, post-opératoire, rééducation, séquelle permanente, chronique), plusieurs pathologies |
| 💪 Rééducation | `reeducation/` | Principes, mesurer les progrès, accompagner le patient, puis onze séances (marche, dos, épaule, main et signes, amputation, brûlures, souffle, équilibre, mémoire, chakra, retour en mission) |
| 🗓️ Exemples de suivis | `exemples/` | Cinq suivis racontés semaine par semaine, et les situations particulières |
| 📋 Modèles de parchemins | `modeles/` | Ouvrir un dossier, pendant le suivi, avec l'IRS, les imprévus, la fin du suivi |
| 💡 FAQ et glossaire | `faq/` | Dossiers et prise en charge, les patients, travailler avec l'IRS, glossaire |

Sur chaque page :
- un menu déroulant par catégorie dans l'en-tête (ou un menu complet sur téléphone) ;
- une barre latérale avec les pages de la catégorie et un fil d'Ariane ;
- un sommaire qui suit la lecture ;
- une **recherche dans tout le site** (bouton « Rechercher » ou <kbd>Ctrl</kbd> + <kbd>K</kbd>) ;
- des boutons **Copier** sur les modèles, avec le nombre de caractères (limite Discord : 2 000).

## Modifier la documentation

Le site est fait de simples fichiers HTML, sans outil à installer :

- le texte de chaque page se trouve dans son fichier `.html`, entre `<main>` et `</main>` ;
- l'apparence est dans `assets/css/doc.css` ;
- le plan du site est en haut de `assets/js/doc.js` (liste `PLAN`). Le script s'en sert pour construire l'en-tête, les menus, la barre latérale, les cartes des pages d'ensemble, les liens « précédent / suivant » et la recherche.

**Ajouter une page** : copie une page existante de la même catégorie, change son titre et son contenu, puis ajoute-la à la catégorie dans `PLAN` (fichier, titre, émoji, description).

Chaque titre de section qui porte un `id` apparaît dans le sommaire et dans la recherche. Après une modification de `doc.css` ou `doc.js`, augmente le numéro `?v=` des liens dans les pages pour que les navigateurs chargent la nouvelle version.

GitHub Pages publie automatiquement la branche `main` : les changements sont en ligne une à deux minutes après leur fusion. Une adresse qui n'existe pas affiche la page `404.html`, qui renvoie vers les catégories.

## Autres fichiers

| Fichier | Rôle |
|---|---|
| `narrations/` | L'ancien outil de suivi des narrations, toujours utilisable à l'adresse `…/Suivis/narrations/` |

L'ancienne application connectée à Supabase a été retirée : tout se passe désormais sur Discord. Le projet Supabase n'est plus utilisé par le site ; il peut être conservé ou supprimé depuis le tableau de bord de Supabase.
