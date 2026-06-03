-- 003_cloud_tiering.sql
-- Add cloud tiering and 15-day trial support to accounts table
-- See docs/BACKEND_ROADMAP.md §3

-- Add subscription_tier column (defaults to 'local')
alter table accounts 
add column subscription_tier text not null default 'local' 
check (subscription_tier in ('local', 'cloud_trial', 'cloud_paid'));

-- Add trial_ends_at column for cloud trial users
alter table accounts 
add column trial_ends_at timestamptz;

-- Add index for quick trial expiration checks
create index idx_accounts_trial_ends_at on accounts(trial_ends_at) 
where subscription_tier = 'cloud_trial';

-- Update RLS to ensure users can only update their own tier/trial info 
-- (though in practice, this is usually managed by a backend admin function or Stripe webhook)
create policy "Users can view own tier info"
  on accounts for select
  using (auth.uid() = id);

-- Note: Updating subscription_tier should ideally be restricted to 
-- service role (backend) to prevent users from granting themselves free cloud access.