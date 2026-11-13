import { describe, expect, it } from 'vitest'
import { portfolioPages } from '../app/utils/data'
import { portfolioItemList, projectPageEntity } from '../app/utils/structured-data'
import en from '../i18n/locales/en.json'
import ru from '../i18n/locales/ru.json'
import { renderWritingFeed } from '../shared/feed'
import { ogCard, ogImagePath, ogProjectKeys, renderOgSvg } from '../shared/og'
import { wrapText } from '../shared/text'

function translate(messages: Record<string, unknown>, key: string, params?: Record<string, unknown>) {
  const value = key.split('.').reduce<unknown>((current, part) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[part] : undefined
  }, messages)
  if (typeof value !== 'string') {
    throw new TypeError(`Missing translation ${key}`)
  }
  return params ? value.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name])) : value
}

describe('writing feed', () => {
  const entries = [
    { slug: 'newer', publishedAt: '2026-10-28', title: 'A & B', description: '5 < 6' },
    { slug: 'older', publishedAt: '2026-01-02', title: 'Older', description: 'Earlier note' },
  ]

  it('renders a valid bilingual item and escapes text', () => {
    const xml = renderWritingFeed({ locale: 'en', title: 'Writing', description: 'Notes', entries })
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('<language>en</language>')
    expect(xml).toContain('href="https://kosarev.space/en/writing/feed.xml"')
    expect(xml).toContain('hreflang="ru"')
    expect(xml.indexOf('newer')).toBeLessThan(xml.indexOf('older'))
    expect(xml).toContain('<title>A &amp; B</title>')
    expect(xml).toContain('<description>5 &lt; 6</description>')
    expect(xml).toContain('<guid isPermaLink="true">https://kosarev.space/en/writing/newer</guid>')
    expect(xml).toContain('<pubDate>Wed, 28 Oct 2026 00:00:00 GMT</pubDate>')
  })

  it('keeps the Russian feed on the unprefixed route', () => {
    const xml = renderWritingFeed({ locale: 'ru', title: 'Публикации', description: 'Заметки', entries: entries.slice(0, 1) })
    expect(xml).toContain('<link>https://kosarev.space/writing</link>')
    expect(xml).toContain('https://kosarev.space/writing/newer')
    expect(xml).not.toContain('https://kosarev.space/en/writing/newer')
  })
})

describe('open graph cards', () => {
  it('wraps long titles and escapes svg text', () => {
    expect(wrapText('one two three four', 8, 2)).toEqual(['one two', 'three...'])
    const svg = renderOgSvg({ eyebrow: 'Name', title: 'A & B', description: '5 < 6' })
    expect(svg).toContain('A &amp; B')
    expect(svg).toContain('5 &lt; 6')
    expect(svg).toContain('fill="#080808"')
    expect(ogImagePath('en', ['projects', 'context'])).toBe('/og/en/projects/context.png')
  })

  it('labels the paused project on the card and keeps the home name', () => {
    expect(ogCard({ kind: 'home' }, en).title).toBe(en.hero.name)
    expect(ogCard({ kind: 'project', key: 'dostigus' }, en).description.startsWith('Paused.')).toBe(true)
    expect(ogCard({ kind: 'project', key: 'context' }, ru).description).toBe(ru.projects.context.description)
    expect(ogCard({ kind: 'project', key: 'k39' }, en)).toEqual({
      eyebrow: en.hero.name,
      title: 'K39',
      description: en.projects.k39.description,
    })
    expect(ogCard({ kind: 'project', key: 'k39' }, ru).description).toBe(ru.projects.k39.description)
    expect(ogProjectKeys).toEqual(['context', 'dostigus', 'k39'])
    expect(portfolioPages.map((page) => page.key).sort()).toEqual([...ogProjectKeys].sort())
  })
})

describe('project structured data', () => {
  it('uses source code for public repositories and a creative work without one', () => {
    const list = portfolioItemList('en', (key, params) => translate(en, key, params))
    const names = list.itemListElement.map((entry) => entry.item.name)
    expect(names.slice(0, 4)).toEqual(['Context', 'K39', 'Woodlands', 'Dostigus'])
    const context = projectPageEntity('en', 'context', (key, params) => translate(en, key, params))
    expect(context['@type']).toBe('SoftwareSourceCode')
    expect(context.codeRepository).toBe('https://github.com/hmbanan666/context')
    expect(context.programmingLanguage).toBe('TypeScript')
    expect(context.license).toBe('MIT')
    expect(context.url).toBe('https://kosarev.space/en/projects/context')
    const dostigus = projectPageEntity('ru', 'dostigus', (key, params) => translate(ru, key, params))
    expect(dostigus.description.startsWith('На паузе.')).toBe(true)
    expect(dostigus.url).toBe('https://kosarev.space/projects/dostigus')
    const k39 = projectPageEntity('en', 'k39', (key, params) => translate(en, key, params))
    expect(k39['@type']).toBe('SoftwareSourceCode')
    expect(k39.url).toBe('https://kosarev.space/en/projects/k39')
    expect(k39.sameAs).toBe('https://k39.online')
    expect(k39.codeRepository).toBe('https://github.com/hmbanan666/k39')
    expect(k39.description).toBe(en.projects.k39.description)
    expect(k39.programmingLanguage).toBeUndefined()
    expect(k39.license).toBeUndefined()
    expect(projectPageEntity('ru', 'k39', (key, params) => translate(ru, key, params)).url).toBe('https://kosarev.space/projects/k39')
    const woodlands = list.itemListElement.find((entry) => entry.item.name === 'Woodlands')!.item
    expect(woodlands['@type']).toBe('CreativeWork')
    expect(woodlands.codeRepository).toBeUndefined()
    expect(woodlands.url).toBe('https://t.me/WoodlandsGameBot')
    const serialized = JSON.stringify(list)
    expect(serialized).not.toContain('dostigus.ru')
    expect(serialized).not.toContain('chatgame.space')
    expect(en.projects.context.work).toContain('On 60 synthetic notes, 10 of 12 questions got complete answers.')
    expect(en.projects.context.work.match(/\d+/g)).toEqual(['60', '10', '12'])
    expect(ru.projects.context.work).toContain('10 из 12')
    expect(en.projects.dostigus.work).not.toMatch(/\d/)
  })
})
