# Recall

> Your subscriptions, on your device, under your control.

A local-first subscription tracking webapp that monitors recurring charges, warns you before each renewal, and provides spending intelligence — all in your browser. Free and open: your data lives on your device and we never see it. Cloud-delivered reminders are free during early access; pricing will be introduced once the MVP proves its success.

## Features

- **Dashboard** — Monthly burn, yearly projection, trial alerts at a glance
- **Subscription Management** — Add, edit, pause, cancel subscriptions with brand icons
- **Renewal Timeline** — See what's coming up with cancel-by dates
- **Free Trial Tracking** — Never get surprised by a trial converting to paid
- **Spending Analytics** — Category breakdowns and top spenders
- **Smart Insights** — "You could save $X by consolidating Y and Z"
- **Unlimited** — Track unlimited subscriptions with every insight, free on your device
- **Optional Sync** — Email & push renewal reminders that reach you with the tab closed (free during early access)
- **Marketing Pages** — Home, About (with FAQ), Blog, Pricing, Privacy, Terms, Refunds, Cookies, Donate
- **Onboarding** — Quick 2-step wizard with profile setup
- **Auth** — Supabase-backed sign-in; dashboard routes gated by AuthGuard

## Tech Stack

| Layer | Choice |
|---|---|
| Build | Vite 6 |
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS 4 (with `@theme` design tokens) + clsx + tailwind-merge |
| State | Zustand 5 + persist (localStorage) |
| Sync | @supabase/supabase-js (frontend + backend) |
| Animation | Framer Motion 12 |
| Scroll | Lenis |
| Routing | React Router 7 |
| Dates | date-fns 4 |
| Icons | Lucide (npm) + Simple Icons (CDN) |
| Charts | Hand-rolled SVG (DonutChart, SegmentRing, no chart library) |
| Backend | Express 5 + lowdb + helmet + cors + express-rate-limit |
| E2E | Playwright |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:21120](http://localhost:21120).

## Monorepo Structure

```
recall-app/
├── frontend/                 # React SPA (Vite)
│   ├── public/               # favicon, icons, manifest.json, robots.txt
│   ├── src/
│   │   ├── assets/           # Icons, illustrations (SVG)
│   │   ├── components/
│   │   │   ├── analytics/    # (placeholder)
│   │   │   ├── auth/         # AuthGuard
│   │   │   ├── charts/       # ChartFrame, ChartEmptyState, ChartErrorBoundary,
│   │   │   │                 #   chartTheme, SegmentRing
│   │   │   ├── dashboard/    # ActivityManager, AlertBanner, CardActivationModal,
│   │   │   │                 #   CategoryRingsCard, DashboardScheduler, DonutChart,
│   │   │   │                 #   FlowTiles, KpiTile, PaymentMethodCard, PlanUsageCard,
│   │   │   │                 #   ProviderStack, RenewalTimeline, SavingsGauge,
│   │   │   │                 #   SpendHealthCard, SpendTrendCard, StatusLockCard,
│   │   │   │                 #   SubscriptionCard, TrialCard, TrialCountdownCard
│   │   │   ├── layout/       # AccountNav, FloatingNav, Footer, GithubStars,
│   │   │   │                 #   Header, MarketingFooter, MaskDivider, NavMenu,
│   │   │   │                 #   ScrollToTop, UserMenu
│   │   │   ├── marketing/    # BrandMarquee, Decor, DonateWidget, HeroCarousel,
│   │   │   │                 #   HeroPreview, IntegrationsMarquee, OrganicGrowthHero,
│   │   │   │                 #   ProjectionPreview, ReminderPreview, StatBand,
│   │   │   │                 #   StepThread, Testimonials
│   │   │   ├── subscriptions/# SubscriptionFormModal
│   │   │   └── ui/           # AnimatedCalendarDropdown, AnimatedCounter, Avatar,
│   │   │                     #   Badge, Button, Card, CircularTestimonials,
│   │   │                     #   ConfirmModal, Dropdown, EmptyState, ErrorBoundary,
│   │   │                     #   FlippableSubscriptionCard, Illustration, Input, Logo,
│   │   │                     #   Modal, PaymentCardVisual, ProgressBar, ProviderIcon,
│   │   │                     #   Select, Separator, Skeleton, StatCard,
│   │   │                     #   SubscriptionCardCarousel, SyncBadge, Tabs, Tag,
│   │   │                     #   TextRotate, toast-context, Toast, Toggle, Tooltip,
│   │   │                     #   UndoToast
│   │   ├── hooks/            # useApiSync, useAuth, useFocusTrap, useLenis,
│   │   │                     #   useReducedMotion, useTheme
│   │   ├── layouts/          # DashboardLayout, MarketingLayout
│   │   ├── lib/              # api, cardTheme, credits, chartData, date,
│   │   │                     #   dashboardRoutes, environment, format, github,
│   │   │                     #   pricing, projection, providers, security,
│   │   │                     #   subscriptionValidation, supabaseClient, supabaseSync,
│   │   │                     #   telemetry, urgency, utils, visuals
│   │   ├── pages/
│   │   │   ├── Home.tsx      # Marketing hero + parallax features
│   │   │   ├── About.tsx     # Pillars + story + credits + FAQ section
│   │   │   ├── Donate.tsx    # Support page with donation link
│   │   │   ├── Blog.tsx      # Post list
│   │   │   ├── BlogPost.tsx  # Article view
│   │   │   ├── Pricing.tsx   # Plans + pricing
│   │   │   ├── Privacy.tsx   # Privacy policy
│   │   │   ├── Terms.tsx     # Terms of service
│   │   │   ├── Refunds.tsx   # Refund policy
│   │   │   ├── Cookies.tsx   # Cookie policy
│   │   │   ├── Onboarding.tsx# 2-step wizard
│   │   │   ├── Dashboard.tsx # KPIs + renewals + donut + insights
│   │   │   ├── Subscriptions.tsx # Filterable list + add/edit
│   │   │   ├── Analytics.tsx # Stats + top spenders + categories
│   │   │   ├── Profile.tsx   # Settings + support card
│   │   │   └── dashboard/    # Route view wrappers: AnalyticsView,
│   │   │                     #   DashboardView, DevStatsView, SettingsView,
│   │   │                     #   StatsView, SubscriptionsView
│   │   ├── stores/           # Zustand: account, connection, paymentMethod,
│   │   │                     #   subscription
│   │   ├── test/             # Vitest setup + tests: api, chartData, format,
│   │   │                     #   pricing, projection, subscription-store, urgency, smoke
│   │   ├── types/            # paymentMethod, plan, subscription
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles + Tailwind
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── eslint.config.js
├── backend/                  # Express API (lowdb + Supabase auth)
│   ├── src/
│   │   ├── index.ts          # Express server (helmet, cors, rate-limit)
│   │   ├── db.ts             # lowdb database
│   │   ├── auth.ts           # Supabase auth middleware
│   │   ├── backfill.ts       # Data backfill utilities
│   │   ├── rateLimiters.ts   # Rate limit configurations
│   │   ├── supabaseClient.ts # Supabase admin client
│   │   ├── types.d.ts        # Shared type declarations
│   │   ├── validate.ts       # Input validation helpers
│   │   └── routes/           # accounts, paymentMethods, subscriptions, stats
│   ├── test/                 # Vitest: account-id, avatar, validate, validate-edge
│   ├── data/                 # lowdb JSON (gitignored)
│   ├── .env.example
│   ├── tsconfig.json
│   └── vitest.config.ts
├── cli/                      # CLI utilities (separate workspace)
│   ├── src/                  # 6 source files
│   ├── package.json
│   └── tsconfig.json
├── supabase/                 # Supabase project config + migrations
│   └── migrations/           # 4 SQL migration files
├── e2e/                      # Playwright E2E tests
│   ├── analytics.spec.ts
│   ├── blog-faq.spec.ts
│   ├── dashboard-interactions.spec.ts
│   ├── dashboard.spec.ts
│   ├── forms.spec.ts
│   ├── home.spec.ts
│   ├── marketing-pages.spec.ts
│   ├── onboarding.spec.ts
│   ├── profile-settings.spec.ts
│   ├── subscriptions.spec.ts
│   ├── tabs.spec.ts
│   ├── theme.spec.ts
│   ├── fixtures/             # copy.ts, seed.ts
│   └── helpers/              # auth.ts, onboarding.ts
├── docs/                     # Internal planning docs (gitignored)
├── .github/workflows/ci.yml # CI pipeline
├── package.json              # Workspace root (npm workspaces)
├── playwright.config.ts
├── tsconfig.json             # Root config for playwright.config.ts
├── vercel.json               # Vercel deployment config
├── LICENSE                   # MIT
└── .gitignore
```

## Routes

| Path | Layout | Page / Behavior |
|---|---|---|
| `/` | MarketingLayout | Home |
| `/about` | MarketingLayout | About (includes FAQ section) |
| `/pricing` | MarketingLayout | Plans + pricing |
| `/donate` | MarketingLayout | Donate page |
| `/blog` | MarketingLayout | Blog list |
| `/blog/:slug` | MarketingLayout | Blog post |
| `/privacy` | MarketingLayout | Privacy policy |
| `/terms` | MarketingLayout | Terms of service |
| `/refunds` | MarketingLayout | Refund policy |
| `/cookies` | MarketingLayout | Cookie policy |
| `/faq` | — | Redirects to `/about#faq` |
| `/signin` | (standalone) | OnboardingPage (alias) |
| `/onboarding` | (standalone) | 2-step wizard |
| `/dashboard` | DashboardLayout + AuthGuard | Dashboard (KPIs, charts) |
| `/dashboard/subscriptions` | DashboardLayout + AuthGuard | Subscription list |
| `/dashboard/analytics` | DashboardLayout + AuthGuard | Spending analytics |
| `/dashboard/stats` | DashboardLayout + AuthGuard | Dev stats |
| `/dashboard/settings` | DashboardLayout + AuthGuard | Profile settings |
| `/dashboard/upgrade` | — | Redirects to `/pricing` |

Legacy redirects for convenience: `/subscriptions` → `/dashboard/subscriptions`, `/analytics` → `/dashboard/analytics`, `/profile` → `/dashboard/settings`.

## Design System

- **Canvas:** `#f5f0eb` (warm off-white)
- **Surface:** `#fffdf9` (card background)
- **Accent:** `#d4443a` (Rausch — all CTAs)
- **Radius tokens:** `sm` 8px, `md` 14px, `lg` 16px, `xl` 20px, `pill` 9999px
- **Typography:** Inter (sans), Fraunces (display)
- **Sidebar:** 260px expanded / 72px collapsed, with responsive hamburger < 744px

## License

MIT