import type { ActivitySnapshot } from '../../shared/activity'
import type { KnowledgeChunk } from './knowledge'
import { chunkDocument } from './knowledge'

export async function agentEvidence(): Promise<KnowledgeChunk[]> {
  const base = await useStorage('assets:agent-knowledge').getItem<KnowledgeChunk[]>('pack.json') ?? []
  // These repository methods select only published revisions, never draft content.
  const summaries = await repository.publication.findAll().catch(() => [])
  const publications = await Promise.all(summaries.map((item) => repository.publication.findBySlug(item.slug).catch(() => null)))
  const chunks = [...base]
  for (const publication of publications) {
    if (!publication) {
      continue
    }
    for (const locale of ['ru', 'en'] as const) {
      const text = publication.locales[locale]
      chunks.push(...chunkDocument(text.title, `${locale === 'en' ? '/en' : ''}/writing/${publication.slug}`, locale, `Published: ${publication.publishedAt}\n${text.description}\n${text.body}`))
    }
  }
  const activity = await useStorage('cache').getItem<ActivitySnapshot>('github-public-v1').catch(() => null)
  if (activity?.fetchedAt && Date.now() - Date.parse(activity.fetchedAt) < 86400000) {
    for (const locale of ['ru', 'en']) {
      chunks.push(...chunkDocument('Recent public activity · Сейчас · Активность', locale === 'en' ? '/en' : '/', locale, `Public sample, not complete activity. Snapshot: ${activity.fetchedAt}. ${JSON.stringify(activity.items.slice(0, 12).map(({ repo, title, date }) => ({ repo, title, date })))}`))
    }
  }
  return chunks
}
