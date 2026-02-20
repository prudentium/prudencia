-- Prudencia: setup de auth + dados por usuário (Supabase)

create extension if not exists pgcrypto;

-- PERFIL BÁSICO DO USUÁRIO
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- CONFIGURAÇÕES INICIAIS DO USUÁRIO
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  monthly_budget numeric not null default 5000,
  currency text not null default 'BRL',
  created_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "settings_select_own" on public.user_settings;
create policy "settings_select_own"
  on public.user_settings
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "settings_insert_own" on public.user_settings;
create policy "settings_insert_own"
  on public.user_settings
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "settings_update_own" on public.user_settings;
create policy "settings_update_own"
  on public.user_settings
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  amount numeric not null,
  description text not null,
  category_id text not null,
  date timestamptz not null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz not null default now()
);

alter table public.transactions add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.transactions alter column user_id set default auth.uid();

create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_anon" on public.transactions;
drop policy if exists "transactions_insert_anon" on public.transactions;
drop policy if exists "transactions_delete_anon" on public.transactions;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
  on public.transactions
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own"
  on public.transactions
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own"
  on public.transactions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own"
  on public.transactions
  for delete
  to authenticated
  using (user_id = auth.uid());

-- AUTO-PROVISIONAMENTO APÓS SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill para usuários já existentes
insert into public.profiles (id, full_name, email)
select
  u.id,
  u.raw_user_meta_data ->> 'full_name',
  u.email
from auth.users u
on conflict (id) do nothing;

insert into public.user_settings (user_id)
select u.id
from auth.users u
on conflict (user_id) do nothing;

-- LIMPEZA DIÁRIA DE CONTAS NÃO CONFIRMADAS (24h)
create extension if not exists pg_cron;

create or replace function public.delete_unconfirmed_users_older_than_24h()
returns integer
language plpgsql
security definer
set search_path = auth, public
as $$
declare
  deleted_count integer;
begin
  delete from auth.users
  where email_confirmed_at is null
    and created_at < now() - interval '24 hours';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

do $$
begin
  if exists (
    select 1
    from cron.job
    where jobname = 'delete-unconfirmed-users-daily'
  ) then
    perform cron.unschedule('delete-unconfirmed-users-daily');
  end if;
end;
$$;

select cron.schedule(
  'delete-unconfirmed-users-daily',
  '0 3 * * *',
  $$select public.delete_unconfirmed_users_older_than_24h();$$
);