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

// Storyset "Pana" illustrations — bundled from Storyset (Freepik).
// Attribution required; credited in lib/credits.ts and rendered on the About
// page. Plant illustrations carry the warm "grow your savings" metaphor;
// finance illustrations anchor money-related surfaces.
import storysetPottedPlants from '@/assets/illustrations/storyset/potted-plants-pana.svg';
import storysetStrelitzia from '@/assets/illustrations/storyset/strelitzia-plant-pana.svg';
import storysetEwallet from '@/assets/illustrations/storyset/e-wallet-pana.svg';
import storysetMessyBun from '@/assets/illustrations/storyset/messy-bun-pana.svg';

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
