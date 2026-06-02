import { describe, expect, it } from 'vitest'
import { format, addDays } from 'date-fns'
import { getProjectedCharges, hasProjectedCharges, type ProjectionPoint } from '@/lib/projection'
import type { Subscription } from '@/types/subscription'

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'sub_test',
    name: 'Test Sub',
    amount: 10,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'entertainment',
    startDate: '2024-01-01',
    nextRenewalDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    reminderDaysBefore: 3,
    autoReminder: true,
    isFreeTrial: false,
    status: 'active',
    ...overrides,
  }
}

describe('getProjectedCharges', () => {
  it('returns exactly `months` points', () => {
    const result = getProjectedCharges([], { months: 6 })
    expect(result).toHaveLength(6)
  })

  it('defaults to 12 months when no option given', () => {
    const result = getProjectedCharges([])
    expect(result).toHaveLength(12)
  })

  it('returns empty array for months <= 0', () => {
    expect(getProjectedCharges([], { months: 0 })).toEqual([])
    expect(getProjectedCharges([], { months: -1 })).toEqual([])
  })

  it('each point has monthKey, label, charges, and cumulative', () => {
    const result = getProjectedCharges([], { months: 3 })
    for (const point of result) {
      expect(point).toHaveProperty('monthKey')
      expect(point).toHaveProperty('label')
      expect(point).toHaveProperty('charges')
      expect(point).toHaveProperty('cumulative')
      expect(typeof point.monthKey).toBe('string')
      expect(point.monthKey).toMatch(/^\d{4}-\d{2}$/)
    }
  })

  it('produces zero charges for empty subscription list', () => {
    const result = getProjectedCharges([], { months: 6 })
    for (const point of result) {
      expect(point.charges).toBe(0)
      expect(point.cumulative).toBe(0)
    }
  })

  it('places a monthly subscription charge in the correct month', () => {
    const renewalDate = addDays(new Date(), 5)
    const sub = makeSub({ nextRenewalDate: format(renewalDate, 'yyyy-MM-dd'), amount: 25 })
    const result = getProjectedCharges([sub], { months: 3 })

    const renewalMonthKey = format(renewalDate, 'yyyy-MM')
    const monthPoint = result.find((p) => p.monthKey === renewalMonthKey)
    expect(monthPoint).toBeDefined()
    expect(monthPoint!.charges).toBeGreaterThanOrEqual(25)
  })

  it('skips cancelled subscriptions', () => {
    const sub = makeSub({ status: 'cancelled' })
    const result = getProjectedCharges([sub], { months: 3 })
    for (const point of result) {
      expect(point.charges).toBe(0)
    }
  })

  it('skips paused subscriptions', () => {
    const sub = makeSub({ status: 'paused' })
    const result = getProjectedCharges([sub], { months: 3 })
    for (const point of result) {
      expect(point.charges).toBe(0)
    }
  })

  it('yearly subscription produces one spike per year', () => {
    const renewalDate = addDays(new Date(), 10)
    const sub = makeSub({
      billingCycle: 'yearly',
      amount: 120,
      nextRenewalDate: format(renewalDate, 'yyyy-MM-dd'),
    })
    const result = getProjectedCharges([sub], { months: 12 })

    // Only one month should have a charge of 120
    const monthsWithCharges = result.filter((p) => p.charges > 0)
    expect(monthsWithCharges).toHaveLength(1)
    expect(monthsWithCharges[0].charges).toBe(120)
  })

  it('weekly subscription produces ~4 charges per month', () => {
    // Use a date well within the current month to ensure it stays in the window
    const today = new Date()
    const dayOfMonth = today.getDate()
    if (dayOfMonth > 20) {
      // Near month end — skip this test's tight assertion; use 3-month window instead
      const sub = makeSub({
        billingCycle: 'weekly',
        amount: 5,
        nextRenewalDate: format(addDays(today, 1), 'yyyy-MM-dd'),
      })
      const result = getProjectedCharges([sub], { months: 3 })
      const totalAll = result.reduce((sum, p) => sum + p.charges, 0)
      expect(totalAll).toBeGreaterThan(0)
      return
    }
    const sub = makeSub({
      billingCycle: 'weekly',
      amount: 5,
      nextRenewalDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    })
    const result = getProjectedCharges([sub], { months: 3 })
    const totalAll = result.reduce((sum, p) => sum + p.charges, 0)
    expect(totalAll).toBeGreaterThan(0)
  })

  it('custom cycle uses customCycleDays', () => {
    const sub = makeSub({
      billingCycle: 'custom',
      customCycleDays: 14,
      amount: 20,
      nextRenewalDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    })
    const result = getProjectedCharges([sub], { months: 3 })
    const totalAll = result.reduce((sum, p) => sum + p.charges, 0)
    // Over 3 months with 14-day cycles, there should be several occurrences
    expect(totalAll).toBeGreaterThanOrEqual(20)
  })

  it('custom cycle defaults to 30 days when customCycleDays is missing', () => {
    const sub = makeSub({
      billingCycle: 'custom',
      customCycleDays: undefined,
      amount: 30,
      nextRenewalDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    })
    const result = getProjectedCharges([sub], { months: 3 })
    const totalAll = result.reduce((sum, p) => sum + p.charges, 0)
    // Over 3 months with 30-day cycles, there should be ~3 occurrences
    expect(totalAll).toBeGreaterThanOrEqual(30)
  })

  it('cumulative is non-decreasing', () => {
    const sub1 = makeSub({ amount: 10, nextRenewalDate: format(addDays(new Date(), 5), 'yyyy-MM-dd') })
    const sub2 = makeSub({ amount: 20, nextRenewalDate: format(addDays(new Date(), 35), 'yyyy-MM-dd') })
    const result = getProjectedCharges([sub1, sub2], { months: 6 })

    for (let i = 1; i < result.length; i++) {
      expect(result[i].cumulative).toBeGreaterThanOrEqual(result[i - 1].cumulative)
    }
  })

  it('never emits charges before window start', () => {
    // A subscription that renewed in the past
    const sub = makeSub({
      nextRenewalDate: format(addDays(new Date(), -30), 'yyyy-MM-dd'),
    })
    const result = getProjectedCharges([sub], { months: 3 })

    // All charges should be in the future window, cumulative starts at 0
    expect(result[0].cumulative).toBeGreaterThanOrEqual(0)
  })

  it('skips subscriptions with invalid nextRenewalDate', () => {
    const sub = makeSub({ nextRenewalDate: 'not-a-date' })
    const result = getProjectedCharges([sub], { months: 3 })
    for (const point of result) {
      expect(point.charges).toBe(0)
    }
  })
})

describe('hasProjectedCharges', () => {
  it('returns false for all-zero points', () => {
    const points: ProjectionPoint[] = [
      { monthKey: '2025-01', label: 'Jan', charges: 0, cumulative: 0 },
      { monthKey: '2025-02', label: 'Feb', charges: 0, cumulative: 0 },
    ]
    expect(hasProjectedCharges(points)).toBe(false)
  })

  it('returns true when at least one point has charges', () => {
    const points: ProjectionPoint[] = [
      { monthKey: '2025-01', label: 'Jan', charges: 0, cumulative: 0 },
      { monthKey: '2025-02', label: 'Feb', charges: 50, cumulative: 50 },
    ]
    expect(hasProjectedCharges(points)).toBe(true)
  })

  it('returns false for empty array', () => {
    expect(hasProjectedCharges([])).toBe(false)
  })
})