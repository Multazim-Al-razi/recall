import { Router, type Request, type Response } from "express";
import { getDb, createDefaultAccount } from "../db.js";
import { validateAccountPatch, sanitizeString, sanitizeEmail } from "../validate.js";
import { writeLimiter } from "../rateLimiters.js";

const router = Router();

/** Get the single default account, creating + persisting it if missing. */
async function ensureAccount() {
  const db = await getDb();
  let account = db.data.accounts.find((a) => a.id === "default");
  if (!account) {
    account = createDefaultAccount();
    db.data.accounts.push(account);
    await db.write();
  }
  return { db, account };
}

/**
 * GET /api/account
 */
router.get("/", async (_req: Request, res: Response) => {
  const { account } = await ensureAccount();
  res.json(account);
});

/**
 * PATCH /api/account
 */
router.patch("/", writeLimiter, async (req: Request, res: Response) => {
  const { db, account } = await ensureAccount();
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
  const { db, account } = await ensureAccount();
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
router.post("/reset", writeLimiter, async (_req: Request, res: Response) => {
  const { db, account } = await ensureAccount();
  const fresh = createDefaultAccount();
  Object.assign(account, fresh, {
    id: account.id,
    createdAt: account.createdAt,
  });
  account.updatedAt = new Date().toISOString();
  await db.write();
  res.json(account);
});

export default router;
