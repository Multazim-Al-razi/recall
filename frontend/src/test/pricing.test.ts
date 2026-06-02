import { describe, it, expect } from "vitest";
import {
  PLANS,
  COMPARISON,
  PRICING_FAQ,
  type CompareCell,
} from "@/lib/pricing";
import { FLAGS } from "@/lib/featureFlags";

describe("PLANS", () => {
  it("defines exactly the two expected plans", () => {
    expect(PLANS.map((p) => p.id)).toEqual(["free", "cloud"]);
  });

  it("does not feature any plan when the sync flag is off (the default)", () => {
    expect(FLAGS.syncPlan).toBe(false);
    const featured = PLANS.filter((p) => p.featured);
    expect(featured).toHaveLength(0);
  });

  it("prices the Cloud plan at $1.99/mo and keeps Free plan free", () => {
    const byId = Object.fromEntries(PLANS.map((p) => [p.id, p]));
    expect(byId.free.price).toBe("Free");
    expect(byId.cloud.price).toBe("$1.99");
    expect(byId.cloud.cadence).toBe("/mo");
  });

  it("gives every plan the fields the UI renders", () => {
    for (const plan of PLANS) {
      expect(plan.name).toBeTruthy();
      expect(plan.tagline).toBeTruthy();
      expect(plan.description.length).toBeGreaterThan(20);
      expect(plan.features.length).toBeGreaterThan(0);
      expect(plan.availability).toBeTruthy();
      expect(plan.cta.label).toBeTruthy();
      expect(plan.cta.to.startsWith("/")).toBe(true);
      expect(plan.icon).toBeDefined();
    }
  });

  it("only marks the featured plan with a badge", () => {
    for (const plan of PLANS) {
      if (plan.featured) expect(plan.badge).toBeTruthy();
      else expect(plan.badge).toBeUndefined();
    }
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
      expect(describesAll(row.free)).toBe(true);
      expect(describesAll(row.cloud)).toBe(true);
    }
  });

  it("reflects the core value story: Free is free, Cloud adds cloud reminders", () => {
    const priceRow = COMPARISON.find((r) => r.feature === "Price");
    expect(priceRow).toBeDefined();
    expect(priceRow!.free).toBe("Free");
    expect(priceRow!.cloud).toBe("$1.99/mo");

    const pushRow = COMPARISON.find(
      (r) => r.feature === "Email & push reminders",
    );
    expect(pushRow).toBeDefined();
    expect(pushRow!.free).toBe(false);
    expect(pushRow!.cloud).toBe(true);
  });

  it('keeps "no account" true for Free but not Cloud', () => {
    const row = COMPARISON.find((r) => r.feature === "No account / sign-up");
    expect(row).toBeDefined();
    expect(row!.free).toBe(true);
    expect(row!.cloud).toBe(false);
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

  it("addresses why Cloud costs money", () => {
    const hasWhyQuestion = PRICING_FAQ.some((item) =>
      /why.*cloud.*cost/i.test(item.q),
    );
    expect(hasWhyQuestion).toBe(true);
  });

  it("uses unique questions", () => {
    const questions = PRICING_FAQ.map((item) => item.q);
    expect(new Set(questions).size).toBe(questions.length);
  });
});
