-- study-tracker-app (Study rail): checkbox progress
-- Table shape after the PD1 Hub migration: one row per signed-in user,
-- readable and writable only by its owner.
-- On an existing project, run pd1-hub/supabase/pd1hub_migration.sql instead;
-- this file is for reference and for setting up a fresh project. Safe to re-run.

create table if not exists public.study_tracker_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  id         int  not null default 1,  -- legacy, from before PD1 Hub
  done       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.study_tracker_progress enable row level security;

drop policy if exists "owner select" on public.study_tracker_progress;
drop policy if exists "owner insert" on public.study_tracker_progress;
drop policy if exists "owner update" on public.study_tracker_progress;
drop policy if exists "owner delete" on public.study_tracker_progress;

create policy "owner select" on public.study_tracker_progress for select to authenticated using (user_id = auth.uid());
create policy "owner insert" on public.study_tracker_progress for insert to authenticated with check (user_id = auth.uid());
create policy "owner update" on public.study_tracker_progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner delete" on public.study_tracker_progress for delete to authenticated using (user_id = auth.uid());
