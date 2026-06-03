create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  avatar text not null default 'rocket',
  level int not null default 1,
  xp int not null default 0,
  coins int not null default 0,
  streak int not null default 0,
  completed_lessons int not null default 0,
  accuracy numeric(5, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  topic text not null,
  difficulty text not null,
  game_mode text not null,
  score int not null,
  accuracy numeric(5, 2) not null,
  fastest_time numeric(6, 2),
  created_at timestamptz not null default now()
);

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade unique,
  child_name text not null,
  avatar text not null,
  score int not null default 0,
  accuracy numeric(5, 2) not null default 0,
  fastest_time numeric(6, 2) not null default 0,
  week_start date not null default date_trunc('week', now())::date,
  updated_at timestamptz not null default now()
);

alter table public.child_profiles enable row level security;
alter table public.lesson_attempts enable row level security;
alter table public.leaderboard_entries enable row level security;

create policy "parents read own children"
on public.child_profiles for select
using (auth.uid() = parent_id);

create policy "parents manage own children"
on public.child_profiles for all
using (auth.uid() = parent_id)
with check (auth.uid() = parent_id);

create policy "public leaderboard read"
on public.leaderboard_entries for select
using (true);
