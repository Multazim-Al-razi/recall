import { type Request, type Response, type Router, type NextFunction } from "express";
import express from "express";
import { getDb } from "../db.js";
import { getSupabaseAdmin, createSupabaseUserClient } from "../supabaseClient.js";
import { writeLimiter } from "../rateLimiters.js";
import { sanitizeString } from "../validate.js";
import type { AuthedUser } from "../auth.js";

/** Allowlist of valid telemetry event names. */
const VALID_EVENTS = new Set([
  "subscription_created",
  "subscription_cancelled",
  "subscription_paused",
  "subscription_resumed",
  "onboarding_completed",
  "reminder_sent",
  "quick_checkin_response",
]);

export const statsRoutes: Router = express.Router();

statsRoutes.get("/", getStats);
statsRoutes.post("/event", writeLimiter, postEvent);

interface TelemetryEvent {
  event: string;
  category?: string;
  amountBucket?: string;
  timestamp: string;
}

/**
 * POST /api/stats/event
 *
 * Accepts anonymized telemetry events (no PII). Fire-and-forget from
 * the client. Stored in Supabase for future trend analysis, or simply
 * logged in lowdb mode.
 */
async function postEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { event, category, amountBucket, timestamp } = req.body as TelemetryEvent;

    if (!event || !timestamp) {
      res.status(400).json({ error: "Missing required fields: event, timestamp" });
      return;
    }

    // Validate event name against allowlist
    if (!VALID_EVENTS.has(event)) {
      res.status(400).json({ error: `Invalid event type: ${sanitizeString(event, 60)}` });
      return;
    }

    const DB_BACKEND = process.env.DB_BACKEND ?? "lowdb";

    if (DB_BACKEND === "supabase") {
      const supabase = getSupabaseAdmin();
      await supabase.from("telemetry_events").insert({
        event,
        category: category ? sanitizeString(category, 60) : null,
        amount_bucket: amountBucket ? sanitizeString(amountBucket, 30) : null,
        timestamp,
      });
    } else {
      // lowdb mode — log to console (no persistent telemetry storage needed for single user)
      console.log(`[Telemetry] ${event} | ${category ?? '-'} | ${amountBucket ?? '-'} | ${timestamp}`);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/stats
 *
 * Returns anonymized aggregate metrics.
 * - In Supabase mode: admin users see cross-account data via service role.
 *   Non-admin users see only their own stats via user-scoped client.
 * - In lowdb mode: returns the single default user's stats with a note.
 */
export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const DB_BACKEND = process.env.DB_BACKEND ?? "lowdb";

    if (DB_BACKEND === "supabase") {
      const user = req.user as AuthedUser | undefined;
      // Only admin accounts may view cross-tenant aggregate stats.
      // Regular users get their own scoped stats.
      const isAdmin = user?.email && process.env.ADMIN_EMAILS?.split(",").includes(user.email);

      if (isAdmin) {
        return getAdminStats(req, res, next);
      }
      return getUserStats(req, res, next);
    }

    // lowdb mode — single user
    const db = await getDb();
    const account = db.data.accounts[0];
    const subs = db.data.subscriptions;

    const active = subs.filter((s) => s.status === "active");
    let totalMonthlyBurn = 0;
    const monthlyBurnByCategory: Record<string, number> = {};

    for (const s of active) {
      const monthly = toMonthly(s.amount, s.billingCycle, s.customCycleDays);
      totalMonthlyBurn += monthly;
      monthlyBurnByCategory[s.category] = (monthlyBurnByCategory[s.category] ?? 0) + monthly;
    }

    const now = new Date();
    const renewals7d = active.filter((s) => {
      const d = new Date(s.nextRenewalDate);
      return d >= now && d <= new Date(now.getTime() + 7 * 86400000);
    }).length;
    const renewals30d = active.filter((s) => {
      const d = new Date(s.nextRenewalDate);
      return d >= now && d <= new Date(now.getTime() + 30 * 86400000);
    }).length;

    const trials = active.filter((s) => s.isFreeTrial).length;

    // ── Spend Health score (0–100) ──────────────────────────────────
    const spendHealth = computeSpendHealth(subs, active, monthlyBurnByCategory, trials);

    // ── Monthly spending history (last 6 months) ────────────────────
    const monthlySpending = computeMonthlySpending(subs, 6);

    return res.json({
      mode: "lowdb",
      note: "Single-user mode — stats reflect the default account only.",
      totalUsers: 1,
      activeSubscriptions: active.length,
      totalSubscriptions: subs.length,
      totalMonthlyBurn: Math.round(totalMonthlyBurn * 100) / 100,
      yearlyProjection: Math.round(totalMonthlyBurn * 12 * 100) / 100,
      categoryBurn: monthlyBurnByCategory,
      renewalsNext7d: renewals7d,
      renewalsNext30d: renewals30d,
      activeFreeTrials: trials,
      onboarded: account.onboarded,
      spendHealth,
      monthlySpending,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin-only: cross-tenant aggregate stats using service role client.
 */
async function getAdminStats(_req: Request, res: Response, next: NextFunction) {
  const supabase = getSupabaseAdmin();

  const { count: totalUsers } = await supabase
    .from("accounts")
    .select("*", { count: "exact", head: true })
    .eq("onboarded", true);

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("amount, currency, billing_cycle, custom_cycle_days, category, status, start_date, next_renewal_date, is_free_trial")
    .eq("status", "active");

  const activeSubCount = subs?.length ?? 0;

  const monthlyBurnByCategory: Record<string, number> = {};
  let totalMonthlyBurn = 0;

  for (const s of subs ?? []) {
    const monthly = toMonthly(s.amount, s.billing_cycle, s.custom_cycle_days);
    totalMonthlyBurn += monthly;
    monthlyBurnByCategory[s.category] = (monthlyBurnByCategory[s.category] ?? 0) + monthly;
  }

  const now = new Date();
  const renewals7d = (subs ?? []).filter((s) => {
    const d = new Date(s.next_renewal_date);
    return d >= now && d <= new Date(now.getTime() + 7 * 86400000);
  }).length;
  const renewals30d = (subs ?? []).filter((s) => {
    const d = new Date(s.next_renewal_date);
    return d >= now && d <= new Date(now.getTime() + 30 * 86400000);
  }).length;

  const trialCount = (subs ?? []).filter((s) => s.is_free_trial).length;
  const avgMonthlyBurn = totalUsers && totalUsers > 0 ? totalMonthlyBurn / totalUsers : 0;

  return res.json({
    mode: "supabase",
    scope: "admin",
    totalUsers: totalUsers ?? 0,
    activeSubscriptions: activeSubCount,
    totalMonthlyBurn: Math.round(totalMonthlyBurn * 100) / 100,
    avgMonthlyBurnPerUser: Math.round(avgMonthlyBurn * 100) / 100,
    yearlyProjection: Math.round(totalMonthlyBurn * 12 * 100) / 100,
    categoryBurn: monthlyBurnByCategory,
    renewalsNext7d: renewals7d,
    renewalsNext30d: renewals30d,
    activeFreeTrials: trialCount,
    timestamp: new Date().toISOString(),
  });
}

/**
 * User-scoped stats — returns only the requesting user's own data.
 */
async function getUserStats(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as AuthedUser;
    const supabase = createSupabaseUserClient(
      (req.headers.authorization as string)?.slice(7) ?? "",
    );

    const { data: account } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: subs } = await supabase
      .from("subscriptions")
      .select("amount, currency, billing_cycle, custom_cycle_days, category, status, start_date, next_renewal_date, is_free_trial")
      .eq("account_id", user.id)
      .eq("status", "active");

    const activeSubCount = subs?.length ?? 0;
    let totalMonthlyBurn = 0;
    const monthlyBurnByCategory: Record<string, number> = {};

    for (const s of subs ?? []) {
      const monthly = toMonthly(s.amount, s.billing_cycle, s.custom_cycle_days);
      totalMonthlyBurn += monthly;
      monthlyBurnByCategory[s.category] = (monthlyBurnByCategory[s.category] ?? 0) + monthly;
    }

    const now = new Date();
    const renewals7d = (subs ?? []).filter((s) => {
      const d = new Date(s.next_renewal_date);
      return d >= now && d <= new Date(now.getTime() + 7 * 86400000);
    }).length;
    const renewals30d = (subs ?? []).filter((s) => {
      const d = new Date(s.next_renewal_date);
      return d >= now && d <= new Date(now.getTime() + 30 * 86400000);
    }).length;

    const trialCount = (subs ?? []).filter((s) => s.is_free_trial).length;

    return res.json({
      mode: "supabase",
      scope: "user",
      totalUsers: 1,
      activeSubscriptions: activeSubCount,
      totalMonthlyBurn: Math.round(totalMonthlyBurn * 100) / 100,
      yearlyProjection: Math.round(totalMonthlyBurn * 12 * 100) / 100,
      categoryBurn: monthlyBurnByCategory,
      renewalsNext7d: renewals7d,
      renewalsNext30d: renewals30d,
      activeFreeTrials: trialCount,
      onboarded: account?.onboarded ?? false,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Normalizes any billing cycle to a monthly amount (mirrors frontend logic).
 */
function toMonthly(amount: number, cycle: string, customDays?: number): number {
  switch (cycle) {
    case "monthly": return amount;
    case "yearly": return amount / 12;
    case "weekly": return amount * 4.33;
    case "custom": return (amount / (customDays ?? 30)) * 30;
    default: return 0;
  }
}

/**
 * Computes a 0–100 "Spend Health" composite score from 4 sub-factors, each
 * contributing 0–25 points. Higher is healthier.
 */
function computeSpendHealth(
  allSubs: { amount: number; billingCycle: string; customCycleDays?: number; status: string; category: string; isFreeTrial: boolean; startDate: string }[],
  active: { amount: number; billingCycle: string; customCycleDays?: number; status: string; category: string; isFreeTrial: boolean; autoRenews?: boolean }[],
  categoryBurn: Record<string, number>,
  trialCount: number,
): { score: number; label: string; factors: { trendScore: number; trialScore: number; diversityScore: number; savingsScore: number } } {
  // 1. Trend Score (0–25): MoM change — lower rise is better
  const history = computeMonthlySpending(allSubs, 2);
  const prev = history[0]?.amount ?? 0;
  const curr = history[1]?.amount ?? 0;
  const momChange = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
  const trendScore = Math.round(Math.max(0, Math.min(25, 25 - (momChange * 25) / 20)));

  // 2. Trial Score (0–25): fewer unconverted trials = better
  const trialScore = Math.max(0, 25 - trialCount * 5);

  // 3. Diversity Score (0–25): Herfindahl index — spread across categories is better
  const cats = Object.values(categoryBurn);
  const totalCatBurn = cats.reduce((a, b) => a + b, 0);
  let diversityScore = 25;
  if (cats.length <= 1) {
    diversityScore = cats.length === 0 ? 25 : 5;
  } else if (totalCatBurn > 0) {
    const hhi = cats.reduce((sum, v) => sum + (v / totalCatBurn) ** 2, 0);
    // hhi ranges from 1/n (perfectly spread) to 1 (single category)
    // Scale: hhi=1 → 5, hhi=1/n → 25
    const minHhi = 1 / cats.length;
    diversityScore = Math.round(5 + (1 - (hhi - minHhi) / (1 - minHhi || 1)) * 20);
  }

  // 4. Savings Score (0–25): fewer duplicate-category subs = better
  const categoryCounts: Record<string, number> = {};
  for (const s of active) categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1;
  const duplicates = Object.values(categoryCounts).reduce((sum, c) => sum + Math.max(0, c - 1), 0);
  const savingsScore = Math.max(0, 25 - duplicates * 4);

  const score = Math.min(100, trendScore + trialScore + diversityScore + savingsScore);
  const label = score >= 76 ? "Excellent" : score >= 51 ? "Good" : score >= 26 ? "Fair" : "At Risk";

  return { score, label, factors: { trendScore, trialScore, diversityScore, savingsScore } };
}

/**
 * Generates the trailing N months of total subscription spend for the bar chart.
 * Mirrors the frontend `getSpendHistory` logic.
 */
function computeMonthlySpending(
  subs: { amount: number; billingCycle: string; customCycleDays?: number; status: string; startDate: string }[],
  months: number,
): { month: string; amount: number }[] {
  const now = new Date();
  const result: { month: string; amount: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const total = subs
      .filter((s) => s.status !== "cancelled")
      .filter((s) => new Date(s.startDate) <= monthEnd)
      .reduce((sum, s) => sum + toMonthly(s.amount, s.billingCycle, s.customCycleDays), 0);
    result.push({
      month: monthEnd.toLocaleDateString("en-US", { month: "short" }),
      amount: Math.round(total * 100) / 100,
    });
  }

  return result;
}
