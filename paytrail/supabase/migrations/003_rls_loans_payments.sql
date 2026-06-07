-- Create RLS policies for loans and payments that restrict access to borrower owners
-- Assumes borrowers.user_id exists and is linked to auth.users.id

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='loans' and policyname='allow_owner_loans') then
    create policy "allow_owner_loans" on public.loans for all
      using (
        exists (select 1 from public.borrowers b where b.id = public.loans.borrower_id and b.user_id = auth.uid())
      )
      with check (
        exists (select 1 from public.borrowers b where b.id = public.loans.borrower_id and b.user_id = auth.uid())
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='payments' and policyname='allow_owner_payments') then
    create policy "allow_owner_payments" on public.payments for all
      using (
        exists (
          select 1 from public.loans l
            join public.borrowers b on b.id = l.borrower_id
          where l.id = public.payments.loan_id and b.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.loans l
            join public.borrowers b on b.id = l.borrower_id
          where l.id = public.payments.loan_id and b.user_id = auth.uid()
        )
      );
  end if;
end $$;
