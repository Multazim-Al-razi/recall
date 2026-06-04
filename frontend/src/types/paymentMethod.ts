import type { CardShade } from '@/lib/cardTheme';

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "debit" | "other";

export interface PaymentMethod {
  id: string;
  label: string;
  brand: CardBrand;
  last4: string;
  color: string;
  /** Color shade preset for the card illustration background. */
  shade: CardShade;
  expiryMonth?: number;
  expiryYear?: number;
}

export const CARD_BRANDS: CardBrand[] = [
  "visa",
  "mastercard",
  "amex",
  "discover",
  "debit",
  "other",
];

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  debit: "Debit Card",
  other: "Other",
};

export const CARD_BRAND_COLORS: Record<CardBrand, string> = {
  visa: "#1A1F71",
  mastercard: "#EB001B",
  amex: "#006FCF",
  discover: "#FF6000",
  debit: "#6B7280",
  other: "#374151",
};

export const CARD_BRAND_GRADIENTS: Record<CardBrand, string> = {
  visa: "linear-gradient(135deg, #1A1F71 0%, #2D3386 100%)",
  mastercard: "linear-gradient(135deg, #EB001B 0%, #F79E1B 100%)",
  amex: "linear-gradient(135deg, #006FCF 0%, #0090DA 100%)",
  discover: "linear-gradient(135deg, #FF6000 0%, #FF8800 100%)",
  debit: "linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)",
  other: "linear-gradient(135deg, #374151 0%, #6B7280 100%)",
};
