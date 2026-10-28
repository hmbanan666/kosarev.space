export type PublicationLocale = 'ru' | 'en'
export type PublicationType = 'note' | 'digest' | 'article'

export interface RelatedWork {
  kind: 'project' | 'case'
  key: string
  title: Record<PublicationLocale, string>
}

export interface PublicationText {
  title: string
  description: string
  content: string
}

export interface Publication {
  slug: string
  publishedAt: string
  type: PublicationType
  locales: Record<PublicationLocale, PublicationText>
  relatedWork: readonly RelatedWork[]
}

export const publications: readonly Publication[] = [
  {
    slug: 'k39-draft-permissions',
    publishedAt: '2026-10-28',
    type: 'article',
    locales: {
      ru: {
        title: 'Как K39 отделяет правки AI-агента от публикации',
        description: 'Два уровня доступа, отдельные предложения изменений и ошибка, которую не ловит проверка статуса.',
        content: 'K39ArticleRu',
      },
      en: {
        title: 'How K39 separates AI edits from publication',
        description: 'Two access scopes, separate change proposals, and a bug that a status check would miss.',
        content: 'K39ArticleEn',
      },
    },
    relatedWork: [{ kind: 'project', key: 'k39', title: { ru: 'K39', en: 'K39' } }],
  },
]

export function publicationPath(publication: Pick<Publication, 'slug'>): string {
  return `/writing/${publication.slug}`
}

export function sortPublications(items: readonly Publication[]): Publication[] {
  return [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug, 'en'))
}

export function findPublication(slug: string): Publication | undefined {
  return publications.find((publication) => publication.slug === slug)
}

export function publicationsForWork(kind: RelatedWork['kind'], key: string): Publication[] {
  return sortPublications(publications.filter((publication) => publication.relatedWork.some((work) => work.kind === kind && work.key === key)))
}

export function relatedWorkPath(work: Pick<RelatedWork, 'kind' | 'key'>): string {
  return work.kind === 'case' ? `/cases/${encodeURIComponent(work.key)}` : `/#project-${encodeURIComponent(work.key)}`
}

export function formatPublicationDate(date: string, locale: PublicationLocale): string {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}
