import bambooTreeBg from '@/assets/illustrations/storyset/bamboo-tree-pana.svg';
import poppyFlowerBg from '@/assets/illustrations/storyset/poppy-flower-pana.svg';

/** Card background illustration — only bamboo tree and poppy flower. */
export type CardIllustrationTheme = 'bambooTree' | 'poppyFlower';

const CARD_THEMES: CardIllustrationTheme[] = ['bambooTree', 'poppyFlower'];

/** Resolve a theme from the card's index in the payment methods list. */
export function getCardTheme(index: number): CardIllustrationTheme {
  return CARD_THEMES[index % CARD_THEMES.length];
}

/** SVG asset URLs keyed by theme. */
export const THEME_SVG: Record<CardIllustrationTheme, string> = {
  bambooTree: bambooTreeBg,
  poppyFlower: poppyFlowerBg,
};

/** Color shade presets — 5 distinct hues to tint the SVG accent (#FF725E coral).
 *  Each shade defines a CSS filter applied to the <img> to shift the base coral
 *  accent toward the target hue, plus an aurora-style border gradient. */
export type CardShade = 'coral' | 'ocean' | 'forest' | 'galaxy' | 'gold';

export const CARD_SHADES: Record<CardShade, {
  label: string;
  /** CSS filter applied to the SVG <img> to tint the accent color. */
  filter: string;
  /** Border gradient — aurora-style ring around the card edge. */
  borderGradient: string;
  /** Preview swatch background — used by the shade picker dots. */
  swatch: string;
}> = {
  coral: {
    label: 'Coral',
    filter: 'none',
    borderGradient: 'linear-gradient(90deg, rgba(214,79,51,0.5) 0%, rgba(255,114,94,0.4) 25%, rgba(255,182,0,0.3) 50%, rgba(255,255,255,0.6) 100%)',
    swatch: '#FF725E',
  },
  ocean: {
    label: 'Ocean',
    filter: 'hue-rotate(210deg) saturate(1.1)',
    borderGradient: 'linear-gradient(90deg, rgba(0,87,255,0.5) 0%, rgba(0,144,255,0.4) 25%, rgba(0,200,255,0.3) 50%, rgba(255,255,255,0.6) 100%)',
    swatch: '#3B82F6',
  },
  forest: {
    label: 'Forest',
    filter: 'hue-rotate(100deg) saturate(1.1)',
    borderGradient: 'linear-gradient(90deg, rgba(20,83,45,0.5) 0%, rgba(34,197,94,0.4) 25%, rgba(163,230,53,0.3) 50%, rgba(255,255,255,0.6) 100%)',
    swatch: '#22C55E',
  },
  galaxy: {
    label: 'Galaxy',
    filter: 'hue-rotate(250deg) saturate(1.2)',
    borderGradient: 'linear-gradient(90deg, rgba(88,28,135,0.5) 0%, rgba(168,85,247,0.4) 25%, rgba(216,180,254,0.3) 50%, rgba(255,255,255,0.6) 100%)',
    swatch: '#A855F7',
  },
  gold: {
    label: 'Gold',
    filter: 'hue-rotate(30deg) saturate(0.9) brightness(1.05)',
    borderGradient: 'linear-gradient(90deg, rgba(191,136,44,0.5) 0%, rgba(224,162,60,0.4) 25%, rgba(250,204,21,0.3) 50%, rgba(255,255,255,0.6) 100%)',
    swatch: '#E0A23C',
  },
};

export const CARD_SHADE_LIST: CardShade[] = ['coral', 'ocean', 'forest', 'galaxy', 'gold'];
