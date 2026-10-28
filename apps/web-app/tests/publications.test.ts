import type { Publication, PublicationType } from '../shared/publications'
import { describe, expect, it } from 'vitest'
import { formatPublicationDate, publicationPath, publicationsForWork, relatedWorkPath, sortPublications } from '../shared/publications'

function fixture(slug: string, type: PublicationType, publishedAt: string): Publication {
  return { slug, type, publishedAt, revision: 'test', locales: { ru: { title: 'Тест', description: 'Описание', html: '<p>Текст</p>' }, en: { title: 'Test', description: 'Description', html: '<p>Text</p>' } }, relatedWork: [{ kind: 'project', key: 'k39', title: { ru: 'K39', en: 'K39' } }] }
}

describe('one publication feed', () => {
  it('interleaves all types by publication date without mutating the registry', () => {
    const items = [fixture('deep-dive', 'article', '2026-01-02'), fixture('observation', 'note', '2026-01-04'), fixture('weekly', 'digest', '2026-01-03')]
    expect(sortPublications(items).map((entry) => entry.slug)).toEqual(['observation', 'weekly', 'deep-dive'])
    expect(items.map((entry) => entry.slug)).toEqual(['deep-dive', 'observation', 'weekly'])
  })

  it('uses a stable slug order for equal dates instead of prioritizing a type', () => {
    const items = [fixture('z-article', 'article', '2026-01-01'), fixture('a-note', 'note', '2026-01-01')]
    expect(sortPublications(items).map((entry) => entry.slug)).toEqual(['a-note', 'z-article'])
  })

  it('keeps project and case relationships distinct and only returns actual matches', () => {
    const items = [fixture('example', 'article', '2026-01-01')]
    expect(publicationsForWork(items, 'project', 'k39').map((entry) => entry.slug)).toEqual(['example'])
    expect(publicationsForWork(items, 'case', 'k39')).toEqual([])
    expect(publicationsForWork(items, 'project', 'woodlands')).toEqual([])
    expect(publicationPath(items[0]!)).toBe('/writing/example')
    expect(relatedWorkPath({ kind: 'project', key: 'k39' })).toBe('/#project-k39')
    expect(relatedWorkPath({ kind: 'case', key: 'expi-billing' })).toBe('/cases/expi-billing')
  })

  it('formats the actual calendar date consistently in both languages', () => {
    expect(formatPublicationDate('2026-10-28', 'en')).toBe('28 October 2026')
    expect(formatPublicationDate('2026-10-28', 'ru')).toBe('28 октября 2026 г.')
  })
})
