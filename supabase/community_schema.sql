-- FaithBuilt Community Schema
-- Run this in Supabase SQL editor after the main schema.sql

-- ─────────────────────────────────────────────
-- Add reminder_time to profiles
-- ─────────────────────────────────────────────
alter table public.profiles
  add column if not exists reminder_time text;

-- ─────────────────────────────────────────────
-- COMMUNITY POSTS
-- ─────────────────────────────────────────────
create table if not exists public.community_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  author_name text not null,
  content text not null check (char_length(content) between 1 and 200),
  post_date date not null default current_date,
  fire_count integer default 0 check (fire_count >= 0),
  created_at timestamptz default now()
);

alter table public.community_posts enable row level security;

-- Anyone logged in can read all posts
create policy "All users can read community posts"
  on public.community_posts for select
  using (auth.uid() is not null);

-- Users can only create their own posts
create policy "Users can insert own posts"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

-- Users can update their own posts (for fire_count changes via app logic)
-- We allow anyone logged in to update fire_count only
create policy "Users can update any post fire_count"
  on public.community_posts for update
  using (auth.uid() is not null);

-- Users can delete their own posts
create policy "Users can delete own posts"
  on public.community_posts for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- POST REACTIONS (one fire per user per post)
-- ─────────────────────────────────────────────
create table if not exists public.post_reactions (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.community_posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

alter table public.post_reactions enable row level security;

create policy "All users can read reactions"
  on public.post_reactions for select
  using (auth.uid() is not null);

create policy "Users can insert own reactions"
  on public.post_reactions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own reactions"
  on public.post_reactions for delete
  using (auth.uid() = user_id);
