import { supabase } from '@/lib/supabaseClient';
import type { Subscription } from '@/types/subscription';
import type { UserProfile } from '@/stores/account';

function subToRow(sub: Partial<Subscription>) {
  const row: Record<string, unknown> = {};
  if (sub.id !== undefined) row.id = sub.id;
  if (sub.name !== undefined) row.name = sub.name;
  if (sub.amount !== undefined) row.amount = sub.amount;
  if (sub.currency !== undefined) row.currency = sub.currency;
  if (sub.billingCycle !== undefined) row.billing_cycle = sub.billingCycle;
  if (sub.customCycleDays !== undefined) row.custom_cycle_days = sub.customCycleDays;
  if (sub.category !== undefined) row.category = sub.category;
  if (sub.startDate !== undefined) row.start_date = sub.startDate;
  if (sub.nextRenewalDate !== undefined) row.next_renewal_date = sub.nextRenewalDate;
  if (sub.reminderDaysBefore !== undefined) row.reminder_days_before = sub.reminderDaysBefore;
  if (sub.autoReminder !== undefined) row.auto_reminder = sub.autoReminder;
  if (sub.isFreeTrial !== undefined) row.is_free_trial = sub.isFreeTrial;
  if (sub.trialEndDate !== undefined) row.trial_end_date = sub.trialEndDate;
  if (sub.providerIcon !== undefined) row.provider_icon = sub.providerIcon;
  if (sub.notes !== undefined) row.notes = sub.notes;
  if (sub.status !== undefined) row.status = sub.status;
  return row;
}

function rowToSub(row: Record<string, unknown>): Subscription {
  return {
    id: row.id as string,
    name: row.name as string,
    amount: Number(row.amount),
    currency: row.currency as string,
    billingCycle: row.billing_cycle as Subscription['billingCycle'],
    customCycleDays: row.custom_cycle_days as number | undefined,
    category: row.category as Subscription['category'],
    startDate: row.start_date as string,
    nextRenewalDate: row.next_renewal_date as string,
    reminderDaysBefore: Number(row.reminder_days_before),
    autoReminder: row.auto_reminder as boolean,
    isFreeTrial: row.is_free_trial as boolean,
    trialEndDate: row.trial_end_date as string | undefined,
    providerIcon: row.provider_icon as string | undefined,
    notes: row.notes as string | undefined,
    status: row.status as Subscription['status'],
  };
}

function accountRowToProfile(row: Record<string, unknown>): Pick<UserProfile, 'name' | 'email' | 'currency' | 'reminderLeadDays'> & { onboarded: boolean; tier: string } {
  return {
    name: (row.name as string) ?? '',
    email: (row.email as string) ?? '',
    currency: (row.currency as string) ?? 'USD',
    reminderLeadDays: Number(row.reminder_lead_days ?? 3),
    onboarded: row.onboarded as boolean,
    tier: (row.tier as string) ?? 'local',
  };
}

export async function listSubscriptions(): Promise<Subscription[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('next_renewal_date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => rowToSub(r as Record<string, unknown>));
}

export async function createSubscription(sub: Subscription): Promise<Subscription> {
  if (!supabase) return sub;
  const row = subToRow(sub);
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(row)
    .select('*')
    .single();
  if (error) throw error;
  return rowToSub(data as Record<string, unknown>);
}

export async function updateSubscription(
  id: string,
  patch: Partial<Subscription>,
): Promise<Subscription> {
  if (!supabase) throw new Error('Supabase not configured');
  const row = subToRow(patch);
  const { data, error } = await supabase
    .from('subscriptions')
    .update(row)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return rowToSub(data as Record<string, unknown>);
}

export async function deleteSubscription(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function fetchAccount(): Promise<{
  profile: Pick<UserProfile, 'name' | 'email' | 'currency' | 'reminderLeadDays'> & { onboarded: boolean; tier: string };
} | null> {
  if (!supabase) return null;
  const userRes = await supabase.auth.getUser();
  if (!userRes.data.user) return null;

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', userRes.data.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { profile: accountRowToProfile(data as Record<string, unknown>) };
}

export async function ensureAccount(
  profile: Partial<UserProfile>,
): Promise<{ profile: Pick<UserProfile, 'name' | 'email' | 'currency' | 'reminderLeadDays'> & { onboarded: boolean; tier: string } }> {
  if (!supabase) throw new Error('Supabase not configured');
  const userRes = await supabase.auth.getUser();
  if (!userRes.data.user) throw new Error('Not authenticated');
  const id = userRes.data.user.id;

  const { data, error } = await supabase
    .from('accounts')
    .upsert(
      {
        id,
        name: profile.name ?? '',
        email: profile.email ?? userRes.data.user.email ?? '',
        currency: profile.currency ?? 'USD',
        reminder_lead_days: profile.reminderLeadDays ?? 3,
        onboarded: true,
      },
      { onConflict: 'id' },
    )
    .select('*')
    .single();
  if (error) throw error;
  return { profile: accountRowToProfile(data as Record<string, unknown>) };
}

export async function updateAccount(
  patch: Partial<UserProfile>,
): Promise<{ profile: Pick<UserProfile, 'name' | 'email' | 'currency' | 'reminderLeadDays'> & { onboarded: boolean; tier: string } }> {
  if (!supabase) throw new Error('Supabase not configured');
  const userRes = await supabase.auth.getUser();
  if (!userRes.data.user) throw new Error('Not authenticated');
  const id = userRes.data.user.id;

  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.currency !== undefined) row.currency = patch.currency;
  if (patch.reminderLeadDays !== undefined) row.reminder_lead_days = patch.reminderLeadDays;

  const { data, error } = await supabase
    .from('accounts')
    .update(row)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return { profile: accountRowToProfile(data as Record<string, unknown>) };
}

export async function resetAccount(): Promise<void> {
  if (!supabase) return;
  const userRes = await supabase.auth.getUser();
  if (!userRes.data.user) return;
  const id = userRes.data.user.id;

  await supabase.from('subscriptions').delete().eq('account_id', id);
  await supabase
    .from('accounts')
    .update({
      name: '',
      email: '',
      currency: 'USD',
      reminder_lead_days: 3,
      onboarded: false,
      tier: 'local',
    })
    .eq('id', id);
}
