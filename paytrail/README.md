# PayTrail

PayTrail is a loan tracking app built with React, Vite, and Supabase. Over the current session we expanded the project toward a Personal Finance Management System while preserving the existing loan-management features.

## Quick setup

1. Create a Supabase project.
2. Apply the SQL migrations in the `supabase/migrations/` folder (see order below).
3. Copy your Supabase URL and anon key into `.env` / Vite env vars.
4. Start the app with:

```bash
npm install
npm run dev
```

Run tests with:

```bash
npm test
```

### Environment variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## What I did today 6/7/2026

- Added ephemeral toast notifications and wired them into several finance pages to improve UX:
	- `src/components/Toast.jsx` (new)
	- `src/pages/Categories.jsx` — shows "Default categories created" after seeding
	- `src/pages/Incomes.jsx` — shows "Income added"
	- `src/pages/Expenses.jsx` — shows "Expense recorded"
	- `src/pages/Goals.jsx` — shows "Goal created"
- Updated pages to refresh lists after successful create actions so the UI and toasts reflect real state.
- Ran unit tests: `npm test` — existing tests pass.

## Files & services touched today

- `src/components/Toast.jsx` (added)
- `src/pages/Categories.jsx` (updated)
- `src/pages/Incomes.jsx` (updated)
- `src/pages/Expenses.jsx` (updated)
- `src/pages/Goals.jsx` (updated)

## Database migrations (added but NOT applied to Supabase)

The repo contains SQL migration files in `supabase/migrations/`. Important ones added earlier in the project:

- `002_add_borrower_user_id.sql` — add `user_id` to `borrowers` and backfill/index
- `003_rls_loans_payments.sql` — RLS policies restricting `loans`/`payments` access to borrower owners
- `004_create_financial_tables.sql` — create `categories`, `incomes`, `expenses`, `allocations`, `savings_goals`, etc.

Apply these migrations on your Supabase project in the order above before using the new finance features.

## Pending / Next todos

The high-level pending work (ordered) is tracked in the project TODO list and includes:

- Apply DB migrations to Supabase (in-progress)
- Seed default categories in DB (use the UI `Create Default Categories` or call `categoriesService.createDefaultCategories(userId)`)
- Add error toasts and success toasts for loans/payments
- Add an admin UI for linking `borrowers.user_id` to auth users for unmatched records
- Implement Allocation Profiles UI and complete automatic allocation flows
- Improve dashboard metrics (Net Worth, Total Cash Available)
- Add reports and CSV/Excel export features
- Set up CI, tests, and linting
- Expand documentation and rollout instructions

If you want, I can apply the migrations to your Supabase instance next (I'll need the database access steps), seed categories, and wire error toasts for all create/update actions.

## Notes & recommendations

- Toasts are client-side and lightweight; consider migrating to a global Notification Provider for consistent UX across the app.
- RLS must be carefully validated after applying migrations — test `My Debts` and dashboard while signed in as different users.
- For production, tighten any permissive RLS policies and remove dev-open policies.

----

If you'd like, I'll commit these README changes and then apply the DB migrations and seed default categories next. Reply which action to take next.