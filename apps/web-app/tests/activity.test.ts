import { expect, it } from 'vitest'
import { activityLayout } from '../app/utils/home-canvas'
import { activityScore, calendarDays } from '../shared/activity'

it('weights recent public commits and PRs, ignoring releases, old and future entries', () => {
  const now = '2026-11-16T12:00:00Z'
  const items = [
    { kind: 'commit' as const, date: '2026-11-15T12:00:00Z' },
    { kind: 'pr' as const, date: '2026-10-27T12:00:00Z' },
    { kind: 'release' as const, date: now },
    { kind: 'commit' as const, date: '2026-09-01T00:00:00Z' },
    { kind: 'commit' as const, date: '2026-12-01T00:00:00Z' },
  ]
  expect(activityScore(items, now)).toBe(32)
  expect(calendarDays(items, now, 30).reduce((sum, day) => sum + day.count, 0)).toBe(2)
})

it('places the most active project centrally and larger, with deterministic empty cells', () => {
  const layout = activityLayout({ context: 2, k39: 80, woodlands: 0, space: 5 })
  expect(layout).toEqual(activityLayout({ space: 5, woodlands: 0, k39: 80, context: 2 }))
  expect(layout.find((b) => b.id === 'k39')).toMatchObject({ x: 6, y: 3, w: 6, h: 3 })
  expect(layout.find((b) => b.id === 'context')!.w).toBeLessThan(6)
  expect(layout.reduce((sum, b) => sum + b.w * b.h, 0)).toBeLessThan(17 * 10)
})
