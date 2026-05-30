/**
 * Visual registry — the single source of truth for illustration assets.
 *
 * Maintained by the "Visual Chief" role (see .kiro/steering/visual-chief.md).
 * Components must request illustrations through this registry rather than
 * importing SVG files directly, so usage, alt text, and attribution stay
 * centralised and licence-compliant.
 */
import type { Category } from '@/types/subscription';

// unDraw illustrations — free for commercial use, no attribution required.
// Recoloured to the Rausch accent (#d4443a) to match the brand.
import revenueAnalysis from '@/assets/illustrations/undraw/revenue-analysis_fjh2.svg';
import dragToAdd from '@/assets/illustrations/undraw/drag-to-add_8zdg.svg';
import dancing from '@/assets/illustrations/undraw/dancing_lvv0.svg';
import deviceSync from '@/assets/illustrations/undraw/device-sync_d9ei.svg';
import fitnessStats from '@/assets/illustrations/undraw/fitness-stats_bd09.svg';
import videoTutorial from '@/assets/illustrations/undraw/video-tutorial_ly8k.svg';
import allChecked from '@/assets/illustrations/undraw/all-checked_d3u6.svg';
import goalsTarget from '@/assets/illustrations/undraw/goals_dwgr.svg';
import fileAnalysis from '@/assets/illustrations/undraw/file-analysis_nbtc.svg';
import emptyWalletArt from '@/assets/illustrations/undraw/empty-wallet_j0kn.svg';
import controlPanelArt from '@/assets/illustrations/undraw/control-panel_s0j2.svg';
import leaveAReview from '@/assets/illustrations/undraw/leave-a-review_uj9v.svg';

// Storyset "Pana" illustrations — bundled from Storyset (Freepik).
// Attribution required; credited in lib/credits.ts and rendered on the About
// page. Plant illustrations carry the warm "grow your savings" metaphor;
// finance illustrations anchor money-related surfaces.
import storysetPottedPlants from '@/assets/illustrations/storyset/potted-plants-pana.svg';
import storysetStrelitzia from '@/assets/illustrations/storyset/strelitzia-plant-pana.svg';
import storysetEwallet from '@/assets/illustrations/storyset/e-wallet-pana.svg';
import storysetMessyBun from '@/assets/illustrations/storyset/messy-bun-pana.svg';
import storysetCreditCard from '@/assets/illustrations/storyset/credit-card-pana.svg';
import storysetMobilePayments from '@/assets/illustrations/storyset/mobile-payments-pana.svg';
import storysetSpringFlower from '@/assets/illustrations/storyset/spring-flower-pana.svg';
import storysetConsent from '@/assets/illustrations/storyset/consent-pana.svg';
import storysetAutonomy from '@/assets/illustrations/storyset/autonomy-pana.svg';
import storysetCuriosityBrain from '@/assets/illustrations/storyset/curiosity-brain-pana.svg';
import storysetBusinessSupport from '@/assets/illustrations/storyset/business-support-pana.svg';
import storysetWallet from '@/assets/illustrations/storyset/wallet-pana.svg';
import storysetPoppyFlower from '@/assets/illustrations/storyset/poppy-flower-pana.svg';
import storysetPaymentInformation from '@/assets/illustrations/storyset/payment-information-cuate.svg';
import storysetInvestmentData from '@/assets/illustrations/storyset/investment-data-mesa-de-trabajo-1-bro.svg';

// Open Peeps — hand-drawn people library by Pablo Stanley (CC0).
// Mix-and-match diverse human characters for people-centric illustrations.
import openPeepsSitting from '@/assets/illustrations/open-peeps/5e5351f351970522b7a2499d_peep-15.svg';
import openPeepsStanding from '@/assets/illustrations/open-peeps/5e536061519705b96fa8d804_peep-standing-1.svg';
import openPeepsThoughtful from '@/assets/illustrations/open-peeps/5e53523cf3aa4b6f462b2ec0_peep-17.svg';

// Lukasz Adam — simple minimal illustrations (CC0 / MIT).
// Free for commercial use, no attribution required.
import lukaszadamNotification from '@/assets/illustrations/lukasz-adam/notification_woman.svg';
import lukaszadamCactus from '@/assets/illustrations/lukasz-adam/cactus.svg';
import lukaszadamGoal from '@/assets/illustrations/lukasz-adam/goal.svg';
import lukaszadamSuccess from '@/assets/illustrations/lukasz-adam/success_illustration.svg';
import lukaszadamTools from '@/assets/illustrations/lukasz-adam/tools.svg';
import lukaszadamRelaxing from '@/assets/illustrations/lukasz-adam/relaxing.svg';
import lukaszadamCoffee from '@/assets/illustrations/lukasz-adam/coffee.svg';
import lukaszadamSale from '@/assets/illustrations/lukasz-adam/sale.svg';
import lukaszadamHero from '@/assets/illustrations/lukasz-adam/hero-illustration.svg';
import lukaszadamWebsiteWork from '@/assets/illustrations/lukasz-adam/website_work.svg';

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
 * underlying asset can be swapped without touching component code.
 */
export const illustrations = {
  /** Dashboard hero — a person reviewing their spending. */
  hero: {
    src: revenueAnalysis,
    alt: 'Person reviewing a spending analytics dashboard',
    collection: 'unDraw',
  },
  /** Zero / empty state — adding the first subscription. */
  emptyAdd: {
    src: dragToAdd,
    alt: 'Dragging a card to add a new subscription',
    collection: 'unDraw',
  },
  /** Entertainment category. */
  entertainment: {
    src: videoTutorial,
    alt: 'Person watching streaming video content',
    collection: 'unDraw',
  },
  /** Music category. */
  music: {
    src: dancing,
    alt: 'Person dancing to music',
    collection: 'unDraw',
  },
  /** Cloud category. */
  cloud: {
    src: deviceSync,
    alt: 'Devices syncing data to the cloud',
    collection: 'unDraw',
  },
  /** Fitness category. */
  fitness: {
    src: fitnessStats,
    alt: 'Person tracking fitness statistics',
    collection: 'unDraw',
  },
  /** Onboarding welcome — potted plants, "grow your subscription garden". */
  welcome: {
    src: storysetPottedPlants,
    alt: 'Potted plants representing growth and nurturing your finances',
    collection: 'Storyset',
  },
  /** Pricing page — e-wallet with payment elements. */
  pricing: {
    src: storysetEwallet,
    alt: 'Digital e-wallet with coins and payment cards',
    collection: 'Storyset',
  },
  /** Generic empty state — a single potted plant / seedling. */
  empty: {
    src: storysetStrelitzia,
    alt: 'A potted strelitzia plant',
    collection: 'Storyset',
  },
  /** Profile / account page — person illustration. */
  profile: {
    src: storysetMessyBun,
    alt: 'A person with a messy bun hairstyle sitting at a table',
    collection: 'Storyset',
  },
  /** Billing / payments — credit card with payment elements. */
  billing: {
    src: storysetCreditCard,
    alt: 'Credit card with payment and billing elements',
    collection: 'Storyset',
  },
  /** Mobile payments — phone with payment interface. */
  payments: {
    src: storysetMobilePayments,
    alt: 'Mobile phone showing a payment interface',
    collection: 'Storyset',
  },
  /** Growth / savings — spring flower representing growth. */
  growth: {
    src: storysetSpringFlower,
    alt: 'Spring flower representing financial growth',
    collection: 'Storyset',
  },
  /** Privacy / consent — shield and consent elements. */
  privacy: {
    src: storysetConsent,
    alt: 'Shield representing data privacy and consent',
    collection: 'Storyset',
  },
  /** About / autonomy — person with independent posture. */
  about: {
    src: storysetAutonomy,
    alt: 'Person representing autonomy and independence',
    collection: 'Storyset',
  },
  /** Blog / knowledge — curiosity and brain illustration. */
  blog: {
    src: storysetCuriosityBrain,
    alt: 'Brain representing curiosity and learning',
    collection: 'Storyset',
  },
  /** FAQ / support — business support illustration. */
  faq: {
    src: storysetBusinessSupport,
    alt: 'Person providing business support and guidance',
    collection: 'Storyset',
  },
  /** Wallet — wallet with financial elements. */
  wallet: {
    src: storysetWallet,
    alt: 'Wallet with financial elements',
    collection: 'Storyset',
  },
  /** Testimonial / trust — poppy flower representing trust. */
  testimonial: {
    src: storysetPoppyFlower,
    alt: 'Poppy flower representing trust and appreciation',
    collection: 'Storyset',
  },
  /** Spend / payment info — payment information cuate illustration. */
  spend: {
    src: storysetPaymentInformation,
    alt: 'Payment information breakdown showing spending details',
    collection: 'Storyset',
  },
  /** Security / protection — all checks passed, representing security. */
  security: {
    src: allChecked,
    alt: 'Checklist with all items verified, representing data security and protection',
    collection: 'unDraw',
  },

  // ── Data-viz & marketing slots (wired from already-downloaded assets) ─
  /** Analytics hero — investment/data dashboard for the Analytics page. */
  analyticsHero: {
    src: storysetInvestmentData,
    alt: 'Person analysing investment data on a dashboard with charts and graphs',
    collection: 'Storyset',
  },
  /** Savings goal — target representing a savings goal. */
  savingsGoal: {
    src: goalsTarget,
    alt: 'Person aiming at a target, representing a savings goal',
    collection: 'unDraw',
  },
  /** Projection / forecast — analysing a file of figures. */
  projection: {
    src: fileAnalysis,
    alt: 'Person reviewing a document of figures, representing a spending projection',
    collection: 'unDraw',
  },
  /** Empty wallet — zero-spend or empty financial state. */
  emptyWallet: {
    src: emptyWalletArt,
    alt: 'An empty wallet, representing no spending to display',
    collection: 'unDraw',
  },
  /** Control panel — settings and configuration dashboard. */
  controlPanel: {
    src: controlPanelArt,
    alt: 'Person adjusting a settings dashboard with sliders and controls',
    collection: 'unDraw',
  },
  /** Reviews / testimonial — leaving a star rating and review. */
  reviews: {
    src: leaveAReview,
    alt: 'Person leaving a star rating and written review',
    collection: 'unDraw',
  },

  // ── Open Peeps alternatives ──────────────────────────────────────────
  /** Profile alternative — person sitting casually (Open Peeps). */
  profileAlt: {
    src: openPeepsSitting,
    alt: 'Person sitting casually with a friendly expression',
    collection: 'Open Peeps',
  },
  /** Welcome alternative — person standing with welcoming gesture (Open Peeps). */
  welcomeAlt: {
    src: openPeepsStanding,
    alt: 'Person standing with a welcoming gesture',
    collection: 'Open Peeps',
  },
  /** FAQ alternative — person with a thoughtful expression (Open Peeps). */
  faqAlt: {
    src: openPeepsThoughtful,
    alt: 'Person with a thoughtful expression',
    collection: 'Open Peeps',
  },

  // ── Lukasz Adam alternatives ─────────────────────────────────────────
  /** Notification — woman receiving a notification. */
  notification: {
    src: lukaszadamNotification,
    alt: 'Woman receiving a notification on her device',
    collection: 'Lukasz Adam',
  },
  /** Empty alternative — minimalist cactus for empty states. */
  emptyAlt: {
    src: lukaszadamCactus,
    alt: 'Minimalist cactus illustration for empty states',
    collection: 'Lukasz Adam',
  },
  /** Goal / savings — target with arrow representing financial goals. */
  goal: {
    src: lukaszadamGoal,
    alt: 'Goal target with arrow representing financial goals',
    collection: 'Lukasz Adam',
  },
  /** Success — celebration illustration. */
  success: {
    src: lukaszadamSuccess,
    alt: 'Success celebration illustration',
    collection: 'Lukasz Adam',
  },
  /** Settings — tools illustration. */
  settings: {
    src: lukaszadamTools,
    alt: 'Settings tools illustration',
    collection: 'Lukasz Adam',
  },
  /** Hero alternative — person relaxing with a laptop. */
  heroAlt: {
    src: lukaszadamRelaxing,
    alt: 'Person relaxing with a laptop, calm and productive',
    collection: 'Lukasz Adam',
  },
  /** Welcome alternative — coffee cup representing daily routine. */
  welcomeAlt2: {
    src: lukaszadamCoffee,
    alt: 'Coffee cup illustration representing daily routine',
    collection: 'Lukasz Adam',
  },
  /** Pricing alternative — sales and pricing illustration. */
  pricingAlt: {
    src: lukaszadamSale,
    alt: 'Sales and pricing illustration',
    collection: 'Lukasz Adam',
  },
  /** About alternative — person with a cat representing personal space. */
  aboutAlt: {
    src: lukaszadamHero,
    alt: 'Person with a cat representing a relaxed personal space',
    collection: 'Lukasz Adam',
  },
  /** Cloud alternative — person working with web technology. */
  cloudAlt: {
    src: lukaszadamWebsiteWork,
    alt: 'Person working with web technology and cloud services',
    collection: 'Lukasz Adam',
  },
} as const satisfies Record<string, IllustrationMeta>;

export type IllustrationKey = keyof typeof illustrations;

/**
 * Categories that have a matching illustration. Productivity, news, food and
 * "other" intentionally have none — the Visual Chief rule is to fall back to
 * a brand icon or plain layout rather than force an unrelated illustration.
 */
const CATEGORY_ILLUSTRATION: Partial<Record<Category, IllustrationKey>> = {
  entertainment: 'entertainment',
  music: 'music',
  cloud: 'cloud',
  fitness: 'fitness',
};

/** Returns the illustration for a category, or null when none fits. */
export function getCategoryIllustration(category: Category): IllustrationMeta | null {
  const key = CATEGORY_ILLUSTRATION[category];
  return key ? illustrations[key] : null;
}
