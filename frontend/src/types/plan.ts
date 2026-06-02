/**
 * Plan types live alongside the pricing data in `@/lib/pricing`.
 * This file is a re-export shim kept for backwards compatibility with any
 * import path that still uses `@/types/plan`. New code should import from
 * `@/lib/pricing` (the data) and `@/lib/entitlements` (the runtime check).
 */
export type { Plan, CompareCell, CompareRow } from '@/lib/pricing';
