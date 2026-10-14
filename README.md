# 生命 Seimei · Suivi des pathologies

Site confidentiel de la branche **Suivi des pathologies** de la Seimei, en lien avec l'IRS.
Il accompagne le forum Discord de la branche : chaque dossier du site correspond à un post du forum, et le site prépare tous les textes à y copier (fiche patient, comptes rendus, rapports de l'IRS).

## Ce que fait le site

- **Accès confidentiel** : connexion par compte, validation par le responsable, règles d'accès appliquées par la base elle-même.
- **Tableau de bord** : urgences, dossiers à attribuer, rapports de l'IRS reçus, rendez-vous à venir ou en retard, dossiers inactifs depuis 3 semaines, essais de traitement de plus de 2 semaines, suivis stables sans contrôle depuis 1 mois.
- **Dossiers** : un dossier par patient, avec recherche, filtres par statut, catégorie et médecin.
- **Fiche dossier** :
  - **parcours de soin** étape par étape (parcours maladie en 7 étapes, parcours réadaptation en 4), avec ce qu'il faut vérifier à chaque étape ;
  - **journal** : comptes rendus, rapports de l'IRS, notes et historique automatique (changements de statut, de médecin, d'étape, d'accord IRS) ;
  - **historique des traitements** essayés et de leurs effets ;
  - **accord du patient** pour l'IRS : sans lui, impossible de transmettre le dossier.
- **Discord** : copie en un clic de la fiche patient, du titre du post (`Nom Prénom | Pathologie`), des étiquettes, des comptes rendus et des rapports. Les messages de plus de 2 000 caractères sont découpés automatiquement.
- **Import d'une fiche Discord** : on colle la fiche remplie par le joueur, et le formulaire se remplit tout seul.
- **Archives** : les dossiers clôturés restent consultables et peuvent être rouverts.
- **Équipe** : demandes d'accès, rôles, réattribution des dossiers d'un médecin inactif, sauvegarde des données.

## Qui voit quoi

| Rôle | Voit | Peut |
|---|---|---|
| Responsable de la branche | tous les dossiers | tout : attribuer, clôturer, rouvrir, supprimer, gérer l'équipe |
| Médecin référent | tous les dossiers | ouvrir et modifier des dossiers, prendre en charge un dossier libre, comptes rendus, traitements |
| Personnel soignant | tous les dossiers | comptes rendus et notes |
| Référent IRS | **seulement les dossiers dont le patient a donné son accord** | rapports d'analyse et notes |
| Compte en attente | rien | attendre la validation |

Ces règles sont appliquées **par la base de données** : elles restent valables même si quelqu'un contourne le site.

---

## Mise en route (environ 10 minutes)

### 1. Installer la base dans Supabase

1. Ouvre ton projet sur [supabase.com/dashboard](https://supabase.com/dashboard).
2. Dans le menu de gauche : **SQL Editor** → **New query**.
3. Copie tout le contenu du fichier [`supabase/schema.sql`](supabase/schema.sql), colle-le, puis clique sur **Run**.

Le script peut être relancé sans danger (par exemple après une mise à jour du site).

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
- **Sign In / Providers** → **Email** → désactive **Confirm email** (conseillé). Le service d'e-mails gratuit de Supabase n'envoie que quelques e-mails par heure, ce qui bloquerait les inscriptions. De toute façon, chaque compte doit être validé par le responsable avant de voir quoi que ce soit.

### 4. Mettre le site en ligne

Dans le dépôt GitHub : **Settings** → **Pages** → *Deploy from a branch* → branche `main`, dossier `/ (root)`.
Le site est disponible à l'adresse `https://lune-ecl.github.io/Suivis/` après une ou deux minutes.

### 5. Créer ton compte de responsable

Ouvre le site → **Demander un accès** → crée ton compte. **Le tout premier compte créé devient automatiquement responsable de la branche**, alors fais-le dès que le site est en ligne.

Si besoin, tu peux donner le rôle de responsable à un compte depuis le **SQL Editor** :

```sql
update public.membres set role = 'responsable', actif = true
where id = (select id from auth.users where email = 'adresse@exemple.com');
```

### 6. Faire venir l'équipe

Chaque membre ouvre le site et clique sur **Demander un accès**. Tu valides ensuite sa demande dans **Équipe** en choisissant son rôle (médecin, soignant, référent IRS ou responsable).

---

## Utilisation au quotidien

1. **Ouvrir un dossier** : *Nouveau dossier* → *Importer une fiche* pour coller la fiche du joueur → *Ouvrir le dossier*. Le site affiche ensuite le titre du post, les étiquettes et la fiche à copier sur le forum.
2. **Après chaque rendez-vous RP** : *Compte rendu* sur la fiche du dossier. Le prochain rendez-vous et le nouveau statut se mettent à jour, puis le compte rendu est prêt à copier dans le post du patient.
3. **Faire avancer le parcours** : clique sur l'étape suivante. Le site propose le statut correspondant.
4. **IRS** : enregistre l'accord du patient, passe le dossier en « Analyse IRS en cours ». Le référent IRS le voit alors et publie son rapport ; le tableau de bord signale le rapport reçu.
5. **Clôture** (responsable) : statut « Dossier clôturé » avec le motif. Le dossier passe dans les archives.

Après chaque changement de statut, le site rappelle quelle étiquette mettre sur le post Discord.

## Sauvegarde

Le plan gratuit de Supabase ne fait pas de sauvegarde automatique. Le responsable peut télécharger toutes les données depuis **Équipe** → **Sauvegarder les données** (fichier JSON). Garde ce fichier en lieu sûr : il contient des informations confidentielles.

## Connexion avec Discord (facultatif)

1. Sur [discord.com/developers/applications](https://discord.com/developers/applications) : **New Application** → onglet **OAuth2**. Copie le *Client ID* et génère un *Client Secret*. Dans **Redirects**, ajoute `https://xxxx.supabase.co/auth/v1/callback` (avec l'adresse de ton projet).
2. Dans Supabase : **Authentication** → **Sign In / Providers** → **Discord** : active-le, colle le Client ID et le Client Secret.
3. Dans `config.js`, mets `connexionDiscord: true`.

Le bouton « Continuer avec Discord » apparaît alors sur la page de connexion. Les nouveaux comptes passent toujours par la validation du responsable.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html`, `assets/` | le site (aucune installation nécessaire) |
| `config.js` | l'adresse et la clé publique de ta base Supabase |
| `supabase/schema.sql` | tables, règles d'accès et automatismes de la base |
| `assets/vendor/supabase.js` | bibliothèque officielle Supabase (supabase-js 2.117.2, licence MIT) |
| `narrations/` | l'ancien outil de suivi des narrations, toujours utilisable à l'adresse `…/Suivis/narrations/` |
