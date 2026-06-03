import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import subscriptionRoutes from "./routes/subscriptions.js";
import accountRoutes from "./routes/accounts.js";
import statsRoutes from "./routes/stats.js";
import { closeDb } from "./db.js";

const app = express();
const PORT = parseInt(process.env.PORT || "21121", 10);

// CORS — allowlist from env in production, permissive in dev.
// Set CORS_ORIGINS to a comma-separated list of allowed origins when deploying.
const corsOrigins = process.env.CORS_ORIGINS?.split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);

// Minimal security headers (no extra dependency).
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  next();
});

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

// Routes
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/stats", statsRoutes);

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
