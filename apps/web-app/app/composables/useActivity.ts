import { emptyActivity } from '~~/shared/activity'

export function useActivity() {
  const result = useFetch('/api/activity', { key: 'public-activity', default: emptyActivity, getCachedData: (key, app, context) => context.cause === 'initial' && app.isHydrating ? app.payload.data[key] : undefined })
  onNuxtReady(() => {
    void result.refresh()
  })
  // A cold server returns immediately; revisit its snapshot after hydration.
  useTimeoutFn(() => {
    void result.refresh()
  }, 10000)
  useIntervalFn(() => {
    void result.refresh()
  }, 60000)
  return result
}
