import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "recall.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "debit" | "other";

export interface PaymentMethodRecord {
  id: string;
  accountId: string;
  label: string;
  brand: CardBrand;
  last4: string;
  color: string;
  expiryMonth?: number;
  expiryYear?: number;
  createdAt: string;
  updatedAt: string;
}

export type CancellationDifficulty = "easy" | "medium" | "hard";

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
  paymentMethodId?: string;
  cancellationDifficulty?: CancellationDifficulty;
  autoRenews?: boolean;
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
  createdAt: string;
  updatedAt: string;
}

export interface Schema {
  accounts: AccountRecord[];
  subscriptions: SubscriptionRecord[];
  paymentMethods: PaymentMethodRecord[];
}

/** Single source of truth for a fresh default account. */
export function createDefaultAccount(id: string = "default"): AccountRecord {
  const now = new Date().toISOString();
  return {
    id,
    name: "",
    email: "",
    currency: "USD",
    reminderLeadDays: 3,
    onboarded: false,
    createdAt: now,
    updatedAt: now,
  };
}

const defaultData: Schema = {
  accounts: [createDefaultAccount()],
  subscriptions: [],
  paymentMethods: [],
};

let db: Low<Schema> | null = null;

export async function getDb(): Promise<Low<Schema>> {
  if (!db) {
    const adapter = new JSONFile<Schema>(DB_PATH);
    db = new Low<Schema>(adapter, defaultData);
    await db.read();
    // Ensure structure exists
    if (!db.data) db.data = defaultData;
    if (!db.data.accounts) db.data.accounts = defaultData.accounts;
    if (!db.data.subscriptions) db.data.subscriptions = defaultData.subscriptions;
    if (!db.data.paymentMethods) db.data.paymentMethods = defaultData.paymentMethods;
  }
  return db;
}

export async function closeDb() {
  if (db) {
    await db.write();
    db = null;
  }
}

// ── Lowdb Adapter ──────────────────────────────────────────────────
// Implements the interface that the subscription routes expect,
// wrapping lowdb CRUD operations so the routes don't need to know
// whether they're talking to lowdb or Supabase.

export interface DbAdapter {
  listSubscriptions(accountId: string, status?: string): Promise<SubscriptionRecord[]>;
  getSubscription(id: string, accountId: string): Promise<SubscriptionRecord | null>;
  countSubscriptions(accountId: string): Promise<number>;
  createSubscription(sub: SubscriptionRecord): Promise<SubscriptionRecord>;
  updateSubscription(id: string, accountId: string, patch: Partial<SubscriptionRecord>): Promise<SubscriptionRecord>;
  deleteSubscription(id: string, accountId: string): Promise<void>;
  listPaymentMethods(accountId: string): Promise<PaymentMethodRecord[]>;
  getPaymentMethod(id: string, accountId: string): Promise<PaymentMethodRecord | null>;
  createPaymentMethod(pm: PaymentMethodRecord): Promise<PaymentMethodRecord>;
  updatePaymentMethod(id: string, accountId: string, patch: Partial<PaymentMethodRecord>): Promise<PaymentMethodRecord>;
  deletePaymentMethod(id: string, accountId: string): Promise<void>;
}

class LowdbAdapter implements DbAdapter {
  async listSubscriptions(accountId: string, status?: string): Promise<SubscriptionRecord[]> {
    const d = await getDb();
    let subs = d.data.subscriptions.filter((s) => s.accountId === accountId);
    if (status) subs = subs.filter((s) => s.status === status);
    return subs;
  }

  async getSubscription(id: string, accountId: string): Promise<SubscriptionRecord | null> {
    const d = await getDb();
    return d.data.subscriptions.find((s) => s.id === id && s.accountId === accountId) ?? null;
  }

  async countSubscriptions(accountId: string): Promise<number> {
    const d = await getDb();
    return d.data.subscriptions.filter((s) => s.accountId === accountId).length;
  }

  async createSubscription(sub: SubscriptionRecord): Promise<SubscriptionRecord> {
    const d = await getDb();
    d.data.subscriptions.push(sub);
    await d.write();
    return sub;
  }

  async updateSubscription(id: string, accountId: string, patch: Partial<SubscriptionRecord>): Promise<SubscriptionRecord> {
    const d = await getDb();
    const idx = d.data.subscriptions.findIndex((s) => s.id === id && s.accountId === accountId);
    if (idx === -1) throw new Error("Subscription not found");
    d.data.subscriptions[idx] = { ...d.data.subscriptions[idx], ...patch, updatedAt: new Date().toISOString() };
    await d.write();
    return d.data.subscriptions[idx];
  }

  async deleteSubscription(id: string, accountId: string): Promise<void> {
    const d = await getDb();
    d.data.subscriptions = d.data.subscriptions.filter((s) => !(s.id === id && s.accountId === accountId));
    await d.write();
  }

  async listPaymentMethods(accountId: string): Promise<PaymentMethodRecord[]> {
    const d = await getDb();
    return d.data.paymentMethods.filter((p) => p.accountId === accountId);
  }

  async getPaymentMethod(id: string, accountId: string): Promise<PaymentMethodRecord | null> {
    const d = await getDb();
    return d.data.paymentMethods.find((p) => p.id === id && p.accountId === accountId) ?? null;
  }

  async createPaymentMethod(pm: PaymentMethodRecord): Promise<PaymentMethodRecord> {
    const d = await getDb();
    d.data.paymentMethods.push(pm);
    await d.write();
    return pm;
  }

  async updatePaymentMethod(id: string, accountId: string, patch: Partial<PaymentMethodRecord>): Promise<PaymentMethodRecord> {
    const d = await getDb();
    const idx = d.data.paymentMethods.findIndex((p) => p.id === id && p.accountId === accountId);
    if (idx === -1) throw new Error("Payment method not found");
    d.data.paymentMethods[idx] = { ...d.data.paymentMethods[idx], ...patch, updatedAt: new Date().toISOString() };
    await d.write();
    return d.data.paymentMethods[idx];
  }

  async deletePaymentMethod(id: string, accountId: string): Promise<void> {
    const d = await getDb();
    d.data.paymentMethods = d.data.paymentMethods.filter((p) => !(p.id === id && p.accountId === accountId));
    // Unlink any subscriptions that reference this payment method
    for (const sub of d.data.subscriptions) {
      if (sub.paymentMethodId === id) {
        sub.paymentMethodId = undefined;
        sub.updatedAt = new Date().toISOString();
      }
    }
    await d.write();
  }
}

let adapterInstance: DbAdapter | null = null;

export function getAdapter(): DbAdapter {
  if (!adapterInstance) {
    adapterInstance = new LowdbAdapter();
  }
  return adapterInstance;
}
