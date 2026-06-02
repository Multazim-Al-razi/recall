-- 002_rls.sql
-- Row Level Security + role column
-- See docs/BACKEND_ROADMAP.md §2

-- Enable RLS on both tables
alter table accounts enable row level security;
alter table subscriptions enable row level security;

-- ── RLS policies: accounts ────────────────────────────────────────────
-- Users can only see and modify their own account
create policy "Users can view own account"
  on accounts for select
  using (auth.uid() = id);

create policy "Users can update own account"
  on accounts for update
  using (auth.uid() = id);

create policy "Users can insert own account"
  on accounts for insert
  with check (auth.uid() = id);

-- ── RLS policies: subscriptions ───────────────────────────────────────
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

-- ── Role column ──────────────────────────────────────────────────────
-- Adds a role field for the future developer dashboard. Default 'user'.
-- Admin access uses the service role client on the backend side, not RLS.
alter table accounts add column role text not null default 'user'
  check (role in ('user', 'admin'));
