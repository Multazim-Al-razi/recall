# Recall Backend — Supabase Cloud Migration Roadmap

> Tracking document for migrating from the dev-only Express + lowdb service
> in [`../backend/`](../backend/) to a Supabase-powered cloud backend that
> supports the Sync plan ($1.99/mo).
>
> The backend currently boots in dev mode only; a production kill switch in
> [`../backend/src/index.ts`](../backend/src/index.ts) refuses to start
> without an explicit `ALLOW_DEV_BACKEND=1` override.
>
> **Decision:** Supabase replaces the original plan of "lowdb → SQLite →
> Postgres + roll-your-own-auth + roll-your-own-mailer" with a single
> platform that provides hosted Postgres, built-in Auth (magic link + JWT),
> Row Level Security for multi-tenant isolation, Realtime for multi-device
> sync, and Edge Functions for reminder delivery. This eliminates three of
> the four original workstreams as separate projects — they are now Supabase
> features.

The workstreams below are independent and each is shippable as its own PR.
They are ordered because each step is built and tested on top of the previous.

```
[1. Supabase Setup + DB] → [2. Auth + RLS] → [3. Sync + Reminders] → [4. Observability + Ops]
```

---

## 1. Supabase project setup + database migration

**Why:** lowdb is a single JSON file with no write-side concurrency, no
querying, and no backup story. Supabase provides a hosted Postgres database
with built-in migrations, real-time change feeds, and automatic daily
backups — eliminating the need for a self-managed SQLite or Postgres instance.

**Scope:**

- Create a Supabase project (free tier for dev; Pro tier for production).
- Install `@supabase/supabase-js` in both `frontend/` and `backend/`.
- Create Supabase client modules:
  - `frontend/src/lib/supabaseClient.ts` — browser client with anon key,
    session persistence in localStorage (via Supabase's built-in auth
    storage adapter).
  - `backend/src/supabaseClient.ts` — server-side client with service role
    key (bypasses RLS for admin/migration operations), plus a
    `supabaseUserClient` that carries the user's JWT for RLS-protected
    queries.
- Write initial migration (`supabase/migrations/001_init.sql`) with tables
  that mirror the current `AccountRecord` and `SubscriptionRecord` shapes:
  ```sql
  create table accounts (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text,
    avatar text,
    currency text default 'USD',
    reminder_lead_days integer default 3,
    onboarded boolean default false,
    tier text default 'local' check (tier in ('local', 'sync')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  create table subscriptions (
    id uuid default gen_random_uuid() primary key,
    account_id uuid not null references accounts(id) on delete cascade,
    name text not null,
    amount numeric not null,
    currency text default 'USD',
    billing_cycle text not null check (billing_cycle in ('monthly', 'yearly', 'weekly', 'custom')),
    custom_cycle_days integer,
    category text not null,
    start_date date not null,
    next_renewal_date date not null,
    reminder_days_before integer default 3,
    auto_reminder boolean default true,
    is_free_trial boolean default false,
    trial_end_date date,
    provider_icon text,
    notes text,
    status text default 'active' check (status in ('active', 'paused', 'cancelled')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  -- Enable realtime for multi-device sync
  alter publication supabase_realtime add table subscriptions;
  alter publication supabase_realtime add table accounts;

  -- Auto-update timestamps
  create or replace function handle_times()
    returns trigger as $$
    begin
      if tg_op = 'INSERT' then
        new.created_at := now();
        new.updated_at := now();
      elseif tg_op = 'UPDATE' then
        new.created_at = old.created_at;
        new.updated_at := now();
      end if;
      return new;
    end;
    $$ language plpgsql;

  create trigger handle_times_accounts
    before insert or update on accounts
    for each row execute procedure handle_times();

  create trigger handle_times_subscriptions
    before insert or update on subscriptions
    for each row execute procedure handle_times();
  ```
- Write a one-time backfill script that reads `backend/data/recall.json`
  and inserts rows into Supabase. This script uses the service role client
  and runs once during migration.
- Update `backend/src/db.ts` to add a `SupabaseAdapter` alongside the
  existing `LowDbAdapter`, so route handlers can switch between them via
  an env var (`DB_BACKEND=lowdb|supabase`). This lets the dev server keep
  working with lowdb for local-only testing while the cloud path uses
  Supabase.
- Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env.example` (frontend
  and backend). Add `SUPABASE_SERVICE_ROLE_KEY` to backend `.env.example`
  only.

**Acceptance:**

- All existing Vitest validation tests pass unchanged (they test the
  validation layer, not the DB adapter).
- A concurrent-write stress test (50 parallel `POST` calls via Supabase
  adapter) produces 50 distinct rows — no clobbering.
- `npm run dev` works with `DB_BACKEND=lowdb` (existing behavior, no
  regression).
- `npm run dev` with `DB_BACKEND=supabase` and valid Supabase env vars
  successfully reads/writes through Supabase Postgres.

**Estimated effort:** small-medium (1–2 days). Low risk — route signatures
and validator contract are unchanged; only the DB adapter switches.

---

## 2. Authentication + Row Level Security

**Why:** Today every route is world-readable and world-writable. Supabase
Auth provides magic-link email login + signed JWTs out of the box, and
Postgres RLS enforces tenant isolation at the database level — no
application-level filtering needed.

**Scope:**

- Enable Supabase Auth with **magic link (OTP)** as the sole login method.
  This matches the local-first product story (no passwords, no social
  login surface area) and is a built-in Supabase feature — no custom
  email-sending code required.
- Frontend changes:
  - Add a `useAuth` hook in `frontend/src/hooks/useAuth.ts` that wraps
    `supabase.auth.signInWithOtp({ email })`, `supabase.auth.verifyOtp()`,
    `supabase.auth.getSession()`, and `supabase.auth.onAuthStateChange()`.
  - Update `useApiSync` to send `Authorization: Bearer <jwt>` on every
    API call. Store the session in Supabase's built-in localStorage adapter
    (replaces the planned separate localStorage key).
  - Add login/verify screens to the Onboarding flow (or a new `/login`
    route) that call `signInWithOtp` and `verifyOtp`.
- Backend changes:
  - Add a `requireAuth` middleware in `backend/src/auth.ts` that:
    - Reads `Authorization: Bearer <jwt>` from the request header.
    - Verifies the JWT using `supabase.auth.getUser(token)`.
    - Attaches `req.user = { id, email, ... }` for downstream handlers.
    - Rejects unauthenticated requests with `401`.
  - Update `useApiSync` proxy calls in the backend to forward the user's
    JWT to Supabase when making RLS-protected queries.
- RLS policies:
  ```sql
  -- Enable RLS on both tables
  alter table accounts enable row level security;
  alter table subscriptions enable row level security;

  -- Users can only see and modify their own account
  create policy "Users can view own account"
    on accounts for select
    using (auth.uid() = id);

  create policy "Users can update own account"
    on accounts for update
    using (auth.uid() = id);

  -- Users can only see and modify their own subscriptions
  create policy "Users can view own subscriptions"
    on subscriptions for select
    using (auth.uid() = account_id);

  create policy "Users can insert own subscriptions"
    on subscriptions for insert
    with check (auth.uid() = account_id);

  create policy "Users can update own subscriptions"
    on subscriptions for update
    using (auth.uid() = account_id);

  create policy "Users can delete own subscriptions"
    on subscriptions for delete
    using (auth.uid() = account_id);
  ```
- The backend routes continue to work as Express endpoints (they act as a
  thin proxy to Supabase, forwarding the user's JWT). Over time, the
  frontend may call Supabase directly for reads (bypassing the Express
  layer entirely), but writes initially go through the backend for
  validation + sanitization.
- Add a `role` column to `accounts` (`'user' | 'admin'`) for the future
  developer dashboard. Default is `'user'`. Admin access uses the service
  role client on the backend side, not RLS.

**Acceptance:**

- An unauthenticated request to any `/api/*` route other than
  `/api/auth/*` and `/api/health` returns `401`.
- A request authenticated as account A cannot read or write account B's
  rows (`403` or `404`, not `200`) — enforced by RLS.
- The frontend `useApiSync` round-trips successfully when Supabase issues
  a JWT, and falls back to local-first when the backend is unreachable
  (no regression to the offline experience).
- Magic link login flow works end-to-end: user enters email → Supabase
  sends OTP → user enters OTP → frontend receives session.

**Estimated effort:** medium (2–3 days). Supabase handles the hardest parts
(email delivery, JWT signing, token refresh); the work is wiring it into
the existing Express routes and frontend sync hooks.

---

## 3. Multi-device sync + Reminder delivery

**Why:** The Sync plan ($1.99/mo) is the *only* feature that justifies the
cloud backend. Without it, paying users get nothing they didn't already
have on the free Local plan. Supabase Realtime and Edge Functions replace
the planned cron worker + SES mailer + BullMQ stack.

**Depends on:** §2 (Auth + RLS). Does **not** depend on §1 being
fully complete — you can start sync/reminder work as soon as Auth ships,
since Supabase Postgres is provisioned with the project.

**Scope:**

- **Multi-device sync via Supabase Realtime:**
  - The frontend subscribes to `postgres_changes` on the `subscriptions`
    and `accounts` tables, filtered by the authenticated user's `account_id`.
  - When a change arrives via Realtime, the Zustand store is updated
    in-place, keeping the UI reactive without manual polling.
  - The existing `useApiSync` hook gains a `useRealtimeSync` companion that
    opens a Supabase channel on mount and cleans up on unmount.
  - The local-first fallback remains: if Realtime disconnects, mutations
    still write to Zustand + localStorage and sync on reconnect.

- **Reminder delivery via Supabase Edge Functions:**
  - Create a Supabase Edge Function `send-reminders` (Deno runtime) that:
    - Runs on a Supabase cron trigger (pg_cron extension) every 5 minutes.
    - Queries subscriptions where
      `next_renewal_date - reminder_days_before` falls in the next 5
      minutes and `auto_reminder = true`.
    - Sends an email for each matching subscription using Supabase's
      built-in email delivery (or an SES integration via Edge Function
      env vars for production).
    - Writes to a `reminders` table to deduplicate (never send the same
      reminder twice).
  ```sql
  create table reminders (
    id uuid default gen_random_uuid() primary key,
    subscription_id uuid not null references subscriptions(id),
    account_id uuid not null references accounts(id),
    sent_at timestamptz default now(),
    reminder_type text not null check (reminder_type in ('renewal', 'trial_expiry')),
    unique(subscription_id, reminder_type, date_trunc('day', sent_at))
  );

  alter table reminders enable row level security;

  create policy "Users can view own reminders"
    on reminders for select
    using (auth.uid() = account_id);
  ```
  - **Daily digest:** An optional Edge Function `daily-digest` that sends
    a summary email at 9am local time with the day's renewals.
  - **Web Push:** Follow-up (v1.1); v1 ships email-only per the Sync plan FAQ.
- Flip `FLAGS.syncPlan = true` in `lib/featureFlags.ts` once reminder
  delivery is live end-to-end.

**Acceptance:**

- A subscription with `next_renewal_date = today + reminder_days_before`
  produces exactly one `reminders` row and exactly one email when the cron
  fires.
- Re-running the cron on the same data does not produce duplicate emails
  (deduplication via the `reminders` unique constraint).
- Two browser tabs (or two devices) signed in as the same user see
  real-time sync: a mutation in one tab appears in the other within 2
  seconds.
- Console log mode (dev) logs would-be emails; production mode sends
  real emails via Supabase's configured mailer or SES.

**Estimated effort:** medium (2–3 days for sync + email; +1–2 for web
push). Much less than the original plan because Supabase handles
infrastructure (cron, mailer, realtime) — the work is wiring Edge
Functions and frontend Realtime subscriptions.

---

## 4. Observability, backups, and ops

**Why:** Once §1–§3 ship, the service can be deployed. Supabase provides
built-in daily backups, logging, and health monitoring — but the Express
proxy layer and Edge Functions still need operational coverage.

**Scope:**

- Replace `console.*` with `pino` structured logging in the Express backend.
  One log line per request: `req.id`, `accountId`, `route`, `status`,
  `durationMs`.
- Add `/api/health/deep` that checks Supabase connectivity (ping the
  Postgres pool) and Edge Function status.
- Supabase provides automatic daily backups on the Pro tier; document this
  in a `RUNBOOK.md`. On the free tier, add a manual `pg_dump` script
  (Supabase CLI: `supabase db dump`) for local backup retention.
- A `Dockerfile` and `docker-compose.yml` for one-command local prod-like
  runs: Express proxy + Supabase CLI local dev stack (`supabase start`).
- A short `RUNBOOK.md` covering: how to roll back a migration, how to
  restore from Supabase backup, how to read the access log, how to rotate
  `SUPABASE_SERVICE_ROLE_KEY`, how to manage Edge Function deployments.
- Update the production kill switch: remove `ALLOW_DEV_BACKEND=1` once
  §1–§4 are done and the Express proxy is pointing at a production Supabase
  project.

**Acceptance:**

- `docker compose up` + `supabase start` brings up a fully working local
  stack (Express proxy + local Supabase dev instance).
- Killing the Express proxy and restarting preserves all data through the
  Supabase Postgres layer.
- A request to a dead route produces a structured `pino` log line.
- Supabase dashboard shows backup history (Pro tier) or manual backups are
  documented (free tier).

**Estimated effort:** small (1 day). Supabase handles backups and DB
ops; the work is Express-side logging + the Docker/RUNBOOK story.

---

## Pre-flight checklist before removing the production kill switch

The `ALLOW_DEV_BACKEND` override in [`../backend/src/index.ts`](../backend/src/index.ts)
should only be removed when **all** of the following are true:

- [ ] §1 done — Supabase Postgres is the data source; lowdb is not used in
      production.
- [ ] §2 done — every `/api/*` route other than `/api/auth/*` and
      `/api/health` returns `401` to unauthenticated requests; RLS
      policies are active.
- [ ] §3 done — at least one subscription has received a real reminder
      email end-to-end via Supabase Edge Functions.
- [ ] §4 done — `pino` logging is wired, RUNBOOK.md exists, backup story
      is verified.
- [ ] Staging Supabase project (separate from production) is in use for
      testing.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is stored in a secrets manager (not in
      `.env` files on the production host).

Until then, `NODE_ENV=production` should keep refusing to boot.

## Open questions

- **Pricing model:** $1.99/mo is the committed price. Supabase Pro tier
  ($25/mo) is needed for production backups and Edge Function deployment.
  The margin is tight at one user; breaks even at ~13 Sync subscribers.
  Consider annual pricing or a higher per-user rate before §3 ships.
- **Supabase region:** Pick the Supabase project region closest to the
  target user base. This determines both Postgres latency and SES email
  routing.
- **Data retention:** When a user cancels Sync, Supabase Auth supports
  `auth.admin.deleteUser()` — decide whether to soft-delete (keep rows
  for N days) or hard-delete immediately. Affects RLS policies and the
  privacy page copy.
- **Express proxy vs. direct Supabase calls:** The current architecture
  routes all API calls through Express. As the frontend matures, read
  operations (subscription list, account GET) can call Supabase directly
  using the anon key + RLS, bypassing Express entirely. Write operations
  should still go through Express for validation + sanitization. Decide
  the migration timeline.

## Supabase project structure

Once all workstreams are complete, the project structure will include:

```
recall-app/
├── supabase/
│   ├── config.toml            # Supabase CLI config
│   ├── migrations/
│   │   ├── 001_init.sql       # accounts + subscriptions tables
│   │   ├── 002_rls.sql        # Row Level Security policies
│   │   ├── 003_reminders.sql  # reminders table + unique dedup
│   │   └── 004_audit.sql      # audit_log table (dev dashboard)
│   └── functions/
│       ├── send-reminders/    # Edge Function: cron-triggered reminder emails
│       │   └ index.ts
│       └── daily-digest/      # Edge Function: daily summary email
│       │   └ index.ts
├── backend/
│   └── src/
│       ├── supabaseClient.ts  # Server-side Supabase clients (service role + user)
│       ├── auth.ts            # requireAuth middleware (JWT verification via Supabase)
│       ├── db.ts              # Adapter pattern: LowDbAdapter | SupabaseAdapter
│       ├── index.ts           # Express server (production kill switch updated)
│       ├── validate.ts        # Input validation (unchanged)
│       └── routes/            # Express routes (unchanged signatures)
├── frontend/
│   └── src/
│       ├── lib/
│       │   ├── supabaseClient.ts  # Browser Supabase client (anon key)
│       │   ├── api.ts             # API client (now sends Bearer JWT)
│       │   └── featureFlags.ts    # FLAGS.syncPlan (flipped after §3)
│       ├── hooks/
│       │   ├── useApiSync.ts      # Sync hook (adds JWT header)
│       │   ├── useRealtimeSync.ts # Realtime channel subscription
│       │   └── useAuth.ts         # Auth state hook (signInWithOtp, verifyOtp, session)
│       └── stores/                # Zustand stores (unchanged; Realtime updates them)
```