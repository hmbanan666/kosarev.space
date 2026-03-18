import { cases } from '../../db/cases'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const locale = (query.locale as string) || 'ru'

  return cases.map((c) => {
    const content = c.content[locale] ?? c.content.ru!
    return {
      key: c.key,
      tags: c.tags,
      icon: c.icon,
      title: content.title,
      description: content.description,
    }
  })
})
