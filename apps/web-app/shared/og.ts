import { wrapText } from './text'
import { escapeXml } from './xml'

export interface OgCard {
  eyebrow: string
  title: string
  description: string
}

export interface OgMessages {
  hero: { name: string }
  seo: { description: string }
  cv: { seoTitle: string, seoDescription: string }
  writing: { title: string, description: string }
  projects: {
    statusPaused: string
    context: { description: string }
    dostigus: { description: string }
  }
}

export type OgSubject
  = | { kind: 'home' }
    | { kind: 'writing' }
    | { kind: 'cv' }
    | { kind: 'project', key: 'context' | 'dostigus' }
    | { kind: 'article' | 'case', title: string, description: string }

export function ogCard(subject: OgSubject, messages: OgMessages): OgCard {
  const name = messages.hero.name
  if (subject.kind === 'home') {
    return {
      eyebrow: 'kosarev.space',
      title: name,
      description: messages.seo.description,
    }
  }
  if (subject.kind === 'writing') {
    return { eyebrow: name, title: messages.writing.title, description: messages.writing.description }
  }
  if (subject.kind === 'cv') {
    return { eyebrow: name, title: messages.cv.seoTitle, description: messages.cv.seoDescription }
  }
  if (subject.kind === 'project') {
    const project = messages.projects[subject.key]
    const description = subject.key === 'dostigus'
      ? `${messages.projects.statusPaused}. ${project.description}`
      : project.description
    return { eyebrow: name, title: subject.key === 'context' ? 'Context' : 'Dostigus', description }
  }
  return { eyebrow: name, title: subject.title, description: subject.description }
}

export function renderOgSvg(card: OgCard, photoHref?: string): string {
  const titleLines = wrapText(card.title, 22, 3)
  const descriptionLines = wrapText(card.description, 40, 4)
  const titleSize = titleLines.length > 2 ? 46 : 58
  let y = 176
  const lines = [
    `<text x="72" y="118" fill="#D9AD67" font-family="Noto Sans" font-size="22">${escapeXml(card.eyebrow)}</text>`,
  ]
  for (const line of titleLines) {
    lines.push(`<text x="72" y="${y}" fill="#F3F1EB" font-family="Lora Medium" font-size="${titleSize}">${escapeXml(line)}</text>`)
    y += titleSize + 12
  }
  y += 18
  for (const line of descriptionLines) {
    lines.push(`<text x="72" y="${y}" fill="#AAA8A2" font-family="Noto Sans" font-size="26">${escapeXml(line)}</text>`)
    y += 38
  }
  lines.push('<text x="72" y="574" fill="#AAA8A2" font-family="Noto Sans" font-size="22">kosarev.space</text>')
  const photo = photoHref
    ? `<rect x="808" y="104" width="300" height="400" fill="none" stroke="#D9AD67" stroke-width="1"/><image href="${photoHref}" xlink:href="${photoHref}" x="780" y="76" width="300" height="400" preserveAspectRatio="xMidYMid slice"/>`
    : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#080808"/>
  <rect x="72" y="76" width="64" height="3" fill="#D9AD67"/>
  ${photo}
  ${lines.join('\n  ')}
</svg>
`
}

export function ogImagePath(locale: 'ru' | 'en', segments: string[]): string {
  return `/og/${locale}/${segments.join('/')}.png`
}
