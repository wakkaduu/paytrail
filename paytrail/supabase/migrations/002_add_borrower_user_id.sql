-- Add user_id to borrowers and backfill from auth.users where emails match
alter table if exists public.borrowers add column if not exists user_id uuid;

-- Backfill: set borrowers.user_id = auth.users.id where borrowers.contact = auth.users.email
do $$
begin
  update public.borrowers b
  set user_id = u.id
  from auth.users u
  where b.contact is not null and lower(b.contact) = lower(u.email);
exception when others then
  -- ignore errors during backfill
  raise notice 'backfill borrowers.user_id skipped: %', sqlerrm;
end $$;

create index if not exists idx_borrowers_user_id on public.borrowers (user_id);

-- Optional: add policy to allow users to select their own borrowers (dev-friendly fallback)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='borrowers' and policyname='allow_owner_borrowers'
  ) then
    create policy "allow_owner_borrowers" on public.borrowers for select using (user_id = auth.uid()) with check (true);
  end if;
end $$;
