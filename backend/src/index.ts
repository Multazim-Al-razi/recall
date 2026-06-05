import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import subscriptionRoutes from "./routes/subscriptions.js";
import accountRoutes from "./routes/accounts.js";
import { statsRoutes } from "./routes/stats.js";
import paymentMethodRoutes from "./routes/paymentMethods.js";
import { requireAuth } from "./auth.js";
import { closeDb } from "./db.js";

const app = express();
const PORT = parseInt(process.env.PORT || "21121", 10);

// CORS — strict allowlist from env in production, localhost in dev.
const corsOrigins = process.env.CORS_ORIGINS?.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === "production" && (!corsOrigins || corsOrigins.length === 0)) {
  console.error("[Recall] CORS_ORIGINS must be set in production. Refusing to start with open CORS.");
  process.exit(1);
}

const allowedOrigins = corsOrigins && corsOrigins.length > 0
  ? corsOrigins
  : ["http://localhost:21120", "http://localhost:21121"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: false,
  }),
);

// Security headers via helmet (replaces manual headers below)
app.use(helmet());

app.use(express.json({ limit: "100kb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

// Auth middleware — applies to all /api/* routes except health.
// In lowdb mode, requireAuth passes requests through without auth.
// In Supabase mode, it validates the JWT and attaches req.user.
app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/health") return next();
  requireAuth(req, res, next);
});

// Routes
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Recall API Error]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Recall API running on http://localhost:${PORT}`);
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
