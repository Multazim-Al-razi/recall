import { Router, type Request, type Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  getAdapter,
  createDefaultAccount,
  type SubscriptionRecord,
} from "../db.js";
import {
  validateNewSubscription,
  validateSubscriptionPatch,
} from "../validate.js";
import { writeLimiter } from "../rateLimiters.js";
import type { AuthedUser } from "../auth.js";

const router = Router();

/** Hard cap on subscriptions per account. */
const MAX_SUBSCRIPTIONS_PER_ACCOUNT = 1000;

/**
 * Resolve the effective account ID for the current request.
 *
 * In lowdb mode the account ID is the legacy "default" string. In Supabase
 * mode it comes from the authenticated user's JWT (req.user.id). The
 * DB_BACKEND env var determines which adapter is active, so the route
 * doesn't need to know — it just resolves the ID and passes it to the
 * adapter.
 */
function getAccountId(req: Request): string {
  const user = req.user as AuthedUser | undefined;
  // If auth middleware attached a user, use their Supabase UUID.
  // Otherwise fall back to "default" for lowdb / unauthenticated dev mode.
  return user?.id ?? "default";
}

/**
 * GET /api/subscriptions
 */
router.get("/", async (req: Request, res: Response) => {
  const adapter = getAdapter();
  const accountId = getAccountId(req);
  const status = req.query.status as string | undefined;

  const subs = await adapter.listSubscriptions(accountId, status);
  res.json({ subscriptions: subs });
});

/**
 * GET /api/subscriptions/:id
 */
router.get("/:id", async (req: Request, res: Response) => {
  const adapter = getAdapter();
  const accountId = getAccountId(req);
  const id = req.params.id as string;

  const sub = await adapter.getSubscription(id, accountId);
  if (!sub) {
    res.status(404).json({ error: "Subscription not found" });
    return;
  }
  res.json(sub);
});

/**
 * POST /api/subscriptions
 */
router.post("/", writeLimiter, async (req: Request, res: Response) => {
  const adapter = getAdapter();
  const accountId = getAccountId(req);

  const { ok, errors, value } = validateNewSubscription(req.body);
  if (!ok) {
    res.status(400).json({ error: errors.join("; ") });
    return;
  }

  const currentCount = await adapter.countSubscriptions(accountId);
  if (currentCount >= MAX_SUBSCRIPTIONS_PER_ACCOUNT) {
    res.status(409).json({
      error: "Subscription limit reached",
    });
    return;
  }

  const now = new Date().toISOString();
  const sub: SubscriptionRecord = {
    id: uuidv4(),
    accountId,
    ...value,
    createdAt: now,
    updatedAt: now,
  };

  const persisted = await adapter.createSubscription(sub);
  res.status(201).json(persisted);
});

/**
 * PATCH /api/subscriptions/:id
 */
router.patch("/:id", writeLimiter, async (req: Request, res: Response) => {
  const adapter = getAdapter();
  const accountId = getAccountId(req);
  const { ok, errors, value } = validateSubscriptionPatch(req.body);
  if (!ok) {
    res.status(400).json({ error: errors.join("; ") });
    return;
  }

  const id = req.params.id as string;
  const existing = await adapter.getSubscription(id, accountId);
  if (!existing) {
    res.status(404).json({ error: "Subscription not found" });
    return;
  }

  const updated = await adapter.updateSubscription(
    id,
    accountId,
    value,
  );
  res.json(updated);
});

/**
 * DELETE /api/subscriptions/:id
 */
router.delete("/:id", writeLimiter, async (req: Request, res: Response) => {
  const adapter = getAdapter();
  const accountId = getAccountId(req);
  const id = req.params.id as string;
  const existing = await adapter.getSubscription(id, accountId);
  if (!existing) {
    res.status(404).json({ error: "Subscription not found" });
    return;
  }

  await adapter.deleteSubscription(id, accountId);
  res.json({ success: true });
});

export default router;
