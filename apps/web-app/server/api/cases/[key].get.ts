import { cases } from '../../db/cases'

export default defineEventHandler((event) => {
  const key = getRouterParam(event, 'key')
  const query = getQuery(event)
  const locale = (query.locale as string) || 'ru'

  const found = cases.find((c) => c.key === key)
  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Case not found' })
  }

  const content = found.content[locale] ?? found.content.ru!

  // Related cases: same tags, exclude current
  const tags = new Set(found.tags)
  const related = cases
    .filter((c) => c.key !== found.key && c.tags.some((t) => tags.has(t)))
    .slice(0, 4)
    .map((c) => {
      const relContent = c.content[locale] ?? c.content.ru!
      return {
        key: c.key,
        tags: c.tags,
        icon: c.icon,
        title: relContent.title,
        description: relContent.description,
      }
    })

  return {
    key: found.key,
    tags: found.tags,
    icon: found.icon,
    image: found.image,
    ...content,
    related,
  }
})
