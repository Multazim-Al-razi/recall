# Recall

Local-first subscription tracker — spending intelligence in your browser, data never leaves your device.

## Tech Stack

| Layer | Choice |
|---|---|
| Build | Vite 6 |
| UI | React 19 · TypeScript · Tailwind CSS 4 · Framer Motion 12 |
| State | Zustand 5 (localStorage persist) |
| Routing | React Router 7 |
| Backend | Express 5 · lowdb · Supabase auth |
| Dates | date-fns 4 |

## Quick Start

```bash
npm install && npm run dev
```

Opens at `http://localhost:21120`.

## Structure

```
frontend/   React SPA (Vite)
backend/    Express API + Supabase auth
cli/        CLI utilities
```

## License

MIT