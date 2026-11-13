import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { sampleProjectPage } from '../app/utils/project-section-fixture'
import { projectSectionsFor, readProjectSections } from '../app/utils/project-sections'
import en from '../i18n/locales/en.json'
import ru from '../i18n/locales/ru.json'

describe('project sections', () => {
  it('drops empty, unsafe and incomplete values', () => {
    expect(readProjectSections(null)).toBeNull()
    expect(readProjectSections([])).toBeNull()
    expect(readProjectSections({
      problem: '  ',
      decisions: [{ title: 'Only a title' }],
      stack: ['', 4],
      links: [{ label: 'Bad', href: 'javascript:alert(1)' }],
    })).toBeNull()
    expect(readProjectSections({
      problem: ' A narrow column. ',
      links: [
        { label: 'Site', href: 'https://example.com/a' },
        { label: 'Mail', href: 'mailto:nick@example.com' },
        { label: 'Path', href: '/writing' },
        { label: 'Scheme-relative', href: '//example.com' },
      ],
    })).toEqual({
      problem: 'A narrow column.',
      decisions: [],
      stack: [],
      links: [
        { label: 'Site', href: 'https://example.com/a' },
        { label: 'Mail', href: 'mailto:nick@example.com' },
        { label: 'Path', href: '/writing' },
      ],
    })
  })

  it('resolves message objects and ignores a missing locale key', () => {
    expect(readProjectSections({ built: { type: 0 } }, (message) => {
      const record = message as { type?: number }
      return record.type === 0 ? 'Built text' : ''
    })?.built).toBe('Built text')
    expect(projectSectionsFor('k39', { te: () => false, tm: () => ({ problem: 'Hidden' }) })).toBeNull()
    expect(projectSectionsFor('k39', {
      te: (key) => key === 'projects.k39.sections',
      tm: () => ({ stack: ['One'] }),
    })).toEqual({ decisions: [], stack: ['One'], links: [] })
  })

  it('keeps published project copy free of long-form sections', () => {
    for (const messages of [en, ru]) {
      expect(messages.projects.context).not.toHaveProperty('sections')
      expect(messages.projects.dostigus).not.toHaveProperty('sections')
      expect(messages.projects.k39).not.toHaveProperty('sections')
      expect(messages.projects.k39.description.length).toBeGreaterThan(0)
    }
    expect(en.projects.k39.description).toBe('Helps visitors choose places and plan a trip through a map, routes and destination pages.')
    expect(ru.projects.k39.description).toBe('Помогает выбрать место и спланировать поездку: карта, маршруты и страницы достопримечательностей.')
  })

  it('uses an obvious layout fixture for every section', () => {
    for (const locale of ['en', 'ru'] as const) {
      const page = sampleProjectPage[locale]
      const serialized = JSON.stringify(page)
      expect(serialized).not.toMatch(/K39|Context|Dostigus|Woodlands|Kaliningrad|Калининград/)
      expect(readProjectSections(page.sections)).toEqual(page.sections)
      expect(page.sections.decisions).toHaveLength(2)
      expect(page.sections.stack.length).toBeGreaterThan(0)
      expect(page.sections.links[0]?.href).toBe('https://example.com/fixture')
    }
    const source = readFileSync(new URL('../app/pages/projects/section-fixture.vue', import.meta.url), 'utf8')
    expect(source).toContain('import.meta.dev')
    expect(source).toContain('statusCode: 404')
  })
})
