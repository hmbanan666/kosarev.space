import type { ActivitySnapshot } from '../../shared/activity'
import type { KnowledgeChunk } from './knowledge'
import { cvSkillGroups } from '../../app/utils/cv'
import { activeProducts } from '../../app/utils/data'
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
  const now = new Date().toISOString()
  const fresh = activity?.fetchedAt && Date.parse(now) - Date.parse(activity.fetchedAt) >= 0 && Date.parse(now) - Date.parse(activity.fetchedAt) < 86400000
  // The public snapshot's repository list is the allowlist. Never include subjects.
  const allowed = new Set(activity?.repos.map(({ name }) => name))
  const recent = fresh
    ? activity.items.filter(({ kind, repo, date }) => kind === 'commit' && allowed.has(repo) && Date.parse(date) <= Date.parse(now) && Date.parse(now) - Date.parse(date) < 30 * 86400000)
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
        .slice(0, 3)
        .map(({ repo, date }) => ({ repo, date }))
    : []
  const latest = summaries[0]
  for (const locale of ['ru', 'en'] as const) {
    const prefix = locale === 'en' ? '/en' : ''
    const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    chunks.push({
      title: 'Profile · Стек', url: `${prefix}/cv#cv-skills`, locale,
      text: JSON.stringify({
        stack: cvSkillGroups,
        links: locale === 'en' ? '[CV](/en/cv) · [Contact Nikolay](/en/contact)' : '[Резюме](/cv) · [Связаться с Николаем](/contact)',
      }),
    })
    chunks.push({
      title: 'Now · Сейчас', url: prefix || '/', locale,
      text: JSON.stringify({
        asOf: now,
        activeProjects: activeProducts.map(({ title, page, key }) => ({ title, url: `${prefix}${page ?? `/projects#project-${key}`}` })),
        publicActivity: {
          snapshot: fresh ? activity.fetchedAt : null,
          coverage: 'Public sample only; missing activity is unknown.',
          items: recent.map((item) => ({ ...item, displayDate: dateFormat.format(new Date(item.date)) })),
        },
        latestPublication: latest ? { title: latest.locales[locale].title, date: latest.publishedAt, url: `${prefix}/writing/${latest.slug}` } : null,
      }),
    })
  }
  return chunks
}
