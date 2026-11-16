import { expect, it } from 'vitest'
import { activityLayout } from '../app/utils/home-canvas'
import { activityFeedItems, activityScore, calendarDays } from '../shared/activity'

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
  expect(layout.find((b) => b.id === 'k39')).toMatchObject({ x: 8, y: 4, w: 7, h: 3 })
  expect(layout.find((b) => b.id === 'context')!.w).toBeLessThan(7)
  expect(layout.reduce((sum, b) => sum + b.w * b.h, 0)).toBeLessThan(20 * 12)
})

it('shows a PR and its squash commit once, scoped to the same repository', () => {
  const items = [
    { id: 'a', kind: 'commit' as const, repo: 'owner/one', title: 'Ship feature (#42)', date: '2026-11-16', url: 'https://github.com/owner/one/commit/a' },
    { id: 'b', kind: 'commit' as const, repo: 'owner/two', title: 'Another feature (#42)', date: '2026-11-16', url: 'https://github.com/owner/two/commit/b' },
    { id: 'c', kind: 'pr' as const, repo: 'owner/one', title: 'Ship feature', date: '2026-11-15', url: 'https://github.com/owner/one/pull/42' },
    { id: 'd', kind: 'commit' as const, repo: 'owner/one', title: 'Mention #42 in prose', date: '2026-11-14', url: 'https://github.com/owner/one/commit/d' },
  ]
  expect(activityFeedItems(items).map((item) => item.id)).toEqual(['c', 'b', 'd'])
  expect(items).toHaveLength(4)
})
