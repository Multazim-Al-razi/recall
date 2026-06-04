export type Category =
  | "entertainment"
  | "productivity"
  | "fitness"
  | "music"
  | "cloud"
  | "news"
  | "food"
  | "other";

export type BillingCycle = "monthly" | "yearly" | "weekly" | "custom";

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type CancellationDifficulty = "easy" | "medium" | "hard";

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  customCycleDays?: number;
  category: Category;
  startDate: string;
  nextRenewalDate: string;
  reminderDaysBefore: number;
  autoReminder: boolean;
  isFreeTrial: boolean;
  trialEndDate?: string;
  providerIcon?: string;
  notes?: string;
  status: SubscriptionStatus;
  /** ID of the PaymentMethod that pays for this subscription. */
  paymentMethodId?: string;
  /** How hard it is to cancel this subscription. */
  cancellationDifficulty?: CancellationDifficulty;
  /** Whether the subscription auto-renews at the end of each cycle. */
  autoRenews?: boolean;
}

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; gradient: string }
> = {
  entertainment: { label: "Entertainment", gradient: "rgba(214,79,51,0.10)" },
  productivity: { label: "Productivity", gradient: "rgba(224,162,60,0.12)" },
  fitness: { label: "Fitness", gradient: "rgba(31,156,136,0.12)" },
  music: { label: "Music", gradient: "rgba(232,137,109,0.13)" },
  cloud: { label: "Cloud", gradient: "rgba(22,120,106,0.10)" },
  news: { label: "News", gradient: "rgba(197,135,43,0.13)" },
  food: { label: "Food", gradient: "rgba(168,58,35,0.10)" },
  other: { label: "Other", gradient: "rgba(179,165,151,0.16)" },
};

export const CATEGORY_COLORS: Record<Category, string> = {
  entertainment: "#d64f33", // sienna (primary)
  music: "#e8896d", // soft sienna
  food: "#a83a23", // deep sienna
  cloud: "#16786a", // pine (secondary)
  fitness: "#1f9c88", // light pine
  productivity: "#e0a23c", // honey (tertiary)
  news: "#c5872b", // deep honey
  other: "#b3a597", // warm taupe (neutral)
};
