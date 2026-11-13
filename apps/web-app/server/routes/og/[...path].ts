import type { OgMessages, OgSubject } from '../../../shared/og'
import en from '../../../i18n/locales/en.json'
import ru from '../../../i18n/locales/ru.json'
import { ogCard } from '../../../shared/og'
import { renderOgPng } from '../../utils/og-png'

const copy = { ru, en } satisfies Record<'ru' | 'en', OgMessages>

function subjectFor(parts: string[], article?: { title: string, description: string }, workCase?: { title: string, description: string }): OgSubject | null {
  const [head, second] = parts
  if (head === 'home' && !second) {
    return { kind: 'home' }
  }
  if (head === 'writing' && !second) {
    return { kind: 'writing' }
  }
  if (head === 'writing' && second && parts.length === 2 && article) {
    return { kind: 'article', title: article.title, description: article.description }
  }
  if (head === 'cv' && !second) {
    return { kind: 'cv' }
  }
  if (head === 'projects' && (second === 'context' || second === 'dostigus') && parts.length === 2) {
    return { kind: 'project', key: second }
  }
  if (head === 'cases' && second && parts.length === 2 && workCase) {
    return { kind: 'case', title: workCase.title, description: workCase.description }
  }
  return null
}

export default defineEventHandler(async (event) => {
  const match = getRequestURL(event).pathname.match(/^\/og\/(ru|en)\/(.+)\.png$/)
  if (!match?.[1] || !match[2]) {
    throw createError({ statusCode: 404, statusMessage: 'OG image not found' })
  }
  const locale = match[1] as 'ru' | 'en'
  const parts = match[2].split('/').filter(Boolean)
  let article: { title: string, description: string } | undefined
  let workCase: { title: string, description: string } | undefined
  if (parts[0] === 'writing' && parts[1]) {
    const publication = await repository.publication.findBySlug(parts[1])
    const text = publication?.locales[locale]
    if (!text) {
      throw createError({ statusCode: 404, statusMessage: 'OG image not found' })
    }
    article = text
  }
  if (parts[0] === 'cases' && parts[1]) {
    const record = await repository.case.findByKey(parts[1], locale)
    if (!record) {
      throw createError({ statusCode: 404, statusMessage: 'OG image not found' })
    }
    workCase = record
  }
  const subject = subjectFor(parts, article, workCase)
  if (!subject) {
    throw createError({ statusCode: 404, statusMessage: 'OG image not found' })
  }
  const png = await renderOgPng(ogCard(subject, copy[locale]))
  setHeader(event, 'Content-Type', 'image/png')
  const dynamic = (parts[0] === 'writing' && Boolean(parts[1])) || parts[0] === 'cases'
  setHeader(event, 'Cache-Control', dynamic ? 'no-store' : 'public, max-age=86400')
  return png
})
