import type { Publication } from '../../../shared/publications'
import { renderPublicationMarkdown } from '../../utils/publication-markdown'

export default defineEventHandler(async (event): Promise<Publication> => {
  setHeader(event, 'Cache-Control', 'no-store')
  const slug = getRouterParam(event, 'slug')
  const publication = slug && await repository.publication.findBySlug(slug)
  if (!publication) {
    throw createError({ statusCode: 404, statusMessage: 'Publication not found' })
  }
  const { locales, ...metadata } = publication
  return {
    ...metadata,
    locales: {
      ru: { title: locales.ru.title, description: locales.ru.description, html: renderPublicationMarkdown(locales.ru.body) },
      en: { title: locales.en.title, description: locales.en.description, html: renderPublicationMarkdown(locales.en.body) },
    },
  }
})
