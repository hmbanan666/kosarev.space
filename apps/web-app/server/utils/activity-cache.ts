import type { ActivitySnapshot } from '../../shared/activity'
import { emptyActivity } from '../../shared/activity'

interface ActivityStorage { getItem: (key: string) => Promise<ActivitySnapshot | null>, setItem: (key: string, value: ActivitySnapshot) => Promise<unknown> }
export function createActivityCache(storage: ActivityStorage, refresh: () => Promise<ActivitySnapshot>, now = Date.now) {
  let pending: Promise<void> | undefined
  let retryAt = 0
  return async (waitUntil: (promise: Promise<void>) => void) => {
    const saved = await storage.getItem('github-public-v1').catch(() => null)
    const age = saved?.fetchedAt ? now() - Date.parse(saved.fetchedAt) : Infinity
    if (age >= 30 * 60 * 1000 && now() >= retryAt && !pending) {
      retryAt = now() + 60 * 1000
      pending = refresh().then((value) => storage.setItem('github-public-v1', value)).then(() => {}).catch(() => {}).finally(() => {
        pending = undefined
      })
      waitUntil(pending)
    }
    // Expire the public snapshot after a day, including on prolonged API failure.
    return age < 86400000 && saved ? saved : emptyActivity()
  }
}
