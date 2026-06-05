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
