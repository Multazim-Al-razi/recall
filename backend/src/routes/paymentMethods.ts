import { Router, type Request, type Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getAdapter, type CardBrand } from "../db.js";
import { writeLimiter } from "../rateLimiters.js";
import { sanitizeString } from "../validate.js";
import type { AuthedUser } from "../auth.js";

const router = Router();

const CARD_BRANDS: CardBrand[] = ["visa", "mastercard", "amex", "discover", "debit", "other"];
const CARD_COLORS: Record<CardBrand, string> = {
  visa: "#1A1F71",
  mastercard: "#EB001B",
  amex: "#006FCF",
  discover: "#FF6000",
  debit: "#6B7280",
  other: "#374151",
};

function getAccountId(req: Request): string {
  const user = req.user as AuthedUser | undefined;
  return user?.id ?? "default";
}

/**
 * GET /api/payment-methods
 */
router.get("/", async (req: Request, res: Response) => {
  const adapter = getAdapter();
  const accountId = getAccountId(req);
  const methods = await adapter.listPaymentMethods(accountId);
  res.json({ paymentMethods: methods });
});

/**
 * POST /api/payment-methods
 */
router.post("/", writeLimiter, async (req: Request, res: Response) => {
  const adapter = getAdapter();
  const accountId = getAccountId(req);

  const b = (req.body ?? {}) as Record<string, unknown>;
  const label = sanitizeString(b.label, 60);
  const brand = (typeof b.brand === "string" && CARD_BRANDS.includes(b.brand as CardBrand)
    ? b.brand : "other") as CardBrand;
  const last4 = sanitizeString(b.last4, 4);
  const color = sanitizeString(b.color, 30) || CARD_COLORS[brand];
  const expiryMonth = typeof b.expiryMonth === "number" && b.expiryMonth >= 1 && b.expiryMonth <= 12
    ? b.expiryMonth : undefined;
  const expiryYear = typeof b.expiryYear === "number" && b.expiryYear >= 2020 && b.expiryYear <= 2040
    ? b.expiryYear : undefined;

  if (!label) {
    res.status(400).json({ error: "label is required" });
    return;
  }
  if (!last4 || last4.length !== 4 || !/^\d{4}$/.test(last4)) {
    res.status(400).json({ error: "last4 must be exactly 4 digits" });
    return;
  }

  const now = new Date().toISOString();
  const pm = {
    id: uuidv4(),
    accountId,
    label,
    brand,
    last4,
    color,
    expiryMonth,
    expiryYear,
    createdAt: now,
    updatedAt: now,
  };

  const persisted = await adapter.createPaymentMethod(pm);
  res.status(201).json(persisted);
});

/**
 * PATCH /api/payment-methods/:id
 */
router.patch("/:id", writeLimiter, async (req: Request, res: Response) => {
  const adapter = getAdapter();
  const accountId = getAccountId(req);

  const existing = await adapter.getPaymentMethod(req.params.id, accountId);
  if (!existing) {
    res.status(404).json({ error: "Payment method not found" });
    return;
  }

  const b = (req.body ?? {}) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  if (b.label !== undefined) patch.label = sanitizeString(b.label, 60);
  if (b.brand !== undefined) patch.brand = CARD_BRANDS.includes(b.brand as CardBrand) ? b.brand : "other";
  if (b.last4 !== undefined) patch.last4 = sanitizeString(b.last4, 4);
  if (b.color !== undefined) patch.color = sanitizeString(b.color, 30);
  if (b.expiryMonth !== undefined) patch.expiryMonth = b.expiryMonth;
  if (b.expiryYear !== undefined) patch.expiryYear = b.expiryYear;

  const updated = await adapter.updatePaymentMethod(req.params.id, accountId, patch);
  res.json(updated);
});

/**
 * DELETE /api/payment-methods/:id
 */
router.delete("/:id", writeLimiter, async (req: Request, res: Response) => {
  const adapter = getAdapter();
  const accountId = getAccountId(req);

  const existing = await adapter.getPaymentMethod(req.params.id, accountId);
  if (!existing) {
    res.status(404).json({ error: "Payment method not found" });
    return;
  }

  await adapter.deletePaymentMethod(req.params.id, accountId);
  res.json({ success: true });
});

export default router;
