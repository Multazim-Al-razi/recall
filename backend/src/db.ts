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
    createdAt: now,
    updatedAt: now,
  };
}

const defaultData: Schema = {
  accounts: [createDefaultAccount()],
  subscriptions: [],
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
    if (!db.data.subscriptions)
      db.data.subscriptions = defaultData.subscriptions;
  }
  return db;
}

export async function closeDb() {
  if (db) {
    await db.write();
    db = null;
  }
}
