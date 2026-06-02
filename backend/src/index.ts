import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { writeLimiter } from "./rateLimiters.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import accountRoutes from "./routes/accounts.js";
import { closeDb } from "./db.js";
import { requireAuth, isPublicRoute } from "./auth.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Refuse to boot in production. The dev-only backend has no auth and writes
 * to a local JSON file; the operator must explicitly opt in with
 * ALLOW_DEV_BACKEND=1 (e.g. for a known-isolated staging environment).
 */
if (NODE_ENV === "production" && process.env.ALLOW_DEV_BACKEND !== "1") {
  console.error(
    "[recall-api] Refusing to start: the Express backend is dev-only.\n" +
      "  Set ALLOW_DEV_BACKEND=1 to start anyway (not recommended for public traffic).",
  );
  process.exit(1);
}

// Audit log: every time ALLOW_DEV_BACKEND=1 is set, surface it loudly so it
// does not silently slip into a long-lived environment. This is the only
// safe way to "opt out" of the production kill switch.
if (process.env.ALLOW_DEV_BACKEND === "1") {
  console.warn(
    "[recall-api] WARNING: ALLOW_DEV_BACKEND=1 is set. " +
      "The production kill switch is DISABLED. This is only safe in a known-isolated environment.",
  );
}

/**
 * SECURITY (B-2): The dev backend has NO authentication and accepts any
 * cross-origin write. Historically it bound to 0.0.0.0, which made it
 * reachable from any device on the LAN. We now default to 127.0.0.1 in
 * every environment so the server is only reachable from the local
 * machine. If you genuinely need LAN access (e.g. testing on a phone), set
 * HOST=0.0.0.0 explicitly — but be aware that any device on the same
 * network can read and mutate your data.
 */
const HOST = process.env.HOST ?? "127.0.0.1";
if (HOST === "0.0.0.0") {
  console.warn(
    "[recall-api] WARNING: HOST=0.0.0.0 — the dev backend (no auth) is reachable from any network interface. " +
      "Only do this on a trusted, isolated network.",
  );
}

// CORS — allowlist from env in production, default to the local Vite dev
// origin in dev (B-1). Setting CORS_ORIGINS to a comma-separated list always
// wins, in any environment.
const rawCorsOrigins =
  process.env.CORS_ORIGINS?.split(",")
    .map((o) => o.trim())
    .filter(Boolean) ?? [];
const DEFAULT_DEV_CORS_ORIGINS = ["http://localhost:5173"];
const corsOrigin: string[] | true =
  rawCorsOrigins.length > 0
    ? rawCorsOrigins
    : NODE_ENV === "production"
      ? true // guarded by the production kill switch above; refuse to start without CORS_ORIGINS
      : DEFAULT_DEV_CORS_ORIGINS;
if (NODE_ENV === "production" && rawCorsOrigins.length === 0) {
  console.error(
    "[recall-api] CORS_ORIGINS is required in production. Refusing to start with a wildcard CORS policy.",
  );
  process.exit(1);
}
app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);

// Security headers via helmet (H-1 / 10.7). CSP is off because this is a
// JSON API, not a document server; HSTS, frame-options, no-sniff, etc.
// are kept on.
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

/**
 * Cache-Control: no-store on every /api/* response (H-1). The health probe
 * is exempted so monitoring tools that poll /api/health still get a
 * cacheable signal.
 */
app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/health") {
    next();
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Minimal security headers (no extra dependency) — keep these in addition
// to helmet so the intent is documented in plain code.
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  next();
});

app.use(express.json({ limit: "100kb" }));

// Rate limiting — broad default for read traffic, with a stricter limit on
// the destructive write endpoints (10.5). The narrower limiter is exported
// so the subscriptions and accounts routers can mount it.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

export { writeLimiter };

// Auth middleware — require JWT on every /api/* route except /api/auth/* and
// /api/health (Workstream 2 acceptance criteria). The middleware runs after
// rate limiting so unauthenticated requests still consume a rate-limit slot,
// which prevents brute-force token probing.
app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  if (isPublicRoute(req.path)) {
    next();
    return;
  }
  requireAuth(req, res, next);
});

// Routes
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/account", accountRoutes);

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler. In production, do not leak err.message to the
// client (10.4); log full stack server-side regardless of environment.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Recall API Error]", err);
  if (NODE_ENV === "production") {
    res.status(500).json({ error: "Internal server error" });
  } else {
    res
      .status(500)
      .json({ error: "Internal server error", detail: err.message });
  }
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`Recall API running on http://${HOST}:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down...");
  closeDb();
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  closeDb();
  server.close(() => process.exit(0));
});

export { app };
