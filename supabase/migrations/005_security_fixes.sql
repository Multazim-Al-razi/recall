-- 005_security_fixes.sql
-- Security audit remediation: DELETE policy on accounts, tier update restriction

-- M1: Add DELETE RLS policy on accounts (GDPR / right-to-delete compliance)
create policy "Users can delete own account"
  on accounts for delete
  using (auth.uid() = id);

-- M2: Restrict subscription_tier and trial_ends_at updates to service role only.
-- Regular users cannot change their own tier to grant themselves cloud_paid access.
-- We create a separate restrictive UPDATE policy that excludes tier columns,
-- then revoke the overly-permissive existing update policy for regular users.

-- Drop the old overly-permissive update policy
drop policy "Users can update own account" on accounts;

-- New user-scoped update policy that excludes tier/trial columns
-- (users can still update name, email, avatar, currency, etc.)
create policy "Users can update own profile fields"
  on accounts for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- subscription_tier must not change via this policy
    AND subscription_tier = (select subscription_tier from accounts where id = auth.uid())
    -- trial_ends_at must not change via this policy
    AND trial_ends_at = (select trial_ends_at from accounts where id = auth.uid())
  );

-- Service role can still update tier (used by backend admin functions / Stripe webhooks)
create policy "Service role can update account tier"
  on accounts for update
  to service_role
  using (true)
  with check (true);