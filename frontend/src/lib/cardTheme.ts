/** Card background illustration themes — cycled per card index. */
export type CardIllustrationTheme = 'cherryTree' | 'bambooTree' | 'poppyFlower' | 'springFlower';

const CARD_THEMES: CardIllustrationTheme[] = ['cherryTree', 'bambooTree', 'poppyFlower', 'springFlower'];

/** Resolve a theme from the card's index in the payment methods list. */
export function getCardTheme(index: number): CardIllustrationTheme {
  return CARD_THEMES[index % CARD_THEMES.length];
}
