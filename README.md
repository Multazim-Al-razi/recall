# Recall

> Track every subscription. Never forget to cancel.

A local-first subscription tracking webapp that monitors recurring charges, sends cancellation reminders, and provides spending intelligence.

## Features

- **Dashboard** — Monthly burn, yearly projection, trial alerts at a glance
- **Subscription Management** — Add, edit, pause, cancel subscriptions with brand icons
- **Renewal Timeline** — See what's coming up with cancel-by dates
- **Free Trial Tracking** — Never get surprised by a trial converting to paid
- **Spending Analytics** — Category breakdowns and top spenders
- **Smart Insights** — "You could save $X by consolidating Y and Z"
- **Marketing Pages** — Home, Pricing, About, Blog, FAQ
- **Dashboard** — Sidebar-driven layout with tabs, KPIs, charts, and forms
- **Onboarding** — Multi-step wizard with profile setup and plan selection

## Tech Stack

| Layer | Choice |
|---|---|
| Build | Vite 6 |
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS 4 (with `@theme` design tokens) |
| State | Zustand + persist (localStorage) |
| Animation | Framer Motion 12 |
| Scroll | Lenis |
| Routing | React Router 7 |
| Dates | date-fns |
| Icons | Lucide + Simple Icons |
| Charts | Hand-rolled SVG (DonutChart, no chart library) |
| E2E | Playwright |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Monorepo Structure

```
recall-app/
├── frontend/                 # React SPA (Vite)
│   ├── src/
│   │   ├── assets/           # Icons, illustrations (SVG)
│   │   ├── components/
│   │   │   ├── analytics/    # (placeholder)
│   │   │   ├── charts/       # ChartFrame, ChartEmptyState, chartTheme
│   │   │   ├── dashboard/    # KpiTile, SubscriptionCard, DonutChart,
│   │   │   │                 #   RenewalTimeline, AlertBanner, TrialCard, PlanUsageCard
│   │   │   ├── layout/       # Sidebar, Header, TabBar, Footer, FloatingNav,
│   │   │   │                 #   MarketingFooter, MaskDivider
│   │   │   ├── marketing/    # SpendRing
│   │   │   ├── subscriptions/# SubscriptionFormModal
│   │   │   └── ui/           # Avatar, Logo, Illustration, Card, Button, Modal,
│   │   │                     #   Input, Select, Tabs, Toast, etc. (23 components)
│   │   ├── hooks/            # useLenis (smooth scroll), useReducedMotion, useTabs
│   │   ├── layouts/          # DashboardLayout, MarketingLayout
│   │   ├── lib/              # visuals, credits, format, dashboardRoutes,
│   │   │                     #   blog, chartData, projection
│   │   ├── pages/
│   │   │   ├── Home.tsx      # Marketing hero + parallax features
│   │   │   ├── Pricing.tsx   # Plan cards + comparison matrix
│   │   │   ├── About.tsx     # Pillars + story + credits
│   │   │   ├── Blog.tsx      # Post list
│   │   │   ├── BlogPost.tsx  # Article view
│   │   │   ├── Faq.tsx       # Accordion FAQ
│   │   │   ├── Onboarding.tsx# 3-step wizard
│   │   │   ├── Dashboard.tsx # KPIs + renewals + donut + insights
│   │   │   ├── Subscriptions.tsx # Filterable list + add/edit
│   │   │   ├── Analytics.tsx # Stats + top spenders + categories
│   │   │   ├── Profile.tsx   # Settings + plan usage
│   │   │   └── dashboard/    # Route view wrappers (DashboardView, etc.)
│   │   ├── stores/           # Zustand: subscription, account, tabs
│   │   ├── test/             # Vitest setup + smoke test
│   │   └── types/            # subscription, plan
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json         # References app + node configs
│   ├── tsconfig.app.json     # Frontend source config
│   ├── tsconfig.node.json    # Vite config
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── eslint.config.js
├── backend/                  # Placeholder for future API services
│   └── README.md
├── e2e/                      # Playwright E2E tests
│   ├── home.spec.ts
│   ├── onboarding.spec.ts
│   ├── dashboard.spec.ts
│   ├── subscriptions.spec.ts
│   └── marketing-pages.spec.ts
├── docs/                     # Documentation
│   ├── SPEC.md               # Product specification
│   ├── DESIGN.md             # Design system (tokens, components, layout)
│   ├── MOODBOARD.md          # Design inspiration
│   └── TASKS.md              # Implementation phases + roadmap
├── package.json              # Workspace root (npm workspaces)
├── tsconfig.json             # Root config for playwright.config.ts
├── playwright.config.ts
└── .gitignore
```

## Routes

| Path | Layout | Page |
|---|---|---|
| `/` | MarketingLayout | Home |
| `/pricing` | MarketingLayout | Pricing |
| `/about` | MarketingLayout | About |
| `/blog` | MarketingLayout | Blog list |
| `/blog/:slug` | MarketingLayout | Blog post |
| `/faq` | MarketingLayout | FAQ |
| `/onboarding` | (standalone) | 3-step wizard |
| `/dashboard` | DashboardLayout | Dashboard (KPIs, charts) |
| `/dashboard/subscriptions` | DashboardLayout | Subscription list |
| `/dashboard/analytics` | DashboardLayout | Spending analytics |
| `/dashboard/settings` | DashboardLayout | Profile settings |
| `/dashboard/upgrade` | DashboardLayout | Pricing page |

## Design System

- **Canvas:** `#f5f0eb` (warm off-white)
- **Surface:** `#fffdf9` (card background)
- **Accent:** `#d4443a` (Rausch — all CTAs)
- **Radius tokens:** `sm` 8px, `md` 14px, `lg` 16px, `xl` 20px, `pill` 9999px
- **Typography:** Inter (sans), Fraunces (display)
- **Sidebar:** 260px expanded / 72px collapsed, with responsive hamburger < 744px

## Docs

- [SPEC.md](docs/SPEC.md) — Product specification
- [DESIGN.md](docs/DESIGN.md) — Design system reference
- [MOODBOARD.md](docs/MOODBOARD.md) — Design inspiration scan + forward-looking direction
- [TASKS.md](docs/TASKS.md) — Implementation plan with phases

## License

MIT
