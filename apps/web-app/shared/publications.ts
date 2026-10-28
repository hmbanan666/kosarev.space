import type { PublicationLocale, PublicationSummary, RelatedWork, Publication as StoredPublication } from '@kosarev/database/publication'

export type { PublicationLocale, PublicationSummary, PublicationType, RelatedWork } from '@kosarev/database/publication'

export interface Publication extends Omit<StoredPublication, 'locales'> {
  locales: Record<'ru' | 'en', { title: string, description: string, html: string }>
}

export function publicationPath(publication: Pick<Publication, 'slug'>): string {
  return `/writing/${publication.slug}`
}

export function sortPublications<T extends PublicationSummary>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug, 'en'))
}

export function publicationsForWork(items: readonly PublicationSummary[], kind: RelatedWork['kind'], key: string): PublicationSummary[] {
  return sortPublications(items.filter((publication) => publication.relatedWork.some((work) => work.kind === kind && work.key === key)))
}

export function relatedWorkPath(work: Pick<RelatedWork, 'kind' | 'key'>): string {
  return work.kind === 'case' ? `/cases/${encodeURIComponent(work.key)}` : `/#project-${encodeURIComponent(work.key)}`
}

export function formatPublicationDate(date: string, locale: PublicationLocale): string {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}
