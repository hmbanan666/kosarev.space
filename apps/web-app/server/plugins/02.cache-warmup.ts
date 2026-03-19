export default defineNitroPlugin(async () => {
  const logger = useLogger('cache-warmup')
  const fetchInternal = $fetch.create({}) as (url: string) => Promise<unknown>

  try {
    for (const locale of ['ru', 'en']) {
      const cases = await fetchInternal(`/api/cases?locale=${locale}`) as { key: string }[]

      for (const c of cases) {
        await fetchInternal(`/api/cases/${c.key}?locale=${locale}`)
      }
    }

    logger.success('Cache warmed')
  } catch (error) {
    logger.warn('Cache warmup failed:', error)
  }
})
