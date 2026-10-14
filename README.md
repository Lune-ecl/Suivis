# 生命 Seimei · Suivi des pathologies

Site confidentiel de la branche **Suivi des pathologies** de la Seimei, en lien avec l'IRS.
Il est réservé à l'équipe de la branche et aux chercheurs de l'IRS : **les joueurs n'y ont pas accès**.
L'annuaire des joueurs est lu directement sur le serveur Discord.

## Ce que fait le site

- **Connexion avec le nom RP et un code**, sans adresse e-mail. Le responsable valide chaque compte.
- **Annuaire des joueurs** (page *Joueurs*) :
  - lu sur le serveur Discord par un bot : le pseudo sur le serveur donne le nom RP, les rôles donnent le grade, la section et le clan (Hoki, Sabaku, Hakumei, Roran, Shirogane / Chikatsume, ou sans clan) ;
  - les joueurs absents du serveur, par exemple les **Roran**, s'ajoutent à la main ;
  - une information fausse sur Discord se corrige dans la fiche du joueur.
- **Ouverture d'un dossier** : on choisit le joueur dans l'annuaire, et son nom, son prénom, son grade, sa section et son clan se remplissent tout seuls.
- **Tableau de bord** : urgences, rapports de l'IRS reçus, rendez-vous à venir ou en retard, dossiers sans médecin, dossiers inactifs depuis 3 semaines, essais de traitement de plus de 2 semaines, suivis stables sans contrôle depuis 1 mois.
- **Dossiers** : recherche (y compris par clan), filtres par statut, catégorie et médecin, repère « Nouveau » quand un dossier a changé.
- **Fiche dossier** :
  - parcours de soin étape par étape (maladie en 7 étapes, réadaptation en 4) ;
  - journal : comptes rendus, rapports de l'IRS, notes de l'équipe et historique automatique ;
  - historique des traitements et de leurs effets.
- **Archives** des dossiers clôturés, qui peuvent être rouverts.
- **Équipe** : validation des demandes d'accès (avec vérification du nom RP sur le serveur Discord), rôles, nouveau code en cas d'oubli, réattribution des dossiers d'un médecin inactif, sauvegarde des données.
- **Guide de la branche** : fonctionnement, parcours, statuts, règles et garde-fous.

## Qui voit quoi

| Rôle | Voit | Peut |
|---|---|---|
| Responsable de la branche | tous les dossiers, l'annuaire | tout : attribuer, clôturer, rouvrir, supprimer, gérer les comptes, relier Discord |
| Médecin référent | tous les dossiers, l'annuaire | ouvrir et modifier des dossiers, prendre en charge un dossier libre, comptes rendus, traitements, compléter l'annuaire |
| Personnel soignant | tous les dossiers, l'annuaire | comptes rendus et notes |
| Référent IRS | **seulement les dossiers dont le patient a donné son accord** | rapports d'analyse et notes |
| Demande en attente | rien | attendre la validation du responsable |
| Joueurs | **aucun accès au site** | — |

Ces règles sont appliquées **par la base de données** : elles restent valables même si quelqu'un contourne le site.

---

## Mise en route

### 1. Installer ou mettre à jour la base dans Supabase

1. Ouvre ton projet sur [supabase.com/dashboard](https://supabase.com/dashboard).
2. Dans le menu de gauche : **SQL Editor** → **New query**.
3. Copie tout le contenu du fichier [`supabase/schema.sql`](supabase/schema.sql), colle-le, puis clique sur **Run**.

Le script peut être relancé sans danger. Sur une base installée avec la version précédente, il conserve les dossiers et supprime les comptes joueurs.

### 2. Relier le site à Supabase

Le fichier [`config.js`](config.js) contient l'adresse du projet et la clé publique (`publishable` ou `anon`).

> ⚠️ Ne mets **jamais** la clé `service_role` ou `secret` dans ce fichier : elle donne tous les droits sur la base.
> La clé publique, elle, peut être visible : la confidentialité repose sur les règles d'accès de la base.

### 3. Réglage de connexion dans Supabase (obligatoire)

**Authentication** → **Sign In / Providers** → **Email** : laisse ce fournisseur activé, mais **désactive « Confirm email »**, puis enregistre.

Le site n'utilise aucune adresse e-mail : il en fabrique une à partir du nom RP (`hoki.ren@seimei.invalid`), à laquelle rien n'est jamais envoyé.

### 4. Mettre le site en ligne

Dans le dépôt GitHub : **Settings** → **Pages** → *Deploy from a branch* → branche `main`, dossier `/ (root)`.
Le site est disponible à l'adresse `https://lune-ecl.github.io/Suivis/` après une ou deux minutes.

### 5. Créer ton compte de responsable

Ouvre le site → **Créer un compte** → le nom de ton personnage et un code d'au moins 6 caractères.
**Le premier compte devient automatiquement responsable de la branche.**

Si tu avais déjà créé un compte avec une adresse e-mail (version précédente du site), connecte-toi en tapant cette adresse dans le champ « Nom Prénom RP ».

Si besoin, tu peux donner le rôle de responsable à un compte depuis le **SQL Editor** :

```sql
update public.membres set role = 'responsable', actif = true
where nom_rp = 'Nom Prénom';
```

### 6. Relier le serveur Discord

Le site lit les joueurs de ton serveur grâce à un bot, à créer une seule fois :

1. Sur [discord.com/developers/applications](https://discord.com/developers/applications), clique sur **New Application** et donne-lui un nom (par exemple « Seimei »).
2. Onglet **Bot** :
   - active **Server Members Intent** et enregistre ;
   - clique sur **Reset Token** et copie le token.
3. Onglet **OAuth2** → **URL Generator** : coche **bot**, ouvre le lien généré en bas de la page et ajoute le bot à ton serveur.
4. Sur le site, page **Joueurs** : colle le token et clique sur **Relier**. L'annuaire se remplit tout de suite.
5. Bouton **Discord** de la page Joueurs : vérifie quels rôles correspondent à un grade, une section ou un clan. Les clans, les sections et les grades courants sont reconnus automatiquement.

Le token reste dans une partie privée de la base : il n'est jamais renvoyé au site, même au responsable. Le bot ne fait que lire la liste des membres et des rôles.
L'annuaire se met à jour tout seul quand il date de plus d'une heure, ou avec le bouton « Mettre à jour ».

### 7. Faire venir l'équipe

Chaque membre de la branche et de l'IRS crée son compte avec son nom RP et un code. Tu valides sa demande dans **Équipe** en choisissant son rôle. La carte de la demande indique si ce nom RP existe bien sur le serveur Discord.

Code oublié : bouton **Code** sur la carte du membre, dans **Équipe**. Chacun peut aussi changer son code depuis **Mon profil**.

---

## Au quotidien

1. **Nouveau patient** : bouton **Ouvrir un suivi** sur la fiche du joueur (page Joueurs), ou **Nouveau dossier** puis recherche du joueur. Un médecin clique sur **Prendre en charge** et devient médecin référent.
2. **Après chaque rendez-vous RP** : **Compte rendu** sur la fiche du dossier. Le prochain rendez-vous et le nouveau statut se mettent à jour.
3. **Parcours** : clique sur l'étape suivante, le site propose le statut correspondant.
4. **IRS** : avec l'accord du patient, passe le dossier en « Analyse IRS en cours ». Le référent IRS publie son rapport, et le tableau de bord signale le rapport reçu.
5. **Notes** : l'équipe s'organise dans le journal du dossier (disponibilités du joueur, rappels…).
6. **Clôture** (responsable) : statut « Dossier clôturé » avec le motif. Le dossier passe dans les archives.

## Sauvegarde

Le plan gratuit de Supabase ne fait pas de sauvegarde automatique. Le responsable peut télécharger toutes les données depuis **Équipe** → **Sauvegarder les données** (fichier JSON). Garde ce fichier en lieu sûr : il contient des informations confidentielles.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html`, `assets/` | le site (aucune installation nécessaire) |
| `config.js` | l'adresse et la clé publique de ta base Supabase |
| `supabase/schema.sql` | tables, règles d'accès, automatismes et lecture du serveur Discord |
| `assets/vendor/supabase.js` | bibliothèque officielle Supabase (supabase-js 2.117.2, licence MIT) |
| `narrations/` | l'ancien outil de suivi des narrations, toujours utilisable à l'adresse `…/Suivis/narrations/` |
