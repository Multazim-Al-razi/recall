/**
 * One-time backfill script: reads backend/data/recall.json and inserts rows
 * into Supabase using the service role client (bypasses RLS).
 *
 * Run with:  npx tsx backend/src/backfill.ts
 *
 * Required env vars:
 *   SUPABASE_URL           — e.g. https://your-project-id.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — the service role key (bypasses RLS)
 *
 * This script is meant to be run once during migration. It:
 *   1. Creates the account row (maps "default" → new UUID)
 *   2. Creates all subscription rows with the new account_id
 *   3. Prints a summary of inserted rows
 *
 * The old lowdb IDs ("default", "sub_netflix", etc.) are NOT carried over
 * — Supabase generates fresh UUIDs via gen_random_uuid(). The backfill
 * script stores the old→new ID mapping in a local map for reference only.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load .env file (relative to this script, which is in backend/src/)
const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".env",
);
config({ path: envPath });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "recall.json");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Set these in your .env file before running the backfill.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface LowDbAccount {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  reminderLeadDays: number;
  onboarded: boolean;
  plan?: string;
  tier?: "local" | "sync";
  createdAt: string;
  updatedAt: string;
}

interface LowDbSubscription {
  id: string;
  accountId: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: string;
  customCycleDays?: number;
  category: string;
  startDate: string;
  nextRenewalDate: string;
  reminderDaysBefore: number;
  autoReminder: boolean;
  isFreeTrial: boolean;
  trialEndDate?: string;
  providerIcon?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface LowDbSchema {
  accounts: LowDbAccount[];
  subscriptions: LowDbSubscription[];
}

async function backfill() {
  console.log("Reading data from:", DATA_PATH);
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  const data: LowDbSchema = JSON.parse(raw);

  // ── Account ────────────────────────────────────────────────────────
  const oldAccount = data.accounts[0];
  if (!oldAccount) {
    console.error("No account found in recall.json. Nothing to backfill.");
    process.exit(1);
  }

  // Map the legacy "plan" field to "tier" (the db.ts backfill does this
  // in-process, but recall.json might still have the old key).
  const tier: "local" | "sync" = oldAccount.tier === "sync" ? "sync" : "local";

  console.log(
    `Inserting account: "${oldAccount.name}" (old id: ${oldAccount.id})`,
  );
  const { data: newAccount, error: accountError } = await supabase
    .from("accounts")
    .insert({
      name: oldAccount.name || "",
      email: oldAccount.email || "",
      avatar: oldAccount.avatar || null,
      currency: oldAccount.currency || "USD",
      reminder_lead_days: oldAccount.reminderLeadDays ?? 3,
      onboarded: oldAccount.onboarded ?? false,
      tier,
    })
    .select("id")
    .single();

  if (accountError) {
    console.error("Failed to insert account:", accountError);
    process.exit(1);
  }

  const accountId = newAccount!.id;
  console.log(`Account created with new UUID: ${accountId}`);

  // ── Subscriptions ──────────────────────────────────────────────────
  const idMap = new Map<string, string>(); // old id → new id
  let inserted = 0;
  let failed = 0;

  for (const sub of data.subscriptions) {
    const row = {
      account_id: accountId,
      name: sub.name,
      amount: sub.amount,
      currency: sub.currency || "USD",
      billing_cycle: sub.billingCycle,
      custom_cycle_days: sub.customCycleDays ?? null,
      category: sub.category,
      start_date: sub.startDate,
      next_renewal_date: sub.nextRenewalDate,
      reminder_days_before: sub.reminderDaysBefore ?? 3,
      auto_reminder: sub.autoReminder ?? true,
      is_free_trial: sub.isFreeTrial ?? false,
      trial_end_date: sub.trialEndDate ?? null,
      provider_icon: sub.providerIcon ?? null,
      notes: sub.notes ?? null,
      status: sub.status || "active",
    };

    const { data: newRow, error: subError } = await supabase
      .from("subscriptions")
      .insert(row)
      .select("id")
      .single();

    if (subError) {
      console.error(`  ✗ Failed to insert "${sub.name}":`, subError.message);
      failed++;
    } else {
      idMap.set(sub.id, newRow!.id);
      inserted++;
    }
  }

  // ── Summary ────────────────────────────────────────────────────────
  console.log("\n─── Backfill Summary ───");
  console.log(`Account:  1 inserted  (old "default" → ${accountId})`);
  console.log(
    `Subscriptions: ${inserted} inserted, ${failed} failed (out of ${data.subscriptions.length})`,
  );
  console.log("\nOld → New ID mapping:");
  for (const [oldId, newId] of idMap) {
    console.log(`  ${oldId} → ${newId}`);
  }

  if (failed > 0) {
    console.warn(
      `\n⚠ ${failed} subscriptions failed. Review errors above and re-run if needed.`,
    );
  } else {
    console.log("\n✓ All rows backfilled successfully.");
  }
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
