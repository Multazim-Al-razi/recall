import { Router, type Request, type Response } from "express";
import { getDb, createDefaultAccount } from "../db.js";
import { validateAccountPatch, sanitizeString, sanitizeEmail } from "../validate.js";
import { writeLimiter } from "../rateLimiters.js";
import type { AuthedUser } from "../auth.js";

const router = Router();

function getAccountId(req: Request): string {
  const user = req.user as AuthedUser | undefined;
  return user?.id ?? "default";
}

/** Get or create an account for the requesting user. */
async function ensureAccount(accountId: string) {
  const db = await getDb();
  let account = db.data.accounts.find((a) => a.id === accountId);
  if (!account) {
    account = createDefaultAccount(accountId);
    db.data.accounts.push(account);
    await db.write();
  }
  return { db, account };
}

/**
 * GET /api/account
 */
router.get("/", async (req: Request, res: Response) => {
  const accountId = getAccountId(req);
  const { account } = await ensureAccount(accountId);
  res.json(account);
});

/**
 * PATCH /api/account
 */
router.patch("/", writeLimiter, async (req: Request, res: Response) => {
  const accountId = getAccountId(req);
  const { db, account } = await ensureAccount(accountId);
  const patch = validateAccountPatch(req.body);
  Object.assign(account, patch);
  account.updatedAt = new Date().toISOString();
  await db.write();
  res.json(account);
});

/**
 * POST /api/account/complete-onboarding
 */
router.post("/complete-onboarding", writeLimiter, async (req: Request, res: Response) => {
  const accountId = getAccountId(req);
  const { db, account } = await ensureAccount(accountId);
  const { name, email, currency } = req.body ?? {};

  account.onboarded = true;
  if (name !== undefined) account.name = sanitizeString(name, 80);
  if (email !== undefined) account.email = sanitizeEmail(email);
  if (currency !== undefined)
    account.currency = sanitizeString(currency, 8).toUpperCase() || "USD";
  account.updatedAt = new Date().toISOString();
  await db.write();
  res.json(account);
});

/**
 * POST /api/account/reset
 */
router.post("/reset", writeLimiter, async (req: Request, res: Response) => {
  const accountId = getAccountId(req);
  const { db, account } = await ensureAccount(accountId);
  const fresh = createDefaultAccount(accountId);
  Object.assign(account, fresh, {
    createdAt: account.createdAt,
  });
  account.updatedAt = new Date().toISOString();
  await db.write();
  res.json(account);
});

export default router;
