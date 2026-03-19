export default defineCachedEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'Missing case key' })
  }

  const query = getQuery(event)
  const locale = typeof query.locale === 'string' ? query.locale : 'ru'

  const found = await repository.case.findByKey(key, locale)
  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Case not found' })
  }

  const related = await repository.case.findRelated(key, found.tags, locale)

  return {
    ...found,
    related,
  }
}, { swr: true, maxAge: 60 })
