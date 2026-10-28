import type { Publication, PublicationSummary } from '../publication'
import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { useDatabase } from '../database'
import { publicationRevisions, publications } from '../tables'

export class PublicationRepository {
  static async findAll(): Promise<PublicationSummary[]> {
    const rows = await this.publishedRows()
    return rows.map(({ slug, publishedAt, revision, content }) => ({
      slug, publishedAt: publishedAt!, revision, type: content.type, relatedWork: content.relatedWork,
      locales: {
        ru: { title: content.locales.ru.title, description: content.locales.ru.description },
        en: { title: content.locales.en.title, description: content.locales.en.description },
      },
    }))
  }

  static async findBySlug(slug: string): Promise<Publication | null> {
    const [row] = await this.publishedRows(slug)
    return row ? { ...row.content, slug: row.slug, publishedAt: row.publishedAt!, revision: row.revision } : null
  }

  private static publishedRows(slug?: string) {
    return useDatabase().select({ slug: publications.slug, publishedAt: publications.publishedAt, revision: publicationRevisions.id, content: publicationRevisions.content }).from(publications).innerJoin(publicationRevisions, and(eq(publications.slug, publicationRevisions.slug), eq(publications.publishedRevision, publicationRevisions.id))).where(and(isNotNull(publications.publishedAt), slug === undefined ? undefined : eq(publications.slug, slug))).orderBy(desc(publications.publishedAt), publications.slug)
  }
}
