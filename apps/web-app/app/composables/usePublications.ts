export function usePublications() {
  return useFetch('/api/publications', {
    key: 'publications',
    dedupe: 'defer',
    getCachedData: (key, nuxtApp) => nuxtApp.isHydrating ? nuxtApp.payload.data[key] : undefined,
  })
}
