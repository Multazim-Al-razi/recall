import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getSupabaseAdmin } from "./supabaseClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "recall.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ── Shared types ──────────────────────────────────────────────────────

export interface SubscriptionRecord {
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

export interface AccountRecord {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  reminderLeadDays: number;
  onboarded: boolean;
  tier: "local" | "sync";
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface Schema {
  accounts: AccountRecord[];
  subscriptions: SubscriptionRecord[];
}

/** Single source of truth for a fresh default account. */
export function createDefaultAccount(): AccountRecord {
  const now = new Date().toISOString();
  return {
    id: "default",
    name: "",
    email: "",
    currency: "USD",
    reminderLeadDays: 3,
    onboarded: false,
    tier: "local",
    role: "user",
    createdAt: now,
    updatedAt: now,
  };
}

const defaultData: Schema = {
  accounts: [createDefaultAccount()],
  subscriptions: [],
};

// ── DbAdapter interface ───────────────────────────────────────────────
// Route handlers call adapter methods instead of raw db.data access.
// Switching between LowDbAdapter and SupabaseAdapter is controlled by
// DB_BACKEND env var — see docs/BACKEND_ROADMAP.md §1.

export interface DbAdapter {
  // Accounts
  getAccount(id: string): Promise<AccountRecord | null>;
  ensureAccount(id: string): Promise<AccountRecord>;
  updateAccount(
    id: string,
    patch: Partial<AccountRecord>,
  ): Promise<AccountRecord>;
  resetAccount(id: string): Promise<AccountRecord>;

  // Subscriptions
  listSubscriptions(
    accountId: string,
    status?: string,
  ): Promise<SubscriptionRecord[]>;
  getSubscription(
    id: string,
    accountId: string,
  ): Promise<SubscriptionRecord | null>;
  createSubscription(sub: SubscriptionRecord): Promise<SubscriptionRecord>;
  updateSubscription(
    id: string,
    accountId: string,
    patch: Partial<SubscriptionRecord>,
  ): Promise<SubscriptionRecord>;
  deleteSubscription(id: string, accountId: string): Promise<boolean>;
  countSubscriptions(accountId: string): Promise<number>;
}

// ── Column-name mapping ───────────────────────────────────────────────
// lowdb uses camelCase; Supabase/Postgres uses snake_case.

const ACCOUNT_TO_DB: Record<string, string> = {
  id: "id",
  name: "name",
  email: "email",
  avatar: "avatar",
  currency: "currency",
  reminderLeadDays: "reminder_lead_days",
  onboarded: "onboarded",
  tier: "tier",
  role: "role",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

const DB_TO_ACCOUNT: Record<string, string> = Object.fromEntries(
  Object.entries(ACCOUNT_TO_DB).map(([k, v]) => [v, k]),
);

const SUB_TO_DB: Record<string, string> = {
  id: "id",
  accountId: "account_id",
  name: "name",
  amount: "amount",
  currency: "currency",
  billingCycle: "billing_cycle",
  customCycleDays: "custom_cycle_days",
  category: "category",
  startDate: "start_date",
  nextRenewalDate: "next_renewal_date",
  reminderDaysBefore: "reminder_days_before",
  autoReminder: "auto_reminder",
  isFreeTrial: "is_free_trial",
  trialEndDate: "trial_end_date",
  providerIcon: "provider_icon",
  notes: "notes",
  status: "status",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

const DB_TO_SUB: Record<string, string> = Object.fromEntries(
  Object.entries(SUB_TO_DB).map(([k, v]) => [v, k]),
);

function toSnakeCase(
  obj: Record<string, unknown>,
  map: Record<string, string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined && map[key]) {
      out[map[key]] = val;
    }
  }
  return out;
}

function toCamelCase(
  obj: Record<string, unknown>,
  map: Record<string, string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined && map[key]) {
      out[map[key]] = val;
    }
  }
  return out;
}

function dbRowToAccount(row: Record<string, unknown>): AccountRecord {
  return toCamelCase(row, DB_TO_ACCOUNT) as unknown as AccountRecord;
}

function dbRowToSub(row: Record<string, unknown>): SubscriptionRecord {
  return toCamelCase(row, DB_TO_SUB) as unknown as SubscriptionRecord;
}

function accountToDbRow(
  record: Partial<AccountRecord>,
): Record<string, unknown> {
  return toSnakeCase(record as Record<string, unknown>, ACCOUNT_TO_DB);
}

function subToDbRow(
  record: Partial<SubscriptionRecord>,
): Record<string, unknown> {
  return toSnakeCase(record as Record<string, unknown>, SUB_TO_DB);
}

// ── SupabaseAdapter ───────────────────────────────────────────────────

class SupabaseAdapter implements DbAdapter {
  async getAccount(id: string): Promise<AccountRecord | null> {
    const { data, error } = await getSupabaseAdmin()
      .from("accounts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? dbRowToAccount(data) : null;
  }

  async ensureAccount(id: string): Promise<AccountRecord> {
    let account = await this.getAccount(id);
    if (!account) {
      const { data, error } = await getSupabaseAdmin()
        .from("accounts")
        .insert({
          id,
          name: "",
          email: "",
          currency: "USD",
          reminder_lead_days: 3,
          onboarded: false,
          tier: "local",
        })
        .select("*")
        .single();
      if (error) throw error;
      account = dbRowToAccount(data);
    }
    return account;
  }

  async updateAccount(
    id: string,
    patch: Partial<AccountRecord>,
  ): Promise<AccountRecord> {
    const dbRow = accountToDbRow(patch);
    const { data, error } = await getSupabaseAdmin()
      .from("accounts")
      .update(dbRow)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return dbRowToAccount(data);
  }

  async resetAccount(id: string): Promise<AccountRecord> {
    const fresh = createDefaultAccount();
    const dbRow = accountToDbRow({
      ...fresh,
      id,
      // Preserve original timestamps
    });
    // Fetch original createdAt so we don't overwrite it
    const existing = await this.getAccount(id);
    if (existing) {
      dbRow["created_at"] = existing.createdAt;
    }
    const { data, error } = await getSupabaseAdmin()
      .from("accounts")
      .update(dbRow)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return dbRowToAccount(data);
  }

  async listSubscriptions(
    accountId: string,
    status?: string,
  ): Promise<SubscriptionRecord[]> {
    let query = getSupabaseAdmin()
      .from("subscriptions")
      .select("*")
      .eq("account_id", accountId)
      .order("next_renewal_date", { ascending: true });
    if (status) {
      query = query.eq("status", status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(dbRowToSub);
  }

  async getSubscription(
    id: string,
    accountId: string,
  ): Promise<SubscriptionRecord | null> {
    const { data, error } = await getSupabaseAdmin()
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .eq("account_id", accountId)
      .maybeSingle();
    if (error) throw error;
    return data ? dbRowToSub(data) : null;
  }

  async createSubscription(
    sub: SubscriptionRecord,
  ): Promise<SubscriptionRecord> {
    const dbRow = subToDbRow(sub);
    const { data, error } = await getSupabaseAdmin()
      .from("subscriptions")
      .insert(dbRow)
      .select("*")
      .single();
    if (error) throw error;
    return dbRowToSub(data);
  }

  async updateSubscription(
    id: string,
    accountId: string,
    patch: Partial<SubscriptionRecord>,
  ): Promise<SubscriptionRecord> {
    const dbRow = subToDbRow(patch);
    const { data, error } = await getSupabaseAdmin()
      .from("subscriptions")
      .update(dbRow)
      .eq("id", id)
      .eq("account_id", accountId)
      .select("*")
      .single();
    if (error) throw error;
    return dbRowToSub(data);
  }

  async deleteSubscription(id: string, accountId: string): Promise<boolean> {
    const { error } = await getSupabaseAdmin()
      .from("subscriptions")
      .delete()
      .eq("id", id)
      .eq("account_id", accountId);
    if (error) throw error;
    return true;
  }

  async countSubscriptions(accountId: string): Promise<number> {
    const { count, error } = await getSupabaseAdmin()
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("account_id", accountId);
    if (error) throw error;
    return count ?? 0;
  }
}

// ── LowDbAdapter ──────────────────────────────────────────────────────

class LowDbAdapter implements DbAdapter {
  private db: Low<Schema> | null = null;

  private async getDb(): Promise<Low<Schema>> {
    if (!this.db) {
      const adapter = new JSONFile<Schema>(DB_PATH);
      this.db = new Low<Schema>(adapter, defaultData);
      let parsed: Schema;
      try {
        await this.db.read();
      } catch (err) {
        console.error(
          "[recall-api] db.read() threw; falling back to on-disk parse.",
          err,
        );
        parsed = this.readFromDisk();
        this.db.data = parsed;
      }
      if (!this.db.data) {
        this.db.data = JSON.parse(JSON.stringify(defaultData));
      }
      if (!this.db.data.accounts) this.db.data.accounts = defaultData.accounts;
      if (!this.db.data.subscriptions)
        this.db.data.subscriptions = defaultData.subscriptions;
      for (const account of this.db.data.accounts) {
        if (account.tier !== "local" && account.tier !== "sync") {
          account.tier = "local";
        }
      }
    }
    return this.db;
  }

  private readFromDisk(): Schema {
    if (!fs.existsSync(DB_PATH)) {
      return JSON.parse(JSON.stringify(defaultData));
    }
    try {
      const raw = fs.readFileSync(DB_PATH, "utf8");
      if (!raw.trim()) return JSON.parse(JSON.stringify(defaultData));
      return JSON.parse(raw) as Schema;
    } catch (err) {
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(DATA_DIR, `recall.json.broken-${ts}`);
      console.error(
        `[recall-api] Corrupt data file; backing up to ${backupPath}.`,
        err,
      );
      try {
        fs.copyFileSync(DB_PATH, backupPath);
      } catch {
        /* ignore */
      }
      return JSON.parse(JSON.stringify(defaultData));
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await withWriteLock(async () => {
        await this.db!.write();
      });
      this.db = null;
    }
  }

  async getAccount(id: string): Promise<AccountRecord | null> {
    const db = await this.getDb();
    return db.data.accounts.find((a) => a.id === id) ?? null;
  }

  async ensureAccount(id: string): Promise<AccountRecord> {
    const db = await this.getDb();
    let account = db.data.accounts.find((a) => a.id === id);
    if (!account) {
      account = { ...createDefaultAccount(), id };
      await withWriteLock(async () => {
        db.data.accounts.push(account!);
        await db.write();
      });
    }
    return account;
  }

  async updateAccount(
    id: string,
    patch: Partial<AccountRecord>,
  ): Promise<AccountRecord> {
    const db = await this.getDb();
    const account = db.data.accounts.find((a) => a.id === id);
    if (!account) throw new Error(`Account ${id} not found`);
    await withWriteLock(async () => {
      Object.assign(account, patch);
      account.updatedAt = new Date().toISOString();
      await db.write();
    });
    return account;
  }

  async resetAccount(id: string): Promise<AccountRecord> {
    const db = await this.getDb();
    const account = db.data.accounts.find((a) => a.id === id);
    if (!account) throw new Error(`Account ${id} not found`);
    const fresh = createDefaultAccount();
    await withWriteLock(async () => {
      Object.assign(account, fresh, {
        id: account.id,
        createdAt: account.createdAt,
      });
      account.updatedAt = new Date().toISOString();
      await db.write();
    });
    return account;
  }

  async listSubscriptions(
    accountId: string,
    status?: string,
  ): Promise<SubscriptionRecord[]> {
    const db = await this.getDb();
    let subs = db.data.subscriptions.filter((s) => s.accountId === accountId);
    if (status) subs = subs.filter((s) => s.status === status);
    subs.sort((a, b) => a.nextRenewalDate.localeCompare(b.nextRenewalDate));
    return subs;
  }

  async getSubscription(
    id: string,
    accountId: string,
  ): Promise<SubscriptionRecord | null> {
    const db = await this.getDb();
    return (
      db.data.subscriptions.find(
        (s) => s.id === id && s.accountId === accountId,
      ) ?? null
    );
  }

  async createSubscription(
    sub: SubscriptionRecord,
  ): Promise<SubscriptionRecord> {
    const db = await this.getDb();
    await withWriteLock(async () => {
      db.data.subscriptions.push(sub);
      await db.write();
    });
    return sub;
  }

  async updateSubscription(
    id: string,
    accountId: string,
    patch: Partial<SubscriptionRecord>,
  ): Promise<SubscriptionRecord> {
    const db = await this.getDb();
    const sub = db.data.subscriptions.find(
      (s) => s.id === id && s.accountId === accountId,
    );
    if (!sub) throw new Error(`Subscription ${id} not found`);
    await withWriteLock(async () => {
      Object.assign(sub, patch);
      sub.updatedAt = new Date().toISOString();
      await db.write();
    });
    return sub;
  }

  async deleteSubscription(id: string, accountId: string): Promise<boolean> {
    const db = await this.getDb();
    await withWriteLock(async () => {
      const index = db.data.subscriptions.findIndex(
        (s) => s.id === id && s.accountId === accountId,
      );
      if (index === -1) throw new Error(`Subscription ${id} not found`);
      db.data.subscriptions.splice(index, 1);
      await db.write();
    });
    return true;
  }

  async countSubscriptions(accountId: string): Promise<number> {
    const db = await this.getDb();
    return db.data.subscriptions.filter((s) => s.accountId === accountId)
      .length;
  }
}

// ── Write lock (used by LowDbAdapter) ─────────────────────────────────

let writeQueue: Promise<unknown> = Promise.resolve();

export function withWriteLock<T>(work: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(work, work);
  writeQueue = next.catch(() => undefined);
  return next;
}

// ── Adapter factory ───────────────────────────────────────────────────

const DB_BACKEND = (process.env.DB_BACKEND ?? "lowdb") as "lowdb" | "supabase";

let adapterInstance: DbAdapter | null = null;

export function getAdapter(): DbAdapter {
  if (adapterInstance) return adapterInstance;
  if (DB_BACKEND === "supabase") {
    console.log("[recall-api] Using Supabase database adapter.");
    adapterInstance = new SupabaseAdapter();
  } else {
    console.log("[recall-api] Using lowdb database adapter.");
    adapterInstance = new LowDbAdapter();
  }
  return adapterInstance;
}

/**
 * Graceful shutdown — only needed for the lowdb adapter (flush pending
 * writes). Supabase has no local state to flush.
 */
export async function closeDb() {
  if (adapterInstance instanceof LowDbAdapter) {
    await adapterInstance.close();
  }
  adapterInstance = null;
}

// ── Legacy exports (back-compat for tests that import getDb directly) ──
// These will be removed once all route handlers are migrated to
// getAdapter() calls. For now, they allow existing Vitest validation
// tests to pass unchanged.

let db: Low<Schema> | null = null;

export async function getDb(): Promise<Low<Schema>> {
  if (!db) {
    const adapter = new JSONFile<Schema>(DB_PATH);
    db = new Low<Schema>(adapter, defaultData);
    let parsed: Schema;
    try {
      await db.read();
    } catch (err) {
      console.error(
        "[recall-api] db.read() threw; falling back to on-disk parse.",
        err,
      );
      parsed = readFromDiskLegacy();
      db.data = parsed;
    }
    if (!db.data) {
      db.data = JSON.parse(JSON.stringify(defaultData));
    }
    if (!db.data.accounts) db.data.accounts = defaultData.accounts;
    if (!db.data.subscriptions)
      db.data.subscriptions = defaultData.subscriptions;
    for (const account of db.data.accounts) {
      if (account.tier !== "local" && account.tier !== "sync") {
        account.tier = "local";
      }
    }
  }
  return db;
}

function readFromDiskLegacy(): Schema {
  if (!fs.existsSync(DB_PATH)) {
    return JSON.parse(JSON.stringify(defaultData));
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    if (!raw.trim()) {
      return JSON.parse(JSON.stringify(defaultData));
    }
    return JSON.parse(raw) as Schema;
  } catch (err) {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(DATA_DIR, `recall.json.broken-${ts}`);
    console.error(
      `[recall-api] Corrupt data file at ${DB_PATH}; backing up to ${backupPath} and starting from defaults.`,
      err,
    );
    try {
      fs.copyFileSync(DB_PATH, backupPath);
    } catch (copyErr) {
      console.error(
        `[recall-api] Failed to back up corrupt data file to ${backupPath}.`,
        copyErr,
      );
    }
    return JSON.parse(JSON.stringify(defaultData));
  }
}
