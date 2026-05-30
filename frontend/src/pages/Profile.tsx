import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Check, CreditCard, RotateCcw } from 'lucide-react';
import { useAccountStore } from '@/stores/account';
import { useSubscriptionStore, getActiveSubscriptions } from '@/stores/subscription';
import { PLAN_CONFIG } from '@/types/plan';
import { Illustration } from '@/components/ui/Illustration';
import { MaskDivider } from '@/components/layout/MaskDivider';
import { initials } from '@/lib/format';

const inputClass =
  'mt-1.5 w-full rounded-md border border-ink/10 bg-canvas px-4 py-2.5 text-[15px] focus:border-rausch focus:outline-none';

export function ProfilePage() {
  const profile = useAccountStore((s) => s.profile);
  const plan = useAccountStore((s) => s.plan);
  const updateProfile = useAccountStore((s) => s.updateProfile);
  const resetAccount = useAccountStore((s) => s.resetAccount);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);

  const planConfig = PLAN_CONFIG[plan];
  const activeCount = getActiveSubscriptions(subscriptions).length;
  const limit = planConfig.subscriptionLimit;
  const usagePct = limit === Infinity ? 0 : Math.min(100, (activeCount / limit) * 100);

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [currency, setCurrency] = useState(profile.currency);
  const [reminderLeadDays, setReminderLeadDays] = useState(profile.reminderLeadDays);
  const [saved, setSaved] = useState(false);

  const dirty =
    name !== profile.name ||
    email !== profile.email ||
    currency !== profile.currency ||
    reminderLeadDays !== profile.reminderLeadDays;

  const save = () => {
    updateProfile({ name: name.trim() || 'Friend', email: email.trim(), currency, reminderLeadDays });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Reset your profile and plan? Your subscriptions are kept.')) {
      resetAccount();
      setName('');
      setEmail('');
      setCurrency('USD');
      setReminderLeadDays(3);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8 md:px-12">
        {/* Header */}
        <section className="flex flex-col items-center gap-6 pt-6 pb-10 sm:flex-row sm:gap-7 md:pt-8">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt=""
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rausch to-[#e8726a] text-[28px] font-bold text-white">
              {initials(profile.name)}
            </div>
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-[32px] font-light tracking-[-1.5px]">
              {profile.name || 'Your profile'}
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              {profile.email || 'No email set'} · {currency}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 pb-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Account settings */}
          <div className="rounded-xl bg-surface p-7">
            <h2 className="text-[18px] font-semibold">Account settings</h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-[13px] font-medium text-ink/70">Name</span>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-ink/70">Email</span>
                <input
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <div className="flex flex-col gap-4 sm:flex-row">
                <label className="block flex-1">
                  <span className="text-[13px] font-medium text-ink/70">Currency</span>
                  <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block flex-1">
                  <span className="text-[13px] font-medium text-ink/70">Reminder lead time</span>
                  <select
                    className={inputClass}
                    value={reminderLeadDays}
                    onChange={(e) => setReminderLeadDays(Number(e.target.value))}
                  >
                    {[1, 2, 3, 5, 7, 14].map((d) => (
                      <option key={d} value={d}>
                        {d} day{d > 1 ? 's' : ''} before
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={save}
                disabled={!dirty}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all ${
                  dirty
                    ? 'bg-rausch text-white hover:-translate-y-0.5'
                    : 'cursor-default bg-ink/8 text-muted'
                }`}
              >
                {saved ? <Check size={16} /> : null}
                {saved ? 'Saved' : 'Save changes'}
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-rausch"
              >
                <RotateCcw size={14} />
                Reset account
              </button>
            </div>
          </div>

          {/* Plan card */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-surface p-7">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-muted">
                  <CreditCard size={13} />
                  Current plan
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[1px] text-white"
                  style={{ background: planConfig.accent }}
                >
                  {planConfig.name}
                </span>
              </div>
              <div className="mt-3 text-[15px] text-muted">{planConfig.tagline}</div>

              {/* Usage */}
              <div className="mt-5">
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="font-medium">Subscriptions</span>
                  <span className="text-muted">
                    {activeCount} / {limit === Infinity ? 'unlimited' : limit}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/8">
                  <div
                    className="h-full rounded-full bg-rausch transition-all"
                    style={{ width: limit === Infinity ? '12%' : `${usagePct}%` }}
                  />
                </div>
                {limit !== Infinity && activeCount >= limit && (
                  <p className="mt-2 text-[12px] font-medium text-rausch">
                    You've hit your plan limit — upgrade to add more.
                  </p>
                )}
              </div>

              <Link
                to="/pricing"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rausch px-5 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5"
              >
                {plan === 'max' ? 'View plans' : 'Upgrade plan'}
              </Link>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-surface p-5">
              <Illustration name="profile" className="h-[80px] w-[90px] shrink-0 object-contain" />
              <p className="text-[13px] leading-[1.5] text-muted">
                Recall is local-first. Your profile, plan, and subscriptions live
                only in this browser.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MaskDivider />
      <section className="pb-24 pt-8 text-center text-[13px] text-muted">
        Manage your subscriptions from the{' '}
        <Link to="/dashboard/subscriptions" className="border-b border-rausch/30 text-rausch">
          Subscriptions
        </Link>{' '}
        page.
      </section>
    </motion.div>
  );
}
