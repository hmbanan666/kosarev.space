import type { Publication, PublicationType } from '../shared/publications'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { activeProducts, projects } from '../app/utils/data'
import { findPublication, formatPublicationDate, publicationPath, publications, publicationsForWork, relatedWorkPath, sortPublications } from '../shared/publications'

function fixture(slug: string, type: PublicationType, publishedAt: string): Publication {
  return { ...publications[0]!, slug, type, publishedAt }
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

  it('preserves the first article identity and returns no invented publication', () => {
    expect(publications).toHaveLength(1)
    expect(publicationPath(findPublication('k39-draft-permissions')!)).toBe('/writing/k39-draft-permissions')
    expect(findPublication('not-a-publication')).toBeUndefined()
  })

  it('keeps project and case relationships distinct and only returns actual matches', () => {
    expect(publicationsForWork('project', 'k39').map((entry) => entry.slug)).toEqual(['k39-draft-permissions'])
    expect(publicationsForWork('case', 'k39')).toEqual([])
    expect(publicationsForWork('project', 'woodlands')).toEqual([])
    expect(relatedWorkPath({ kind: 'project', key: 'k39' })).toBe('/#project-k39')
    expect(relatedWorkPath({ kind: 'case', key: 'expi-billing' })).toBe('/cases/expi-billing')
  })

  it('formats the actual calendar date consistently in both languages', () => {
    expect(formatPublicationDate('2026-10-28', 'en')).toBe('28 October 2026')
    expect(formatPublicationDate('2026-10-28', 'ru')).toBe('28 октября 2026 г.')
  })

  it('registers unique slugs, valid dates, existing bilingual bodies and real project targets', () => {
    expect(new Set(publications.map((entry) => entry.slug)).size).toBe(publications.length)
    const projectKeys = new Set([...activeProducts, ...projects].map((project) => project.key))
    for (const entry of publications) {
      expect(entry.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(entry.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(new Date(`${entry.publishedAt}T00:00:00Z`).toISOString().slice(0, 10)).toBe(entry.publishedAt)
      expect(['note', 'digest', 'article']).toContain(entry.type)
      for (const locale of ['ru', 'en'] as const) {
        const text = entry.locales[locale]
        expect(text.title.trim()).not.toBe('')
        expect(text.description.trim()).not.toBe('')
        expect(text.content).toMatch(/^[A-Z][A-Za-z0-9]+$/)
        const content = readFileSync(new URL(`../app/components/writing/content/${text.content}.vue`, import.meta.url), 'utf8')
        expect(content).toContain('<template>')
      }
      for (const work of entry.relatedWork) {
        expect(work.key).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        if (work.kind === 'project') {
          expect(projectKeys.has(work.key)).toBe(true)
        }
      }
    }
  })
})
