import { expect, it } from 'vitest'
import { createActivityCache } from '../server/utils/activity-cache'
import { emptyActivity } from '../shared/activity'

it('returns immediately on a cold cache, deduplicates refresh and serves stale while revalidating', async () => {
  let value = null as ReturnType<typeof emptyActivity> | null
  let now = Date.parse('2026-11-16T12:00:00Z')
  let complete!: (value: ReturnType<typeof emptyActivity>) => void
  const refresh = new Promise<ReturnType<typeof emptyActivity>>((resolve) => {
    complete = resolve
  })
  const waiting: Promise<void>[] = []
  const cache = createActivityCache({ getItem: async () => value, setItem: async (_, next) => {
    value = next
  } }, () => refresh, () => now)
  expect((await cache((promise) => waiting.push(promise))).coverage).toBe('unavailable')
  await cache((promise) => waiting.push(promise))
  expect(waiting).toHaveLength(1)
  complete({ ...emptyActivity(), fetchedAt: new Date(now).toISOString(), coverage: 'rest90' })
  await waiting[0]
  expect((await cache((promise) => waiting.push(promise))).coverage).toBe('rest90')
  now += 31 * 60000
  expect((await cache((promise) => waiting.push(promise))).coverage).toBe('rest90')
  expect(waiting).toHaveLength(2)
})

it('keeps stale data through refresh failures, throttles retries and expires it after a day', async () => {
  let now = Date.parse('2026-11-16T12:00:00Z')
  const saved = { ...emptyActivity(), fetchedAt: '2026-11-16T11:00:00Z', coverage: 'rest90' as const }
  const waiting: Promise<void>[] = []
  const cache = createActivityCache({ getItem: async () => saved, setItem: async () => {} }, async () => {
    throw new Error('rate limited')
  }, () => now)
  expect((await cache((promise) => waiting.push(promise))).coverage).toBe('rest90')
  await waiting[0]
  await cache((promise) => waiting.push(promise))
  expect(waiting).toHaveLength(1)
  now += 86400000
  expect((await cache((promise) => waiting.push(promise))).coverage).toBe('unavailable')
  await waiting[1]
  expect(waiting).toHaveLength(2)
})
