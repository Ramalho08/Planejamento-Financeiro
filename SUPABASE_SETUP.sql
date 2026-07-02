
-- Ramalho Finance Supabase Cloud READY
-- Execute este script no Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  updated_at timestamptz default now()
);

create table if not exists public.transactions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null default 0,
  type text not null check (type in ('income','expense')),
  category text default 'Outros',
  date date not null,
  created_at timestamptz default now()
);

create table if not exists public.wallets (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  balance numeric not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.goals (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target numeric not null default 0,
  saved numeric not null default 0,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.wallets enable row level security;
alter table public.goals enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "transactions_crud_own" on public.transactions;
drop policy if exists "wallets_crud_own" on public.wallets;
drop policy if exists "goals_crud_own" on public.goals;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "transactions_crud_own" on public.transactions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "wallets_crud_own" on public.wallets
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_crud_own" on public.goals
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);
create index if not exists idx_wallets_user on public.wallets(user_id);
create index if not exists idx_goals_user on public.goals(user_id);
