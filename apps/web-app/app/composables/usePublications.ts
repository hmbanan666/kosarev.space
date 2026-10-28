export function usePublications() {
  return useFetch('/api/publications', {
    key: 'publications',
    getCachedData: (key, nuxtApp) => nuxtApp.isHydrating ? nuxtApp.payload.data[key] : undefined,
  })
}
