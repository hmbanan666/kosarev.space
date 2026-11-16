import { describe, expect, it } from 'vitest'
import { contributionSummary } from '../shared/contribution-calendar'

describe('contribution calendar summary', () => {
  it('keeps an empty calendar empty', () => {
    expect(contributionSummary([])).toEqual({ total: 0, activeDays: 0, longestStreak: 0, months: [], busiestDay: undefined, busiestMonth: undefined })
  })
  it('summarizes a single active day', () => {
    expect(contributionSummary([{ date: '2026-01-01', count: 7 }])).toEqual({
      total: 7, activeDays: 1, longestStreak: 1,
      months: [{ month: '2026-01', count: 7 }],
      busiestDay: { date: '2026-01-01', count: 7 },
      busiestMonth: { month: '2026-01', count: 7 },
    })
  })
  it('groups a rolling year by year-month and counts streaks across December and leap day', () => {
    const days = Array.from({ length: 366 }, (_, index) => ({
      date: new Date(Date.UTC(2023, 10, 16 + index)).toISOString().slice(0, 10), count: 0,
    }))
    for (const date of ['2023-12-30', '2023-12-31', '2024-01-01', '2024-01-03', '2024-02-28', '2024-02-29', '2024-03-01']) {
      days.find((day) => day.date === date)!.count = 2
    }
    days.find((day) => day.date === '2024-11-01')!.count = 5
    const reversed = days.toReversed()
    const result = contributionSummary(reversed)
    expect(result.total).toBe(19)
    expect(result.activeDays).toBe(8)
    expect(result.longestStreak).toBe(3)
    expect(result.months).toEqual([
      { month: '2023-11', count: 0 }, { month: '2023-12', count: 4 },
      { month: '2024-01', count: 4 }, { month: '2024-02', count: 4 },
      { month: '2024-03', count: 2 }, { month: '2024-04', count: 0 },
      { month: '2024-05', count: 0 }, { month: '2024-06', count: 0 },
      { month: '2024-07', count: 0 }, { month: '2024-08', count: 0 },
      { month: '2024-09', count: 0 }, { month: '2024-10', count: 0 },
      { month: '2024-11', count: 5 },
    ])
    expect(result.busiestDay).toEqual({ date: '2024-11-01', count: 5 })
    expect(result.busiestMonth).toEqual({ month: '2024-11', count: 5 })
    expect(reversed[0]!.date).toBe('2024-11-15')
    expect(contributionSummary(days.filter((day) => day.date >= '2023-12-30' && day.date <= '2024-01-01')).longestStreak).toBe(3)
    expect(contributionSummary(days.filter((day) => day.date >= '2024-02-28' && day.date <= '2024-03-01')).longestStreak).toBe(3)
  })
  it('breaks streaks at missing dates and uses the earliest date/month for ties', () => {
    const result = contributionSummary([
      { date: '2026-01-30', count: 4 }, { date: '2026-02-01', count: 4 },
      { date: '2026-02-02', count: 0 }, { date: '2026-02-03', count: 0 },
    ])
    expect(result.longestStreak).toBe(1)
    expect(result.busiestDay?.date).toBe('2026-01-30')
    expect(result.busiestMonth?.month).toBe('2026-01')
  })
  it('does not invent a busiest day or month for an all-zero calendar', () => {
    expect(contributionSummary([{ date: '2026-01-01', count: 0 }])).toEqual({
      total: 0, activeDays: 0, longestStreak: 0, months: [{ month: '2026-01', count: 0 }],
      busiestDay: undefined, busiestMonth: undefined,
    })
  })
})
