import { describe, expect, it } from 'vitest'
import { currencySymbol, formatMoney, initials } from '@/lib/format'

describe('currencySymbol', () => {
  it('returns correct symbol for known currencies', () => {
    expect(currencySymbol('USD')).toBe('$')
    expect(currencySymbol('EUR')).toBe('€')
    expect(currencySymbol('GBP')).toBe('£')
    expect(currencySymbol('INR')).toBe('₹')
    expect(currencySymbol('JPY')).toBe('¥')
    expect(currencySymbol('CAD')).toBe('C$')
    expect(currencySymbol('AUD')).toBe('A$')
  })

  it('returns the raw code for unknown currencies', () => {
    expect(currencySymbol('BTC')).toBe('BTC')
    expect(currencySymbol('CHF')).toBe('CHF')
    expect(currencySymbol('')).toBe('')
  })
})

describe('formatMoney', () => {
  it('formats USD amounts with 2 decimal places', () => {
    expect(formatMoney(0)).toBe('$0.00')
    expect(formatMoney(15.99)).toBe('$15.99')
    expect(formatMoney(1000)).toBe('$1,000.00')
    expect(formatMoney(1234567.89)).toBe('$1,234,567.89')
  })

  it('formats EUR with correct symbol', () => {
    const result = formatMoney(99.95, 'EUR')
    expect(result).toContain('99.95')
    expect(result).toContain('€')
  })

  it('formats JPY with no decimal places', () => {
    const result = formatMoney(1500, 'JPY')
    expect(result).not.toContain('.00')
    expect(result).toContain('¥')
    expect(result).toContain('1,500')
  })

  it('handles zero amount', () => {
    expect(formatMoney(0)).toBe('$0.00')
    expect(formatMoney(0, 'EUR')).toContain('0.00')
  })

  it('handles negative amounts', () => {
    const result = formatMoney(-10.50)
    expect(result).toContain('10.50')
    expect(result).toMatch(/[-−]/) // various minus sign representations
  })

  it('falls back gracefully for unknown currency codes', () => {
    const result = formatMoney(42, 'XYZ')
    // Intl.NumberFormat adds a narrow no-break space between currency code and amount
    expect(result).toContain('42.00')
    expect(result).toContain('XYZ')
  })
})

describe('initials', () => {
  it('returns first two letters for single name', () => {
    expect(initials('Ada')).toBe('AD')
    expect(initials('John')).toBe('JO')
  })

  it('returns first + last initials for multi-word names', () => {
    expect(initials('Ada Lovelace')).toBe('AL')
    expect(initials('John Doe Smith')).toBe('JS')
  })

  it('falls back to "R" for empty or whitespace-only names', () => {
    expect(initials('')).toBe('R')
    expect(initials('   ')).toBe('R')
  })

  it('handles single-character names', () => {
    expect(initials('A')).toBe('A')
  })

  it('trims whitespace from names', () => {
    expect(initials('  Ada  Lovelace  ')).toBe('AL')
  })
})