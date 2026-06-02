import { describe, expect, it } from 'vitest'
import { toCategoryData, toTopSpenders } from '@/lib/chartData'
import { format, addDays } from 'date-fns'
import type { Subscription } from '@/types/subscription'
import { CATEGORY_COLORS } from '@/types/subscription'

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

describe('toCategoryData', () => {
  it('returns empty array when all amounts are zero', () => {
    expect(toCategoryData({ entertainment: 0, music: 0 })).toEqual([])
  })

  it('returns empty array for empty input', () => {
    expect(toCategoryData({})).toEqual([])
  })

  it('filters out zero-amount categories', () => {
    const result = toCategoryData({ entertainment: 15, music: 0, cloud: 0 })
    expect(result).toHaveLength(1)
    expect(result[0].category).toBe('entertainment')
  })

  it('sorts by amount descending', () => {
    const result = toCategoryData({ entertainment: 10, music: 25, cloud: 15 })
    expect(result[0].category).toBe('music')
    expect(result[1].category).toBe('cloud')
    expect(result[2].category).toBe('entertainment')
  })

  it('calculates correct percentages', () => {
    const result = toCategoryData({ entertainment: 50, music: 50 })
    expect(result[0].percent).toBe(50)
    expect(result[1].percent).toBe(50)
  })

  it('includes label from CATEGORY_CONFIG', () => {
    const result = toCategoryData({ entertainment: 10 })
    expect(result[0].label).toBe('Entertainment')
  })

  it('includes color from CATEGORY_COLORS', () => {
    const result = toCategoryData({ entertainment: 10 })
    expect(result[0].color).toBe(CATEGORY_COLORS.entertainment)
  })

  it('drops unknown category keys', () => {
    const result = toCategoryData({ entertainment: 10, fakecategory: 99 })
    expect(result).toHaveLength(1)
    expect(result[0].category).toBe('entertainment')
  })

  it('breaks ties by label alphabetically', () => {
    const result = toCategoryData({ entertainment: 10, music: 10 })
    const labels = result.map((r) => r.label)
    const sorted = [...labels].sort()
    expect(labels).toEqual(sorted)
  })

  it('has collides boolean on each entry', () => {
    const result = toCategoryData({ entertainment: 10, music: 20 })
    for (const entry of result) {
      expect(typeof entry.collides).toBe('boolean')
    }
  })
})

describe('toTopSpenders', () => {
  it('returns active subscriptions sorted by monthly amount descending', () => {
    const subs = [
      makeSub({ name: 'Cheap', amount: 5, status: 'active' }),
      makeSub({ name: 'Expensive', amount: 50, status: 'active' }),
      makeSub({ name: 'Mid', amount: 20, status: 'active' }),
    ]
    const result = toTopSpenders(subs)
    expect(result[0].name).toBe('Expensive')
    expect(result[1].name).toBe('Mid')
    expect(result[2].name).toBe('Cheap')
  })

  it('excludes non-active subscriptions', () => {
    const subs = [
      makeSub({ name: 'Active', amount: 10, status: 'active' }),
      makeSub({ name: 'Cancelled', amount: 100, status: 'cancelled' }),
    ]
    const result = toTopSpenders(subs)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Active')
  })

  it('respects the limit parameter', () => {
    const subs = Array.from({ length: 15 }, (_, i) =>
      makeSub({ name: `Sub ${i}`, amount: i + 1, status: 'active' })
    )
    expect(toTopSpenders(subs, 5)).toHaveLength(5)
    expect(toTopSpenders(subs, 10)).toHaveLength(10)
  })

  it('defaults limit to 10', () => {
    const subs = Array.from({ length: 15 }, (_, i) =>
      makeSub({ name: `Sub ${i}`, amount: i + 1, status: 'active' })
    )
    expect(toTopSpenders(subs)).toHaveLength(10)
  })

  it('returns each entry with id, name, amount, category, color', () => {
    const subs = [makeSub({ name: 'Netflix', category: 'entertainment', amount: 15 })]
    const result = toTopSpenders(subs)
    expect(result[0]).toMatchObject({
      id: 'sub_test',
      name: 'Netflix',
      category: 'entertainment',
      color: CATEGORY_COLORS.entertainment,
    })
    expect(typeof result[0].amount).toBe('number')
  })

  it('excludes zero-amount subscriptions', () => {
    const subs = [makeSub({ amount: 0, status: 'active' })]
    expect(toTopSpenders(subs)).toHaveLength(0)
  })

  it('breaks ties by name alphabetically (case-insensitive)', () => {
    const subs = [
      makeSub({ name: 'Zebra', amount: 10, status: 'active' }),
      makeSub({ name: 'alpha', amount: 10, status: 'active' }),
    ]
    const result = toTopSpenders(subs)
    expect(result[0].name).toBe('alpha')
    expect(result[1].name).toBe('Zebra')
  })
})