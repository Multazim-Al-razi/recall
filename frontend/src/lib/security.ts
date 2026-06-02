/**
 * Security helpers for untrusted strings that may end up in dangerous sinks
 * (img src=, CSV cells, etc). Centralised so every consumer uses the same
 * allowlist.
 *
 * F-1: `profile.avatar` is user-controlled and flows into `<img src>`. We
 * accept only `https:` URLs and a narrow set of inline `data:image/...`
 * URIs; anything else (including `data:image/svg+xml`, `javascript:`, and
 * `data:text/html`) is rejected outright to prevent stored XSS.
 */

const HTTPS_URL = /^https:\/\/[^\s]+$/i;

/** Strict data-URI allowlist: only safe raster image types with base64 payloads. */
const DATA_IMAGE_RE =
  /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i;

/**
 * Return `value` only if it is a safe avatar URL. Returns `undefined` for
 * everything else, including:
 *   - non-strings
 *   - empty / whitespace-only strings (use `''` explicitly to clear)
 *   - `javascript:`, `data:text/html`, `file:`, `http:`, and other schemes
 *   - `data:image/svg+xml` (XSS vector)
 *   - oversized blobs
 */
export function safeAvatarUrl(
  value: unknown,
  maxLen = 8000,
): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (trimmed.length > maxLen) return undefined;

  if (trimmed.startsWith('data:')) {
    return DATA_IMAGE_RE.test(trimmed) ? trimmed : undefined;
  }

  return HTTPS_URL.test(trimmed) ? trimmed : undefined;
}

/**
 * Characters that, when used as the *first* character of a CSV cell, can be
 * interpreted as a formula by Excel/Google Sheets. We defensively prefix any
 * such cell with a single quote so the cell is rendered as text.
 *
 * Reference: OWASP "CSV Injection" — the dangerous characters are:
 * `=  +  -  @  \t  \r`
 */
const FORMULA_PREFIXES = new Set(['=', '+', '-', '@', '\t', '\r']);

/** Return a CSV-safe cell value. Strings starting with a formula char get
 *  a single-quote prefix so spreadsheet apps render them as text. */
export function safeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.length === 0) return '';
  return FORMULA_PREFIXES.has(str[0]) ? `'${str}` : str;
}

/**
 * Slug used to fetch a Simple Icons SVG. Simple Icons' CDN resolves any
 * path component, so an attacker-controlled slug (`../../foo`) can fetch an
 * unexpected resource. We allowlist against the known `PROVIDERS` set
 * derived from the static manifest.
 */
import { PROVIDERS } from '@/lib/providers';

/** Lower-cased set of every supported provider slug. */
const PROVIDER_SLUGS: ReadonlySet<string> = new Set(
  PROVIDERS.map((p) => p.icon.toLowerCase()),
);

export function safeProviderIconSlug(
  value: unknown,
): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().toLowerCase();
  if (trimmed === '') return undefined;
  return PROVIDER_SLUGS.has(trimmed) ? trimmed : undefined;
}
