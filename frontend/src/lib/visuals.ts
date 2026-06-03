/**
 * Visual registry — the single source of truth for illustration assets.
 *
 * Maintained by the "Visual Chief" role (see .kiro/steering/visual-chief.md).
 * Components must request illustrations through this registry rather than
 * importing SVG files directly, so usage, alt text, and attribution stay
 * centralised and licence-compliant.
 *
 * One family, one accent: every illustration is unDraw (MIT, no attribution),
 * recoloured to the mono Rausch sienna accent (#d64f33). No two active slots
 * reuse the same asset. Never mix other illustration families on screen.
 */
import type { Category } from "@/types/subscription";

// unDraw illustrations — free for commercial use, no attribution required.
// Every accent is normalised to the Rausch sienna (#d64f33) — see
// scripts/normalize-undraw-accent.mjs.
import gardening from "@/assets/illustrations/undraw/gardening_jck1.svg";
import morningPlans from "@/assets/illustrations/undraw/morning-plans_5vln.svg";
import filesMissing from "@/assets/illustrations/undraw/files-missing_ntwe.svg";
import uiAnalysis from "@/assets/illustrations/undraw/ui-analysis_crhb.svg";
import growthChart from "@/assets/illustrations/undraw/growth-chart_4iho.svg";
import scheduleCleanupArt from "@/assets/illustrations/undraw/schedule-cleanup_1xs7.svg";
import charts from "@/assets/illustrations/undraw/charts_31si.svg";
import videoTutorial from "@/assets/illustrations/undraw/video-tutorial_ly8k.svg";
import dancing from "@/assets/illustrations/undraw/dancing_lvv0.svg";
import deviceSync from "@/assets/illustrations/undraw/device-sync_d9ei.svg";
import fitnessStats from "@/assets/illustrations/undraw/fitness-stats_bd09.svg";
import webSearch from "@/assets/illustrations/undraw/web-search_7oif.svg";
import budgeting from "@/assets/illustrations/undraw/budgeting_klon.svg";
import openSourceCodeSvg from "@/assets/illustrations/undraw/open-source-code_411s.svg";
import onboardingIllustration from "@/assets/illustrations/undraw/onboarding_dcq2.svg";
import notifyIllustration from "@/assets/illustrations/undraw/notify_drs8.svg";
import reminderIllustration from "@/assets/illustrations/undraw/reminder_ustg.svg";
import securityIllustration from "@/assets/illustrations/undraw/security_0ubl.svg";
import budgetAdjustments from "@/assets/illustrations/undraw/budget-adjustments_7fj9.svg";
import dreamGift from "@/assets/illustrations/undraw/dream-gift_5ave.svg";
import emptyWallet from "@/assets/illustrations/undraw/empty-wallet_j0kn.svg";
import targetAudience from "@/assets/illustrations/undraw/target-audience_prun.svg";

import storysetBusinessSupport from "@/assets/illustrations/storyset/business-support-pana.svg";
import storysetCharity from "@/assets/illustrations/storyset/Charity-cuate.svg";
import storysetCherryTree from "@/assets/illustrations/storyset/cherry-tree-pana.svg";
import storysetConsent from "@/assets/illustrations/storyset/consent-pana.svg";
import storysetEWallet from "@/assets/illustrations/storyset/e-wallet-pana.svg";
import storysetFinance from "@/assets/illustrations/storyset/finance-mesa-de-trabajo-1-bro.svg";
import storysetWallet from "@/assets/illustrations/storyset/wallet-pana.svg";
import storysetAutonomy from "@/assets/illustrations/storyset/autonomy-pana.svg";

export interface IllustrationMeta {
  /** Bundled, hashed asset URL. */
  src: string;
  /** Descriptive alt text — required for accessibility. */
  alt: string;
  /** Collection the asset came from (used for the About page credit). */
  collection: string;
}

/**
 * Semantic illustration slots. Key by *intent*, never by filename, so the
 * underlying asset can be swapped without touching component code. Every slot
 * resolves to a unique unDraw asset recoloured to the Rausch sienna accent.
 */
export const illustrations = {
  /** Onboarding welcome — tending a garden, "grow your subscription garden". */
  welcome: {
    src: gardening,
    alt: "Person tending a garden, representing nurturing and growth",
    collection: "unDraw",
  },
  /** Profile / account page — person reviewing their plans at a desk. */
  profile: {
    src: morningPlans,
    alt: "Person reviewing their plans for the day at a desk",
    collection: "unDraw",
  },
  /** Generic empty state — nothing to display yet. */
  empty: {
    src: filesMissing,
    alt: "Empty state with no items to display yet",
    collection: "unDraw",
  },
  /** Home / dashboard finance hero — reviewing a spending dashboard. */
  financeOverview: {
    src: onboardingIllustration,
    alt: "Browser window showing an onboarding form, representing quick and easy setup",
    collection: "unDraw",
  },
  /** Analytics page hero — analysing interface data and charts. */
  analyticsHero: {
    src: uiAnalysis,
    alt: "Person analysing a dashboard of charts and metrics",
    collection: "unDraw",
  },
  /** Growth / savings — an upward growth chart. */
  growth: {
    src: growthChart,
    alt: "An upward growth chart representing financial growth",
    collection: "unDraw",
  },
  /** Schedule cleanup — decluttering and organising subscriptions. */
  scheduleCleanup: {
    src: scheduleCleanupArt,
    alt: "Person cleaning up and organising their schedule",
    collection: "unDraw",
  },
  /** Notifications / reminders — renewal and cancellation alerts. */
  notification: {
    src: notifyIllustration,
    alt: "Notifications and alerts, representing timely renewal reminders",
    collection: "unDraw",
  },
  /** Reminder preview — a specific reminder illustration for the hero carousel. */
  reminderPreview: {
    src: reminderIllustration,
    alt: "A friendly reminder notification, representing renewal alerts",
    collection: "unDraw",
  },
  /** Revenue / spending chart — a clean chart card. */
  revenueChart: {
    src: charts,
    alt: "A chart showing spending tracked over time",
    collection: "unDraw",
  },
  /** Savings goal — a target representing a savings goal. */
  savingsGoal: {
    src: storysetFinance,
    alt: "Finance dashboard and savings illustration, representing quiet subscription savings",
    collection: "Storyset",
  },
  /** Entertainment category. */
  entertainment: {
    src: videoTutorial,
    alt: "Person watching streaming video content",
    collection: "unDraw",
  },
  /** Music category. */
  music: {
    src: dancing,
    alt: "Person dancing to music",
    collection: "unDraw",
  },
  /** Cloud category. */
  cloud: {
    src: deviceSync,
    alt: "Devices syncing data to the cloud",
    collection: "unDraw",
  },
  /** Fitness category. */
  fitness: {
    src: fitnessStats,
    alt: "Person tracking fitness statistics",
    collection: "unDraw",
  },
  /** Blog / knowledge — searching and discovering articles. */
  blog: {
    src: webSearch,
    alt: "Person searching the web for information",
    collection: "unDraw",
  },
  /** Wallet / budgeting — managing money. */
  wallet: {
    src: budgeting,
    alt: "Person budgeting and managing their money",
    collection: "unDraw",
  },
  /** Privacy / security — all checks passed. */
  privacy: {
    src: securityIllustration,
    alt: "Security and privacy illustration, representing that your data stays yours",
    collection: "unDraw",
  },
  /** Spend / payment breakdown — adjusting a budget. */
  spend: {
    src: budgetAdjustments,
    alt: "Person adjusting a budget, representing a spending breakdown",
    collection: "unDraw",
  },
  /** Pricing hero — a wallet, "what you pay for". Pairs with the copy about
   *  free-on-device and the optional Cloud add-on. */
  pricing: {
    src: storysetBusinessSupport,
    alt: "People providing support, representing Recall pricing and support",
    collection: "Storyset",
  },
  /** Pricing feature — device sync, "your subscriptions everywhere". */
  pricingSync: {
    src: deviceSync,
    alt: "Devices syncing data to the cloud, representing cross-device access to your subscriptions",
    collection: "unDraw",
  },
  /** Home "feature trio" — a group of people, the audience of your stack. */
  audience: {
    src: targetAudience,
    alt: "A group of people standing together, representing the subscriptions you manage",
    collection: "unDraw",
  },
  /** Home "feature trio" — money in motion, celebrating the savings. */
  celebration: {
    src: storysetEWallet,
    alt: "An e-wallet, representing quiet savings found in subscriptions",
    collection: "Storyset",
  },
  /** Support / plans — a wrapped gift, "the optional Sync plan". */
  support: {
    src: dreamGift,
    alt: "A wrapped gift, representing the optional Sync plan that adds cloud-delivered reminders on top of the free local app",
    collection: "unDraw",
  },
  /** About hero — a lightweight visual for the product ethos. */
  aboutSupport: {
    src: storysetWallet,
    alt: "A wallet, representing the open-source Recall project",
    collection: "Storyset",
  },
  /** About — a compact visual for spending and budgeting. */
  aboutWallet: {
    src: emptyWallet,
    alt: "A wallet, representing managing recurring spend",
    collection: "unDraw",
  },
  /** About — autonomy and ownership, "your data stays yours". */
  aboutAutonomy: {
    src: storysetAutonomy,
    alt: "A person standing confidently, representing autonomy and owning your own data",
    collection: "Storyset",
  },
  /** Donate / support — a gratitude message for community support. */
  donateCharity: {
    src: storysetCharity,
    alt: "A gratitude illustration representing community support and donations",
    collection: "Storyset",
  },
  /** Open source / community — open source code representation. */
  openSourceCode: {
    src: openSourceCodeSvg,
    alt: "Open source code, representing transparent and community-driven software",
    collection: "unDraw",
  },
  /** Community / growing tree — cherry tree for organic growth narrative. */
  cherryTree: {
    src: storysetCherryTree,
    alt: "Cherry tree growing, representing organic growth and community building",
    collection: "Storyset",
  },
  /** Consent / control — user agreement and transparency visualization. */
  consent: {
    src: storysetConsent,
    alt: "Consent checkbox, representing user control and transparency",
    collection: "Storyset",
  },
} as const satisfies Record<string, IllustrationMeta>;

export type IllustrationKey = keyof typeof illustrations;

/**
 * Categories that have a matching illustration. Productivity, news, food and
 * "other" intentionally have none — the Visual Chief rule is to fall back to
 * a brand icon or plain layout rather than force an unrelated illustration.
 */
const CATEGORY_ILLUSTRATION: Partial<Record<Category, IllustrationKey>> = {
  entertainment: "entertainment",
  music: "music",
  cloud: "cloud",
  fitness: "fitness",
};

/** Returns the illustration for a category, or null when none fits. */
export function getCategoryIllustration(
  category: Category,
): IllustrationMeta | null {
  const key = CATEGORY_ILLUSTRATION[category];
  return key ? illustrations[key] : null;
}
