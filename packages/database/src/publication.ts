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
  body: string
}

export interface PublicationContent {
  type: PublicationType
  locales: Record<PublicationLocale, PublicationText>
  relatedWork: RelatedWork[]
}

export interface Publication extends PublicationContent {
  slug: string
  publishedAt: string
  revision: string
}

export interface PublicationSummary extends Omit<Publication, 'locales'> {
  locales: Record<PublicationLocale, Omit<PublicationText, 'body'>>
}
