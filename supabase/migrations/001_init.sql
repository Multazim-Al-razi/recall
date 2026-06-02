-- 001_init.sql
-- Initial schema: accounts + subscriptions tables
-- See docs/BACKEND_ROADMAP.md §1 for the full migration plan.

-- ── accounts ──────────────────────────────────────────────────────────

create table accounts (
  id uuid default gen_random_uuid() primary key,
  name text not null default '',
  email text not null default '',
  avatar text,
  currency text not null default 'USD',
  reminder_lead_days integer not null default 3,
  onboarded boolean not null default false,
  tier text not null default 'local' check (tier in ('local', 'sync')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── subscriptions ─────────────────────────────────────────────────────

create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  account_id uuid not null references accounts(id) on delete cascade,
  name text not null,
  amount numeric not null,
  currency text not null default 'USD',
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly', 'weekly', 'custom')),
  custom_cycle_days integer check (custom_cycle_days is null or (custom_cycle_days between 1 and 3650)),
  category text not null default 'other'
    check (category in ('entertainment', 'productivity', 'fitness', 'music', 'cloud', 'news', 'food', 'other')),
  start_date date not null,
  next_renewal_date date not null,
  reminder_days_before integer not null default 3 check (reminder_days_before between 0 and 365),
  auto_reminder boolean not null default true,
  is_free_trial boolean not null default false,
  trial_end_date date,
  provider_icon text,
  notes text,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── indexes ───────────────────────────────────────────────────────────

create index idx_subscriptions_account_id on subscriptions(account_id);
create index idx_subscriptions_next_renewal_date on subscriptions(next_renewal_date);
create index idx_subscriptions_status on subscriptions(status);

-- ── realtime ──────────────────────────────────────────────────────────
-- Enable realtime for multi-device sync (Workstream 3).

alter publication supabase_realtime add table accounts;
alter publication supabase_realtime add table subscriptions;

-- ── auto-update timestamps ────────────────────────────────────────────

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
