-- TaazaFeed initial database schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  caption text default '',
  media_url text,
  media_type text not null default 'image' check (media_type in ('image','video')),
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_url text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);

create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists posts_user_id_idx on public.posts(user_id);
create index if not exists comments_post_id_idx on public.comments(post_id, created_at);
create index if not exists messages_pair_idx on public.messages(sender_id, recipient_id, created_at);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.follows enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.stories enable row level security;
alter table public.messages enable row level security;

-- Public profiles and posts are readable by signed-in users. Users only edit their own profile/posts.
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "profile owner inserts" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profile owner updates" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "posts readable by authenticated" on public.posts for select to authenticated using (true);
create policy "post owner creates" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy "post owner updates" on public.posts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "post owner deletes" on public.posts for delete to authenticated using (auth.uid() = user_id);

create policy "follows readable by authenticated" on public.follows for select to authenticated using (true);
create policy "follower creates follow" on public.follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "follower removes follow" on public.follows for delete to authenticated using (auth.uid() = follower_id);

create policy "likes readable by authenticated" on public.likes for select to authenticated using (true);
create policy "user likes" on public.likes for insert to authenticated with check (auth.uid() = user_id);
create policy "user unlikes" on public.likes for delete to authenticated using (auth.uid() = user_id);

create policy "comments readable by authenticated" on public.comments for select to authenticated using (true);
create policy "comment owner creates" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "comment owner deletes" on public.comments for delete to authenticated using (auth.uid() = user_id);

create policy "active stories readable" on public.stories for select to authenticated using (expires_at > now());
create policy "story owner creates" on public.stories for insert to authenticated with check (auth.uid() = user_id);
create policy "story owner deletes" on public.stories for delete to authenticated using (auth.uid() = user_id);

create policy "message participants read" on public.messages for select to authenticated using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "sender sends message" on public.messages for insert to authenticated with check (auth.uid() = sender_id);
create policy "recipient marks read" on public.messages for update to authenticated using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- Automatically create a profile row for new signups.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username',''), 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
