-- study-tracker-app: checkbox progress (single row, id = 1)
-- Run in the Supabase SQL Editor of the shared project. Safe to re-run.

create table if not exists public.study_tracker_progress (
  id         int primary key default 1,
  done       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- The app uses the public anon key from the browser, so allow anon
-- to read/write this table only.
alter table public.study_tracker_progress enable row level security;

drop policy if exists "anon read"   on public.study_tracker_progress;
drop policy if exists "anon insert" on public.study_tracker_progress;
drop policy if exists "anon update" on public.study_tracker_progress;

create policy "anon read"   on public.study_tracker_progress for select to anon using (true);
create policy "anon insert" on public.study_tracker_progress for insert to anon with check (true);
create policy "anon update" on public.study_tracker_progress for update to anon using (true) with check (true);
