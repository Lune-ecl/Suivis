-- =====================================================================
--  Seimei · Suivi des pathologies — schéma de la base Supabase
--
--  À exécuter une fois dans Supabase :
--    SQL Editor → New query → coller tout ce fichier → Run
--  Le script peut être relancé sans risque.
--
--  Accès :
--    · les joueurs créent leur compte librement : ils ne voient que leurs
--      propres dossiers, ouvrent leurs demandes de suivi, complètent leur
--      fiche et échangent par messages avec l'équipe ;
--    · les demandes pour rejoindre l'équipe sont validées par le
--      responsable ; la toute première devient responsable de la branche ;
--    · médecins, soignants et responsable voient tous les dossiers ;
--    · les référents IRS ne voient que les dossiers dont le patient a
--      donné son accord pour la transmission à l'IRS.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Membres : équipe de la branche, référents IRS et joueurs
-- ---------------------------------------------------------------------
create table if not exists public.membres (
  id          uuid primary key references auth.users (id) on delete cascade,
  nom_rp      text not null default '',
  pseudo      text not null default '',
  role        text not null default 'en_attente'
              check (role in ('en_attente', 'responsable', 'medecin', 'soignant', 'irs', 'patient')),
  actif       boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Rôle de la personne connectée (null si le compte est inconnu ou désactivé).
create or replace function public.role_actuel()
returns text
language sql stable security definer
set search_path = public
as $$
  select role from public.membres where id = auth.uid() and actif
$$;

-- Appelée par le site à la première connexion : crée la fiche membre.
--   · un joueur devient directement « patient » ;
--   · une demande pour l'équipe est « en attente », sauf s'il n'y a encore
--     aucun responsable : elle devient alors responsable de la branche.
create or replace function public.rejoindre(p_nom_rp text default '', p_pseudo text default '', p_equipe boolean default false)
returns public.membres
language plpgsql security definer
set search_path = public
as $$
declare
  moi public.membres;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise.';
  end if;

  insert into public.membres (id, nom_rp, pseudo, role)
  values (
    auth.uid(),
    left(coalesce(nullif(btrim(p_nom_rp), ''), 'Nouveau membre'), 80),
    left(coalesce(btrim(p_pseudo), ''), 80),
    case
      when not coalesce(p_equipe, false) then 'patient'
      when not exists (select 1 from public.membres where role = 'responsable') then 'responsable'
      else 'en_attente'
    end
  )
  on conflict (id) do nothing;

  select * into moi from public.membres where id = auth.uid();
  return moi;
end;
$$;

-- Seul le responsable change les rôles ; il reste toujours un responsable actif.
create or replace function public.proteger_membre()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  new.id := old.id;
  new.created_at := old.created_at;

  -- Depuis le SQL Editor (personne de connecté), tout est permis.
  if auth.uid() is null then
    return new;
  end if;

  if (new.role is distinct from old.role or new.actif is distinct from old.actif)
     and public.role_actuel() is distinct from 'responsable' then
    raise exception 'Seul le responsable de la branche peut modifier les rôles et les accès.';
  end if;

  if old.role = 'responsable' and old.actif
     and (new.role <> 'responsable' or not new.actif)
     and not exists (select 1 from public.membres
                     where role = 'responsable' and actif and id <> old.id) then
    raise exception 'La branche doit garder au moins un responsable actif.';
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_membre on public.membres;
create trigger proteger_membre
  before update on public.membres
  for each row execute function public.proteger_membre();


-- ---------------------------------------------------------------------
-- 2. Dossiers médicaux (un dossier = un patient)
-- ---------------------------------------------------------------------
create table if not exists public.dossiers (
  id                  uuid primary key default gen_random_uuid(),

  -- Identité
  nom                 text not null check (btrim(nom) <> ''),
  prenom              text not null default '',
  age                 text not null default '',
  grade               text not null default '',
  village             text not null default '',

  -- Pathologie
  categories          text[] not null default '{}'
                      check (categories <@ array['genetique', 'inconnue', 'post_op',
                                                 'reeducation', 'sequelle', 'chronique']),
  pathologie          text not null default '',
  origine             text not null default '',
  apparition          text not null default '',
  symptomes           text not null default '',
  antecedents         text not null default '',
  traitements_essayes text not null default '',
  suivi_a_realiser    text not null default '',

  -- HRP
  joueur              text not null default '',
  souhaits_rp         text not null default '',
  limites             text not null default '',
  disponibilites      text not null default '',

  -- Suivi
  statut              text not null default 'attente'
                      check (statut in ('attente', 'examens', 'analyse_irs', 'traitement',
                                        'stable', 'urgent', 'pause', 'cloture')),
  statut_depuis       timestamptz not null default now(),
  parcours            text not null default 'maladie'
                      check (parcours in ('maladie', 'readaptation')),
  etape               smallint not null default 1 check (etape between 1 and 7),
  medecin_id          uuid references public.membres (id) on delete set null,
  patient_id          uuid references public.membres (id) on delete set null,
  consentement_irs    boolean not null default false,
  plan_suivi          text not null default '',
  prochain_rdv        date,
  motif_cloture       text not null default '',

  cree_par            uuid references public.membres (id) on delete set null,
  created_at          timestamptz not null default now(),
  derniere_activite   timestamptz not null default now()
);

create index if not exists dossiers_medecin_idx on public.dossiers (medecin_id);
create index if not exists dossiers_patient_idx on public.dossiers (patient_id);
create index if not exists dossiers_statut_idx on public.dossiers (statut);

-- Règles de la branche, appliquées par la base elle-même.
create or replace function public.controler_dossier()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  qui  uuid := auth.uid();
  mon_role text := public.role_actuel();
begin
  if new.parcours = 'readaptation' and new.etape > 4 then
    new.etape := 4;
  end if;

  if tg_op = 'INSERT' then
    new.cree_par := coalesce(qui, new.cree_par);
    new.created_at := now();
    new.statut_depuis := now();
    new.derniere_activite := now();

    if qui is not null and mon_role = 'patient' then
      -- Demande de suivi d'un joueur : le suivi médical reste à l'équipe.
      new.patient_id := qui;
      new.statut := 'attente';
      new.medecin_id := null;
      new.etape := 1;
      new.plan_suivi := '';
      new.prochain_rdv := null;
      new.motif_cloture := '';
    elsif qui is not null then
      if new.medecin_id is not null and new.medecin_id <> qui
         and mon_role is distinct from 'responsable' then
        raise exception 'Seul le responsable de la branche peut attribuer un dossier à un autre médecin.';
      end if;
      if new.statut = 'cloture' and mon_role is distinct from 'responsable' then
        raise exception 'Seul le responsable de la branche peut clôturer un dossier.';
      end if;
    end if;

    if new.patient_id is not null
       and not exists (select 1 from public.membres where id = new.patient_id and role = 'patient') then
      raise exception 'Le dossier ne peut être relié qu’au compte d’un joueur.';
    end if;
  else
    new.id := old.id;
    new.cree_par := old.cree_par;
    new.created_at := old.created_at;
    new.derniere_activite := now();
    if new.statut is distinct from old.statut then
      new.statut_depuis := now();
    else
      new.statut_depuis := old.statut_depuis;
    end if;

    if qui is not null and mon_role = 'patient' then
      if old.statut = 'cloture' then
        raise exception 'Ce dossier est clôturé.';
      end if;
      if new.statut is distinct from old.statut or new.medecin_id is distinct from old.medecin_id
         or new.parcours is distinct from old.parcours or new.etape is distinct from old.etape
         or new.plan_suivi is distinct from old.plan_suivi or new.prochain_rdv is distinct from old.prochain_rdv
         or new.motif_cloture is distinct from old.motif_cloture or new.patient_id is distinct from old.patient_id then
        raise exception 'Le suivi médical (statut, médecin, parcours, rendez-vous) est géré par l’équipe de la branche.';
      end if;
    elsif qui is not null then
      -- Un médecin peut prendre en charge un dossier libre ; le reste est réservé au responsable.
      if new.medecin_id is distinct from old.medecin_id
         and mon_role is distinct from 'responsable'
         and not (old.medecin_id is null and new.medecin_id = qui) then
        raise exception 'Seul le responsable de la branche peut réattribuer un dossier.';
      end if;
      if (new.statut = 'cloture') <> (old.statut = 'cloture')
         and mon_role is distinct from 'responsable' then
        raise exception 'Seul le responsable de la branche peut clôturer ou rouvrir un dossier.';
      end if;
    end if;

    if new.patient_id is distinct from old.patient_id and new.patient_id is not null
       and not exists (select 1 from public.membres where id = new.patient_id and role = 'patient') then
      raise exception 'Le dossier ne peut être relié qu’au compte d’un joueur.';
    end if;

    if qui is not null and old.consentement_irs and not new.consentement_irs and new.statut = 'analyse_irs' then
      raise exception 'L’analyse de l’IRS est en cours : l’accord ne peut pas être retiré pour l’instant.';
    end if;
  end if;

  if qui is not null and new.statut = 'analyse_irs' and not new.consentement_irs then
    raise exception 'Le patient n’a pas donné son accord pour transmettre ses prélèvements à l’IRS.';
  end if;

  return new;
end;
$$;

drop trigger if exists controler_dossier on public.dossiers;
create trigger controler_dossier
  before insert or update on public.dossiers
  for each row execute function public.controler_dossier();


-- ---------------------------------------------------------------------
-- 3. Journal du dossier : comptes rendus, rapports IRS, messages, événements
-- ---------------------------------------------------------------------
create table if not exists public.entrees (
  id          uuid primary key default gen_random_uuid(),
  dossier_id  uuid not null references public.dossiers (id) on delete cascade,
  type        text not null check (type in ('compte_rendu', 'rapport_irs', 'note', 'evenement')),
  auteur_id   uuid default auth.uid() references public.membres (id) on delete set null,
  contenu     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists entrees_dossier_idx on public.entrees (dossier_id, created_at desc);

-- Une entrée modifiée garde son auteur, son dossier, son type et sa date.
create or replace function public.figer_entree()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  new.id := old.id;
  new.dossier_id := old.dossier_id;
  new.type := old.type;
  new.auteur_id := old.auteur_id;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists figer_entree on public.entrees;
create trigger figer_entree
  before update on public.entrees
  for each row execute function public.figer_entree();

-- Chaque changement important du dossier est inscrit dans son journal.
create or replace function public.journaliser_dossier()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.entrees (dossier_id, type, auteur_id, contenu)
    values (new.id, 'evenement', auth.uid(), jsonb_build_object('champ', 'ouverture'));
    return null;
  end if;

  if new.statut is distinct from old.statut then
    insert into public.entrees (dossier_id, type, auteur_id, contenu)
    values (new.id, 'evenement', auth.uid(),
            jsonb_build_object('champ', 'statut', 'de', old.statut, 'vers', new.statut,
                               'motif', new.motif_cloture));
  end if;

  if new.medecin_id is distinct from old.medecin_id then
    insert into public.entrees (dossier_id, type, auteur_id, contenu)
    values (new.id, 'evenement', auth.uid(),
            jsonb_build_object('champ', 'medecin', 'de', old.medecin_id, 'vers', new.medecin_id));
  end if;

  if new.etape is distinct from old.etape or new.parcours is distinct from old.parcours then
    insert into public.entrees (dossier_id, type, auteur_id, contenu)
    values (new.id, 'evenement', auth.uid(),
            jsonb_build_object('champ', 'etape', 'parcours', new.parcours,
                               'de', old.etape, 'vers', new.etape));
  end if;

  if new.consentement_irs is distinct from old.consentement_irs then
    insert into public.entrees (dossier_id, type, auteur_id, contenu)
    values (new.id, 'evenement', auth.uid(),
            jsonb_build_object('champ', 'consentement', 'vers', new.consentement_irs));
  end if;

  if new.patient_id is distinct from old.patient_id then
    insert into public.entrees (dossier_id, type, auteur_id, contenu)
    values (new.id, 'evenement', auth.uid(),
            jsonb_build_object('champ', 'joueur', 'vers', new.patient_id));
  end if;

  return null;
end;
$$;

drop trigger if exists journaliser_dossier on public.dossiers;
create trigger journaliser_dossier
  after insert or update on public.dossiers
  for each row execute function public.journaliser_dossier();


-- ---------------------------------------------------------------------
-- 4. Traitements et programmes essayés
-- ---------------------------------------------------------------------
create table if not exists public.traitements (
  id            uuid primary key default gen_random_uuid(),
  dossier_id    uuid not null references public.dossiers (id) on delete cascade,
  nom           text not null check (btrim(nom) <> ''),
  type          text not null default 'traitement'
                check (type in ('traitement', 'reeducation', 'prothese', 'autre')),
  debut         date not null default current_date,
  fin           date,
  etat          text not null default 'essai' check (etat in ('essai', 'maintenu', 'arrete')),
  resultat      text not null default 'a_evaluer'
                check (resultat in ('a_evaluer', 'efficace', 'partiel', 'inefficace', 'effets')),
  observations  text not null default '',
  created_at    timestamptz not null default now()
);

create index if not exists traitements_dossier_idx on public.traitements (dossier_id);

create or replace function public.figer_traitement()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  new.id := old.id;
  new.dossier_id := old.dossier_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

drop trigger if exists figer_traitement on public.traitements;
create trigger figer_traitement
  before update on public.traitements
  for each row execute function public.figer_traitement();


-- ---------------------------------------------------------------------
-- 5. Dernière activité (sert à repérer les dossiers inactifs et les nouveautés)
-- ---------------------------------------------------------------------
create or replace function public.noter_activite()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  cible uuid;
begin
  if tg_op = 'DELETE' then
    cible := old.dossier_id;
  else
    cible := new.dossier_id;
    if tg_table_name = 'entrees' then
      if new.type = 'evenement' then
        return null;
      end if;
    end if;
  end if;

  update public.dossiers set derniere_activite = now() where id = cible;
  return null;
end;
$$;

drop trigger if exists noter_activite on public.entrees;
create trigger noter_activite
  after insert or update or delete on public.entrees
  for each row execute function public.noter_activite();

drop trigger if exists noter_activite on public.traitements;
create trigger noter_activite
  after insert or update or delete on public.traitements
  for each row execute function public.noter_activite();


-- ---------------------------------------------------------------------
-- 6. Confidentialité : règles d'accès (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.membres     enable row level security;
alter table public.dossiers    enable row level security;
alter table public.entrees     enable row level security;
alter table public.traitements enable row level security;

-- Personne ne lit quoi que ce soit sans être connecté.
revoke all on public.membres, public.dossiers, public.entrees, public.traitements from anon;

revoke execute on function public.role_actuel() from public, anon;
grant execute on function public.role_actuel() to authenticated;
revoke execute on function public.rejoindre(text, text, boolean) from public, anon;
grant execute on function public.rejoindre(text, text, boolean) to authenticated;

-- Membres : chacun voit sa fiche ; l'équipe voit tout le monde ; les joueurs voient l'équipe.
drop policy if exists "membres : lecture" on public.membres;
create policy "membres : lecture" on public.membres
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select public.role_actuel()) in ('responsable', 'medecin', 'soignant', 'irs')
    or ((select public.role_actuel()) = 'patient' and role in ('responsable', 'medecin', 'soignant', 'irs'))
  );

drop policy if exists "membres : modification" on public.membres;
create policy "membres : modification" on public.membres
  for update to authenticated
  using (id = (select auth.uid()) or (select public.role_actuel()) = 'responsable')
  with check (id = (select auth.uid()) or (select public.role_actuel()) = 'responsable');

-- Dossiers : la branche voit tout, l'IRS les dossiers transmis avec accord, le joueur les siens.
drop policy if exists "dossiers : lecture" on public.dossiers;
create policy "dossiers : lecture" on public.dossiers
  for select to authenticated
  using (
    (select public.role_actuel()) in ('responsable', 'medecin', 'soignant')
    or ((select public.role_actuel()) = 'irs' and consentement_irs)
    or ((select public.role_actuel()) = 'patient' and patient_id = (select auth.uid()))
  );

drop policy if exists "dossiers : création" on public.dossiers;
create policy "dossiers : création" on public.dossiers
  for insert to authenticated
  with check (
    (select public.role_actuel()) in ('responsable', 'medecin')
    or ((select public.role_actuel()) = 'patient' and patient_id = (select auth.uid()))
  );

drop policy if exists "dossiers : modification" on public.dossiers;
create policy "dossiers : modification" on public.dossiers
  for update to authenticated
  using (
    (select public.role_actuel()) in ('responsable', 'medecin')
    or ((select public.role_actuel()) = 'patient' and patient_id = (select auth.uid()))
  )
  with check (
    (select public.role_actuel()) in ('responsable', 'medecin')
    or ((select public.role_actuel()) = 'patient' and patient_id = (select auth.uid()))
  );

drop policy if exists "dossiers : suppression" on public.dossiers;
create policy "dossiers : suppression" on public.dossiers
  for delete to authenticated
  using ((select public.role_actuel()) = 'responsable');

-- Journal : visible par ceux qui voient le dossier.
drop policy if exists "entrées : lecture" on public.entrees;
create policy "entrées : lecture" on public.entrees
  for select to authenticated
  using (exists (select 1 from public.dossiers d where d.id = dossier_id));

drop policy if exists "entrées : création" on public.entrees;
create policy "entrées : création" on public.entrees
  for insert to authenticated
  with check (
    auteur_id = (select auth.uid())
    and exists (select 1 from public.dossiers d where d.id = dossier_id and d.statut <> 'cloture')
    and case type
          when 'compte_rendu' then (select public.role_actuel()) in ('responsable', 'medecin', 'soignant')
          when 'rapport_irs'  then (select public.role_actuel()) in ('responsable', 'irs')
          when 'note'         then (select public.role_actuel()) in ('responsable', 'medecin', 'soignant', 'irs', 'patient')
          else false
        end
  );

drop policy if exists "entrées : modification" on public.entrees;
create policy "entrées : modification" on public.entrees
  for update to authenticated
  using (
    type <> 'evenement'
    and (auteur_id = (select auth.uid()) or (select public.role_actuel()) = 'responsable')
    and exists (select 1 from public.dossiers d where d.id = dossier_id)
  )
  with check (type <> 'evenement');

drop policy if exists "entrées : suppression" on public.entrees;
create policy "entrées : suppression" on public.entrees
  for delete to authenticated
  using (
    ((type <> 'evenement' and auteur_id = (select auth.uid()))
     or (select public.role_actuel()) = 'responsable')
    and exists (select 1 from public.dossiers d where d.id = dossier_id)
  );

-- Traitements : visibles avec le dossier, gérés par les médecins et le responsable.
drop policy if exists "traitements : lecture" on public.traitements;
create policy "traitements : lecture" on public.traitements
  for select to authenticated
  using (exists (select 1 from public.dossiers d where d.id = dossier_id));

drop policy if exists "traitements : création" on public.traitements;
create policy "traitements : création" on public.traitements
  for insert to authenticated
  with check (
    (select public.role_actuel()) in ('responsable', 'medecin')
    and exists (select 1 from public.dossiers d where d.id = dossier_id and d.statut <> 'cloture')
  );

drop policy if exists "traitements : modification" on public.traitements;
create policy "traitements : modification" on public.traitements
  for update to authenticated
  using (
    (select public.role_actuel()) in ('responsable', 'medecin')
    and exists (select 1 from public.dossiers d where d.id = dossier_id)
  )
  with check ((select public.role_actuel()) in ('responsable', 'medecin'));

drop policy if exists "traitements : suppression" on public.traitements;
create policy "traitements : suppression" on public.traitements
  for delete to authenticated
  using (
    (select public.role_actuel()) in ('responsable', 'medecin')
    and exists (select 1 from public.dossiers d where d.id = dossier_id)
  );


-- =====================================================================
--  Commandes utiles (à lancer à la main dans le SQL Editor si besoin)
--
--  Donner le rôle de responsable à un compte, à partir de son e-mail :
--    update public.membres set role = 'responsable', actif = true
--    where id = (select id from auth.users where email = 'adresse@exemple.com');
--
--  Rôles possibles : responsable, medecin, soignant, irs, patient, en_attente
-- =====================================================================
