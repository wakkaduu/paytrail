import { describe, expect, it } from 'vitest'
import { calculateRemainingBalance, formatDate, formatMoney, summarizeLoans } from './loanDisplay'

describe('loanDisplay', () => {
  it('formats money values', () => {
    expect(formatMoney(1234.5)).toBe('$1,234.50')
  })

  it('formats dates', () => {
    expect(formatDate('2026-06-07T00:00:00.000Z')).toMatch(/Jun|June/)
  })

  it('calculates remaining balance', () => {
    expect(calculateRemainingBalance(100, 25)).toBe(75)
  })

  it('summarizes loan totals', () => {
    expect(
      summarizeLoans([
        { amount: 100, remaining: 75 },
        { amount: 50, remaining: 10 },
      ]),
    ).toEqual({ totalLoaned: 150, totalRemaining: 85 })
  })
})