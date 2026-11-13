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
      stack: ['{\'@\'}nuxtjs/mcp-toolkit'],
    })?.stack).toEqual(['@nuxtjs/mcp-toolkit'])
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
    expect(projectSectionsFor('k39', { te: () => false, tm: () => ({}) })).toBeNull()
    expect(projectSectionsFor('k39', { te: () => false, tm: () => null })).toBeNull()
    expect(projectSectionsFor('k39', {
      te: () => false,
      tm: () => ({ problem: 'Shown anyway' }),
    })).toEqual({ problem: 'Shown anyway', decisions: [], stack: [], links: [] })
    expect(projectSectionsFor('k39', {
      te: (key) => key === 'projects.k39.sections',
      tm: () => ({ stack: ['One'] }),
    })).toEqual({ decisions: [], stack: ['One'], links: [] })
  })

  it('publishes the approved long-form copy and keeps the short cards', () => {
    expect(en.projects.k39.description).toBe('Helps visitors choose places and plan a trip through a map, routes and destination pages.')
    expect(ru.projects.k39.description).toBe('Помогает выбрать место и спланировать поездку: карта, маршруты и страницы достопримечательностей.')
    expect(en.projects.context.work).toContain('On 60 synthetic notes, 10 of 12 questions got complete answers.')
    expect(ru.projects.context.work).toContain('10 из 12')
    expect(en.projects.dostigus.work).toBe('I built it to run my own bots and host it myself. Development is paused.')
    expect(ru.projects.dostigus.work).toBe('Собрал её, чтобы запускать своих ботов, и размещаю сам. Разработка на паузе.')
    expect(en.projects.woodlands).not.toHaveProperty('sections')
    expect(ru.projects.woodlands).not.toHaveProperty('sections')

    const pages = [
      [en.projects.context.sections, ru.projects.context.sections],
      [en.projects.dostigus.sections, ru.projects.dostigus.sections],
      [en.projects.k39.sections, ru.projects.k39.sections],
    ] as const
    for (const [english, russian] of pages) {
      for (const sections of [english, russian]) {
        const displayed = readProjectSections(sections)
        expect(displayed?.problem).toBe(sections.problem)
        expect(displayed?.built).toBe(sections.built)
        expect(displayed?.statusNext).toBe(sections.statusNext)
        expect(displayed?.decisions).toEqual(sections.decisions)
        expect(displayed?.links).toEqual(sections.links)
        expect(displayed?.stack).toEqual(sections.stack.map((item) => item.replaceAll('{\'@\'}', '@')))
        expect(displayed?.stack.join('\n')).not.toContain('{\'@\'}')
        expect(sections.decisions).toHaveLength(4)
        expect(sections.problem.length).toBeGreaterThan(40)
        expect(sections.built.length).toBeGreaterThan(40)
        expect(sections.statusNext.length).toBeGreaterThan(20)
        expect(sections.stack.length).toBeGreaterThan(3)
        expect(sections.links.length).toBeGreaterThan(0)
        const text = JSON.stringify(sections)
        expect(text).not.toMatch(/—|–|EXPI|\[S\d+\]|PR #40|3 of 12|3 из 12|3 предложения из 12|реальных данных|real data|тупик|dead end|swarm of agents|роем агентов|затем использовал|later used the same|K39 MCP|MCP-сервере K39/i)
        const unescaped = text.replaceAll('{\'@\'}', '')
        expect(unescaped).not.toContain('@')
        expect(unescaped).not.toContain('|')
      }
    }

    expect(en.projects.context.sections.decisions[0]?.why).toContain('In a synthetic experiment on 60 notes, 10 of 12 questions got complete answers, and background knowledge extraction did not improve them.')
    expect(ru.projects.context.sections.decisions[0]?.why).toContain('В синтетическом эксперименте на 60 заметках 10 из 12 вопросов получили полные ответы')
    expect(en.projects.context.sections.decisions[1]?.why).toBe('At first the nightly tidy decided by itself which note was outdated. I removed automatic replacement. Now an agent passes supersedes itself when it knows a fact has changed.')
    expect(ru.projects.context.sections.decisions[1]?.why).toBe('Сначала ночная уборка сама решала, какая заметка устарела. Автозамену я убрал. Теперь агент сам передаёт supersedes, когда точно знает, что факт изменился.')
    expect(en.projects.dostigus.sections.statusNext).toBe('Development is paused; the last commit is from 3 October 2026. The code is open under MIT.')
    expect(ru.projects.dostigus.sections.statusNext).toBe('Разработка на паузе, последний коммит 3 октября 2026. Код открыт под MIT.')
    expect(en.projects.dostigus.sections.stack).toContain('{\'@\'}nuxtjs/mcp-toolkit')
    expect(en.projects.k39.sections.statusNext).toContain('test whether the site can earn money')
    expect(ru.projects.k39.sections.statusNext).toContain('может ли сайт зарабатывать')
    expect(en.projects.k39.sections.links.map((link) => link.href)).toEqual(['https://k39.online', 'https://github.com/hmbanan666/k39'])
    expect(ru.projects.k39.sections.links.map((link) => link.label)).toEqual(['Сайт', 'Код'])
    expect(en.projects.context.sections.links[0]).toEqual({ label: 'Source', href: 'https://github.com/hmbanan666/context' })
    expect(en.projects.dostigus.sections.links[0]).toEqual({ label: 'Source', href: 'https://github.com/dostigus/dostigus' })
    expect(projectSectionsFor('context', {
      te: () => false,
      tm: () => en.projects.context.sections,
    })?.statusNext).toBe(en.projects.context.sections.statusNext)
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
