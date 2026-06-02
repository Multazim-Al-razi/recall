# Recall Backend

> The Express + lowdb service for optional cloud sync. **Status: dev-only.**
>
> The cloud backend is migrating to **Supabase** (hosted Postgres, Auth, RLS,
> Realtime, Edge Functions). See [../docs/BACKEND_ROADMAP.md](../docs/BACKEND_ROADMAP.md)
> for the full migration plan. The Express server will remain as a thin proxy /
> validation layer, but the data store will switch from lowdb to Supabase Postgres.

The backend is intentionally small. Recall is a local-first SPA; the backend
exists so the upcoming Sync plan ($1.99/mo) has a server to live on, and so
the frontend can mirror subscriptions across devices when the user opts in.
Until then, the entire app works with the backend turned off.

## What's implemented

| Endpoint | Method | Notes |
|---|---|---|
| `/api/health` | GET | Liveness probe. |
| `/api/subscriptions` | GET, POST | List (filterable by `accountId`, `status`) / create. |
| `/api/subscriptions/:id` | GET, PATCH, DELETE | Per-subscription CRUD. |
| `/api/account` | GET, PATCH | Read / update the single default account. |
| `/api/account/complete-onboarding` | POST | Mark the account onboarded. |
| `/api/account/reset` | POST | Wipe the account in place. |
| `/api/account/upgrade` | POST | **Stub.** Returns `501` until billing ships. |

Cross-cutting concerns that **are** implemented:

- CORS allowlist from `CORS_ORIGINS` (wildcard in dev).
- Rate limit: 100 requests / 15 min via `express-rate-limit` on `/api`.
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-DNS-Prefetch-Control`.
- JSON body limit: 100 KB.
- Input validation + sanitization for every write endpoint ([src/validate.ts](src/validate.ts)).
- Graceful `SIGINT` / `SIGTERM` shutdown that flushes lowdb.
- Production kill switch: refuses to boot with `NODE_ENV=production` unless `ALLOW_DEV_BACKEND=1` is set.

## What's NOT implemented (the production gap)

These are tracked in [../docs/BACKEND_ROADMAP.md](../docs/BACKEND_ROADMAP.md).
The plan has pivoted to **Supabase** for the cloud layer. Do not point this
service at public traffic until the migration workstreams are closed.

- **Authentication.** Every route is world-readable and world-writable. The
  `accountId` is taken from the query string or a request body field with no
  signature check. Supabase Auth (magic link + JWT) will replace this —
  see roadmap §2.
- **Multi-tenant isolation.** Even after auth ships, the data model currently
  relies on a single `default` account id. Supabase Row Level Security (RLS)
  will enforce tenant isolation at the database level — see roadmap §2.
- **Production database.** lowdb writes to a single JSON file with no
  locking. Concurrent writes can clobber. Supabase's hosted Postgres replaces
  this — see roadmap §1.
- **Realtime sync.** No multi-device sync mechanism today. Supabase Realtime
  provides `postgres_changes` subscriptions for instant cross-device sync —
  see roadmap §3.
- **Email / push reminder delivery.** The Sync plan is a UI promise; nothing
  on the server side wakes up to send a reminder. Supabase Edge Functions
  with pg_cron will handle this — see roadmap §3.
- **Stripe / billing integration.** `POST /api/account/upgrade` validates the
  payload shape and returns 501; the Stripe webhook is not wired. Supabase
  Auth handles identity; Stripe integration remains a future workstream.

## Running locally

```bash
cp .env.example .env       # set PORT and CORS_ORIGINS if you need to
npm install
npm run dev                # tsx watch on :3001
```

The frontend (`npm run dev` in `../frontend`) proxies `/api/*` to
`http://localhost:3001` automatically — see [../frontend/vite.config.ts](../frontend/vite.config.ts).

## Running with Supabase (future)

Once the Supabase migration lands, you can run the backend with the Supabase
adapter:

```bash
# Set these in .env or environment
DB_BACKEND=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

npm run dev
```

The `LowDbAdapter` remains available via `DB_BACKEND=lowdb` for local-only
testing without Supabase.

## Tests

```bash
npm test
```

Vitest covers the validation layer end-to-end ([test/validate.test.ts](test/validate.test.ts),
[test/validate-edge.test.ts](test/validate-edge.test.ts)). Endpoint tests will
be added alongside the auth workstream in the roadmap.

## Deployment

Today: **don't**. The production kill switch will refuse to boot. When the
Supabase migration roadmap items are closed, the operational story is:

1. Provision a Supabase project (Postgres + Auth + Realtime + Edge Functions).
2. Set `DB_BACKEND=supabase` and Supabase env vars.
3. Set `NODE_ENV=production`, `CORS_ORIGINS=https://your-frontend.example`.
4. Put a reverse proxy (nginx, Caddy, Fly) in front for TLS termination.
5. Wire a log drain — switch from `console.*` to `pino` (roadmap §4).
6. Remove the `ALLOW_DEV_BACKEND` kill switch once all checklist items pass.