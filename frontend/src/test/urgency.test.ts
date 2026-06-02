import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  daysUntil,
  urgencyForDays,
  urgencyForSubscription,
  renewalLabel,
  URGENCY_THRESHOLDS,
  URGENCY_STYLES,
} from "@/lib/urgency";
import type { Subscription } from "@/types/subscription";

/** Fixed "now" at UTC midnight so date-only math is exact regardless of TZ. */
const NOW = new Date("2026-05-31T00:00:00.000Z");

/**
 * Build a `yyyy-MM-dd` string `daysFromNow` days from NOW using UTC arithmetic.
 * Date-only strings parse as UTC midnight, matching NOW, so `daysUntil` returns
 * an exact integer with no half-day truncation across timezones.
 */
function iso(daysFromNow: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "sub_test",
    name: "Test Sub",
    amount: 10,
    currency: "USD",
    billingCycle: "monthly",
    category: "entertainment",
    startDate: "2024-01-01",
    nextRenewalDate: iso(10),
    reminderDaysBefore: 3,
    autoReminder: true,
    isFreeTrial: false,
    status: "active",
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("daysUntil", () => {
  it("returns 0 for today", () => {
    expect(daysUntil(iso(0))).toBe(0);
  });

  it("returns a positive count for future dates", () => {
    expect(daysUntil(iso(5))).toBe(5);
    expect(daysUntil(iso(30))).toBe(30);
  });

  it("returns a negative count for past dates", () => {
    expect(daysUntil(iso(-3))).toBe(-3);
  });
});

describe("urgencyForDays", () => {
  it('classifies <= 2 days as "now"', () => {
    expect(urgencyForDays(0)).toBe("now");
    expect(urgencyForDays(2)).toBe("now");
    expect(urgencyForDays(-5)).toBe("now");
  });

  it('classifies 3-7 days as "soon"', () => {
    expect(urgencyForDays(3)).toBe("soon");
    expect(urgencyForDays(7)).toBe("soon");
  });

  it('classifies > 7 days as "ok"', () => {
    expect(urgencyForDays(8)).toBe("ok");
    expect(urgencyForDays(365)).toBe("ok");
  });

  it("respects the exported thresholds at their boundaries", () => {
    expect(urgencyForDays(URGENCY_THRESHOLDS.now)).toBe("now");
    expect(urgencyForDays(URGENCY_THRESHOLDS.now + 1)).toBe("soon");
    expect(urgencyForDays(URGENCY_THRESHOLDS.soon)).toBe("soon");
    expect(urgencyForDays(URGENCY_THRESHOLDS.soon + 1)).toBe("ok");
  });
});

describe("urgencyForSubscription", () => {
  it("uses nextRenewalDate for non-trial subscriptions", () => {
    expect(
      urgencyForSubscription(
        makeSub({ isFreeTrial: false, nextRenewalDate: iso(1) }),
      ),
    ).toBe("now");
    expect(
      urgencyForSubscription(
        makeSub({ isFreeTrial: false, nextRenewalDate: iso(5) }),
      ),
    ).toBe("soon");
    expect(
      urgencyForSubscription(
        makeSub({ isFreeTrial: false, nextRenewalDate: iso(20) }),
      ),
    ).toBe("ok");
  });

  it("uses trialEndDate for free trials when present", () => {
    const sub = makeSub({
      isFreeTrial: true,
      trialEndDate: iso(1),
      nextRenewalDate: iso(60),
    });
    expect(urgencyForSubscription(sub)).toBe("now");
  });

  it("falls back to nextRenewalDate for a trial without trialEndDate", () => {
    const sub = makeSub({
      isFreeTrial: true,
      trialEndDate: undefined,
      nextRenewalDate: iso(4),
    });
    expect(urgencyForSubscription(sub)).toBe("soon");
  });
});

describe("renewalLabel", () => {
  it("labels past dates as overdue", () => {
    expect(renewalLabel(iso(-1))).toBe("overdue");
  });

  it("labels today, tomorrow, and near-future days", () => {
    expect(renewalLabel(iso(0))).toBe("today");
    expect(renewalLabel(iso(1))).toBe("tomorrow");
    expect(renewalLabel(iso(5))).toBe("in 5 days");
    expect(renewalLabel(iso(7))).toBe("in 7 days");
  });

  it("uses a month/day label beyond 7 days", () => {
    // Beyond a week, the label switches to a localized "Mon D" form. The exact
    // day can shift by the runner's timezone, so assert the shape, not a literal.
    expect(renewalLabel(iso(20))).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});

describe("URGENCY_STYLES", () => {
  it("defines a complete style entry for every urgency band", () => {
    (["now", "soon", "ok"] as const).forEach((band) => {
      const style = URGENCY_STYLES[band];
      expect(style.color).toBeTruthy();
      expect(style.text).toBeTruthy();
      expect(style.bg).toBeTruthy();
      expect(style.dot).toBeTruthy();
      expect(style.border).toBeTruthy();
      expect(style.label).toBeTruthy();
    });
  });
});
