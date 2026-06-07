-- Create categories, incomes, expenses, allocation profiles, allocations, and savings goals

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  slug text,
  type text default 'expense',
  target_amount numeric default 0,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  amount numeric not null check (amount > 0),
  source text,
  date date not null default now(),
  notes text,
  allocation_profile_id uuid,
  allocated boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric not null check (amount > 0),
  date date not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.allocation_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  is_default boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.allocation_profile_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.allocation_profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  percentage numeric not null check (percentage >= 0 and percentage <= 100)
);

create table if not exists public.allocations (
  id uuid primary key default gen_random_uuid(),
  income_id uuid not null references public.incomes(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  amount numeric not null,
  percentage numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  target_date date,
  category_id uuid references public.categories(id) on delete set null,
  status text default 'active',
  created_at timestamptz not null default now()
);

create index if not exists idx_incomes_user_id_date on public.incomes (user_id, date desc);
create index if not exists idx_expenses_user_id_date on public.expenses (user_id, date desc);

-- expose to realtime publication
do $$
begin
  alter publication supabase_realtime add table public.categories;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.incomes;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.expenses;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.allocation_profiles;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.allocation_profile_items;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.allocations;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.savings_goals;
exception when duplicate_object then null;
end $$;

-- Enable RLS for new tables and add permissive dev policies (replace for production)
alter table public.categories enable row level security;
alter table public.incomes enable row level security;
alter table public.expenses enable row level security;
alter table public.allocation_profiles enable row level security;
alter table public.allocations enable row level security;
alter table public.savings_goals enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='allow all categories') then
    create policy "allow all categories" on public.categories for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='incomes' and policyname='allow all incomes') then
    create policy "allow all incomes" on public.incomes for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='expenses' and policyname='allow all expenses') then
    create policy "allow all expenses" on public.expenses for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='allocation_profiles' and policyname='allow all profiles') then
    create policy "allow all profiles" on public.allocation_profiles for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='allocations' and policyname='allow all allocations') then
    create policy "allow all allocations" on public.allocations for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='savings_goals' and policyname='allow all goals') then
    create policy "allow all goals" on public.savings_goals for all using (true) with check (true);
  end if;
end $$;
