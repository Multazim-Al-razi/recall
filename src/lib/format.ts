/** Small shared formatting helpers. */

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
};

export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

export function formatMoney(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(amount);
  } catch {
    // Fallback for unknown currencies
    return `${currencySymbol(currency)}${amount.toFixed(2)}`;
  }
}

/** Initials from a name, e.g. "Ada Lovelace" -> "AL". Falls back to "R". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'R';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
