# 生命 Seimei · Suivi des pathologies

Site confidentiel de la branche **Suivi des pathologies** de la Seimei, en lien avec l'IRS.
Tout le suivi se fait sur le site : les joueurs y ouvrent le dossier médical de leur personnage, l'équipe y consigne chaque rendez-vous, l'IRS y publie ses analyses.

## Ce que fait le site

**Pour les joueurs**
- Création de compte immédiate, sans validation : chaque joueur n'a accès qu'à **ses propres dossiers**.
- **Demande de suivi** : le joueur remplit la fiche patient de son personnage (identité, pathologie, HRP).
- Suivi de son dossier : médecin référent, prochain rendez-vous, parcours de soin, comptes rendus, rapports de l'IRS, traitements.
- **Messages** avec l'équipe dans chaque dossier, et accord (ou refus) pour la transmission à l'IRS.
- Repère **« Nouveau »** quand quelque chose a changé depuis sa dernière visite.

**Pour l'équipe**
- **Tableau de bord** : urgences, nouvelles demandes, messages des joueurs en attente de réponse, rapports de l'IRS reçus, rendez-vous à venir ou en retard, dossiers inactifs depuis 3 semaines, essais de traitement de plus de 2 semaines, suivis stables sans contrôle depuis 1 mois.
- **Dossiers** : recherche, filtres par statut, catégorie et médecin.
- **Fiche dossier** :
  - parcours de soin étape par étape (maladie en 7 étapes, réadaptation en 4), avec ce qu'il faut vérifier à chaque étape ;
  - journal : comptes rendus, rapports de l'IRS, messages et historique automatique ;
  - historique des traitements et de leurs effets.
- **Archives** des dossiers clôturés, qui peuvent être rouverts.
- **Équipe** : validation des demandes d'accès, rôles, réattribution des dossiers d'un médecin inactif, liste des joueurs, sauvegarde des données.

**Pour tout le monde** : un **guide de la branche** (fonctionnement, parcours, statuts, règles et garde-fous).

## Qui voit quoi

| Rôle | Voit | Peut |
|---|---|---|
| Responsable de la branche | tous les dossiers | tout : attribuer, clôturer, rouvrir, supprimer, gérer les comptes |
| Médecin référent | tous les dossiers | ouvrir et modifier des dossiers, prendre en charge un dossier libre, comptes rendus, traitements |
| Personnel soignant | tous les dossiers | comptes rendus et messages |
| Référent IRS | **seulement les dossiers dont le patient a donné son accord** | rapports d'analyse et messages |
| Joueur | **seulement ses propres dossiers** | ouvrir une demande, compléter sa fiche, donner son accord pour l'IRS, écrire des messages |
| Demande d'équipe en attente | rien | attendre la validation du responsable |

Ces règles sont appliquées **par la base de données** : elles restent valables même si quelqu'un contourne le site.

---

## Mise en route (environ 10 minutes)

### 1. Installer la base dans Supabase

1. Ouvre ton projet sur [supabase.com/dashboard](https://supabase.com/dashboard).
2. Dans le menu de gauche : **SQL Editor** → **New query**.
3. Copie tout le contenu du fichier [`supabase/schema.sql`](supabase/schema.sql), colle-le, puis clique sur **Run**.

Le script peut être relancé sans danger.

### 2. Relier le site à Supabase

1. Dans Supabase, clique sur **Connect** en haut de ton projet, ou va dans **Project Settings** → **API Keys** / **Data API**.
2. Copie :
   - l'**URL du projet** (`https://xxxx.supabase.co`) ;
   - la **clé publique** : `anon` ou `publishable` (`sb_publishable_…`).
3. Sur GitHub, ouvre le fichier [`config.js`](config.js), clique sur le crayon ✏️, colle les deux valeurs entre les guillemets, puis **Commit changes**.

> ⚠️ Ne mets **jamais** la clé `service_role` ou `secret` dans ce fichier : elle donne tous les droits sur la base.
> La clé publique, elle, peut être visible : la confidentialité repose sur les règles d'accès de la base.

### 3. Réglages de connexion dans Supabase

Dans **Authentication** :

- **URL Configuration** → **Site URL** : mets l'adresse du site, par exemple `https://lune-ecl.github.io/Suivis/`. Sinon les liens reçus par e-mail (confirmation, mot de passe oublié) ne ramènent pas au site.
- **Sign In / Providers** → **Email** → désactive **Confirm email** (conseillé). Le service d'e-mails gratuit de Supabase n'envoie que quelques e-mails par heure, ce qui bloquerait les inscriptions.

### 4. Mettre le site en ligne

Dans le dépôt GitHub : **Settings** → **Pages** → *Deploy from a branch* → branche `main`, dossier `/ (root)`.
Le site est disponible à l'adresse `https://lune-ecl.github.io/Suivis/` après une ou deux minutes.

### 5. Créer ton compte de responsable

Ouvre le site → **Créer un compte** → choisis **« Je rejoins l'équipe »**. **La première demande d'équipe devient automatiquement responsable de la branche**, alors fais-le dès que le site est en ligne.

Si besoin, tu peux donner le rôle de responsable à un compte depuis le **SQL Editor** :

```sql
update public.membres set role = 'responsable', actif = true
where id = (select id from auth.users where email = 'adresse@exemple.com');
```

### 6. Faire venir tout le monde

- **Les joueurs** créent leur compte avec « Je suis joueur » : ils ont tout de suite accès à leur espace.
- **Les membres de l'équipe et de l'IRS** choisissent « Je rejoins l'équipe » : tu valides leur demande dans **Équipe** en choisissant leur rôle.

---

## Au quotidien

1. **Nouvelle demande** : un joueur ouvre une demande de suivi. Elle apparaît sur le tableau de bord ; un médecin clique sur **Prendre en charge** et devient médecin référent. L'équipe peut aussi ouvrir elle-même un dossier et le **relier au compte du joueur**.
2. **Après chaque rendez-vous RP** : **Compte rendu** sur la fiche du dossier. Le prochain rendez-vous et le nouveau statut se mettent à jour ; le joueur le voit dans son dossier.
3. **Parcours** : clique sur l'étape suivante, le site propose le statut correspondant.
4. **IRS** : avec l'accord du patient, passe le dossier en « Analyse IRS en cours ». Le référent IRS publie son rapport, et le tableau de bord signale le rapport reçu.
5. **Messages** : le joueur et l'équipe échangent dans le dossier. Le tableau de bord signale les messages des joueurs qui attendent une réponse.
6. **Clôture** (responsable) : statut « Dossier clôturé » avec le motif. Le dossier passe dans les archives.

## Sauvegarde

Le plan gratuit de Supabase ne fait pas de sauvegarde automatique. Le responsable peut télécharger toutes les données depuis **Équipe** → **Sauvegarder les données** (fichier JSON). Garde ce fichier en lieu sûr : il contient des informations confidentielles.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html`, `assets/` | le site (aucune installation nécessaire) |
| `config.js` | l'adresse et la clé publique de ta base Supabase |
| `supabase/schema.sql` | tables, règles d'accès et automatismes de la base |
| `assets/vendor/supabase.js` | bibliothèque officielle Supabase (supabase-js 2.117.2, licence MIT) |
| `narrations/` | l'ancien outil de suivi des narrations, toujours utilisable à l'adresse `…/Suivis/narrations/` |
