import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import {
  Activity,
  CheckCircle2,
  DollarSign,
  Users,
  XCircle,
  ArrowLeft,
  RefreshCw,
  CalendarClock,
  Wifi,
  WifiOff,
  BarChart3,
} from 'lucide-react';
import {
  useSubscriptionStore,
  getMonthlySpend,
  getByCategory,
  getUpcomingRenewals,
  getFreeTrials,
  getActiveSubscriptions,
} from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { currencySymbol } from '@/lib/format';
import { statsApi, type ApiStats } from '@/lib/api';
import { CATEGORY_CONFIG, CATEGORY_COLORS } from '@/types/subscription';
import type { Category } from '@/types/subscription';

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: 'easeOut' as const },
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Production-ready KPI dashboard — works in both local and cloud mode.
 *
 * - "My Stats" section: always visible, reads from Zustand stores.
 * - "Product Health" section: visible when the backend responds with
 *   aggregated cross-user metrics (Supabase mode). In lowdb mode it
 *   falls back to the single user's data with a note.
 *
 * Mounted at `/dashboard/stats` — no DEV gate, available in production.
 */
export function StatsView() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const profile = useAccountStore((s) => s.profile);
  const onboarded = useAccountStore((s) => s.onboarded);
  const sym = currencySymbol(profile.currency);

  const [serverStats, setServerStats] = useState<ApiStats | null>(null);
  const [serverError, setServerError] = useState(false);
  const [loading, setLoading] = useState(true);

  function fetchServerStats() {
    setLoading(true);
    setServerError(false);
    statsApi
      .get()
      .then((data) => {
        setServerStats(data);
        setLoading(false);
      })
      .catch(() => {
        setServerError(true);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchServerStats();
  }, []);

  // Local stats (always available)
  const active = getActiveSubscriptions(subscriptions);
  const cancelled = subscriptions.filter((s) => s.status === 'cancelled');
  const paused = subscriptions.filter((s) => s.status === 'paused');
  const trials = getFreeTrials(subscriptions);
  const renewals7d = getUpcomingRenewals(subscriptions, 7);
  const renewals30d = getUpcomingRenewals(subscriptions, 30);
  const monthlySpend = getMonthlySpend(subscriptions);
  const yearlyProjection = monthlySpend * 12;
  const byCategory = getByCategory(subscriptions);
  const categoryEntries = Object.entries(byCategory).sort(
    ([, a], [, b]) => b - a,
  );
  const maxCategory = categoryEntries[0]?.[1] ?? 1;

  // localStorage health
  const storageMetrics = useMemo(() => {
    const keys = ['recall-subscriptions', 'recall-account', 'recall-connection'];
    let totalBytes = 0;
    const rows = keys.map((key) => {
      const raw =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(key)
          : null;
      const bytes = raw ? raw.length : 0;
      totalBytes += bytes;
      return { key, bytes, present: raw !== null };
    });
    return { rows, totalBytes };
  }, []);

  // Server category breakdown (use server stats if available)
  const serverCategoryEntries = serverStats
    ? Object.entries(serverStats.categoryBurn).sort(([, a], [, b]) => b - a)
    : [];
  const maxServerCategory = serverCategoryEntries[0]?.[1] ?? 1;

  const refresh = () => {
    fetchServerStats();
    window.location.reload();
  };

  return (
    <motion.div {...fadeUp} className="pb-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 md:px-10">
        {/* Header */}
        <header className="flex flex-col gap-4 pt-2 pb-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              aria-label="Back to dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted shadow-[0_0_0_1px_var(--color-hairline),var(--shadow-xs)] transition-colors hover:text-ink"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[2px] text-rausch">
                Stats · Metrics
              </div>
              <h1 className="font-display text-[26px] font-light leading-[1.1] tracking-[-0.5px] md:text-[32px]">
                Product KPIs
              </h1>
            </div>
            {/* Backend status indicator */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              {loading ? (
                <span className="flex items-center gap-1.5 text-muted">
                  <RefreshCw size={12} className="animate-spin" /> Loading…
                </span>
              ) : serverStats ? (
                <span className="flex items-center gap-1.5 text-success">
                  <Wifi size={12} /> {serverStats.mode === 'supabase' ? 'Cloud' : 'Local'}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-rausch">
                  <WifiOff size={12} /> Offline
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-[13px] font-semibold text-ink shadow-[0_0_0_1px_var(--color-hairline),var(--shadow-xs)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </header>

        {/* ─── My Stats ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-3 font-display text-[18px] font-normal tracking-tight">
            My Stats
          </h2>
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
            <KpiTile
              icon={<Activity size={16} />}
              label="My subscriptions"
              value={String(subscriptions.length)}
              hint={`${active.length} active · ${cancelled.length} cancelled`}
            />
            <KpiTile
              icon={<CheckCircle2 size={16} />}
              label="Active now"
              value={String(active.length)}
              hint={`${paused.length} paused · ${trials.length} on trial`}
            />
            <KpiTile
              icon={<DollarSign size={16} />}
              label="My monthly burn"
              value={`${sym}${monthlySpend.toFixed(2)}`}
              hint={`Year ≈ ${sym}${yearlyProjection.toFixed(0)}`}
            />
            <KpiTile
              icon={<Users size={16} />}
              label="Onboarded"
              value={onboarded ? 'Yes' : 'No'}
              hint={profile.name || '(no profile yet)'}
            />
          </div>
        </section>

        {/* ─── My Category breakdown + My Renewals ───────────────────── */}
        <div className="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          <div className="card-premium flex flex-col gap-4 p-5">
            <h2 className="font-display text-[18px] font-normal tracking-tight">
              My burn by category
            </h2>
            {categoryEntries.length === 0 ? (
              <p className="text-[13px] text-muted">No active subscriptions yet.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {categoryEntries.map(([cat, amount]) => {
                  const pct = (amount / maxCategory) * 100;
                  const color = CATEGORY_COLORS[cat as Category];
                  const label = CATEGORY_CONFIG[cat as Category]?.label ?? cat;
                  return (
                    <li key={cat} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-medium text-ink">{label}</span>
                        <span className="font-semibold tabular-nums text-ink-soft">
                          {sym}{amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-ink/5">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="card-premium flex flex-col gap-4 p-5">
            <h2 className="font-display text-[18px] font-normal tracking-tight">
              My upcoming renewals
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                icon={<CalendarClock size={14} />}
                label="Next 7 days"
                value={renewals7d.length}
              />
              <MiniStat
                icon={<CalendarClock size={14} />}
                label="Next 30 days"
                value={renewals30d.length}
              />
            </div>
            <ul className="flex flex-col gap-1.5">
              {renewals7d.length === 0 && (
                <li className="text-[12px] text-muted">
                  No renewals in the next week.
                </li>
              )}
              {renewals7d.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[12.5px] hover:bg-ink/4"
                >
                  <span className="truncate">{s.name}</span>
                  <span className="ml-2 font-semibold tabular-nums text-ink-soft">
                    {sym}{s.amount.toFixed(2)} · {s.nextRenewalDate}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ─── Product Health (server-side) ───────────────────────────── */}
        {serverStats && (
          <section className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={16} className="text-rausch" />
              <h2 className="font-display text-[18px] font-normal tracking-tight">
                Product Health
              </h2>
              {serverStats.mode === 'lowdb' && (
                <span className="text-[11px] font-medium text-muted bg-surface px-2 py-0.5 rounded-full">
                  Local mode — single user
                </span>
              )}
              {serverStats.mode === 'supabase' && (
                <span className="text-[11px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                  Cloud — {serverStats.totalUsers} users
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
              <KpiTile
                icon={<Users size={16} />}
                label="Total users"
                value={String(serverStats.totalUsers)}
                hint={serverStats.mode === 'supabase' ? 'Onboarded accounts' : 'Single local account'}
              />
              <KpiTile
                icon={<Activity size={16} />}
                label="Active subscriptions"
                value={String(serverStats.activeSubscriptions)}
                hint={`Across all accounts`}
              />
              <KpiTile
                icon={<DollarSign size={16} />}
                label="Total monthly burn"
                value={`$${serverStats.totalMonthlyBurn.toFixed(2)}`}
                hint={
                  serverStats.avgMonthlyBurnPerUser
                    ? `Avg $${serverStats.avgMonthlyBurnPerUser.toFixed(2)}/user`
                    : `Year ≈ $${serverStats.yearlyProjection.toFixed(0)}`
                }
              />
              <KpiTile
                icon={<CalendarClock size={16} />}
                label="Renewals (7d)"
                value={String(serverStats.renewalsNext7d)}
                hint={`${serverStats.renewalsNext30d} in next 30d`}
              />
            </div>

            {/* Server category breakdown */}
            {serverCategoryEntries.length > 0 && (
              <div className="mt-3.5 card-premium flex flex-col gap-4 p-5">
                <h3 className="font-display text-[18px] font-normal tracking-tight">
                  Cross-user category burn
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {serverCategoryEntries.map(([cat, amount]) => {
                    const pct = (amount / maxServerCategory) * 100;
                    const color = CATEGORY_COLORS[cat as Category];
                    const label = CATEGORY_CONFIG[cat as Category]?.label ?? cat;
                    return (
                      <li key={cat} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="font-medium text-ink">{label}</span>
                          <span className="font-semibold tabular-nums text-ink-soft">
                            ${amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-ink/5">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        )}

        {serverError && (
          <section className="mt-6">
            <div className="card-premium flex items-center gap-3 p-5 text-muted">
              <WifiOff size={18} />
              <div>
                <p className="text-[13px] font-medium text-ink">Backend unavailable</p>
                <p className="text-[12px]">
                  Product Health metrics require a running backend. Your personal stats above are still accurate.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ─── localStorage health ─────────────────────────────────────── */}
        <div className="mt-3.5 card-premium flex flex-col gap-4 p-5">
          <h2 className="font-display text-[18px] font-normal tracking-tight">
            Persisted state (localStorage)
          </h2>
          <div className="overflow-hidden rounded-lg border border-hairline">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-hairline bg-surface-2/40">
                  <th className="px-4 py-2 text-left font-semibold text-ink-soft">Key</th>
                  <th className="px-4 py-2 text-right font-semibold text-ink-soft">Present</th>
                  <th className="px-4 py-2 text-right font-semibold text-ink-soft">Size</th>
                </tr>
              </thead>
              <tbody>
                {storageMetrics.rows.map((row) => (
                  <tr key={row.key} className="border-b border-hairline last:border-b-0">
                    <td className="px-4 py-2 font-mono text-[12px] text-ink">{row.key}</td>
                    <td className="px-4 py-2 text-right">
                      {row.present ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <CheckCircle2 size={12} /> yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted">
                          <XCircle size={12} /> no
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-ink-soft">
                      {formatBytes(row.bytes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted">
            Total: {formatBytes(storageMetrics.totalBytes)}.
            This page reads from both your local stores and the backend when available.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="card-premium flex flex-col gap-2 p-5">
      <div className="flex items-center gap-2 text-muted">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rausch/10 text-rausch">
          {icon}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[1.5px]">{label}</span>
      </div>
      <div className="font-display text-[28px] font-light leading-none tracking-[-0.5px] tabular-nums">
        {value}
      </div>
      <div className="text-[11px] text-muted">{hint}</div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="card-inset flex items-center gap-3 p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink-soft">
        {icon}
      </span>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted">{label}</div>
        <div className="font-display text-[18px] font-light leading-none tabular-nums">{value}</div>
      </div>
    </div>
  );
}
