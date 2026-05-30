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

## Tech Stack

| Layer | Choice |
|---|---|
| Build | Vite 8 |
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| State | Zustand + persist (localStorage) |
| Animation | Framer Motion 12 |
| Scroll | Lenis |
| Routing | React Router 7 |
| Dates | date-fns |
| Icons | Lucide + Simple Icons |
| Charts | Hand-rolled SVG / CSS (no chart library) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
├── components/
│   ├── dashboard/      # KpiTile, SubscriptionCard, DonutChart, RenewalTimeline, etc.
│   ├── layout/         # Sidebar, Header, TabBar, Footer, FloatingNav, MaskDivider
│   ├── subscriptions/  # SubscriptionFormModal
│   └── ui/             # Avatar, Logo, Illustration
├── hooks/              # useLenis (smooth scroll), useTabs
├── layouts/            # DashboardLayout (sidebar + header + tabs shell)
├── lib/                # visuals (illustration registry), credits, format, dashboardRoutes
├── pages/              # Home, Pricing, About, Onboarding, Dashboard, Subscriptions,
│                       #   Analytics, Profile + dashboard/ route views
├── stores/             # Zustand stores: subscription, account, tabs
└── types/              # subscription, plan
```

## Docs

- [SPEC.md](docs/SPEC.md) — Product specification
- [DESIGN.md](docs/DESIGN.md) — Design system reference
- [MOODBOARD.md](docs/MOODBOARD.md) — Design inspiration scan + forward-looking direction
- [TASKS.md](docs/TASKS.md) — Implementation plan with phases

## License

MIT
