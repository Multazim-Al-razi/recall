# Recall — Product Specification

> A subscription tracking webapp that monitors recurring charges, sends cancellation reminders, and provides spending intelligence.

## 1. Problem Statement

Users accumulate subscriptions over time and lose track of what they're paying for. Free trials convert silently, renewal dates slip by, and monthly spend creeps up. There's no single place to see the full picture of recurring charges.

## 2. Target User

Individual consumers (primarily 18-40) who maintain 5-15 active subscriptions across entertainment, productivity, fitness, and cloud services. They want visibility and control without manual spreadsheet tracking.

## 3. Core Features

### 3.1 Subscription Management
- **Manual entry** — name, amount, currency, billing cycle, start date, category
- **Smart autocomplete** — common services (Netflix, Spotify, etc.) pre-fill details
- **Edit / pause / cancel** — lifecycle management per subscription
- **Category tagging** — Entertainment, Productivity, Fitness, Music, Cloud, News, Food, Other

### 3.2 Renewal Tracking & Reminders
- **Auto-calculated cancellation windows** — default 3 days before renewal
- **User-adjustable reminder timing** — 1-30 days before renewal
- **Renewal timeline** — chronological view of upcoming charges
- **In-app alerts** — banner notifications for urgent renewals (next 48h)

### 3.3 Free Trial Monitoring
- **Separate trial tracking** — distinct from active subscriptions
- **Auto-alert before conversion** — configurable days before trial ends
- **Trial status indicators** — visual urgency (3 days = red, 7 days = amber)

### 3.4 Spending Analytics
- **Monthly / yearly totals** — current monthly spend and its yearly projection
- **Category breakdown** — donut chart with per-category drill-down
- **Top spenders ranking** — sorted by amount with percentage of total
- **Smart insights** — "You could save $X by consolidating Y and Z"

> Historical month-over-month trend charts are deferred: a local-first v1 has no
> stored spending history to chart, so the app shows only figures derived from
> current data rather than fabricated history.

### 3.5 Dashboard
- **Hero section** — brand messaging + decorative illustration
- **KPI cards** — monthly burn, yearly projection, trial alerts
- **Subscription grid** — 4 featured cards with brand icons
- **Renewal timeline** — chronological upcoming charges
- **Category donut** — visual spend breakdown
- **Spending insight** — dark card with actionable recommendation

## 4. Data Model

```typescript
interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;                    // default "USD"
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'custom';
  customCycleDays?: number;
  category: Category;
  startDate: string;                   // ISO date
  nextRenewalDate: string;             // ISO date
  reminderDaysBefore: number;          // default 3
  autoReminder: boolean;               // auto-calculated cancellation window
  isFreeTrial: boolean;
  trialEndDate?: string;
  providerIcon?: string;               // Simple Icons slug
  notes?: string;
  status: 'active' | 'paused' | 'cancelled';
}

type Category =
  | 'entertainment' | 'productivity' | 'fitness'
  | 'music' | 'cloud' | 'news' | 'food' | 'other';
```

## 5. Out of Scope (v1)

These are not in v1 and have no committed timeline:

- Bank/card integration (Plaid)
- Email parsing for auto-detection
- Push notifications via the browser Notifications API
- Data export to PDF
- Multi-user / team features

The following items were *non-goals for v1* but are now tracked separately. They
are no longer "out of scope for the product" — they are tracked work with a
documented rollout path:

- **Cloud sync / multi-device.** The optional Express backend exists today in
  dev-only mode, with a `tier` field on the account and an `/api/account/upgrade`
  stub. The production-hardening path (Supabase migration, Auth + RLS, reminder
  delivery via Edge Functions, observability) is in
  [BACKEND_ROADMAP.md](BACKEND_ROADMAP.md).
- **The Sync plan ($1.99/mo).** Schemed in the data model and gated by a
  build-time feature flag (`FLAGS.syncPlan`); the UI surfaces it as
  "in development" until billing and reminder delivery ship. See §8 below.
- **CSV export.** Already shipped — see [SubscriptionsView.tsx](../frontend/src/pages/dashboard/SubscriptionsView.tsx).

## 6. Success Criteria

- User can add a subscription in under 15 seconds
- Dashboard loads with all data in under 200ms (local storage)
- Renewal reminders surface before auto-charge
- Category breakdown accurately reflects spending distribution
- App works offline (local-first architecture)

## 7. Technical Constraints

- **Local-first by default** — all subscription and account data is persisted
  in the browser (localStorage via Zustand `persist`). The app is fully
  functional with the backend turned off.
- **Optional Express backend** — a small Express + lowdb service lives in
  `backend/`. It mirrors local state to the server when reachable, and a
  status indicator surfaces `online` / `offline` / `connecting`. The
  backend is **dev-only**: a production kill switch in
  [`backend/src/index.ts`](../backend/src/index.ts) refuses to start with
  `NODE_ENV=production` unless `ALLOW_DEV_BACKEND=1` is set. The cloud
  migration path uses **Supabase** (hosted Postgres, Auth, Realtime, Edge
  Functions) instead of self-managed SQLite/Postgres — see
  [BACKEND_ROADMAP.md](BACKEND_ROADMAP.md).
- **Monorepo** — `frontend/` (React SPA), `backend/` (Express + lowdb,
  dev-only; Supabase for cloud), `supabase/` (migrations + Edge Functions,
  to be created), `e2e/` (Playwright), `docs/` (this folder).
- **Design tokens** — CSS `@theme` block in `frontend/src/index.css` defines
  colors, radii, spacing; components use `rounded-sm/md/lg/xl/pill` tokens.
- **Feature flags** — build-time booleans in
  [`frontend/src/lib/featureFlags.ts`](../frontend/src/lib/featureFlags.ts)
  gate the Sync and Mobile plans (`FLAGS.syncPlan`, `FLAGS.mobileApp`) so the
  pricing surface is never a promise the runtime can't keep.
- **Performance** — Lighthouse score > 90 on all metrics.
- **Accessibility** — WCAG AA compliance on all interactive elements.
- **Responsive** — mobile-first, breakpoints at 744px / 1128px / 1440px;
  sidebar collapses to hamburger < 744px.

## 8. Plan Tiers

Recall's product model has three plans, sourced from a single
[`lib/pricing.ts`](../frontend/src/lib/pricing.ts) array and gated by build-time
flags so the marketing surface never oversells a feature that hasn't shipped.

| Plan | Price | Status | What it gives you |
|---|---|---|---|
| **Web · Local** | Free | Ships today | Full tracking, charts, and insights, in your browser. No account, no sign-up, no upload. Data never leaves the device. |
| **Web · Sync** | $1.99/mo | In development | Everything in Local, plus cloud-delivered renewal reminders that reach you with the tab closed, and multi-device sync. Surfaced in the UI as "in development" until `FLAGS.syncPlan` is flipped on after the [BACKEND_ROADMAP.md](BACKEND_ROADMAP.md) Supabase migration workstreams ship. |
| **Mobile** | Free | In development | Native on-device reminders, no sign-up, no account, no server. Free forever. Surfaced in the UI as "coming soon" until the companion app ships. |

### 8.1 Account model

The backend `AccountRecord` carries a `tier: 'local' | 'sync'` field, mirrored
on the frontend `UserProfile`. The account is created with `tier: 'local'`
(see [`backend/src/db.ts`](../backend/src/db.ts) `createDefaultAccount()`).

The frontend's [lib/entitlements.ts](../frontend/src/lib/entitlements.ts)
exposes pure helpers downstream code uses to gate features:

- `hasSync(profile)` → true only when `FLAGS.syncPlan && profile.tier === 'sync'`.
  Even a paying user reads as not-entitled while the flag is off.
- `hasMobile()` → returns `FLAGS.mobileApp` (a build-time gate, not a per-user
  one).
- `tierLabel(tier)` → the marketing label for the active tier, used by the
  profile and pricing UI.

### 8.2 Tier transitions

A stub route `POST /api/account/upgrade` accepts `{ tier: 'local' | 'sync' }`
and currently returns `501 Not Implemented` for valid bodies and `400` for
anything else. The Stripe webhook (or an in-app checkout) will land here
when the Sync plan ships. Auth and billing will be handled by Supabase
Auth (magic link + JWT) and Supabase's subscription billing integration —
see [BACKEND_ROADMAP.md](BACKEND_ROADMAP.md) §2–3.

### 8.3 Copy contract

User-facing copy that the test suite pins (hero headline, CTAs, feature
headlines, trust signals) lives in
[`frontend/src/lib/copyContract.ts`](../frontend/src/lib/copyContract.ts).
Both `Home.tsx` and `e2e/home.spec.ts` import from there, so a marketing
edit surfaces as a single intentional diff instead of a surprise test
failure.
