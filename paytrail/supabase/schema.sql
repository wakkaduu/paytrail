-- PayTrail schema for Supabase / Postgres
-- Apply this in the Supabase SQL editor after creating your project.

create extension if not exists "pgcrypto";

create table if not exists public.borrowers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  created_at timestamptz not null default now()
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  borrower_id uuid not null references public.borrowers(id) on delete cascade,
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  amount_paid numeric not null check (amount_paid > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_loans_borrower_id_created_at on public.loans (borrower_id, created_at desc);
create index if not exists idx_payments_loan_id_created_at on public.payments (loan_id, created_at asc);

do $$
begin
  alter publication supabase_realtime add table public.borrowers;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.loans;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.payments;
exception when duplicate_object then null;
end $$;

alter table public.borrowers enable row level security;
alter table public.loans enable row level security;
alter table public.payments enable row level security;

-- Temporary open policies for development with the anon key.
-- Replace these with authenticated-user policies before production.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'borrowers' and policyname = 'allow all borrowers'
  ) then
    create policy "allow all borrowers" on public.borrowers for all using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'loans' and policyname = 'allow all loans'
  ) then
    create policy "allow all loans" on public.loans for all using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'allow all payments'
  ) then
    create policy "allow all payments" on public.payments for all using (true) with check (true);
  end if;
end $$;