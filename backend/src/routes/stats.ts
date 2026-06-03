import { type Request, type Response, type Router, type NextFunction } from "express";
import express from "express";
import { getDb } from "../db.js";
import { getSupabaseAdmin } from "../supabaseClient.js";

export const statsRoutes: Router = express.Router();

statsRoutes.get("/", getStats);
statsRoutes.post("/event", postEvent);

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

    const DB_BACKEND = process.env.DB_BACKEND ?? "lowdb";

    if (DB_BACKEND === "supabase") {
      const supabase = getSupabaseAdmin();
      await supabase.from("telemetry_events").insert({
        event,
        category: category ?? null,
        amount_bucket: amountBucket ?? null,
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
 * Returns anonymized aggregate metrics across all users.
 * - In Supabase mode: queries cross-account data via the service role client.
 * - In lowdb mode: returns the single default user's stats with a note.
 *
 * Auth: requires a valid JWT (requireAuth middleware) in Supabase mode.
 * In lowdb mode, ALLOW_NO_AUTH allows unauthenticated access.
 */
export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const DB_BACKEND = process.env.DB_BACKEND ?? "lowdb";

    if (DB_BACKEND === "supabase") {
      const supabase = getSupabaseAdmin();

      // Total onboarded users
      const { count: totalUsers } = await supabase
        .from("accounts")
        .select("*", { count: "exact", head: true })
        .eq("onboarded", true);

      // All active subscriptions across all accounts
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("amount, currency, billing_cycle, custom_cycle_days, category, status, start_date, next_renewal_date, is_free_trial")
        .eq("status", "active");

      // Compute aggregates
      const activeSubCount = subs?.length ?? 0;

      const monthlyBurnByCategory: Record<string, number> = {};
      let totalMonthlyBurn = 0;

      for (const s of subs ?? []) {
        const monthly = toMonthly(s.amount, s.billing_cycle, s.custom_cycle_days);
        totalMonthlyBurn += monthly;
        monthlyBurnByCategory[s.category] = (monthlyBurnByCategory[s.category] ?? 0) + monthly;
      }

      // Upcoming renewals (7d and 30d)
      const now = new Date();
      const renewals7d = (subs ?? []).filter((s) => {
        const d = new Date(s.next_renewal_date);
        return d >= now && d <= new Date(now.getTime() + 7 * 86400000);
      }).length;
      const renewals30d = (subs ?? []).filter((s) => {
        const d = new Date(s.next_renewal_date);
        return d >= now && d <= new Date(now.getTime() + 30 * 86400000);
      }).length;

      // Active free trials
      const trialCount = (subs ?? []).filter((s) => s.is_free_trial).length;

      // Average monthly burn per user
      const avgMonthlyBurn = totalUsers && totalUsers > 0
        ? totalMonthlyBurn / totalUsers
        : 0;

      return res.json({
        mode: "supabase",
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
