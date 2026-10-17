-- Arivia database setup. Paste this into Supabase → SQL Editor → Run, once.

-- One profile per account.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  home_city text default 'Երևան',
  language text default 'hy' check (language in ('hy', 'en')),
  currency text default 'AMD',
  passport_country text default 'AM',
  travel_styles text[] default '{}',
  visas jsonb default '[]'::jsonb, -- [{ id, country, type, expiry }]
  updated_at timestamptz default now()
);

-- Each person can only see and change their own profile.
alter table public.profiles enable row level security;

drop policy if exists "Own profile: read" on public.profiles;
create policy "Own profile: read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Own profile: insert" on public.profiles;
create policy "Own profile: insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Own profile: update" on public.profiles;
create policy "Own profile: update" on public.profiles
  for update using (auth.uid() = id);

-- Create an empty profile automatically when someone signs up (email or Google).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets a signed-in person delete their own account (the profile goes with it).
create or replace function public.delete_my_account()
returns void language sql security definer set search_path = public as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
