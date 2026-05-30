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

## 5. Non-Goals (v1)

- Bank/card integration (Plaid)
- Email parsing for auto-detection
- Multi-device sync / cloud backend
- Push notifications (browser API)
- Data export (CSV/PDF)
- Multi-user / team features

## 6. Success Criteria

- User can add a subscription in under 15 seconds
- Dashboard loads with all data in under 200ms (local storage)
- Renewal reminders surface before auto-charge
- Category breakdown accurately reflects spending distribution
- App works offline (local-first architecture)

## 7. Technical Constraints

- **Local storage only** — all data persisted in browser (localStorage via Zustand persist)
- **No backend** — pure client-side SPA
- **Performance** — Lighthouse score > 90 on all metrics
- **Accessibility** — WCAG AA compliance on all interactive elements
- **Responsive** — mobile-first, breakpoints at 744px / 1128px / 1440px
