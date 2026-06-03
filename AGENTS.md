# Recall — Subscription Tracker

## Project Overview
A local-first subscription tracking webapp built with Vite + React + TypeScript. Tracks recurring charges, sends in-app cancellation reminders, and provides spending analytics. Free during early access, donation-supported — Local is free forever, Cloud Sync is free during early access until the MVP proves its success. An optional Express + lowdb backend persists data when running; the frontend works fully offline (local-first) when it is not.

## Tech Stack
- **Build:** Vite 6
- **Framework:** React 19 + TypeScript (strict mode)
- **Styling:** Tailwind CSS 4 with custom design tokens (light + dark themes)
- **State:** Zustand with persist middleware (localStorage)
- **Animation:** Framer Motion 12
- **Scroll:** Lenis smooth scrolling
- **Routing:** React Router 7
- **Dates:** date-fns
- **Icons:** Lucide + Simple Icons (CDN)
- **Backend (optional):** Express 5 + lowdb (JSON file persistence)
- **Testing:** Vitest (unit) + Playwright (e2e)

## Monorepo Structure
npm workspaces — `frontend/`, `backend/`, with `e2e/` and `docs/` at the root.
```
recall-app/
├── frontend/                 # React SPA (Vite) — primary app
│   └── src/
│       ├── components/
│       │   ├── charts/       # ChartFrame, ChartEmptyState, ChartErrorBoundary
│       │   ├── dashboard/    # KpiTile, SubscriptionCard, DonutChart, RenewalTimeline, etc.
│       │   ├── layout/       # NavMenu, Header, Footer, FloatingNav, MarketingFooter, MaskDivider
│       │   ├── marketing/    # SpendRing
│       │   ├── subscriptions/# SubscriptionFormModal
│       │   └── ui/           # Illustration (visual registry renderer) + ~30 primitives
│       ├── hooks/            # useLenis, useTheme, useApiSync, useReducedMotion
│       ├── layouts/          # DashboardLayout, MarketingLayout
│       ├── lib/              # visuals, credits, format, dashboardRoutes, providers,
│       │                     #   blog, chartData, projection, api (backend client)
│       ├── pages/
│       │   ├── dashboard/    # DashboardView, SubscriptionsView, AnalyticsView, SettingsView
│       │   ├── Home, Donate, About, Blog, BlogPost, Faq, Onboarding
│       │   └── Dashboard, Subscriptions, Analytics, Profile (rendered inside the views above)
│       ├── stores/           # subscription, account, connection (sync status)
│       ├── test/             # Vitest setup + unit tests
│       ├── types/            # subscription, plan
│       └── index.css         # Tailwind config + design tokens (light + .dark overrides)
├── backend/                  # Express API (lowdb) — optional
│   └── src/
│       ├── index.ts          # server: CORS, rate limit, 100kb body cap, /api/health
│       ├── db.ts             # lowdb (data/recall.json); single 'default' account, no auth
│       └── routes/           # subscriptions, accounts
├── e2e/                      # Playwright specs
└── docs/                     # SPEC, DESIGN, MOODBOARD, TASKS
```

## Dashboard Layout
The authenticated dashboard uses a fixed shell (`DashboardLayout`):
- **NavMenu** — expanding circular nav (Dashboard, Subscriptions, Analytics, Settings); replaces the previous sidebar concept.
- **Header** — centered logo + donate link + notification bell + account menu.
- **Footer** — copyright + About/Donate links + version badge + sync status.
- Marketing pages (Home, Pricing, About) keep the trimmed **FloatingNav** (Home, Pricing, About + Dashboard CTA).

## Visuals & Iconography
- All illustrations are requested by *semantic slot* through `src/lib/visuals.ts`
  and rendered via `<Illustration name="..." />` — never import SVGs directly
  in components.
- Attribution for every visual library lives in `src/lib/credits.ts` and is
  rendered on the `/about` page.
- See `.kiro/steering/visual-chief.md` for the full placement, icon, and
  licensing playbook (the "Visual Chief" role).
- Lucide icons = UI semantics; Simple Icons (CDN) = brand logos only.

## Key Commands
- `npm run dev` — Start dev server
- `npm run build` — Type-check + production build
- `npm run preview` — Preview production build

## Design System
See `docs/DESIGN.md` for the complete design system reference.

## Path Aliases
`@/` maps to `src/` — configured in both `vite.config.ts` and `tsconfig.app.json`.

## Conventions
- Use `@/` imports, never relative `../` paths
- Tailwind classes in JSX — no CSS modules or styled-components
- Zustand selectors: `useSubscriptionStore((s) => s.field)` for granular subscriptions
- Account store: `useAccountStore((s) => s.profile.currency)` for currency preference
- Framer Motion: wrap page components in `motion.div` with fade+slide transitions
- All TypeScript strict mode — no `any` types

## Design Tokens
Dashboard layout tokens live in `src/index.css` under `@theme`:
- `--header-height` — header chrome height
- `--color-header-bg` — header background color
- NavMenu uses fixed positioning with circular expanding items — no sidebar CSS tokens apply
