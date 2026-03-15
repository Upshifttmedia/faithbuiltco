˜-- FaithBuilt Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- DAILY COMPLETIONS
-- Tracks which tasks were checked off each day
-- ─────────────────────────────────────────────
create table if not exists public.daily_completions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  completion_date date not null default current_date,
  pillar text not null,          -- 'faith' | 'body' | 'mind' | 'stewardship'
  task_key text not null,        -- e.g. 'faith_prayer', 'body_exercise'
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, completion_date, task_key)
);

alter table public.daily_completions enable row level security;

create policy "Users can manage own completions"
  on public.daily_completions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- STREAKS
-- ─────────────────────────────────────────────
create table if not exists public.streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_completed_date date,
  updated_at timestamptz default now()
);

alter table public.streaks enable row level security;

create policy "Users can manage own streak"
  on public.streaks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- JOURNAL ENTRIES
-- ─────────────────────────────────────────────
create table if not exists public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  entry_date date not null default current_date,
  content text not null default '',
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (user_id, entry_date)
);

alter table public.journal_entries enable row level security;

create policy "Users can manage own journal"
  on public.journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
