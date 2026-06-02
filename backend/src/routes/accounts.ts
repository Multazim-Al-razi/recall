import { Router, type Request, type Response } from "express";
import { getAdapter, createDefaultAccount } from "../db.js";
import { validateAccountPatch } from "../validate.js";
import { writeLimiter } from "../rateLimiters.js";
import type { AuthedUser } from "../auth.js";

const router = Router();

/**
 * Resolve the effective account ID for the current request.
 * In Supabase mode: the authenticated user's UUID from the JWT.
 * In lowdb mode: the legacy "default" string.
 */
function getAccountId(req: Request): string {
  const user = req.user as AuthedUser | undefined;
  return user?.id ?? "default";
}

/**
 * GET /api/account
 */
router.get("/", async (req: Request, res: Response) => {
  const adapter = getAdapter();
  const accountId = getAccountId(req);
  const account = await adapter.ensureAccount(accountId);
  res.json(account);
});

/**
 * PATCH /api/account
 */
router.patch("/", async (req: Request, res: Response) => {
  const adapter = getAdapter();
  const accountId = getAccountId(req);
  await adapter.ensureAccount(accountId);
  const patch = validateAccountPatch(req.body);
  const updated = await adapter.updateAccount(accountId, patch);
  res.json(updated);
});

/**
 * POST /api/account/complete-onboarding
 */
router.post(
  "/complete-onboarding",
  writeLimiter,
  async (req: Request, res: Response) => {
    const adapter = getAdapter();
    const accountId = getAccountId(req);
    await adapter.ensureAccount(accountId);
    const { name, email, currency } = req.body ?? {};
    const patch = validateAccountPatch({ name, email, currency });
    const updated = await adapter.updateAccount(accountId, {
      ...patch,
      onboarded: true,
    });
    res.json(updated);
  },
);

/**
 * POST /api/account/reset
 */
router.post("/reset", writeLimiter, async (req: Request, res: Response) => {
  const adapter = getAdapter();
  const accountId = getAccountId(req);
  const account = await adapter.resetAccount(accountId);
  res.json(account);
});

/**
 * POST /api/account/upgrade
 *
 * Stub for the Stripe webhook — see docs/BACKEND_ROADMAP.md.
 */
router.post("/upgrade", async (req: Request, res: Response) => {
  const requested = (req.body ?? {}).tier;
  if (requested !== "sync" && requested !== "local") {
    res.status(400).json({ error: "tier must be 'local' or 'sync'" });
    return;
  }
  res.status(501).json({
    error: "Plan upgrade not implemented yet",
    detail:
      "The Sync plan is on the way. The /api/account/upgrade endpoint is a stub — see docs/BACKEND_ROADMAP.md.",
  });
});

export default router;
