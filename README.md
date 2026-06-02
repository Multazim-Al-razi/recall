# Recall

> Your subscriptions, on your device, under your control.

A local-first subscription tracker. Monitors recurring charges, warns you
before each renewal, and gives you spending intelligence — all in your
browser, with no account required. Free and open-source.

The optional cloud backend is wired through **Supabase** (Postgres, Auth,
RLS, Realtime, Edge Functions) for when multi-device sync ships. The
Express + lowdb backend in `backend/` is dev-only.

## Features

- **Dashboard** — Monthly burn, yearly projection, trial alerts at a glance
- **Subscription management** — Add, edit, pause, cancel with brand icons
- **Renewal timeline** — Cancel-by dates, free-trial expiries
- **Spending analytics** — Category breakdowns and top spenders
- **Smart insights** — Consolidation savings across overlapping categories
- **Local-first** — Your data never leaves the device unless you opt into Sync
- **Marketing pages** — Home, About, Blog, FAQ
- **Onboarding** — 2-step wizard, no password

## Tech stack

| Layer        | Choice                                                  |
| ------------ | ------------------------------------------------------- |
| Build        | Vite 6                                                  |
| Framework    | React 19 + TypeScript                                   |
| Styling      | Tailwind CSS 4 (`@theme` design tokens)                 |
| State        | Zustand + persist (localStorage)                        |
| Animation    | Framer Motion 12                                        |
| Scroll       | Lenis                                                   |
| Routing      | React Router 7                                          |
| Charts       | Hand-rolled SVG (no chart library)                      |
| Dates        | date-fns                                                |
| Icons        | Lucide + Simple Icons                                   |
| Backend      | Express 5 + lowdb *(dev-only)*, migrating to **Supabase** |
| E2E          | Playwright                                              |

## Getting started

```bash
# 1. Install (uses npm workspaces — root installs both apps)
npm install

# 2. Start the frontend (Vite dev server on http://localhost:5173)
npm run dev

# 3. (Optional) Start the dev backend on :3001
cp backend/.env.example backend/.env
npm run dev:backend
```

The frontend's Vite dev server proxies `/api/*` to `http://localhost:3001`
automatically, so the optional backend works out of the box.

### Production build

```bash
npm run build      # type-checks then builds the frontend to frontend/dist
npm run preview    # serves the production build locally
```

## Project layout

```
recall-app/
├── frontend/    # React SPA (Vite) — the product
├── backend/     # Express + lowdb dev backend (production kill switch)
├── supabase/    # Postgres migrations + RLS policies
├── e2e/         # Playwright end-to-end tests
├── vercel.json  # Vercel deployment config (frontend/dist)
└── package.json # npm workspaces root
```

## Routes

| Path                            | Layout    | Page                          |
| ------------------------------- | --------- | ----------------------------- |
| `/`                             | Marketing | Home                          |
| `/about`                        | Marketing | About + plans                 |
| `/blog`, `/blog/:slug`          | Marketing | Blog                          |
| `/onboarding`, `/signin`        | Standalone| 2-step wizard                 |
| `/dashboard`                    | Dashboard | KPIs, charts, renewals        |
| `/dashboard/subscriptions`      | Dashboard | Subscription list             |
| `/dashboard/analytics`          | Dashboard | Spending analytics            |
| `/dashboard/settings`           | Dashboard | Profile settings              |

## Deployment

The frontend deploys to **Vercel** from the monorepo root:

- `buildCommand` → `npm run build` (runs `tsc -b && vite build` in the frontend workspace)
- `outputDirectory` → `frontend/dist`
- The SPA rewrite rule in `vercel.json` sends every path to `/index.html`

The Express backend is **not deployed** — it has a production kill switch
(`backend/src/index.ts`) that refuses to boot with `NODE_ENV=production`
unless `ALLOW_DEV_BACKEND=1` is explicitly set. Use Supabase when you need
a real cloud backend.

## Contributing

Open a PR. Keep the design and architecture decisions in code, not in
scattered design docs. The only docs in this repo are this README and
`supabase/migrations/`.

## License

MIT
