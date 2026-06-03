import { describe, it, expect } from "vitest";
import {
  PLANS,
  COMPARISON,
  PRICING_FAQ,
  type CompareCell,
} from "@/lib/pricing";

describe("PLANS", () => {
  it("defines exactly the two expected plans", () => {
    expect(PLANS.map((p) => p.id)).toEqual(["local", "sync"]);
  });

  it("has exactly one featured plan (the Sync upsell)", () => {
    const featured = PLANS.filter((p) => p.featured);
    expect(featured).toHaveLength(1);
    expect(featured[0].id).toBe("sync");
  });

  it("keeps both plans free", () => {
    const byId = Object.fromEntries(PLANS.map((p) => [p.id, p]));
    expect(byId.local.price).toBe("Free");
    expect(byId.sync.price).toBe("Free");
  });

  it("gives every plan the fields the UI renders", () => {
    for (const plan of PLANS) {
      expect(plan.name).toBeTruthy();
      expect(plan.tagline).toBeTruthy();
      expect(plan.features.length).toBeGreaterThan(0);
      expect(plan.cta.label).toBeTruthy();
      expect(plan.cta.to.startsWith("/")).toBe(true);
    }
  });

  it("does not badge any plan", () => {
    for (const plan of PLANS) {
      expect(plan.badge).toBeUndefined();
    }
  });

  it("uses the expected CTAs", () => {
    const byId = Object.fromEntries(PLANS.map((p) => [p.id, p]));
    expect(byId.local.cta.label).toBe("Get started");
    expect(byId.sync.cta.label).toBe("Sign up");
  });

  it("uses unique plan ids", () => {
    const ids = PLANS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("COMPARISON", () => {
  function describesAll(value: CompareCell) {
    return typeof value === "boolean" || typeof value === "string";
  }

  it("has a cell for both plans on every row", () => {
    for (const row of COMPARISON) {
      expect(row.feature).toBeTruthy();
      expect(describesAll(row.local)).toBe(true);
      expect(describesAll(row.sync)).toBe(true);
    }
  });

  it("reflects the core value story: Local is free, Sync adds cloud reminders", () => {
    const priceRow = COMPARISON.find((r) => r.feature === "Price");
    expect(priceRow).toBeDefined();
    expect(priceRow!.local).toBe("Free");
    expect(priceRow!.sync).toBe("Free (early access)");

    const pushRow = COMPARISON.find(
      (r) => r.feature === "Email & push reminders",
    );
    expect(pushRow).toBeDefined();
    // Local cannot deliver push; Sync can.
    expect(pushRow!.local).toBe(false);
    expect(pushRow!.sync).toBe(true);
  });

  it('keeps "no account" true for Local but not Sync', () => {
    const row = COMPARISON.find((r) => r.feature === "No account / sign-up");
    expect(row).toBeDefined();
    expect(row!.local).toBe(true);
    expect(row!.sync).toBe(false);
  });

  it("uses unique feature labels", () => {
    const features = COMPARISON.map((r) => r.feature);
    expect(new Set(features).size).toBe(features.length);
  });
});

describe("PRICING_FAQ", () => {
  it("provides a non-empty question and answer for each entry", () => {
    expect(PRICING_FAQ.length).toBeGreaterThan(0);
    for (const item of PRICING_FAQ) {
      expect(item.q.trim().length).toBeGreaterThan(0);
      expect(item.a.trim().length).toBeGreaterThan(20);
    }
  });

  it("addresses why Sync costs money", () => {
    const hasWhyQuestion = PRICING_FAQ.some((item) =>
      /why.*sync.*cost/i.test(item.q),
    );
    expect(hasWhyQuestion).toBe(true);
  });

  it("uses unique questions", () => {
    const questions = PRICING_FAQ.map((item) => item.q);
    expect(new Set(questions).size).toBe(questions.length);
  });
});
