# Recall

Local-first subscription tracker with spending intelligence. Data stays on your device by default; an optional backend provides persistence and sync.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
  - [Development](#development)
  - [Production](#production)
  - [Docker](#docker)
- [Project Structure](#project-structure)
- [Utilities and CLI](#utilities-and-cli)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Versioning](#versioning)
- [Forking and Contributing](#forking-and-contributing)
- [License](#license)

---

## Features

- Track recurring subscriptions with billing cycle, amount, and currency
- Cancellation reminders with difficulty ratings (easy / medium / hard)
- Spending analytics dashboard with projections and trend charts
- Payment method management with card brand tracking
- Local-first design: works fully offline without a backend
- Optional Express + lowdb backend for persistent JSON storage
- Optional Supabase integration for authentication
- Companion CLI for native OS notifications and system tray

---

## Architecture

| Layer          | Technology                                                      |
| -------------- | --------------------------------------------------------------- |
| Build          | Vite 6                                                          |
| UI             | React 19, TypeScript (strict), Tailwind CSS 4, Framer Motion 12 |
| State          | Zustand 5 with localStorage persist middleware                  |
| Routing        | React Router 7                                                  |
| Dates          | date-fns 4                                                      |
| Backend        | Express 5, lowdb, Supabase auth (optional)                     |
| CLI            | Commander, node-notifier, node-schedule, systray2              |
| Testing        | Vitest (unit), Playwright (e2e)                                 |

Recall uses npm workspaces in a monorepo layout. The frontend is the primary application and works standalone; the backend and CLI are optional companions.

---

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later (included with Node 18+)
- **Docker** and **Docker Compose** (only required for containerized setup)

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/multazim/recall-app.git
cd recall-app
npm install
```

This installs all workspace packages (frontend, backend, and CLI) via npm workspaces.

---

## Running the Application

### Development

Start the frontend dev server with hot module replacement:

```bash
npm run dev
```

The application opens at `http://localhost:21120`.

To run the backend alongside the frontend:

```bash
npm run dev:backend
```

The backend API starts at `http://localhost:21121`. The frontend dev server automatically proxies `/api` requests to the backend.

### Production

Build all workspaces and start the production servers:

```bash
npm start
```

This runs the full build pipeline and then serves the frontend via Vite preview on port 21120 and the backend on port 21121.

Individual production commands:

| Command                  | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `npm start:frontend`     | Build and serve frontend only (port 21120)        |
| `npm start:backend`      | Build and start backend only (port 21121)         |
| `npm run build`          | Build all workspaces without starting servers      |
| `npm run build:frontend` | Build frontend only                               |
| `npm run build:backend`  | Build backend only                                |
| `npm run build:cli`      | Build CLI only                                    |

### Docker

Run the full stack with Docker Compose:

```bash
docker compose up --build
```

Frontend: `http://localhost:21120`
Backend API: `http://localhost:21121`

Data persistence is handled via a Docker volume (`recall-data`) mounted at `/app/backend/data`.

To stop:

```bash
docker compose down
```

To stop and remove persisted data:

```bash
docker compose down -v
```

Build individual images:

```bash
# Backend only
docker build -t recall-backend .

# Frontend only
docker build -t recall-frontend -f Dockerfile.frontend .
```

---

## Project Structure

```
recall-app/
  frontend/          React SPA (Vite) — primary application
    src/
      components/    UI components (charts, dashboard, layout, marketing, subscriptions, primitives)
      hooks/         Custom React hooks
      layouts/       DashboardLayout, MarketingLayout
      lib/           Utilities, providers, API client, visual registry
      pages/         Route-level page components
      stores/        Zustand stores (subscription, account, tabs)
      types/         TypeScript type definitions
      index.css      Tailwind config and design tokens
  backend/           Express API with lowdb persistence — optional
    src/
      index.ts       Server entry point, middleware, routes
      db.ts          lowdb adapter (JSON file storage)
      auth.ts        Supabase JWT validation
      routes/        API route handlers
  cli/               Companion CLI — optional
    src/             Daemon, notifications, system tray
  e2e/               Playwright end-to-end specs
  docs/              Specification and design documents
```

---

## Utilities and CLI

The Recall CLI provides a local companion for the webapp:

- Background daemon that checks for upcoming renewals
- Native OS notifications for cancellation reminders
- System tray icon for quick access
- Webapp launcher integration

Build and run the CLI:

```bash
npm run build:cli
npm run start -w cli
```

Or use directly after global install:

```bash
npm link -w cli
recall start
```

---

## Testing

### Unit Tests

Run all unit tests:

```bash
npm test
```

Run for a specific workspace:

```bash
npm run test:frontend
npm run test:backend
```

### End-to-End Tests

```bash
npm run e2e              # headless
npm run e2e:headed       # with browser UI
npm run e2e:ui           # Playwright interactive UI
```

### Linting

```bash
npm run lint
```

---

## Environment Variables

### Backend

| Variable        | Required | Description                                                         |
| --------------- | -------- | ------------------------------------------------------------------- |
| `PORT`          | No       | Backend server port (default: `21121`)                              |
| `CORS_ORIGINS`  | Yes\*    | Comma-separated allowed origins (required in production)           |
| `NODE_ENV`      | No       | `development` or `production` (default: `development`)             |
| `SUPABASE_URL`  | No       | Supabase project URL (required only when using Supabase auth)       |
| `SUPABASE_KEY`  | No       | Supabase anon key (required only when using Supabase auth)          |

\* `CORS_ORIGINS` is required when `NODE_ENV=production`. The server refuses to start with open CORS in production.

### Frontend

| Variable                | Required | Description                                              |
| ----------------------- | -------- | -------------------------------------------------------- |
| `VITE_SUPABASE_URL`     | No       | Supabase project URL (required only when using auth)     |
| `VITE_SUPABASE_ANON_KEY` | No     | Supabase anon key (required only when using auth)        |

### Docker

Set environment variables in `docker-compose.yml` under the `environment` key for each service.

---

## Deployment

### Vercel (Frontend)

The repository includes a `vercel.json` configuration. The frontend deploys directly to Vercel:

1. Connect the repository to a Vercel project.
2. Set the root directory to `frontend`.
3. Configure the build command as `npm run build` and the output directory as `dist`.
4. Add any required environment variables in the Vercel dashboard.

### Self-Hosted (Full Stack)

For self-hosted deployment, use the Docker setup described above or run the production commands directly on a server:

```bash
npm install --omit=dev
npm run build
npm run start -w backend   # port 21121
npm run preview -w frontend # port 21120
```

Ensure `CORS_ORIGINS` is set to the public URL of the frontend.

---

## Configuration

### Design Tokens

Layout and color tokens are defined in `frontend/src/index.css` under `@theme`. Key tokens:

- `--sidebar-width` / `--sidebar-collapsed-width`
- `--header-height` / `--tabbar-height`
- `--color-sidebar-*`, `--color-header-bg`, `--color-tab-*`

### Path Aliases

`@/` maps to `src/` in both `vite.config.ts` and `tsconfig.app.json`. All imports use `@/` paths, not relative `../` chains.

### Theme

The application supports light and dark themes. Dark mode overrides are defined in `src/index.css` under `.dark`.

---

## Versioning

The current version is **1.0.1** (frontend and root package). The backend is at **0.1.0** and the CLI at **1.1.0**.

Version numbers are maintained independently per workspace package. When releasing, update the `version` field in the relevant `package.json`:

```bash
# Example: bump frontend to 1.1.0
cd frontend
npm version 1.1.0
```

### Release Checklist

1. Update version in the relevant `package.json` files.
2. Run the full test suite: `npm test && npm run e2e`.
3. Run the build: `npm run build`.
4. Commit the version change with a tag: `git tag v1.x.x`.
5. Push the tag: `git push origin v1.x.x`.

---

## Forking and Contributing

### Forking

1. Fork the repository on GitHub.
2. Clone your fork: `git clone https://github.com/<your-username>/recall-app.git`.
3. Create a feature branch: `git checkout -b feature/<name>`.
4. Make your changes and commit with clear, descriptive messages.
5. Push to your fork: `git push origin feature/<name>`.
6. Open a pull request against the `main` branch of the original repository.

### Contribution Guidelines

- Follow existing code style and conventions (Tailwind in JSX, `@/` imports, Zustand selectors, strict TypeScript).
- Add tests for new functionality.
- Keep pull requests focused on a single change.
- Ensure `npm run lint` and `npm test` pass before submitting.

### Reporting Issues

Open an issue on GitHub with:

- A clear title and description of the problem.
- Steps to reproduce.
- Expected vs. actual behavior.
- Relevant environment details (Node version, OS, browser).

---

## License

This project is licensed under the **MIT License**.

```
Copyright (c) 2026 Multazim Al-razi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

**Recall** is free software, donation-supported. There are no plan tiers or paid features.