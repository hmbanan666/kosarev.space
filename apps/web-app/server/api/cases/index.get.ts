export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  const locale = typeof query.locale === 'string' ? query.locale : 'ru'

  return repository.case.findAll(locale)
}, { swr: true, maxAge: 60 })
