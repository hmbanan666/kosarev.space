import { escapeXml, rfc822 } from './xml'

export interface FeedEntry {
  slug: string
  publishedAt: string
  title: string
  description: string
}

export function renderWritingFeed(input: {
  locale: 'ru' | 'en'
  title: string
  description: string
  entries: FeedEntry[]
}): string {
  const origin = 'https://kosarev.space'
  const prefix = input.locale === 'en' ? '/en' : ''
  const channelLink = `${origin}${prefix}/writing`
  const self = `${origin}${prefix}/writing/feed.xml`
  const otherLocale = input.locale === 'en' ? 'ru' : 'en'
  const otherPrefix = otherLocale === 'en' ? '/en' : ''
  const other = `${origin}${otherPrefix}/writing/feed.xml`
  const entries = [...input.entries].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug, 'en'))
  const items = entries.map((entry) => {
    const link = `${origin}${prefix}/writing/${encodeURIComponent(entry.slug)}`
    return [
      '    <item>',
      `      <title>${escapeXml(entry.title)}</title>`,
      `      <link>${escapeXml(link)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
      `      <pubDate>${escapeXml(rfc822(entry.publishedAt))}</pubDate>`,
      `      <description>${escapeXml(entry.description)}</description>`,
      '    </item>',
    ].join('\n')
  }).join('\n')
  const lastBuild = entries[0] ? `\n    <lastBuildDate>${escapeXml(rfc822(entries[0].publishedAt))}</lastBuildDate>` : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(input.title)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(input.description)}</description>
    <language>${input.locale}</language>
    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml"/>
    <atom:link href="${escapeXml(other)}" rel="alternate" type="application/rss+xml" hreflang="${otherLocale}"/>${lastBuild}
${items}
  </channel>
</rss>
`
}
