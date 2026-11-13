import en from '../../i18n/locales/en.json'
import ru from '../../i18n/locales/ru.json'
import { renderWritingFeed } from '../../shared/feed'

const copy = { ru, en }

export async function writingFeed(locale: 'ru' | 'en'): Promise<string> {
  const publications = await repository.publication.findAll()
  return renderWritingFeed({
    locale,
    title: copy[locale].writing.feedTitle,
    description: copy[locale].writing.description,
    entries: publications.map((publication) => ({
      slug: publication.slug,
      publishedAt: publication.publishedAt,
      title: publication.locales[locale].title,
      description: publication.locales[locale].description,
    })),
  })
}
