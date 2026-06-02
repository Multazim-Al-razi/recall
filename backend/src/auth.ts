import { type Request, type Response, type NextFunction } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a short-lived Supabase client to verify a JWT. Uses the anon
 * key (not service role) so getUser() validates the token against Supabase
 * Auth — expired, malformed, or revoked tokens are rejected.
 *
 * Reads env vars lazily so the server boots fine in lowdb mode without
 * Supabase config. Returns null if env vars are missing.
 */
function verifyJwt(
  token: string,
): Promise<{ id: string; email: string } | null> {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // In lowdb mode, Supabase env vars are not required — auth is
    // effectively skipped (all requests go through with req.user undefined).
    return Promise.resolve(null);
  }

  const client: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return client.auth.getUser().then(({ data, error }) => {
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email ?? "" };
  });
}

export interface AuthedUser {
  id: string;
  email: string;
}

/**
 * Express middleware that:
 *   1. Reads `Authorization: Bearer <jwt>` from the request header.
 *   2. Verifies the JWT using `supabase.auth.getUser(token)`.
 *   3. Attaches `req.user = { id, email }` for downstream handlers.
 *   4. Rejects unauthenticated requests with 401.
 *
 * Behavior when DB_BACKEND=lowdb (no Supabase env vars):
 *   The middleware still runs but JWT verification always returns null,
 *   so requests without auth get 401. To allow unauthenticated access
 *   in lowdb mode, set ALLOW_NO_AUTH=1 — this bypasses requireAuth
 *   entirely for local development.
 *
 * Applied to every `/api/*` route other than `/api/auth/*` and `/api/health`.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // In lowdb mode, allow unauthenticated access so the local dev server
  // works exactly as before (no Supabase env vars needed).
  const DB_BACKEND = process.env.DB_BACKEND ?? "lowdb";
  if (DB_BACKEND === "lowdb" && process.env.ALLOW_NO_AUTH !== "0") {
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = header.slice(7); // strip "Bearer "
  if (!token) {
    res.status(401).json({ error: "Empty token" });
    return;
  }

  const user = await verifyJwt(token);
  if (!user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.user = user as AuthedUser;
  next();
}

/**
 * Public routes that skip auth. Matches the acceptance criteria:
 * "every /api/* route other than /api/auth/* and /api/health returns 401".
 */
export function isPublicRoute(path: string): boolean {
  return (
    path === "/health" ||
    path === "/api/health" ||
    path.startsWith("/auth/") ||
    path.startsWith("/api/auth/")
  );
}
